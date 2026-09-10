/* =========================================================
   CÓDIGO OCULTO - Módulo de Interfaces y Renderizado (UI) - CORREGIDO
   ========================================================= */

import { BANK, isFigure, state } from './config.js';
import { renderizarCuadernoNotas } from './notes.js';
import { el } from './dom.js';

// Helper para actualizar mensajes de estado
export function setStatus(msg, isError) {
  if (el.statusMsg) {
    el.statusMsg.textContent = msg;
    el.statusMsg.classList.toggle('error', !!isError);
  }
}

export function setMultiSetupMessage(msg, isError) {
  if (el.multiSetupMsg) {
    el.multiSetupMsg.textContent = msg;
    el.multiSetupMsg.classList.toggle('error', !!isError);
  }
}

// Construye dinámicamente los botones del teclado virtual
export function buildKeypad() {
  let contenedor = el.keypad; // Por defecto modo VS IA
  
  if (state.gameMode === 'multi') {
    if (el.createRoomPanel && !el.createRoomPanel.classList.contains('hidden')) {
      contenedor = el.multiKeypad;
    } else if (el.multiStatusPanel && !el.multiStatusPanel.classList.contains('hidden')) {
      contenedor = el.statusMultiKeypad;
    }
  }

  if (!contenedor) return;

  contenedor.innerHTML = '';
  BANK.forEach(value => {
    const tecla = document.createElement('button');
    tecla.className = `key ${isFigure(value) ? 'figure' : ''}`;
    tecla.textContent = value;
    tecla.dataset.value = value;
    tecla.addEventListener('click', () => {
      // Ocultar paneles de selección flotantes si existieran de manera segura
      if (el.keypadPanel) el.keypadPanel.classList.add('hidden');
      if (el.statusMultiKeypadPanel) el.statusMultiKeypadPanel.classList.add('hidden');
      addElement(value);
    });
    contenedor.appendChild(tecla);      
  });
  refreshKeypad();
}

// Deshabilita o resalta las teclas que ya están en uso
export function refreshKeypad() {
  let targetKeypad = el.keypad;
  let poolVerificacion = state.current;

  if (state.gameMode === 'multi') {
    if (el.createRoomPanel && !el.createRoomPanel.classList.contains('hidden')) {
      targetKeypad = el.multiKeypad;
      poolVerificacion = state.mySecretCode;
    } else if (el.multiStatusPanel && !el.multiStatusPanel.classList.contains('hidden')) {
      targetKeypad = el.statusMultiKeypad;
      poolVerificacion = state.intentoMulti;
    }
  }

  if (!targetKeypad) return;

  targetKeypad.querySelectorAll('.key').forEach(k => {
    const used = poolVerificacion.includes(k.dataset.value);
    k.classList.toggle('used', used);
    k.disabled = used;
  });
}

// Genera las casillas de entrada (Candados)
export function crearSlots() {
  // 1. MODO VS IA
  if (state.gameMode === 'ia' && el.slots) {
    el.slots.innerHTML = '';
    for (let i = 0; i < state.length; i++) {
      const candado = document.createElement('div');
      const val = state.current[i];
      candado.className = `slot ${val ? 'filled' : 'locked'}`;
      candado.textContent = val ? val : '🔒';
      candado.id = `numero-${i}`;
      candado.addEventListener('click', function() {
        state.presionado = this.id;
        if (el.keypadPanel) el.keypadPanel.classList.remove('hidden');
      });
      el.slots.appendChild(candado);
    }
  } 
  // 2. MODO MULTIJUGADOR
  else if (state.gameMode === 'multi') {
    if (el.multiStatusPanel && !el.multiStatusPanel.classList.contains('hidden') && el.statusMultiSlots) {   
      el.statusMultiSlots.innerHTML = '';
      for (let i = 0; i < state.multiLength; i++) {
        const candado = document.createElement('div');
        const val = state.intentoMulti[i];
        candado.className = `slot ${val ? 'filled' : 'locked'}`;
        candado.textContent = val ? val : '🔒';
        candado.id = `numero-${i}`;
        candado.addEventListener('click', function() {
          state.presionado = this.id;
          if (el.statusMultiKeypadPanel) el.statusMultiKeypadPanel.classList.remove('hidden');
        });
        el.statusMultiSlots.appendChild(candado);
      }
    }
    else if (el.createRoomPanel && !el.createRoomPanel.classList.contains('hidden') && el.multiSlots) {
      el.multiSlots.innerHTML = '';
      for (let i = 0; i < state.multiLength; i++) {
        const candado = document.createElement('div');
        const val = state.mySecretCode[i];
        candado.className = `slot ${val ? 'filled' : 'locked'}`;
        candado.textContent = val ? (state.isCodeLocked ? '★' : val) : '🔒';
        el.multiSlots.appendChild(candado);
      }
    }
  }
}

