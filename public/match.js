/* =========================================================
   CÓDIGO OCULTO - Controlador de Partidas (Modo IA y Red en Línea)
   ========================================================= */
import { state, loadRecords, saveRecords } from './config.js';
import { el } from './dom.js';
import { buildKeypad, crearSlots, refreshKeypad, renderizarBitacoraFiltrada, setStatus, mostrarAlertaCyber } from './ui.js';
import { actualizarVisualSalaJugadores, showVictory, addLogRow } from './main.js';
import { startTimer, stopTimer } from './timer.js';
import { generateSecret } from './rooms.js';
import { removeOverlay } from './fx.js';
import { socket } from './mode-multi.js'; // Importamos la instancia del WebSocket activo
import { sfx } from './audio.js';

export function startGame() {
  state.secret = generateSecret(state.length);
  state.tipoPanel = "setupPanel";
  state.current = [];
  state.attempts = 0;
  state.playing = true;
  
  el.botones.classList.remove('hidden');
  el.botones.disabled = true;
  el.setupPanel.classList.add('hidden');
  el.statusPanel.classList.remove('hidden');
  el.logPanel.classList.remove('hidden');
  el.log.innerHTML = '<div class="log-empty">Sin intentos registrados...</div>';

  buildKeypad();
  crearSlots();
  setStatus('Arma tu intento con el teclado.', false);
  removeOverlay();
  startTimer();

  // >> 🎙 SÍNTESIS DE VOZ: La IA del mainframe desafía al jugador al arrancar
  import('./audio.js').then(audio => {
    audio.emitirVozTerminal("Mainframe  asegurado. Intenta  burlar  mi  cifrado, hacker.");
  });
}

export function lanzarPartidaMultijugador(mensaje) {
  if (el.createRoomPanel) el.createRoomPanel.classList.add('hidden');
  if (el.lobbyPanel) el.lobbyPanel.classList.add('hidden');

  state.playing = true;
  state.intentoMulti = [];
  if (el.setupPanel) el.setupPanel.classList.add('hidden');
  if (el.multiStatusPanel) el.multiStatusPanel.classList.remove('hidden');
  if (el.statusMultiLogPanel) el.statusMultiLogPanel.classList.remove('hidden');
  
  // 💻 CORRECCIÓN MAESTRA: Limpiar visualmente la bitácora para la nueva partida
  // Vaciamos tanto el contenedor multijugador como el genérico por seguridad
  if (el.statusMultiLog) el.statusMultiLog.innerHTML = '<div class="log-empty">Sin intentos registrados...</div>';
  if (el.log) el.log.innerHTML = '<div class="log-empty">Sin intentos registrados...</div>';

  // Hacer visible el contenedor del panel lateral en el DOM antes de ordenar su redibujado
  if (el.jugadorespanel) {
    el.jugadorespanel.classList.remove('hidden');
  }

  // Ahora sí, llamamos de golpe al renderizador común ya corregido
  actualizarVisualSalaJugadores();

  if (el.multibotones) el.multibotones.classList.remove('hidden');
  buildKeypad();
  crearSlots();
  setStatus('Arma tu intento con el teclado.', false);
  removeOverlay();
  state.playing = true; 
  startTimer();
}


export function organizarCodigo() {
  for (let i = 0; i < state.current.length; i++) {
    const node = document.getElementById(`numero-${i}`);
    if (node) state.current[i] = node.textContent;
  }
}

export function submitGuess() {
  if (!state.playing) return;
  organizarCodigo();

  if (state.current.length < state.length) {
    setStatus(`⚠ Completa los ${state.length} campos antes de enviar.`, true);
    return;
  }
  if (new Set(state.current).size !== state.current.length) {
    setStatus('⚠ No se permiten elementos repetidos.', true);
    return;
  }

  // >> 🔊 AUDIO: Suena el latigazo digital al lanzar el ataque a la IA
  sfx.ataque();

  const guess = [...state.current];
  const { correct, present } = calculateHints(guess, state.secret);
  state.attempts++;

  addLogRow(guess, correct, present, state.attempts);

  if (correct === state.length) {
    stopTimer();
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    state.playing = false;

    const records = loadRecords();
    const isRecord = (records[state.length] == null || state.elapsed < records[state.length]);
    if (isRecord) {
      records[state.length] = state.elapsed;
      saveRecords(records);
    }

    setStatus(`✔ CÓDIGO DESCIFRADO en ${state.attempts} intento(s).`, false);
    
    // >> 🔊 AUDIO: Sonido de victoria contra la IA
    sfx.victoria(); 
    showVictory(isRecord);
  } else {
    setStatus(`Aciertos exactos: ${correct} · Presentes: ${present}`, false);

    // >> 🔊 AUDIO: Feedback adaptativo contra la IA
    if (correct >= state.length - 1) {
      sfx.aciertoBueno(); // Arpegio brillante si estás a punto de descifrarlo
    } else if (correct === 0 && present === 0) {
      sfx.falloTotal(); // Zumbido sordo si fallaste todas las casillas
    }
  }

  state.current = [];
  crearSlots();
  refreshKeypad();
}


