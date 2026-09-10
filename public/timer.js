/* =========================================================
   CÓDIGO OCULTO - Motor del Temporizador de Red
   ========================================================= */

import { state } from './config.js';
import { el } from './dom.js'; // Importación correcta

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// SOLUCIÓN: Eliminamos el parámetro 'el' de la firma para que use la importación global
export function startTimer(timeUpCallback) {
  stopTimer(); 
  state.startTime = Date.now();
  
  // 1. SELECCIÓN INTELIGENTE DEL CONTENEDOR VISUAL SEGÚN EL MODO DE JUEGO
  // Si estamos en modo 'multi', buscamos el elemento de texto del reloj dentro de MultistatusPanel
  let nodoTextoReloj = el.timerText;
  let nodoContenedorReloj = el.timer;

  if (state.gameMode === 'multi') {
    // Buscamos el elemento con id o clase que pinte el tiempo en la cabecera multijugador
    // Si tu HTML usa un ID específico dentro del panel, lo capturamos aquí de forma segura:
    nodoTextoReloj = document.getElementById('MultitimerText') || document.querySelector('#MultistatusPanel .timer-text') || el.timerText;
    nodoContenedorReloj = document.getElementById('Multitimer') || document.querySelector('#MultistatusPanel .timer') || el.timer;
  }

  if (nodoContenedorReloj) nodoContenedorReloj.classList.remove('warning');
  if (nodoTextoReloj) nodoTextoReloj.textContent = formatTime(state.limit > 0 ? state.limit : 0);

  // 2. INICIO DEL CICLO ASÍNCRONO
  state.timerId = setInterval(() => {
    const secs = Math.floor((Date.now() - state.startTime) / 1000);

    if (state.limit > 0) {
      // Modo Cuenta Regresiva (Turno bajo presión)
      const remaining = state.limit - secs;
      
      if (nodoTextoReloj) nodoTextoReloj.textContent = formatTime(Math.max(0, remaining));
      if (nodoContenedorReloj) nodoContenedorReloj.classList.toggle('warning', remaining <= 10);
      
      if (remaining <= 0) {
        stopTimer();
        console.warn("⏰ TIEMPO EXPIRADO: Interrupción forzada del árbitro de red.");
        
        if (state.gameMode === 'multi') {
          import('./referee.js').then(modulo => modulo.manejarTiempoAgotadoTurno());
        } else if (typeof timeUpCallback === 'function') {
          timeUpCallback();
        }
      }
    } else {
      // Modo Cronómetro estándar (Sin límite)
      if (nodoTextoReloj) nodoTextoReloj.textContent = formatTime(secs);
    }
  }, 250);
}

// SOLUCIÓN: Eliminamos el parámetro 'el' de aquí también
export function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  
  // Limpiar clases de advertencia en ambos relojes por seguridad
  if (el && el.timer) el.timer.classList.remove('warning');
  const multiTimer = document.getElementById('Multitimer') || document.querySelector('#MultistatusPanel .timer');
  if (multiTimer) multiTimer.classList.remove('warning');
}