// Renderiza el historial detallado de ataques recibidos de un rival específico
export function renderizarBitacoraFiltrada() {
  const targetLog = el.statusMultiLog || el.log;
  if (!targetLog) return;

  targetLog.innerHTML = '';

  if (!state.multiplayerHistory) {
    state.multiplayerHistory = [];
  }

  if (!state.selectedTargetFilter) {
    targetLog.innerHTML = '<div class="log-empty">Selecciona un hacker de la lista para ver su historial de seguridad...</div>';
    renderizarCuadernoNotas();
    return;
  }

  const ataquesRecibidos = state.multiplayerHistory.filter(item => item.target === state.selectedTargetFilter);

  if (ataquesRecibidos.length === 0) {
    targetLog.innerHTML = `<div class="log-empty">El terminal de ${state.selectedTargetFilter.toUpperCase()} no registra ataques recibidos...</div>`;
    renderizarCuadernoNotas();
    return;
  }

  ataquesRecibidos.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'log-row';
    
    const guessHtml = item.guess.map(v => `<div class="log-el ${isFigure(v) ? 'fig' : 'num'}">${v}</div>`).join('');

    row.innerHTML = `
      <div class="log-index" title="Atacante: ${item.player}">
        #${String(index + 1).padStart(2, '0')} 
        <small style="display:block;font-size:9px;color:#00f5d4;margin-top:2px;">ATK POR:<br>${item.player}</small>
      </div> 
      <div class="log-guess">${guessHtml}</div> 
      <div class="hints"> 
        <div class="hint correct"><span class="dot"></span>${item.correct}</div> 
        <div class="hint present"><span class="dot"></span>${item.present}</div> 
      </div>`;
      
    targetLog.appendChild(row);
  });

  targetLog.scrollTop = targetLog.scrollHeight;
  renderizarCuadernoNotas();
}

export function addElement(value) {
  // 1. CASO: MODO VS IA ACTIVO
  if (state.gameMode === 'ia') {
    if (!state.playing || state.current.includes(value)) return;
    
    // Si no hay un slot seleccionado explícitamente mediante clic, busca el primer espacio vacío disponible
    if (!state.presionado) {
      const primerVacio = state.current.findIndex(v => v === undefined || v === null);
      if (primerVacio !== -1 && primerVacio < state.length) {
        state.presionado = `numero-${primerVacio}`;
      } else if (state.current.length < state.length) {
        state.presionado = `numero-${state.current.length}`;
      } else {
        return; // Ya está lleno
      }
    }

    const idSlot = document.getElementById(state.presionado);
    if (!idSlot) return;
    
    let indice = parseInt(state.presionado.split('-')[1], 10);
    state.current[indice] = value;
    idSlot.classList.replace('locked', 'filled');
    idSlot.textContent = value;
    
    state.presionado = ""; // Limpiar foco de selección para la siguiente tecla
    refreshKeypad();
    setStatus('', false);
  } 
  // 2. CASO MODO MULTIJUGADOR
  else if (state.gameMode === 'multi') {
    if (el.multiStatusPanel && !el.multiStatusPanel.classList.contains('hidden')) {
      if (!state.playing || state.intentoMulti.includes(value)) return;
      
      // Auto-asignación de ranura vacía si el usuario oprime el teclado directo sin dar clic al slot
      if (!state.presionado) {
        let primerVacio = -1;
        for (let i = 0; i < state.multiLength; i++) {
          if (!state.intentoMulti[i]) {
            primerVacio = i;
            break;
          }
        }
        if (primerVacio !== -1) {
          state.presionado = `numero-${primerVacio}`;
        } else {
          return; // Ranuras llenas
        }
      }

      const idSlot = document.getElementById(state.presionado);
      if (!idSlot) return; 

      let indice = parseInt(state.presionado.split('-')[1], 10);
      state.intentoMulti[indice] = value;
      idSlot.classList.replace('locked', 'filled');
      idSlot.textContent = value;
      
      state.presionado = ""; // Limpiar foco
      refreshKeypad();
      setStatus('', false);
    }
    else if (el.createRoomPanel && !el.createRoomPanel.classList.contains('hidden')) {
      if (state.isCodeLocked || state.mySecretCode.length >= state.multiLength || state.mySecretCode.includes(value)) return;
      state.mySecretCode.push(value);
      crearSlots();
      refreshKeypad();
    }
  }
}

export function deleteElement() {
  
  if (state.gameMode === 'ia') {
    if (!state.playing) return;
    // Si no hay seleccionado un slot, borra el último elemento ingresado en el pool
    if (!state.presionado) {
      for (let i = state.length - 1; i >= 0; i--) {
        if (state.current[i] !== undefined && state.current[i] !== null) {
          state.presionado = `numero-${i}`;
          break;
        }
      }
    }

    if (state.presionado) {
      let indice = parseInt(state.presionado.split('-')[1], 10);
      state.current[indice] = undefined;
      const idSlot = document.getElementById(state.presionado);
      if (idSlot) {
        idSlot.classList.replace('filled', 'locked');
        idSlot.textContent = '🔒';
      }
      state.presionado = "";
      refreshKeypad();
    }
    if (el.keypadPanel) el.keypadPanel.classList.add('hidden');
  } 
  else if (state.gameMode === 'multi') {
    //if (!state.playing) return;
    if (el.multiStatusPanel && !el.multiStatusPanel.classList.contains('hidden')) {
      // Auto-selección del último candado lleno si no se presionó uno directamente
      if (!state.presionado) {
        for (let i = state.multiLength - 1; i >= 0; i--) {
          if (state.intentoMulti[i]) {
            state.presionado = `numero-${i}`;
            break;
          }
        }
      }

      if (state.presionado) {
        let indice = parseInt(state.presionado.split('-')[1], 10);
        state.intentoMulti[indice] = undefined;
        const idSlot = document.getElementById(state.presionado);
        if (idSlot) {
          idSlot.classList.replace('filled', 'locked');
          idSlot.textContent = '🔒';
        }
        state.presionado = "";
        refreshKeypad();
      }
      
      if (el.statusMultiKeypadPanel) el.statusMultiKeypadPanel.classList.add('hidden');
    } 
    else if (el.createRoomPanel && !el.createRoomPanel.classList.contains('hidden')) {
      if (state.isCodeLocked) return;
      state.mySecretCode.pop();
      crearSlots();
      refreshKeypad();
    }
  }
}