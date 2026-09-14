import { state, BANK } from './config.js';
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
    <div class="room-item" data-code="${room.code}" data-len="${room.len}"> 
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
      
    return `
      <div class="player-item" data-name="${p.name}" data-order="${index + 1}">
        <span class="player-name">📡 ${p.name.toUpperCase()}</span>
        ${badge}
      </div>
    `;
  }).join('');
}
