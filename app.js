// Configura aquí tus credenciales públicas de Supabase
const SUPABASE_URL = "https://khvtshqmwklfcdrgjqqf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodnRzaHFtd2tsZmNkcmdqcXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODM0OTMsImV4cCI6MjEwMjQ1OTQ5M30.p_RgbkcO-Y_a-ZeOMQwbCpP7RRE2viyYhkci2NY6qoY";

// Declaramos e inicializamos la variable buscando el objeto global nativo
let supabase = null;

try {
  // Intentamos detectar la librería en cualquiera de sus nombres globales del navegador
  const libSupabase = window.supabase || window.supabaseJS || supabase;
  
  if (libSupabase && libSupabase.createClient) {
    supabase = libSupabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("[SISTEMA] Motor de Supabase encendido correctamente.");
  }
} catch (e) {
  console.log("[INFO] Esperando inicialización diferida...");
}

// Función de respaldo por si el navegador carga los archivos en desorden
window.inicializarSupabase = function() {
  if (!supabase) {
    const lib = window.supabase || window.supabaseJS;
    if (lib && lib.createClient) {
      supabase = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log("[SISTEMA] Conexión establecida mediante disparador diferido.");
    }
  }
};

const elementosValidos = ['0','1','2','3','4','5','6','7','8','9','★','▲','■','●','◆','▼'];

// Estado global de la aplicación
let estadoJuego = {
  modo: null, // 'pc' o 'multi'
  longitud: 4,
  salaId: null,
  miJugadorId: null,
  miCodigo: null,
  esMiTurno: false,
  listaJugadores: []
};
// Navegación Básica
function cambiarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Inicialización de Eventos
document.getElementById('btn-modo-pc').addEventListener('click', () => iniciarConfiguracion('pc'));
document.getElementById('btn-modo-multi').addEventListener('click', () => iniciarConfiguracion('multi'));
document.getElementById('btn-salir').addEventListener('click', () => location.reload());

document.getElementById('select-dificultad').addEventListener('change', (e) => {
  document.getElementById('wrapper-custom').classList.toggle('oculto', e.target.value !== 'custom');
});

function iniciarConfiguracion(modo) {
  estadoJuego.modo = modo;
  document.getElementById('wrapper-multi-sala').classList.toggle('oculto', modo !== 'multi');
  cambiarPantalla('pantalla-config');
}

document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
  const difVal = document.getElementById('select-dificultad').value;
  estadoJuego.longitud = difVal === 'custom' ? parseInt(document.getElementById('input-custom-long').value) : parseInt(difVal);

  if (estadoJuego.modo === 'pc') {
    inicializarModoPC();
  } else {
    await inicializarModoMultiplayer();
  }
});

// ==========================================
// MODO COMPUTADORA (LÓGICA LOCAL)
// ==========================================
let codigoPC = [];
function inicializarModoPC() {
  cambiarPantalla('pantalla-juego');
  document.getElementById('seccion-definir-codigo').classList.add('oculto');
  document.getElementById('seccion-combate').classList.remove('oculto');
  document.getElementById('indicador-turno').innerText = ">> TU TURNO (VS COMPUTADORA) <<";
  
  // Generar código de la PC sin duplicados
  let barajado = [...elementosValidos].sort(() => 0.5 - Math.random());
  codigoPC = barajado.slice(0, estadoJuego.longitud);

  // Cargar selector de objetivos fijo
  const select = document.getElementById('select-objetivo');
  select.innerHTML = `<option value="pc">COMPUTADORA🤖</option>`;
  
  agregarALog("[SISTEMA] La PC ha memorizado su código secreto. ¡Ataca!");
}

// Evaluar Intentos (Algoritmo Mastermind / Picas y Fijas)
function evaluarCodigo(intento, secreto) {
  let fijas = 0; // Posición exacta
  let picas = 0; // Elemento existe pero diferente posición
  for(let i=0; i<intento.length; i++) {
    if (intento[i] === secreto[i]) {
      fijas++;
    } else if (secreto.includes(intento[i])) {
      picas++;
    }
  }
  return { fijas, picas };
}

