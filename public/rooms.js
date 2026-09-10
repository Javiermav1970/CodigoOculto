import { state, NOMBRES_POOL, BANK } from './config.js';
import { el } from './dom.js';
import { lanzarPartidaMultijugador } from './match.js';

export function generateSecret(len) {
  const pool = [...BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, len);
}

export function renderRoomsList(rooms) {
  state.selectedRoomCode = null;
  el.connectSelectedBtn.disabled = true;

  if (rooms.length === 0) {
    el.roomsList.innerHTML = '<div class="room-empty">No hay terminales públicos esperando jugadores...</div>';
    return;
  }

  el.roomsList.innerHTML = rooms.map(room => `
    <div class="room-item" data-code="${room.code}"> 
      <span class="room-host">${room.host} <span class="room-details">(${room.code})</span></span> 
      <span class="room-details">Dificultad: ${room.len} el.</span> 
    </div>
  `).join('');

  el.roomsList.querySelectorAll('.room-item').forEach(item => {
    item.addEventListener('click', () => {
      el.roomsList.querySelectorAll('.room-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.selectedRoomCode = item.dataset.code;
      el.connectSelectedBtn.disabled = false;
    });
  });
}

export function renderConnectedPlayers() {
  if (state.connectedPlayers.length <= 1) {
    el.connectedPlayersList.innerHTML = '<div class="room-empty">Esperando transmisiones entrantes de otros hackers...</div>';
    return;
  }

  el.connectedPlayersList.innerHTML = state.connectedPlayers.map((p, index) => {
  const badge = p.isHost 
    ? '<span class="player-status host">HOST</span>' 
    : '<span class="player-status ready">READY</span>';
    
  // Añadimos data-name, data-order e index al HTML
  return `
    <div class="player-item" data-name="${p.name}" data-order="${index + 1}">
      <span class="player-name">📡 ${p.name.toUpperCase()}</span>
      ${badge}
    </div>
  `;
  }).join('');
}

export function simularEntradaDeJugadores() {
  const poolMezclado = [...NOMBRES_POOL].sort(() => Math.random() - 0.5);

  const entradaInterval = setInterval(() => {
    if (!state.isCodeLocked) {
      clearInterval(entradaInterval);
      return;
    }

    let nuevoNombre = poolMezclado.pop() || `BOT_${Math.floor(100 + Math.random() * 900)}`;
    
    // GENERACIÓN CRÍTICA: Cada bot genera su combinación secreta única sin repetidos
    const codigoSecretoBot = generateSecret(state.multiLength);

    state.connectedPlayers.push({ 
      name: nuevoNombre, 
      isHost: false,
      secretCode: codigoSecretoBot // <-- Almacenamos su clave en su estructura de jugador
    });
    
    console.log(`🤖 BOT CONECTADO: ${nuevoNombre} | Cifrado generado: [${codigoSecretoBot.join(' ')}]`); // Log en consola para auditoría de desarrollo
    
    renderConnectedPlayers();

    if (state.connectedPlayers.length >= state.maxPlayersAllowed) {
      clearInterval(entradaInterval);
      lanzarPartidaMultijugador("Sincronización completa. Iniciando...");
    }
  }, 1500);
}
