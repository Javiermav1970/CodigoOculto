/* =========================================================
   CÓDIGO OCULTO - Servidor Central de Red (Real-Time)
   ========================================================= */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors()); // Permitir conexiones desde cualquier URL (importante para hosting gratuitos)

app.use(express.static(path.join(__dirname, 'public')));  

const server = http.createServer(app);
// Configurar los WebSockets para aceptar tráficos remotos
const io = new Server(server, {
  cors: {
    origin: "*", // Permite que tu frontend en GitHub Pages o Vercel se conecte sin bloqueos
    methods: ["GET", "POST"]
  }
});

// Estructura en memoria para almacenar las salas activas en internet
// Formato: { 'ROOM_CODE': { connectedPlayers: [], multiplayerHistory: [], decryptedPlayers: [], currentPlayerIndex: 0, limit: 0 } }
const salasActivas = {};

io.on('connection', (socket) => {
  console.log(`📡 Nodo conectado al servidor central: ID [${socket.id}]`);

  // 1. EVENTO: CREAR SALA (Ejecutado por el Host)
  socket.on('crear_sala', (datos) => {
    const { roomCode, username, maxPlayers, multiLength, limit } = datos;

    // Inicializar la estructura de la sala en la nube
    salasActivas[roomCode] = {
      code: roomCode,
      maxPlayers: maxPlayers,
      multiLength: multiLength,
      limit: limit, // Segundos del temporizador adaptativo configurado
      currentPlayerIndex: 0,
      decryptedPlayers: [],
      multiplayerHistory: [],
      playerTargetBlocks: {}, // Control de ataques por ronda
      connectedPlayers: [{
        id: socket.id,
        name: username,
        isHost: true,
        secretCode: null // Se llenará cuando bloquee su secuencia
      }]
    };

    socket.join(roomCode); // Unir la conexión física de Socket.io a la sala
    socket.emit('sala_creada_ok', salasActivas[roomCode]);
    console.log(`🏢 Sala [${roomCode}] publicada con éxito por el Host [${username}]`);
  });

  // 2. EVENTO: UNIRSE A SALA (Ejecutado por los Invitados)
  socket.on('unirse_sala', (datos) => {
    const { roomCode, username } = datos;
    const sala = salasActivas[roomCode];

    if (!sala) {
      socket.emit('error_red', '❌ PROTOCOLO INVÁLIDO: La sala especificada no existe en la red.');
      return;
    }

    if (sala.connectedPlayers.length >= sala.maxPlayers) {
      socket.emit('error_red', '❌ ACCESO DENEGADO: El nodo central ha alcanzado el límite máximo de hackers.');
      return;
    }

    // Registrar al nuevo jugador real en el arreglo de la sala
    const nuevoJugador = {
      id: socket.id,
      name: username,
      isHost: false,
      secretCode: null
    };

    sala.connectedPlayers.push(nuevoJugador);
    socket.join(roomCode);

    // Notificar a todos en la sala que se enlazó un nuevo terminal
    io.to(roomCode).emit('actualizar_sala_jugadores', sala.connectedPlayers);
    socket.emit('union_exitosa', { multiLength: sala.multiLength, limit: sala.limit });
    console.log(`📡 Jugador [${username}] enlazado correctamente al nodo [${roomCode}]`);
  });

  // 3. EVENTO: BLOQUEAR CÓDIGO SECRETO
  socket.on('confirmar_codigo_secreto', (datos) => {
    const { roomCode, username, secretCode } = datos;
    const sala = salasActivas[roomCode];
    if (!sala) return;

    const jugador = sala.connectedPlayers.find(p => p.name === username);
    if (jugador) {
      jugador.secretCode = secretCode;
      console.log(`🔒 Cifrado establecido para [${username}] en sala [${roomCode}]`);
    }

    // Verificar si TODOS los jugadores reales conectados ya guardaron su clave secreta
    const todosListos = sala.connectedPlayers.every(p => p.secretCode !== null);
    
    // Si es una sala de 2 y ya están ambos listos, o si el Host decide forzar con el mínimo configurado
    if (todosListos && sala.connectedPlayers.length >= 2) {
      io.to(roomCode).emit('partida_lista_para_lanzar', {
        connectedPlayers: sala.connectedPlayers,
        currentPlayerIndex: sala.currentPlayerIndex
      });
      console.log(`🎮 PROTOCOLO DE JUEGO ACTIVADO: Todos los terminales de la sala [${roomCode}] están sincronizados.`);
    }
  });

  // 4. EVENTO: PROCESAR INTENTO DE ATAQUE EN TIEMPO REAL
  socket.on('inyectar_ataque', (datos) => {
  const { roomCode, atacante, objetivo, guess } = datos;
  const sala = salasActivas[roomCode];
  if (!sala) return;

  io.to(roomCode).emit('popup_ataque_recibido', { emisor: atacante, receptor: objetivo, codigo: guess });

  const estructuraObjetivo = sala.connectedPlayers.find(p => p.name === objetivo);
  if (!estructuraObjetivo) return;

  const { correct, present } = calculateHintsServer(guess, estructuraObjetivo.secretCode);

  const indexIntento = sala.multiplayerHistory.length + 1;
  sala.multiplayerHistory.push({
    player: atacante, target: objetivo, guess, correct, present, index: indexIntento
  });

  if (correct === sala.multiLength) {
    if (!sala.decryptedPlayers.includes(objetivo)) {
      sala.decryptedPlayers.push(objetivo);
    }
    io.to(roomCode).emit('nodo_comprometido_alerta', { atacante, objetivo, decryptedPlayers: sala.decryptedPlayers });
  }

  // ---- CORRECCIÓN DE TURNOS EN LA NUBE ----
  // Avanzar el turno al siguiente jugador disponible que no esté descifrado (eliminado)
  let siguienteIndex = sala.currentPlayerIndex;
  do {
    siguienteIndex = (siguienteIndex + 1) % sala.connectedPlayers.length;
  } while (
    sala.decryptedPlayers.includes(sala.connectedPlayers[siguienteIndex].name) && 
    sala.decryptedPlayers.length < sala.connectedPlayers.length - 1
  );
  
  sala.currentPlayerIndex = siguienteIndex;

  // Transmitir actualización de bitácora Y el nuevo turno dictado por el servidor
  io.to(roomCode).emit('actualizar_bitacora_global', {
    multiplayerHistory: sala.multiplayerHistory,
    correct: correct,
    present: present,
    target: objetivo,
    currentPlayerIndex: sala.currentPlayerIndex // <--- Turno sincronizado
  });

  // Evaluar Fin del Juego (Dominación)
  const totalObjetivos = sala.connectedPlayers.length - 1;
  const exitosAtacante = sala.multiplayerHistory.filter(item => item.player === atacante && item.correct === sala.multiLength).length;

  if (exitosAtacante === totalObjetivos) {
    io.to(roomCode).emit('victoria_global_servidor', { ganador: atacante });
    delete salasActivas[roomCode];
  }
});

  // 5. EVENTO: ABANDONO O DESCONEXIÓN INVOLUNTARIA
  socket.on('disconnect', () => {
    console.log(`🔌 Conexión interrumpida con el ID [${socket.id}]`);
    
    // Buscar en qué sala se encontraba el usuario saliente
    Object.keys(salasActivas).forEach(roomCode => {
      const sala = salasActivas[roomCode];
      const index = sala.connectedPlayers.findIndex(p => p.id === socket.id);

      if (index !== -1) {
        const jugadorSaliendo = sala.connectedPlayers[index].name;
        sala.connectedPlayers.splice(index, 1); // Remover del arreglo en la nube

        io.to(roomCode).emit('jugador_abandono_sala', {
          nombre: jugadorSaliendo,
          connectedPlayers: sala.connectedPlayers
        });

        // Si la sala se queda vacía, se destruye para liberar memoria en Render
        if (sala.connectedPlayers.length === 0) {
          delete salasActivas[roomCode];
          console.log(`🗑️ Sala vacía [${roomCode}] removida del servidor.`);
        }
      }
    });
  });
});

/* ---------- EVALUACIÓN LÓGICA EN SERVIDOR (MASTERMIND) ---------- */
function calculateHintsServer(guess, secret) {
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

// Inicializar el servidor en el puerto dinámico asignado por Render/Railway, o el 3000 local
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MULTIJUGADOR CORRIENDO EN EL PUERTO: ${PORT}`);
});