// ==========================================
// MODO MULTIJUGADOR (SUPABASE REALTIME)
// ==========================================
async function inicializarModoMultiplayer() {
  
  // Intento de rescate de última hora antes de lanzar la alerta
  if (!supabase) {
    const libRescate = window.supabase || window.supabaseJS;
    if (libRescate && libRescate.createClient) {
      supabase = libRescate.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }
  // Si definitivamente no se encuentra la librería en ningún rincón de la memoria:
  if (!supabase) {
    return alert("Error del Sistema: La librería externa de Supabase no ha sido detectada por el navegador. Asegúrate de estar usando Live Server o revisa la consola de desarrollador (F12).");
  }

  const nombre = document.getElementById('input-nombre').value.trim() || "PLAYER";
  const codSala = document.getElementById('input-sala-id').value.trim().toUpperCase();


  if(!codSala) return alert("Ingresa un código de sala válido");

  // 1. Buscar o Crear Sala
  let { data: sala, error } = await supabase.from('salas').select('*').eq('codigo_sala', codSala).maybeSingle();
  
  if(!sala) {
    const { data: nuevaSala } = await supabase.from('salas').insert([
      { codigo_sala: codSala, dificultad: 'seleccionada', longitud_codigo: estadoJuego.longitud }
    ]).select().single();
    sala = nuevaSala;
  } else {
    estadoJuego.longitud = sala.longitud_codigo;
  }
  estadoJuego.salaId = sala.id;

  // 2. Unirse como Jugador
  const { data: jugador } = await supabase.from('jugadores').insert([
    { sala_id: estadoJuego.salaId, nombre: nombre }
  ]).select().single();
  
  estadoJuego.miJugadorId = jugador.id;
  cambiarPantalla('pantalla-juego');
  agregarALog(`[SISTEMA] Unido a sala ${codSala}. Define tu código para iniciar.`);

  // 3. Suscribirse a cambios en Tiempo Real
  suscribirRealtime();
  actualizarSalaUI();
}

function suscribirRealtime() {
  supabase.channel(`sala:${estadoJuego.salaId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jugadores' }, () => actualizarSalaUI())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'historial_ataques' }, payload => {
       recibirNotificacionAtaque(payload.new);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_turnos' }, payload => {
       gestionarCambioTurno(payload.new);
    })
    .subscribe();
}

// Configurar código propio en Multijugador
document.getElementById('btn-guardar-codigo').addEventListener('click', async () => {
  const stringCod = document.getElementById('input-mi-codigo').value.replace(/\s+/g, '');
  const elementos = stringCod.split(',');

  if(elementos.length !== estadoJuego.longitud) {
    return alert(`Tu código debe tener exactamente ${estadoJuego.longitud} elementos separados por comas.`);
  }
  if(new Set(elementos).size !== elementos.length) {
    return alert("No puedes colocar elementos repetidos.");
  }

  estadoJuego.miCodigo = elementos;

  if(estadoJuego.modo === 'multi') {
    await supabase.from('jugadores').update({ codigo_secreto: stringCod }).eq('id', estadoJuego.miJugadorId);
    document.getElementById('seccion-definir-codigo').innerHTML = `<p class="neon-text-green">✔️ CÓDIGO REGISTRADO EN RED</p>`;
    // Validar si todos están listos para detonar el primer turno
    verificarInicioPartida();
  }
});

async function verificarInicioPartida() {
  let { data: jugadores } = await supabase.from('jugadores').select('*').eq('sala_id', estadoJuego.salaId);
  const todosListos = jugadores.every(j => j.codigo_secreto !== null);
  
  if(todosListos && jugadores.length > 1) {
    // Definir orden aleatorio y activar el primer turno
    await supabase.from('salas').update({ estado: 'jugando' }).eq('id', estadoJuego.salaId);
    await supabase.from('control_turnos').upsert({ sala_id: estadoJuego.salaId, jugador_turno_id: jugadores[0].id });
  }
}

async function actualizarSalaUI() {
  let { data: jugadores } = await supabase.from('jugadores').select('*').eq('sala_id', estadoJuego.salaId);
  estadoJuego.listaJugadores = jugadores;

  const select = document.getElementById('select-objetivo');
  select.innerHTML = '';

  jugadores.forEach(j => {
    if(j.id !== estadoJuego.miJugadorId && j.vivo) {
      select.innerHTML += `<option value="${j.id}">${j.nombre}</option>`;
    }
  });
}

function gestionarCambioTurno(datosTurno) {
  if(!datosTurno) return;
  const esMiTurno = datosTurno.jugador_turno_id === estadoJuego.miJugadorId;
  estadoJuego.esMiTurno = esMiTurno;

  const actual = estadoJuego.listaJugadores.find(j => j.id === datosTurno.jugador_turno_id);
  const nombreTurno = actual ? actual.nombre : "Desconocido";

  const banner = document.getElementById('indicador-turno');
  if(esMiTurno) {
    banner.innerText = ">> TU TURNO DE ATACAR 💥 <<";
    document.getElementById('seccion-combate').classList.remove('oculto');
  } else {
    banner.innerText = `>> TURNO DE: ${nombreTurno.toUpperCase()} <<`;
    document.getElementById('seccion-combate').classList.add('oculto');
  }
}

// Enviar el Ataque
document.getElementById('btn-enviar-ataque').addEventListener('click', async () => {
  const input = document.getElementById('input-ataque').value.replace(/\s+/g, '');
  const intento = input.split(',');

  if(intento.length !== estadoJuego.longitud) {
    return alert(`La hipótesis debe ser de ${estadoJuego.longitud} elementos.`);
  }

  if(estadoJuego.modo === 'pc') {
    let result = evaluarCodigo(intento, codigoPC);
    agregarALog(`[TÚ -> PC]: ${input} | Fijas: ${result.fijas}, Picas: ${result.picas}`);
    if(result.fijas === estadoJuego.longitud) {
      agregarALog("🏆 ¡FELICIDADES! DESTROZASTE EL CÓDIGO DE LA COMPUTADORA.");
      document.getElementById('seccion-combate').classList.add('oculto');
    }
  } else {
    // Ataque Multijugador Realtime
    if(!estadoJuego.esMiTurno) return;
    const objetivoId = document.getElementById('select-objetivo').value;
    const objetivo = estadoJuego.listaJugadores.find(j => j.id === objetivoId);
    const codigoSecretoObjetivo = objetivo.codigo_secreto.split(',');

    let result = evaluarCodigo(intento, codigoSecretoObjetivo);

    // Guardar intento en Supabase
    await supabase.from('historial_ataques').insert([{
      sala_id: estadoJuego.salaId,
      atacante_id: estadoJuego.miJugadorId,
      objetivo_id: objetivoId,
      hipotesis: input,
      correctos_posicion: result.fijas,
      correctos_elemento: result.picas
    }]);

    // Rotar Turno al siguiente jugador vivo
    rotarTurno();
  }
  document.getElementById('input-ataque').value = "";
});

async function rotarTurno() {
  const vivos = estadoJuego.listaJugadores.filter(j => j.vivo);
  const miIdx = vivos.findIndex(j => j.id === estadoJuego.miJugadorId);
  const proxIdx = (miIdx + 1) % vivos.length;
  
  await supabase.from('control_turnos').update({ 
    jugador_turno_id: vivos[proxIdx].id,
    actualizado_en: new Date()
  }).eq('sala_id', estadoJuego.salaId);
}

function recibirNotificacionAtaque(ataque) {
  const atacante = estadoJuego.listaJugadores.find(j => j.id === ataque.atacante_id)?.nombre || "Alguien";
  const objetivo = estadoJuego.listaJugadores.find(j => j.id === ataque.objetivo_id)?.nombre || "Alguien";
  
  agregarALog(`[${atacante} ⚔️ ${objetivo}]: Intento [${ataque.hipotesis}] -> Fijas: ${ataque.correctos_posicion}, Picas: ${ataque.correctos_elemento}`);

  if(ataque.correctos_posicion === estadoJuego.longitud) {
    agregarALog(`🚨 ¡EL CÓDIGO DE ${objetivo.toUpperCase()} FUE DESCUBIERTO!`);
    if(ataque.objetivo_id === estadoJuego.miJugadorId) {
      agregarALog("💥 Has sido eliminado del juego.");
      supabase.from('jugadores').update({ vivo: false }).eq('id', estadoJuego.miJugadorId);
    }
  }
}function agregarALog(texto) {
  const box = document.getElementById('log-terminal');
  box.innerHTML += `<p>${texto}</p>`;
  box.scrollTop = box.scrollHeight; // Auto-scroll al final
}
