// Banco de 16 elementos: 10 números (0-9) + 6 figuras
export const NUMBERS = ['0','1','2','3','4','5','6','7','8','9'];
export const FIGURES = ['▲','●','■','♦','♥','✖'];
export const BANK = [...NUMBERS, ...FIGURES];
export const RECORDS_KEY = 'codigoOculto.records';

// Helper: saber si un elemento es figura (para estilos)
export const isFigure = (v) => FIGURES.includes(v);

export const MOCK_ROOMS = [
  { code: 'X9F2R', host: 'CYBER_GHOST', len: 4 },
  { code: 'K3L7P', host: 'NEO_VANDAL', len: 5 },
  { code: 'B8W1M', host: 'ALPHA_ZERO', len: 3 }
];

export const NOMBRES_POOL = [
  'ANON_MOUS', 'GHOST_RIDER', 'CYBER_PUNK', 'DARK_NET', 
  'HEX_HACKER', 'ROBOT_X', 'NULL_POINTER', 'PHANTOM_OS'
];

// Estado global del juego
export let state = {
  attempts: 0,
  current: [],
  connectedPlayers: [],
  elapsed: 0,
  gameMode: null,
  isCodeLocked: false,
  isHost: false, // Se vuelve 'true' solo si el usuario crea la sala
  intentoMulti: [],
  length: 4,
  limit: 0,
  maxPlayersAllowed: 2,
  multiLength: 3,
  mySecretCode: [],
  playing: false,
  presionado: "",
  selectedRoomCode: null,
  selectedTargetFilter: null,
  secret: [],
  startTime: 0,
  timerId: null,
  username: 'Hacker',
  tipoPanel: "",
  notasDeduccion: {}
};

export function loadRecords() {
  try { return JSON.parse(localStorage.getItem(RECORDS_KEY)) || {}; } catch { return {}; }
}

export function saveRecords(records) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); } catch {}
}

// >> Añade esta función al final de tu config.js <<
export function limpiarEstadoMemoriaCompleto() {
  state.playing = false;
  state.isCodeLocked = false; // <--- Garantiza apagar el cifrado visual de estrellas
  state.isHost = false;
  state.mySecretCode = [];
  state.intentoMulti = [];
  state.current = [];
  state.multiplayerHistory = [];
  state.connectedPlayers = [];
  state.decryptedPlayers = [];
  state.playerTargetBlocks = {};
  state.botMemory = {};
  state.currentPlayerIndex = 0;
  state.selectedTargetFilter = null; // <-- Quitar el "TODOS" para forzar el mensaje de bienvenida de la bitácora
  state.selectedRoomCode = null;
  state.attempts = 0;
  state.elapsed = 0;
  // Conservamos state.username para que el jugador no tenga que volver a logearse
}
