/* =========================================================
   CÓDIGO OCULTO - Juego de deducción tipo Mastermind (Cliente de Red Real-Time)
   ========================================================= */
import { state, BANK, MOCK_ROOMS, isFigure, loadRecords } from './config.js';
import { formatTime,  stopTimer } from './timer.js';
import { el } from './dom.js';
import { renderizarCuadernoNotas } from './notes.js';
import { setStatus, setMultiSetupMessage, buildKeypad, crearSlots, renderizarBitacoraFiltrada, addElement, deleteElement } from './ui.js';
import { renderRoomsList, renderConnectedPlayers } from './rooms.js';
import { launchConfetti, removeOverlay } from './fx.js';
import { startGame, submitGuess, submitGuessMulti } from './match.js';
import { abandonarPartidaMultijugador, socket } from './mode-multi.js'; // Importación del canal de red activo
import { celebrarDescifradoIntermedio, mostrarVentanaFlotanteAtaque, ejecutarVictoriaGlobal } from './referee.js';

// Importamos la inicialización de los manejadores de eventos de cada modo para que se ejecuten
import './mode-ia.js';
import './mode-multi.js';

/* ---------- CONFIGURACIÓN DE ESCUCHADORES DE INTERFAZ EN TIEMPO REAL ---------- */
export function vincularEventosGraficosDeRed() {
  if (!socket) return;

  // A. Escuchar popups flotantes de ataques síncronos enviados por otros terminales
     // RECIBIR SALAS REALES DEL SERVIDOR
  socket.on('lista_salas_actualizada', (salasReales) => {
    import('./rooms.js').then(modulo => modulo.renderRoomsList(salasReales));
  });
  socket.on('popup_ataque_recibido', (datos) => {
    mostrarVentanaFlotanteAtaque(datos.emisor, datos.receptor, datos.codigo);
  });

  // B. Sincronizar el historial de la bitácora unificada calculada en la nube
  socket.on('actualizar_bitacora_global', (datos) => {
    state.multiplayerHistory = datos.multiplayerHistory;
    state.currentPlayerIndex = datos.currentPlayerIndex; // <--- Añadir esta línea para recibir el turno del servidor
  
    // Refrescar paneles de espera/transmisión de inmediato
    actualizarVisualSalaJugadores(); 

    if (state.selectedTargetFilter === datos.target) {
      renderizarBitacoraFiltrada();
    }
  });

  // C. Recibir notificaciones de vulnerabilidades críticas (Nodos quebrados)
  socket.on('nodo_comprometido_alerta', (datos) => {
    state.decryptedPlayers = datos.decryptedPlayers;
    celebrarDescifradoIntermedio(datos.atacante, datos.objetivo);
    actualizarVisualSalaJugadores();
  });

  // D. Fin del juego dictado por el servidor central de Render
  socket.on('victoria_global_servidor', (datos) => {
    ejecutarVictoriaGlobal(datos.ganador);
  });

  // E. Manejar desconexiones inesperadas o abandonos directos de rivales
  socket.on('jugador_abandono_sala', (datos) => {
    state.connectedPlayers = datos.connectedPlayers;
    actualizarVisualSalaJugadores();
    
    // Generar banner estético de advertencia temporal por desconexión
    const popup = document.createElement('div');
    popup.className = 'broadcast-popup';
    popup.style.borderColor = 'var(--danger)';
    popup.innerHTML = `
      <div class="broadcast-content">
        <div class="broadcast-header" style="color:var(--danger)">⚠️ CONEXIÓN INTERRUMPIDA</div>
        <p>El terminal de <strong>${datos.nombre.toUpperCase()}</strong> ha abortado la sesión de red.</p>
      </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3500);
  });
}

/* ---------- RENDER DE MEJORES TIEMPOS ---------- */
function renderRecords() {
  const records = loadRecords();
  const levels = [
    { len: 3, name: 'Principiante' },
    { len: 4, name: 'Estándar' },
    { len: 5, name: 'Experto' }
  ];

  Object.keys(records).forEach(lenKey => {
    const len = parseInt(lenKey, 10);
    if (!levels.some(lv => lv.len === len)) {
      levels.push({ len: len, name: 'Personalizado' });
    }
  });

  levels.sort((a, b) => a.len - b.len);

  el.records.innerHTML = levels.map(lv => {
    const best = records[lv.len];
    const time = (best != null) 
      ? `<span class="r-time">${formatTime(best)}</span>` 
      : '<span class="r-time empty">—</span>';
    return `<div class="record-row"><span class="r-name">${lv.name} · ${lv.len}</span>${time}</div>`;
  }).join('');
}

export function resetGame() {
  state.notasDeduccion = {};
  const panelNotas = document.getElementById('cuadernoNotasPanel');
  if (panelNotas) panelNotas.remove(); 

  state.playing = false;
  stopTimer();
  renderRecords();
  el.modePanel.classList.remove('hidden');
  el.setupPanel.classList.add('hidden');
  el.botones.classList.add('hidden');
  el.botones.disabled = false;
  el.statusPanel.classList.add('hidden');
  el.keypadPanel.classList.add('hidden');
  el.logPanel.classList.add('hidden');
  removeOverlay();
}

/* ---------- GESTIÓN DE SALAS MULTIJUGADOR ---------- */
export function addLogRow(guess, correct, present, index) {
  const empty = el.log.querySelector('.log-empty');
  if (empty) empty.remove();

  const row = document.createElement('div');
  row.className = 'log-row';

  const guessHtml = guess.map(v => `<div class="log-el ${isFigure(v) ? 'fig' : 'num'}">${v}</div>`).join('');

  row.innerHTML = `
    <div class="log-index">#${String(index).padStart(2, '0')}</div> 
    <div class="log-guess">${guessHtml}</div> 
    <div class="hints"> 
      <div class="hint correct"><span class="dot"></span>${correct}</div> 
      <div class="hint present"><span class="dot"></span>${present}</div> 
    </div>`;

  el.log.appendChild(row);
  el.log.scrollTop = el.log.scrollHeight;
}

/* ---------- FINALIZACIÓN DE PARTIDA ---------- */
export function showVictory(isRecord) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'winOverlay';

  const codeHtml = state.secret.map(v => `<div class="log-el ${isFigure(v) ? 'fig' : 'num'}">${v}</div>`).join('');
  const recordBadge = isRecord ? '<div class="record-badge">★ NUEVO RÉCORD DE TIEMPO</div>' : '';

  overlay.innerHTML = `
    <div class="win-card"> 
      <h2>ACCESO CONCEDIDO</h2> 
      <p>Descifraste el código oculto en ${state.attempts} intento(s) · Tiempo: ${formatTime(state.elapsed)}</p> 
      ${recordBadge} 
      <div class="win-code">${codeHtml}</div> 
      <button class="primary-btn" id="playAgainBtn">JUGAR DE NUEVO</button> 
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('playAgainBtn').addEventListener('click', resetGame);
  launchConfetti();
}

function timeUp() {
  stopTimer();
  state.playing = false;
  setStatus('✖ TIEMPO AGOTADO. El código quedó sin descifrar.', true);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'winOverlay';

  const codeHtml = state.secret.map(v => `<div class="log-el ${isFigure(v) ? 'fig' : 'num'}">${v}</div>`).join('');

  overlay.innerHTML = `
    <div class="win-card lose"> 
      <h2>TIEMPO AGOTADO</h2> 
      <p>No lograste descifrar el código a tiempo. Era:</p> 
      <div class="win-code">${codeHtml}</div> 
      <button class="primary-btn" id="playAgainBtn">REINTENTAR</button> 
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('playAgainBtn').addEventListener('click', resetGame);
}

/* ---------- BOTONES Y FLUJOS NAVEGACIÓN ---------- */
el.connectSelectedBtn.addEventListener('click', () => {
  if (!state.selectedRoomCode) return;

  state.multiplayerHistory = [];
  state.selectedTargetFilter = null;
  state.decryptedPlayers = [];
  state.playerTargetBlocks = {};
  state.botMemory = {};
  
  state.isHost = false; 
  state.tipoPanel = "lobbyPanel"; 
  state.currentPlayerIndex = 0;  

  // Buscar los datos de la sala real que seleccionó el invitado
  const salaSeleccionada = MOCK_ROOMS.find(r => r.code === state.selectedRoomCode);
  if (salaSeleccionada) {
    state.multiLength = salaSeleccionada.len; 
    // Si tu servidor envía también el límite de tiempo en la lista, lo asignamos aquí:
    state.limit = salaSeleccionada.limit || 0; 
    el.roomNameInput.value = `SERVER_${salaSeleccionada.host.toUpperCase()}`;
  }

  state.mySecretCode = [];

  // Bloquear campos de texto de la sala
  el.roomNameInput.disabled = true;
  el.roomMaxPlayersInput.type = 'text';
  el.roomMaxPlayersInput.value = state.username.toUpperCase();
  el.roomMaxPlayersInput.disabled = true; 
  
  const etiquetaMax = document.querySelector('label[for="roomMaxPlayersInput"]');
  if (etiquetaMax) etiquetaMax.textContent = "CODENAME DE RED:";

  // 1 y 2. OCULTAR Y COMPORTAMIENTO DE SELECCIÓN (Dificultad y Límite de Tiempo)
  // Ocultamos las filas de botones para que el invitado no pueda hacer clic ni cambiarlos
  const diffContainer = document.querySelector('.diff-row') || el.multiDiffBtns[0]?.parentElement;
  if (diffContainer) diffContainer.style.display = 'none';
  if (el.multiCustomDiffBtn) el.multiCustomDiffBtn.style.display = 'none';

  // Si tienes un contenedor para los botones de límite de tiempo en el HTML, lo ocultamos:
  const limitContainer = el.multiLimitBtns[0]?.parentElement;
  if (limitContainer) limitContainer.style.display = 'none';

  // Opcional: Resaltar visualmente el botón que corresponde a la dificultad de la sala
  el.multiDiffBtns.forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.len, 10) === state.multiLength);
  });
  // Resaltar visualmente el botón del límite de tiempo elegido por el creador
  if (el.multiLimitBtns) {
    el.multiLimitBtns.forEach(b => {
      b.classList.toggle('active', (parseInt(b.dataset.limit, 10) || 0) === state.limit);
    });
  }

  // 3. GENERAR AUTOMÁTICAMENTE LOS SLOTS DE ACUERDO A LA SALA
  setMultiSetupMessage('Establece tu cifrado de acceso para ingresar a la terminal.', false);
  crearSlots(); // Esta función leerá el state.multiLength heredado de la sala y creará los candados exactos
 
  el.multiLockCodeBtn.textContent = "🔒 INGRESO A RED";
  el.multiLockCodeBtn.disabled = false;

  if (el.forceStartMultiBtn) el.forceStartMultiBtn.classList.add('hidden');

  el.lobbyPanel.classList.add('hidden');
  el.createRoomPanel.classList.remove('hidden');
  buildKeypad(); 
});


el.vsIaBtn.addEventListener('click', () => {
  state.username = el.usernameInput.value.trim() || 'Hacker';
  state.gameMode = 'ia';
  el.modePanel.classList.add('hidden');
  el.setupPanel.classList.remove('hidden');
});

el.vsPlayerBtn.addEventListener('click', () => {
  const inputName = el.usernameInput.value.trim();
  if (!inputName) {
    alert("❌ ACCESO DENEGADO: El seudónimo es obligatorio para el protocolo Multijugador.");
    el.usernameInput.focus();
    return;
  }
  state.username = inputName;
  state.gameMode = 'multi';
  el.lobbyUserDisplay.textContent = state.username.toUpperCase();
  el.modePanel.classList.add('hidden');
  el.lobbyPanel.classList.remove('hidden');
  renderRoomsList(MOCK_ROOMS);
  renderRoomsList([]); // Limpia la lista vieja primero
  if (socket) socket.emit('solicitar_lista_salas'); // <--- Pide las salas reales al servidor de inmediato
});

el.createRoomBtn.addEventListener('click', () => {
  state.multiplayerHistory = [];
  state.selectedTargetFilter = null;
  state.decryptedPlayers = [];
  state.playerTargetBlocks = {};
  state.botMemory = {};
  
  state.isHost = true;             
  state.currentPlayerIndex = 0;    
  state.tipoPanel = "lobbyPanel"; 
  state.multiLength = 3;
  state.mySecretCode = [];
  state.isCodeLocked = false;
  state.limit = 0;
  state.connectedPlayers = [{ name: state.username, isHost: true }];
  state.maxPlayersAllowed = parseInt(el.roomMaxPlayersInput.value, 10) || 2;

  el.roomNameInput.disabled = false;
  el.roomMaxPlayersInput.disabled = false;
  el.multiCustomLenInput.disabled = false;
  el.roomNameInput.placeholder = `SERVER_${state.username.toUpperCase()}`;
  el.roomLiveCode.textContent = "SALA: PENDIENTE";
  el.forceStartMultiBtn.disabled = true;

  setMultiSetupMessage('Establece tu cifrado usando la consola inferior.', false);
  
  el.multiDiffBtns.forEach(b => b.classList.remove('active'));
  el.multiCustomDiffBtn.classList.remove('active');
  el.multiDiffBtns[0].classList.add('active');

  if (el.multiLimitBtns) {
    el.multiLimitBtns.forEach(b => b.classList.remove('active'));
    if (el.multiLimitBtns[0]) el.multiLimitBtns[0].classList.add('active');
  }
  
  el.lobbyPanel.classList.add('hidden');
  el.createRoomPanel.classList.remove('hidden');

  crearSlots();
  renderConnectedPlayers();
  buildKeypad();
});

/* ---------- BOTONES ADICIONALES DE RETORNO Y CONTROL ---------- */
el.refreshRoomsBtn.addEventListener('click', () => {
  if (socket) socket.emit('solicitar_lista_salas');
});
el.backToModeBtn.addEventListener('click', () => { 
  el.setupPanel.classList.add('hidden'); 
  el.modePanel.classList.remove('hidden'); 
});

el.backToModeFromLobbyBtn.addEventListener('click', () => { 
  el.lobbyPanel.classList.add('hidden'); 
  el.modePanel.classList.remove('hidden'); 
});

el.startBtn.addEventListener('click', startGame);
el.restartBtn.addEventListener('click', resetGame);
el.MultirestartBtn.addEventListener('click', abandonarPartidaMultijugador);

el.delBtn.addEventListener('click', deleteElement);
el.multiDelBtn.addEventListener('click', deleteElement);
el.StatusMultidelBtn.addEventListener('click', deleteElement);

el.sendBtn.addEventListener('click', submitGuess);
el.StatusMultisendBtn.addEventListener('click', submitGuessMulti);

el.backToLobbyFromCreateBtn.addEventListener('click', () => {
  el.roomNameInput.disabled = false;
  el.roomNameInput.value = '';
  el.roomMaxPlayersInput.type = 'number';
  el.roomMaxPlayersInput.disabled = false;
  
  const etiquetaMax = document.querySelector('label[for="roomMaxPlayersInput"]');
  if (etiquetaMax) etiquetaMax.textContent = "Límite de Hackers en partida";

  const diffContainer = document.querySelector('.diff-row') || el.multiDiffBtns[0]?.parentElement;
  if (diffContainer) diffContainer.style.display = 'flex';

  if (el.multiCustomDiffBtn) el.multiCustomDiffBtn.style.display = 'block';
  
  el.multiLockCodeBtn.textContent = "🔒 INICIAR PARTIDA";

  if (el.forceStartMultiBtn) el.forceStartMultiBtn.classList.remove('hidden');
  
  el.createRoomPanel.classList.add('hidden');
  el.lobbyPanel.classList.remove('hidden');
});

  /* ---------- CAPTURA DE TECLADO FÍSICO ---------- */
document.addEventListener('keydown', (event) => {
  if (!state.playing) return;
  const key = event.key.toUpperCase();
  const figureMap = { 'Q': '▲', 'W': '●', 'E': '■', 'R': '♦', 'T': '♥', 'Y': '✖' };
  if (key === 'ENTER') {
    if (state.gameMode === 'multi') {
      submitGuessMulti();
    } else {
      submitGuess();
    }
  }
  else if (key === 'BACKSPACE' || key === 'DELETE') deleteElement();
  else if (figureMap[key]) addElement(figureMap[key]);
  else if (BANK.includes(key)) addElement(key);
});
/**
 * Refresca la interfaz de la lista lateral para reflejar bloqueos globales, 
 * estados e indicadores de transmisión.
 */
export function actualizarVisualSalaJugadores() {
    if (!el.jugadorespanel) return;

    const bloqueadosPorHumano = state.playerTargetBlocks[state.username] || [];
    let htmlGrid = `<div class="players-grid-container">`;

    htmlGrid += state.connectedPlayers.map((p, idx) => {
        // Evaluación de estados del jugador
        const esCulpable = state.decryptedPlayers.includes(p.name);
        const esTurnoActual = state.currentPlayerIndex === idx;
        const esHistorialActivo = (state.selectedTargetFilter === p.name);
        const yaAtacadoEnTurno = bloqueadosPorHumano.includes(p.name);
        const esElMismoHumano = (p.name === state.username);

        // Clases CSS dinámicas
        const claseBloqueado = (esCulpable || yaAtacadoEnTurno || esElMismoHumano) ? 'bloqueado' : '';
        const claseSelected = (esHistorialActivo && !claseBloqueado) ? 'selected' : '';
        const claseHistorial = esHistorialActivo ? 'historial-activo' : '';

        // Determinar rol de Host
        const determinaHost = p.isHost || (idx === 0 && state.isHost) || p.host;
        let badge = determinaHost ? 'H' : 'R';
        if (esCulpable) badge = '✖';

        // Determinar estado de señal (Transmisión)
        let signalBadge = '';
        if (!esCulpable) {
            if (esTurnoActual) {
                signalBadge = `<span class="signal-badge transmitting">⚡ TRANSMITIENDO</span>`;
            } else {
                signalBadge = `<span class="signal-badge listening">💤 EN ESPERA</span>`;
            }
        }

        // Estilos en línea condicionales
        const estiloTurno = esTurnoActual ? 'border: 1px solid #00f5d4; background: rgba(0,245,212,0.1);' : '';
        let opacidad = (esCulpable || esElMismoHumano) ? 'opacity: 0.4;' : '';
        if (yaAtacadoEnTurno && !esCulpable) opacidad = 'opacity: 0.5; pointer-events: none;';
        if (esElMismoHumano) opacidad += ' pointer-events: none;';

        // Plantilla HTML del componente de jugador
        return `
            <div class="player-card-item ${claseSelected} ${claseBloqueado}" data-name="${p.name}" data-order="${idx + 1}" style="${estiloTurno} ${opacidad}"> 
                <div class="player-info-inline" style="pointer-events: auto; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;"> 
                    <div style="display: flex; align-items: center; gap: 6px; width: 100%;"> 
                        <span class="player-name-text" title="${p.name.toUpperCase()}">${esTurnoActual ? '▶️ ' : ''}📡 ${p.name.toUpperCase()}</span> 
                        ${badge} 
                    </div> 
                    ${signalBadge} 
                </div> 
                <div style="display: flex; gap: 4px;"> 
                    <button class="view-history-btn-compact ${claseHistorial}" data-target-name="${p.name}" style="pointer-events: auto;" title="Ver bitácora de ataques"> ↻ </button> 
                    <button class="open-notes-btn-compact" data-target-name="${p.name}" style="pointer-events: auto;" ${esCulpable || p.name === state.username ? 'disabled' : ''} title="Abrir Notas Deductivas"> 📝 </button> 
                </div> 
            </div>`;
    }).join('');

    htmlGrid += `</div>`;
    el.jugadorespanel.innerHTML = htmlGrid;
}

if (el.jugadorespanel) {
  el.jugadorespanel.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.view-history-btn-compact');
    if (viewBtn) {
      event.stopPropagation();
      const targetName = viewBtn.dataset.targetName;
      el.jugadorespanel.querySelectorAll('.view-history-btn-compact')
      .forEach(btn => btn.classList.remove('historial-activo'));
      viewBtn.classList.add('historial-activo');
      state.selectedTargetFilter = targetName;
      renderizarBitacoraFiltrada();
      return;
    }
    const notesBtn = event.target.closest('.open-notes-btn-compact');
    if (notesBtn) {
      event.stopPropagation();
      const targetName = notesBtn.dataset.targetName;
      state.selectedTargetFilter = targetName;
      abrirModalNotas();
      return;
    }
    const playerCard = event.target.closest('.player-card-item');
    if (!playerCard) return;
    const chosenPlayerName = playerCard.dataset.name;
    if (chosenPlayerName === state.username || playerCard.classList.contains('bloqueado')) {
      return;
    }
    const currentActive = el.jugadorespanel.querySelector('.player-card-item.selected');
    if (currentActive) currentActive.classList.remove('selected');
    playerCard.classList.add('selected');
    state.selectedTargetFilter = chosenPlayerName;
    renderizarBitacoraFiltrada();
  });
}
function abrirModalNotas() {
  const viejoModal = document.getElementById('modalNotasDeduccion');
  if (viejoModal) viejoModal.remove();
  const modal = document.createElement('div');
  modal.id = 'modalNotasDeduccion';
  modal.className = 'overlay-notes';
  modal.innerHTML = `
    <div class="notes-modal-card"> 
      <div class="notes-modal-close" id="closeNotesModalBtn">✕</div> 
      <div id="cuadernoNotasContenedor"></div> 
    </div>
  `;
  document.body.appendChild(modal);

  renderizarCuadernoNotas();

  document.getElementById('closeNotesModalBtn').addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}
export function lanzarFuegosArtificialesCiberpunk() {
  const colores = ['#00f5d4', '#f637ec', '#ffb703', '#ff4d6d', '#ffffff'];
  const intervaloPirotecnia = setInterval(() => {
    if (!document.getElementById('winOverlay')) {
      clearInterval(intervaloPirotecnia);
      return;
    }
    const centroX = Math.random() * 100;
    const centroY = 20 + Math.random() * 50;
    const colorExplosion = colores[Math.floor(Math.random() * colores.length)];
    for (let i = 0; i < 24; i++) {
      const particula = document.createElement('div');
      particula.className = 'confetti';
      particula.style.left = centroX + 'vw';
      particula.style.top = centroY + 'vh';
      particula.style.background = colorExplosion;
      particula.style.width = '6px';
      particula.style.height = '6px';
      particula.style.borderRadius = '50%';
      particula.style.boxShadow = `0 0 8px ${colorExplosion}`;

      const angulo = (i * 15) * (Math.PI / 180);
      const velocidad = 40 + Math.random() * 60;
      const desvX = Math.cos(angulo) * velocidad;
      const desvY = Math.sin(angulo) * velocidad;

      particula.style.setProperty('--x', `${desvX}px`);
      particula.style.setProperty('--y', `${desvY}px`);
      particula.style.animation = 'fuegosArtificialesAnim 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards';
      document.body.appendChild(particula);
      setTimeout(() => particula.remove(), 1800);
    }
  }, 450);
}
renderRecords();
// Añadir al final absoluto de main.js para encender la red en tiempo real
import { inicializarConexionSocket } from './mode-multi.js';

// Conectarse de forma local al puerto 3000 de Node.js
// Nota: Cuando subamos el servidor a Render.com, solo cambiaremos esta URL por la pública gratuita.
const urlServidorPruebas = "https://codigooculto-v1kw.onrender.com";
const instanciaSocket = io(urlServidorPruebas);

// Compartir el canal activo e inicializar los escuchadores gráficos que acabamos de configurar
inicializarConexionSocket(instanciaSocket);
vincularEventosGraficosDeRed();
