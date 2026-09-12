/* =========================================================
   CÓDIGO OCULTO - Motor de Audio y Síntesis Psicoacústica
   ========================================================= */

// Contexto de audio nativo del navegador (CORREGIDO PARA AUTOPLAY)
let audioCtx = null;

function obtenerAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Si el navegador congeló el audio de fondo, le ordenamos despertar de inmediato
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 🔊 EFECTOS DE SONIDO SINTETIZADOS MATEMÁTICAMENTE
 */
export const sfx = {
  // Sonido de pulso digital corto para el ingreso de cada dígito/figura
  slotIngreso: () => {
    const ctx = obtenerAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine'; // Onda pura, limpia y sutil
    osc.frequency.setValueAtTime(1200, ctx.currentTime); // Frecuencia alta (tono agudo tipo clic)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03); // Caída ultra veloz
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime); // Volumen bajo para que no sea molesto al escribir rápido
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03); // Desvanecimiento en milisegundos
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },
  // Sonido tipo "Láser Glitch" al lanzar un virus
  ataque: () => {
    const ctx = obtenerAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth'; // Sonido agresivo cyberpunk
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15); // Caída rápida
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  // Sintetizador brillante ascendente cuando consigues buenas pistas
  aciertoBueno: () => {
    const ctx = obtenerAudioContext();
    const notas = [523.25, 659.25, 783.99, 1046.50]; // Arpegio brillante en Do Mayor
    notas.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, idx * 60); // Retardo en cascada para generar el arpegio
    });
  },

  // Sonido grave de error o estática distorsionada
  falloTotal: () => {
    const ctx = obtenerAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Acorde triunfal extendido
  victoria: () => {
    const ctx = obtenerAudioContext();
    const tonos = [261.63, 329.63, 392.00, 523.25];
    tonos.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    });
  },

  // Sonido distorsionado descendente trágico
  derrota: () => {
    const ctx = obtenerAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }
};

/**
 * 🎙 SÍNTESIS DE VOZ DE INTELIGENCIA ARTIFICIAL EN ESPAÑOL NATIVO
 */
export function emitirVozTerminal(texto) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Cancelar cualquier audio previo en cola para evitar retrasos
  
  const mensaje = new SpeechSynthesisUtterance(texto);
  
  // 1. CONFIGURACIÓN IDIOMA MAESTRO: Forzamos la fonética al español neutro/castellano
  mensaje.lang = 'es-ES'; 
  
  // 2. PARÁMETROS PSICOACÚSTICOS CIBERPUNK
  mensaje.rate = 1.05; // Un toque más rápido para dar sensación de procesamiento informático veloz
  mensaje.pitch = 0.75; // Voz más grave de lo normal, emulando una supercomputadora fría o un Mainframe militar
  mensaje.volume = 0.9;

  // 3. SELECCIÓN DE MOTOR NATIVO EN ESPAÑOL
  // Escaneamos la base de datos de voces del sistema operativo del jugador (Windows, Linux, Android o iOS)
  const vocesDisponibles = window.speechSynthesis.getVoices();
  
  // Buscamos prioritariamente voces de Microsoft, Google o Apple que hablen español ("es")
  const vozEspañola = vocesDisponibles.find(v => v.lang.startsWith('es') && (v.name.includes('Sabina') || v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Microsoft'))) 
                      || vocesDisponibles.find(v => v.lang.startsWith('es')); // Alternativa si no encuentra las principales

  if (vozEspañola) {
    mensaje.voice = vozEspañola; // Anclamos de forma mandatoria la voz en castellano hallada
    console.log(`🎙️ Voz de Terminal establecida: ${vozEspañola.name} (${vozEspañola.lang})`);
  }

  window.speechSynthesis.speak(mensaje);
}

