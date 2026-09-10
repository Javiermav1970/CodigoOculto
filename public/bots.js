/* =========================================================
   CÓDIGO OCULTO - Inteligencia Artificial y Turnos de Bots
   ========================================================= */

import { BANK, state } from './config.js';
import { finalizarTurnoJugador, celebrarDescifradoIntermedio } from './referee.js';
import { actualizarVisualSalaJugadores } from './main.js';
import { renderizarBitacoraFiltrada } from './ui.js';

/**
 * Genera una combinación de ataque aleatoria inteligente basada en la memoria del bot 
 * para no repetir secuencias idénticas que ya hayan fallado contra un objetivo.
 */
export function generarCodigoAtaqueBot(atacante, objetivo, longitud) {
  // Inicializar memoria específica para la relación Atacante -> Objetivo
  if (!state.botMemory[atacante][objetivo]) {
    state.botMemory[atacante][objetivo] = [];
  }

  let intentoValido = [];
  let intentosDeSeguridad = 0;

  // Bucle para garantizar que el bot no envíe una combinación idéntica que ya falló contra ese mismo objetivo
  do {
    intentoValido = [];
    const pool = [...BANK];
    // Mezclar elementos del banco para garantizar aleatoriedad y no repetición interna
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    intentoValido = pool.slice(0, longitud);
    intentosDeSeguridad++;
    
    // Convertir a string para verificar rápidamente en el historial de memoria del bot
    var combinacionStr = intentoValido.join('');
  } while (state.botMemory[atacante][objetivo].includes(combinacionStr) && intentosDeSeguridad < 50);

  // Guardar en la memoria del bot para que no repita este código exacto contra este rival
  state.botMemory[atacante][objetivo].push(combinacionStr);
  return intentoValido;
}

export function simularTurnoBot() {
  // MEDIDA DE SEGURIDAD ANTIBUCLE: Si el turno cambió repentinamente al humano, abortar la ejecución del bot
  if (state.connectedPlayers[state.currentPlayerIndex].name === state.username) {
    return;
  }

  const atacante = state.connectedPlayers[state.currentPlayerIndex].name;
  
  // 1. Inicializar estructuras de control si no existen para este atacante
  if (!state.playerTargetBlocks[atacante]) state.playerTargetBlocks[atacante] = [];
  if (!state.botMemory[atacante]) state.botMemory[atacante] = {};

  // 2. Determinar objetivos elegibles (Filtrar la sala de jugadores)
  const objetivosValidos = state.connectedPlayers.filter(p => {
    // No puede atacarse a sí mismo
    if (p.name === atacante) return false;
    // Bloqueado para todos si su código ya fue adivinado
    if (state.decryptedPlayers.includes(p.name)) return false;
    // Bloqueado de forma individual si este atacante ya lo golpeó en esta ronda de intentos
    if (state.playerTargetBlocks[atacante].includes(p.name)) return false;
    
    return true;
  });

  // 3. Si no hay objetivos válidos para este bot, significa que ya intentó atacar a todos los posibles
  if (objetivosValidos.length === 0) {
    console.log(`🤖 ${atacante} no tiene más objetivos disponibles o ya atacó a todos en esta fase.`);
    finalizarTurnoJugador(atacante);
    return;
  }

  // 4. Seleccionar un objetivo de forma aleatoria de la lista filtrada
  const objetivoSeleccionado = objetivosValidos[Math.floor(Math.random() * objetivosValidos.length)];
  const nombreObjetivo = objetivoSeleccionado.name;

  // 5. Bloquear inmediatamente la selección de este objetivo para este atacante en el futuro
  state.playerTargetBlocks[atacante].push(nombreObjetivo);

  // 6. Escoger el código con el cual realizará el ataque (sin repetir elementos internamente)
  const codigoAtaque = generarCodigoAtaqueBot(atacante, nombreObjetivo, state.multiLength);

  // 7. Realizar el ataque y procesar los resultados
  procesarAtaqueBot(atacante, nombreObjetivo, codigoAtaque);
}

export function procesarAtaqueBot(atacante, objetivo, codigoAtaque) {
  // Nota: Asumimos que los códigos secretos de cada jugador se guardan dinámicamente en su objeto.
  // Si usas 'state.secret' global para la IA, usaremos ese por defecto, o el asignado al bot objetivo.
  const botObjetivoEstructura = state.connectedPlayers.find(p => p.name === objetivo);
  const codigoSecretoObjetivo = botObjetivoEstructura?.secretCode || state.secret; 

  // Calcular pistas usando tu función lógica original 'calculateHints'
  const { correct, present } = calculateHints(codigoAtaque, codigoSecretoObjetivo);

  // Registrar la acción en la bitácora global identificando quién atacó a quién
  const indexIntento = state.multiplayerHistory.length + 1;
  state.multiplayerHistory.push({
    player: atacante,
    target: objetivo, // Guardamos a quién atacó
    guess: [...codigoAtaque],
    correct: correct,
    present: present,
    index: indexIntento
  });

  console.log(`⚔️ ATAQUE: [${atacante}] atacó a [${objetivo}] con (${codigoAtaque.join(' ')}) -> Exactos: ${correct}, Presentes: ${present}`);

  // Actualizar la interfaz visual de la bitácora si está activa
  if (typeof renderizarBitacoraFiltrada === 'function') {
    renderizarBitacoraFiltrada();
  }

  // Si se adivina el código de un jugador (Victoria total sobre ese objetivo)
  if (correct === state.multiLength) {
    console.log(`🎯 ¡CÓDIGO DESCIFRADO! ${atacante} descubrió el código de ${objetivo}.`);
    // Bloquear su selección a TODOS los jugadores de forma definitiva
    if (!state.decryptedPlayers.includes(objetivo)) {
      state.decryptedPlayers.push(objetivo);
    }
    // CONEXIÓN DE LA ALERTA INTERMEDIA:
    celebrarDescifradoIntermedio(atacante, objetivo);
    // Marcar visualmente al jugador como "ELIMINADO / DESCIFRADO" en la sala
    actualizarVisualSalaJugadores();
  }

  // Verificar condición de cambio de turno o fin de ciclo
  finalizarTurnoJugador(atacante);
}
/* ---------- EVALUACIÓN LÓGICA (MASTERMIND) ---------- */

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