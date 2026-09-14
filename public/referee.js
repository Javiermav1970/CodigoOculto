/* =========================================================
   CÓDIGO OCULTO - Motor del Árbitro, Turnos y Fin de Juego - LIMPIO
   ========================================================= */

import { state, isFigure } from './config.js';
import { stopTimer, startTimer } from './timer.js';
import { actualizarVisualSalaJugadores, resetGame, lanzarFuegosArtificialesCiberpunk } from './main.js';
import { el } from './dom.js'; // CORRECCIÓN EXTRA: Añadida importación de elementos de la interfaz

/**
 * ESCENARIO 1: El tiempo terminó para el jugador de turno. 
 * Pasa de forma estricta la transmisión al siguiente nodo de la sala.
 * (Nota: Mantenida para compatibilidad local si tu temporizador la invoca)
 */
export function manejarTiempoAgotadoTurno() {
  if (!state.playing) return;

  const atacanteInactivo = state.connectedPlayers[state.currentPlayerIndex].name;
  console.log(`🚨 EXCEPCIÓN DE RED: ${atacanteInactivo.toUpperCase()} no emitió respuesta a tiempo.`);
  
  // Limpiar acumulados de ataques parciales de esta ronda para el jugador inactivo
  state.playerTargetBlocks[atacanteInactivo] = [];
  
  // Avanzar al siguiente hacker de la lista
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.connectedPlayers.length;
  
  actualizarVisualSalaJugadores();

  // El turno cambió por expiración -> Reseteamos el conteo de forma limpia
  startTimer();
}


/**
 * Controla el reseteo del conteo en los escenarios de ataque parcial y fin de ciclo.
 */
export function finalizarTurnoJugador(atacante) {
  if (!state.playerTargetBlocks[atacante]) state.playerTargetBlocks[atacante] = [];

  const oponentesActivos = state.connectedPlayers.filter(p => 
    p.name !== atacante && !state.decryptedPlayers.includes(p.name)
  ).length;

  const ataquesEfectuadosAActivos = state.playerTargetBlocks[atacante].filter(targetName => 
    !state.decryptedPlayers.includes(targetName)
  ).length;

  // COMPROBACIÓN: ¿Terminó por completo de atacar a todos sus objetivos válidos de la fase?
  if (ataquesEfectuadosAActivos >= oponentesActivos || state.playerTargetBlocks[atacante].length >= state.connectedPlayers.length - 1) {
    
    state.playerTargetBlocks[atacante] = [];
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.connectedPlayers.length;
    
    const nuevoJugadorActivo = state.connectedPlayers[state.currentPlayerIndex];
    console.log(`🔄 FIN DE CICLO: Turno transferido a ${nuevoJugadorActivo.name}`);
    
    actualizarVisualSalaJugadores();
    startTimer();
  } else {
    console.log(`📡 Nodo atacado con éxito. Reconfigurando reloj para el próximo ataque de ${atacante}.`);
    startTimer();
  }
}

export function verificarCondicionVictoriaSala() {
  const totalObjetivosPorHackear = state.connectedPlayers.length - 1;

  for (let jugador of state.connectedPlayers) {
    const codigosDescifradosPorEl = state.multiplayerHistory.filter(item => 
      item.player === jugador.name && item.correct === state.multiLength
    ).length;

    if (codigosDescifradosPorEl === totalObjetivosPorHackear) {
      ejecutarVictoriaGlobal(jugador.name);
      return true;
    }
  }
  return false;
}

