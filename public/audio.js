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
 * 🎙 SÍNTESIS DE VOZ DE INTELIGENCIA ARTIFICIAL (NATIVA)
 */
export function emitirVozTerminal(texto) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Cancelar voces anteriores en cola
  
  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = 'en-US'; // Idioma inglés para darle la estética de comando internacional de red
  mensaje.rate = 1.0;     // Velocidad normal
  mensaje.pitch = 0.6;    // Voz grave, estilo IA fría y robótica
  
  // Buscar una voz masculina/femenina estable del sistema si existe
  const voces = window.speechSynthesis.getVoices();
  const vozRobot = voces.find(v => v.lang.includes('en') && v.name.includes('Google')) || voces[0];
  if (vozRobot) mensaje.voice = vozRobot;

  window.speechSynthesis.speak(mensaje);
}