// =============================================================================
// MODIFICACIÓN CRÍTICA EN match.js: LECTURA DIRECTA DESDE ESTADO EN RED
// =============================================================================

export function submitGuessMulti() {
  if (!state.playing) return;

  // VERIFICACIÓN DE SEGURIDAD INTERNA: Validar si es realmente el turno del jugador humano
  const jugadorActual = state.connectedPlayers[state.currentPlayerIndex];
  if (!jugadorActual || jugadorActual.name !== state.username) {
    mostrarAlertaCyber("No es tu turno de transmisión. Espera a que los demás terminales concluyan.", true);
    return;
  }

  // 1. Validar que haya un jugador objetivo seleccionado
  if (!state.selectedTargetFilter) {
    mostrarAlertaCyber("PROTOCOLO COMPROMETIDO: Debes seleccionar un Hacker objetivo de la lista lateral antes de lanzar el ataque.", true);
    return;
  }

  const atacante = state.username;
  const objetivo = state.selectedTargetFilter;

  // VERIFICACIÓN DE REPETICIÓN: Validar si el humano ya atacó a este objetivo en el turno actual
  if (!state.playerTargetBlocks[atacante]) state.playerTargetBlocks[atacante] = [];
  if (state.playerTargetBlocks[atacante].includes(objetivo)) {
    mostrarAlertaCyber(`OBJETIVO BLOQUEADO: Ya has inyectado un código en el nodo de ${objetivo.toUpperCase()} durante esta fase.`, true);
    return;
  }

  // ¡CORRECCIÓN MAESTRA!: En lugar de buscar los elementos en el HTML mediante document.getElementById,
  // leemos directamente el array de memoria 'state.intentoMulti' que ya está purificado por el teclado.
  // Filtramos cualquier valor nulo, indefinido o vacío para asegurar un envío limpio.
  const digitosIngresados = state.intentoMulti.filter(v => v !== undefined && v !== null && v !== '');

  // 2. Validar que el código esté completo comparando contra la longitud requerida de la sala
  if (digitosIngresados.length < state.multiLength) {
    mostrarAlertaCyber(`SECUENCIA INCOMPLETA: Se requieren exactamente ${state.multiLength} elementos para ejecutar el descifrado.`, true);
    return;
  }

  // 3. Validar elementos repetidos (Regla Mastermind)
  if (new Set(digitosIngresados).size !== digitosIngresados.length) {
    mostrarAlertaCyber('ERROR DE CONFIGURACIÓN: No se permiten elementos repetidos en la secuencia de ataque.', true);
    return;
  }

  // ¡BARRERA DE SEGURIDAD ABSOLUTA EN RED!
  if (objetivo === state.username) {
    mostrarAlertaCyber("Acceso rechazado. Protocolo de seguridad activado. No puedes inyectar un ataque a tu propia terminal.", true);
    return;
  }

  const codigoAtaque = [...digitosIngresados];

  // REGISTRO CRÍTICO: Bloquear local e inmediatamente al objetivo en esta ronda
  state.playerTargetBlocks[atacante].push(objetivo);

  // TRANSMISIÓN EN TIEMPO REAL: Emitir el intento al servidor central de Render
  sfx.ataque();
  
  let nombreSalaActive = state.isHost 
    ? (el.roomNameInput.value.trim().toUpperCase() || `SERVER_${state.username.toUpperCase()}`) 
    : state.selectedRoomCode;

  // Si por alguna razón el texto de la interfaz tiene el código en vivo real (ej. SALA: X9F2R), lo extraemos de forma segura
  if (el.roomLiveCode && el.roomLiveCode.textContent.includes('SALA:') && !el.roomLiveCode.textContent.includes('PENDIENTE')) {
    nombreSalaActive = el.roomLiveCode.textContent.replace('SALA:', '').trim();
  }

  socket.emit('inyectar_ataque', {
    roomCode: nombreSalaActive,
    atacante: atacante,
    objetivo: objetivo,
    guess: codigoAtaque
  });

  // Limpiar y resetear las casillas de entrada locales inmediatamente para el siguiente ataque de la partida
  state.intentoMulti = [];
  state.presionado = ""; // Liberar el foco del slot para que el auto-foco del teclado vuelva a empezar desde cero
  
  crearSlots();
  refreshKeypad();
}

// Pega esto al final de match.js para respaldar el Modo Solo de Práctica
export function calculateHints(guess, secret) {
  let correct = 0;
  let present = 0;
  const secretUsed = new Array(secret.length).fill(false);
  const guessResolved = new Array(guess.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      correct++;
      secretUsed[i] = true;
      guessResolved[i] = true;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (guessResolved[i]) continue;
    for (let j = 0; j < secret.length; j++) {
      if (!secretUsed[j] && guess[i] === secret[j]) {
        present++;
        secretUsed[j] = true;
        break;
      }
    }
  }
  return { correct, present };
}

