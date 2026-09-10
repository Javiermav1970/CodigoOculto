/* =========================================================
   CÓDIGO OCULTO - Controlador de Partida Modo Multijugador (En Línea)
   ========================================================= */
import { state, BANK } from './config.js';
import { el } from './dom.js';
import { buildKeypad, crearSlots, refreshKeypad, setMultiSetupMessage } from './ui.js';
import { renderConnectedPlayers } from './rooms.js';
import { lanzarPartidaMultijugador } from './match.js';
import { resetGame, actualizarVisualSalaJugadores } from './main.js';

// Variable de conexión global que inicializaremos en el punto de entrada
export let socket = null;

/**
 * Asigna la instancia activa de la conexión de red compartida por el orquestador
 */
export function inicializarConexionSocket(instanciaSocket) {
  socket = instanciaSocket;
  configurarEscuchadoresRed();
}

// Validar longitud personalizada modo multijugador
export function validarLongitudPersonalizadaMulti() {
  let val = parseInt(el.multiCustomLenInput.value, 10);
  const maxElements = BANK.length;

  if (isNaN(val) || val < 3) val = 3;
  if (val > maxElements) val = maxElements;
  
  el.multiCustomLenInput.value = val;
  state.multiLength = val;
  state.mySecretCode = [];
  
  crearSlots();
  refreshKeypad();
}

// Eventos de los botones de dificultad del menú multiplayer
el.multiDiffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.isCodeLocked) return;
    el.multiDiffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.multiLength = parseInt(btn.dataset.len, 10);
    state.mySecretCode = [];
    crearSlots();
    refreshKeypad();
  });
});

el.multiCustomDiffBtn.addEventListener('click', () => {
  if (!state.isCodeLocked) {
    el.multiDiffBtns.forEach(b => b.classList.remove('active'));
    el.multiCustomDiffBtn.classList.add('active');
    validarLongitudPersonalizadaMulti();
  }
});

el.multiCustomLenInput.addEventListener('input', () => {
  if (el.multiCustomDiffBtn.classList.contains('active') && !state.isCodeLocked) {
    validarLongitudPersonalizadaMulti();
  }
});

// Confirmación y bloqueo del código de acceso a la red
el.multiLockCodeBtn.addEventListener('click', () => {
  if (state.mySecretCode.length < state.multiLength) {
    setMultiSetupMessage(`⚠ ERROR: Cifrado incompleto. Requiere ${state.multiLength} elementos.`, true);
    return;
  }

  state.isCodeLocked = true;

  // 1. TRANSMISIÓN EN CALIENTE: Si es HOST, publica la sala en internet
  if (state.isHost) {
    let roomName = el.roomNameInput.value.trim().toUpperCase() || `SERVER_${state.username.toUpperCase()}`;
    state.maxPlayersAllowed = parseInt(el.roomMaxPlayersInput.value, 10) || 2;
    
    el.roomNameInput.disabled = true;
    el.roomMaxPlayersInput.disabled = true;
    el.encabezado.textContent = roomName;

    setMultiSetupMessage("✔ PUBLICANDO SALA EN LA RED CENTRAL...", false);
    
    // NOTIFICACIÓN AL SERVIDOR: Registrar la nueva sala en internet
    socket.emit('crear_sala', {
      roomCode: roomName,
      username: state.username,
      maxPlayers: state.maxPlayersAllowed,
      multiLength: state.multiLength,
      limit: state.limit
    });
  } 
  // 2. TRANSMISIÓN EN CALIENTE: Si es INVITADO, solicita unirse al nodo remoto
  else {
    setMultiSetupMessage("✔ ENVIANDO PETICIÓN DE ACCESO AL NODO...", false);
    
    socket.emit('unirse_sala', {
      roomCode: state.selectedRoomCode,
      username: state.username
    });
  }
});

/**
 * Escucha los eventos globales provenientes de la nube para reaccionar en tiempo real
 */
