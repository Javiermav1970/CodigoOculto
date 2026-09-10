/* =========================================================
   CÓDIGO OCULTO - Controlador de Partida Modo Solo / VS IA
   ========================================================= */
import { state, BANK } from './config.js';
import { el } from './dom.js';

function ajustarLongitudFrenada(val) {
  if (isNaN(val) || val < 3) return 3;
  if (val > BANK.length) return BANK.length;
  return val;
}

function validarYAsignarLongitudPersonalizada() {
  const val = ajustarLongitudFrenada(parseInt(el.customLenInput.value, 10));
  el.customLenInput.value = val;
  state.length = val;
}

// Vincular selectores de dificultad modo IA
el.diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    el.diffBtns.forEach(b => b.classList.remove('active'));
    el.customDiffBtn.classList.remove('active');
    btn.classList.add('active');
    state.length = parseInt(btn.dataset.len, 10);
  });
});

el.customDiffBtn.addEventListener('click', () => {
  el.diffBtns.forEach(b => b.classList.remove('active'));
  el.customDiffBtn.classList.add('active');
  validarYAsignarLongitudPersonalizada();
});

el.customLenInput.addEventListener('input', () => {
  if (el.customDiffBtn.classList.contains('active')) validarYAsignarLongitudPersonalizada();
});

el.limitBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    el.limitBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.limit = parseInt(btn.dataset.limit, 10);
  });
});