export function ejecutarVictoriaGlobal(ganador) {
  stopTimer();
  state.playing = false;

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'winOverlay';
  overlay.style.backdropFilter = 'blur(10px)';

  const esHumano = (ganador === state.username);
  const colorFoco = esHumano ? 'var(--neon)' : 'var(--danger)';
  const tituloText = esHumano ? 'DOMINACIÓN TOTAL DE LA RED' : 'SISTEMA COMPROMETIDO';

  overlay.innerHTML = `
    <div class="win-card" style="border-color: ${colorFoco}; box-shadow: 0 0 50px ${colorFoco}; max-width: 460px;"> 
      <h2 style="color: ${colorFoco}; text-shadow: 0 0 15px ${colorFoco}; font-size: 26px;">${tituloText}</h2> 
      
      <div style="margin: 20px 0; padding: 15px; background: var(--bg-panel-2); border: 1px solid var(--border); border-radius: 8px;">
        <span style="color: var(--text-dim); display: block; font-size: 11px; letter-spacing: 2px;">HACKER SUPREMO</span>
        <strong style="color: #fff; font-size: 24px; display: block; margin-top: 5px; letter-spacing: 1px; text-shadow: 0 0 8px #fff;">
          ☠️ ${ganador.toUpperCase()} ☠️
        </strong>
      </div>

      <p style="color: var(--text-dim); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        El nodo central ha sido encriptado de forma permanente. Todos los terminales adversarios fueron neutralizados con éxito.
      </p> 
      
      <button class="primary-btn" id="btnCerrarMulti" style="background: linear-gradient(90deg, ${colorFoco}, #0b131b); color: #fff; box-shadow: 0 0 15px rgba(255,255,255,0.1);">
        VOLVER AL MODO SELECCIÓN
      </button> 
    </div>`;

  document.body.appendChild(overlay);
  
  document.getElementById('btnCerrarMulti').addEventListener('click', () => {
    resetGame();
    if (el && el.multiStatusPanel) el.multiStatusPanel.classList.add('hidden');
    if (el && el.statusMultiLogPanel) el.statusMultiLogPanel.classList.add('hidden');
  });

  lanzarFuegosArtificialesCiberpunk();
}

export function mostrarVentanaFlotanteAtaque(emisor, receptor, codigo) {
  const viejaVentana = document.getElementById('pop-ataque-global');
  if (viejaVentana) viejaVentana.remove();

  const pop = document.createElement('div');
  pop.id = 'pop-ataque-global';
  pop.className = 'broadcast-popup';

  const codigoHtml = codigo.map(v => `<div class="log-el ${isFigure(v) ? 'fig' : 'num'}">${v}</div>`).join('');

  pop.innerHTML = `
    <div class="broadcast-content">
      <div class="broadcast-header">📡 TRANSMISIÓN DE RED DETECTADA</div>
      <p>El agente <strong style="color:#00f5d4;">${emisor.toUpperCase()}</strong> está inyectando un código en el nodo de <strong style="color:#ff4d6d;">${receptor.toUpperCase()}</strong></p>
      <div class="broadcast-code">${codigoHtml}</div>
    </div>
  `;

  document.body.appendChild(pop);

  setTimeout(() => {
    pop.style.opacity = '0';
    pop.style.transform = 'translate(-50%, -60%) scale(0.9)';
    setTimeout(() => pop.remove(), 400);
  }, 3000);
}

export function celebrarDescifradoIntermedio(atacante, objetivo) {
  const alerta = document.createElement('div');
  alerta.className = 'broadcast-popup';
  alerta.style.borderColor = 'var(--neon-2)';
  alerta.style.boxShadow = '0 0 25px rgba(246, 55, 236, 0.6)';
  alerta.style.pointerEvents = 'auto';

  alerta.innerHTML = `
    <div class="broadcast-content">
      <div class="broadcast-header" style="color: var(--neon-2); letter-spacing: 3px;">🎯 NODO COMPROMETIDO 🎯</div>
      <p style="margin-top: 10px; font-size: 14px;">
        El hacker <strong style="color: var(--neon); font-size: 16px;">${atacante.toUpperCase()}</strong> 
        ha quebrado la seguridad de <strong style="color: var(--danger); font-size: 16px;">${objetivo.toUpperCase()}</strong>.
      </p>
      <div style="margin-top: 15px; color: var(--text-dim); font-size: 11px;">El objetivo ha sido desconectado de la red.</div>
    </div>
  `;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.style.opacity = '0';
    alerta.style.transform = 'translate(-50%, -60%) scale(0.9)';
    setTimeout(() => alerta.remove(), 400);
  }, 3500);
}

