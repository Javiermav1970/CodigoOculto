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

// =============================================================================
// OPTIMIZACIÓN DE VOZ ROBÓTICA LOCAL DE ALTA VELOCIDAD (SIN LAG DE RED)
// =============================================================================

export function emitirVozTerminal(texto) {
  if (!('speechSynthesis' in window)) return;
  
  // 1. CANCELACIÓN INMEDIATA: Corta cualquier audio en cola al instante para evitar acumulaciones
  window.speechSynthesis.cancel(); 
  
  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = 'es-ES'; // Forzar fonética castellano/neutro
  mensaje.rate = 1.15;    // Un toque más rápido para dar sensación de procesamiento instantáneo
  mensaje.pitch = 0.70;   // Tono grave militar cyberpunk
  mensaje.volume = 0.95;

  // 2. EXTRAER VOCES DISPONIBLES EN EL SISTEMA
  const voces = window.speechSynthesis.getVoices();

  // 💡 ESTRATEGIA ANTILAG: Filtramos y EXCLUIMOS las voces de la nube de Google que viajan por internet.
  // Buscamos voces nativas integradas directamente en el hardware del dispositivo (ej. las de Samsung, Apple o Microsoft locales).
  let vozLocalRapida = voces.find(v => 
    v.lang.startsWith('es') && 
    !v.name.toLowerCase().includes('google') && 
    !v.localService === false
  );

  // Si el teléfono no tiene una voz local alternativa, tomamos la primera en español disponible como respaldo
  if (!vozLocalRapida) {
    vozLocalRapida = voces.find(v => v.lang.startsWith('es'));
  }

  if (vozLocalRapida) {
    mensaje.voice = vozLocalRapida;
  }

  // 3. INYECCIÓN DIRECTA AL MOTOR
  window.speechSynthesis.speak(mensaje);
}

/**
 * 💡 PROTOCOLO DE PRE-CALENTAMIENTO (Warmup):
 * Fuerza al motor de voz del celular a encenderse y cargar la lista de sonidos en caché 
 * de manera oculta apenas abre el juego, evitando el retardo del primer turno.
 */
function precalentarMotorDeVoz() {
  if (!('speechSynthesis' in window)) return;
  
  // Realizamos una llamada en frío vacía para despertar los nodos acústicos
  window.speechSynthesis.getVoices();
  
  // Chrome y Android exigen escuchar este evento para rellenar la base de datos de audio de forma segura
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
    console.log("🎙️ Nodos de voz locales indexados y listos para transmisión instantánea.");
  };
}

// Ejecutamos el pre-calentamiento al cargar el archivo de audio de forma atómica
precalentarMotorDeVoz();

// =============================================================================
// MOTOR DE MÚSICA DE FONDO CIBERPUNK CONTINUA (Bucle infinito)
// =============================================================================
let nodoMusicaGlobal = null;

export function encenderMusicaDeFondo() {
  // Evitamos duplicar la música si ya está sonando
  if (nodoMusicaGlobal) return;

  const ctx = obtenerAudioContext();
  
  // Creamos un elemento de audio nativo oculto
  const audioHtml = new Audio('./musica_fondo.mp3');
  audioHtml.loop = true; // Forzamos el bucle infinito continuo
  audioHtml.crossOrigin = "anonymous";

  // Conectamos el audio al contexto matemático del juego
  const fuente = ctx.createMediaElementSource(audioHtml);
  const gainNode = ctx.createGain();

  // Ajustamos el volumen de fondo (0.15 = 15% de potencia para que no opaque los efectos sfx ni la voz)
  gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

  // Enlazamos: Música -> Control Volumen -> Parlantes del Dispositivo
  fuente.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Arrancamos la reproducción
  audioHtml.play().then(() => {
    nodoMusicaGlobal = audioHtml;
    console.log("🎵 Banda sonora del Mainframe inicializada en bucle continuo.");
  }).catch((err) => {
    console.warn("⚠️ Esperando interacción para liberar el canal de música:", err);
  });
}