function configurarEscuchadoresRed() {
  if (!socket) return;

  // A. Sincronizar listado de salas
  socket.on('lista_salas_actualizada', (salasReales) => {
    import('./config.js').then(config => {
      config.MOCK_ROOMS.length = 0;
      salasReales.forEach(sala => config.MOCK_ROOMS.push(sala));
    });
    import('./rooms.js').then(modulo => modulo.renderRoomsList(salasReales));
  });

  // B. Confirmación de creación para el Host
  socket.on('sala_creada_ok', (sala) => {
    state.connectedPlayers = sala.connectedPlayers;
    el.roomLiveCode.textContent = `SALA: ${sala.code}`;
    setMultiSetupMessage("✔ SALA PUBLICADA. Esperando cifrados adversarios...", false);
    
    buildKeypad();
    crearSlots();
    refreshKeypad();
    renderConnectedPlayers();

    socket.emit('confirmar_codigo_secreto', {
      roomCode: sala.code,
      username: state.username,
      secretCode: [...state.mySecretCode]
    });
  });

  // C. Confirmación de acceso concedido para el Invitado
  socket.on('union_exitosa', (datos) => {
    state.multiLength = datos.multiLength;
    state.limit = datos.limit;
    setMultiSetupMessage("✔ ENLAZADO. Transmitiendo clave de acceso...", false);

    // Al recibir esta señal, el invitado envía inmediatamente su contraseña elegida
    socket.emit('confirmar_codigo_secreto', {
      roomCode: state.selectedRoomCode,
      username: state.username,
      secretCode: [...state.mySecretCode]
    });
  });

  // D. Sincronizar hackers conectados
  socket.on('actualizar_sala_jugadores', (jugadores) => {
    state.connectedPlayers = jugadores;
    renderConnectedPlayers();
    actualizarVisualSalaJugadores();
  });

  socket.on('error_red', (mensaje) => {
    alert(mensaje);
    state.isCodeLocked = false;
    setMultiSetupMessage(mensaje, true);
  });

  // E. ACTIVACIÓN GLOBAL DE LA PARTIDA (Automático o Forzado)
  socket.on('partida_lista_para_lanzar', (datos) => {
    state.connectedPlayers = datos.connectedPlayers;
    state.currentPlayerIndex = datos.currentPlayerIndex;
    lanzarPartidaMultijugador("Conexión establecida.");
  });
   
  // F. Permitir al Host forzar el inicio
  socket.on('habilitar_inicio_forzado', () => {
    if (state.isHost && el.forceStartMultiBtn) {
      el.forceStartMultiBtn.disabled = false;
      el.forceStartMultiBtn.classList.remove('hidden');
    }
  });

  // ASOCIACIÓN GARANTIZADA DEL BOTÓN DE INICIO FORZADO
  if (el.forceStartMultiBtn) {
    // Limpiar cualquier escuchador antiguo clonando el botón para evitar doble envío
    const clonBoton = el.forceStartMultiBtn.cloneNode(true);
    el.forceStartMultiBtn.parentNode.replaceChild(clonBoton, el.forceStartMultiBtn);
    el.forceStartMultiBtn = clonBoton;

    el.forceStartMultiBtn.disabled = !state.isHost; 
    
    el.forceStartMultiBtn.addEventListener('click', () => {
      if (!state.isHost || !socket) return;
      // Extraer el código activo de la sala directamente del elemento de interfaz
      let roomName = el.roomLiveCode.textContent.replace('SALA:', '').trim();
      if (!roomName || roomName === "PENDIENTE") {
         roomName = el.roomNameInput.value.trim().toUpperCase() || `SERVER_${state.username.toUpperCase()}`;
      }
      socket.emit('forzar_inicio_partida', { roomCode: roomName });
    });
  }
}


/**
 * Remueve al jugador de la transmisión y cierra la conexión del terminal de forma limpia
 */
export function abandonarPartidaMultijugador() {
  if (socket) {
    socket.disconnect(); // Cortar los WebSockets de forma inmediata
  }

  resetGame();
  
  if (el.multiStatusPanel) el.multiStatusPanel.classList.add('hidden');
  if (el.statusMultiLogPanel) el.statusMultiLogPanel.classList.add('hidden');
  
  actualizarVisualSalaJugadores();
}

// Vincular los selectores de límite de tiempo para el modo multijugador
if (el.multiLimitBtns) {
  el.multiLimitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isCodeLocked) return;
      el.multiLimitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      state.limit = parseInt(btn.dataset.limit, 10) || 0;
      console.log(`⏱ LÍMITE DE TRANSMISIÓN AJUSTADO: ${state.limit} segundos.`);

      if (el.timerText) {
        const m = Math.floor(state.limit / 60);
        const s = state.limit % 60;
        el.timerText.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    });
  });
}
