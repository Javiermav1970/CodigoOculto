/* =========================================================
   CÓDIGO OCULTO - Controlador de Partidas (Modo IA y Red en Línea)
   ========================================================= */
import { BANK, state, loadRecords, saveRecords } from './config.js';
import { el } from './dom.js';
import { buildKeypad, crearSlots, refreshKeypad, renderizarBitacoraFiltrada, setStatus } from './ui.js';
import { actualizarVisualSalaJugadores, showVictory, addLogRow } from './main.js';
import { startTimer, stopTimer } from './timer.js';
import { calculateHints } from './bots.js';
import { finalizarTurnoJugador } from './referee.js';
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
    audio.emitirVozTerminal("Mainframe asegurado. Intenta burlar mi cifrado, hacker.");
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


export function submitGuessMulti() {
  if (!state.playing) return;

  // VERIFICACIÓN DE SEGURIDAD INTERNA: Validar si es realmente el turno del jugador humano
  const jugadorActual = state.connectedPlayers[state.currentPlayerIndex];
  if (jugadorActual.name !== state.username) {
    alert("✖ ACCESO DENEGADO: No es tu turno de transmisión. Espera a que los demás terminales concluyan.");
    return;
  }

  // 1. Validar que haya un jugador objetivo seleccionado
  if (!state.selectedTargetFilter) {
    alert("❌ PROTOCOLO COMPROMETIDO: Debes seleccionar un Hacker objetivo de la lista lateral antes de lanzar el ataque.");
    return;
  }

  const atacante = state.username;
  const objetivo = state.selectedTargetFilter;

  // VERIFICACIÓN DE REPETICIÓN: Validar si el humano ya atacó a este objetivo en el turno actual
  if (!state.playerTargetBlocks[atacante]) state.playerTargetBlocks[atacante] = [];
  if (state.playerTargetBlocks[atacante].includes(objetivo)) {
    alert(`⚠ OBJETIVO BLOQUEADO: Ya has inyectado un código en el nodo de ${objetivo.toUpperCase()} durante esta fase.`);
    return;
  }

  // Organizar los elementos que el usuario introdujo en los slots multijugador
  for (let i = 0; i < state.multiLength; i++) {
    const node = document.getElementById(`numero-${i}`);
    if (node) state.intentoMulti[i] = node.textContent;
  }

  // 2. Validar que el código esté completo
  const digitosIngresados = state.intentoMulti.filter(v => BANK.includes(v));

  if (digitosIngresados.length < state.multiLength) {
    alert(`⚠ SECUENCIA INCOMPLETA: Se requieren exactamente ${state.multiLength} elementos para ejecutar el descifrado.`);
    return;
  }

  if (new Set(digitosIngresados).size !== digitosIngresados.length) {
    alert('⚠ ERROR DE CONFIGURACIÓN: No se permiten elementos repetidos en la secuencia de ataque.');
    return;
  }

    // ¡BARRERA DE SEGURIDAD ABSOLUTA EN RED!
  if (state.selectedTargetFilter === state.username) {
    alert("❌ ACCESO RECHAZADO: Protocolo de seguridad activado. No puedes inyectar un ataque a tu propia terminal.");
    return;
  }

  const codigoAtaque = [...digitosIngresados];

  // REGISTRO CRÍTICO: Bloquear local e inmediatamente al objetivo en esta ronda
  state.playerTargetBlocks[atacante].push(objetivo);

  // TRANSMISIÓN EN TIEMPO REAL: Emitir el intento al servidor central
  // El cálculo de pistas, guardado de historial y estados de victoria se procesan ahora en la nube
  sfx.ataque(); // <-- ¡DISPARAR AQUÍ! Suena un latigazo digital al presionar Enviar.
  socket.emit('inyectar_ataque', {
    roomCode: state.isHost ? (el.roomNameInput.value.trim().toUpperCase() || `SERVER_${state.username.toUpperCase()}`) : state.selectedRoomCode,
    atacante: atacante,
    objetivo: objetivo,
    guess: codigoAtaque
  });

  // Limpiar y resetear las casillas de entrada locales inmediatamente para el siguiente ataque
  state.intentoMulti = [];
  crearSlots();
  refreshKeypad();
  state.selectedTargetFilter = null; 
}
