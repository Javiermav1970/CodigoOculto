/* =========================================================
   CÓDIGO OCULTO - Sistema de Notas Tácticas Deductivas
   ========================================================= */

import { BANK, isFigure, state } from './config.js';

/**
 * Inicializa el almacén de notas de un rival si no existe en el estado.
 */
export function inicializarNotasRival(rivalName) {
  if (!state.notasDeduccion[rivalName]) {
    state.notasDeduccion[rivalName] = {};
    // Cada elemento del banco se inicializa en estado neutral (0)
    BANK.forEach(el => {
      state.notasDeduccion[rivalName][el] = 0; // 0 = Neutral, 1 = Correcto, 2 = Presente/Incorrecto, 3 = Descartado
    });
  }
}

/**
 * Renderiza el cuaderno de anotaciones interactivo dentro del contenedor del modal.
 */
export function renderizarCuadernoNotas() {
  const panelNotas = document.getElementById('cuadernoNotasContenedor');
  if (!panelNotas) return; // Si el modal no está abierto en pantalla, cancela la inyección

  const rivalActivo = state.selectedTargetFilter;
  if (!rivalActivo) return;
  
  inicializarNotasRival(rivalActivo);

  let html = `
    <div class="panel-title" style="color: var(--neon-2); text-shadow: 0 0 6px rgba(246,55,236,0.4); margin-bottom: 6px;">
      NOTAS TÁCTICAS: ${rivalActivo.toUpperCase()}
    </div>
    <p style="font-size: 11px; color: var(--text-dim); margin-bottom: 14px; letter-spacing: 1px; line-height: 1.4;">
      Haz clic sobre los elementos para alternar estados: <br>
      <span style="color: var(--ok)">● Correcto</span> | 
      <span style="color: var(--warn)">● Posición Movida</span> | 
      <span style="color: var(--danger)">● Descartado</span>
    </p>
    <div class="keypad" style="grid-template-columns: repeat(4, 1fr); gap: 8px;">
  `;

  BANK.forEach(item => {
    const estado = state.notasDeduccion[rivalActivo][item];
    let claseEstado = '';

    if (estado === 1) claseEstado = 'nota-correcto';
    if (estado === 2) claseEstado = 'nota-presente';
    if (estado === 3) claseEstado = 'nota-descartado';

    html += `
      <button class="key ${isFigure(item) ? 'figure' : ''} ${claseEstado}" 
              data-nota-val="${item}" 
              style="font-size: 18px; aspect-ratio: 1.2;">
        ${item}
      </button>
    `;
  });

  html += `</div>`;
  panelNotas.innerHTML = html;

  // Re-vincular los eventos clic de cada elemento dentro de la ventana flotante
  panelNotas.querySelectorAll('[data-nota-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.notaVal;
      state.notasDeduccion[rivalActivo][val] = (state.notasDeduccion[rivalActivo][val] + 1) % 4;
      renderizarCuadernoNotas(); // Actualización reactiva instantánea
    });
  });
}
