/**
 * Servidor WebSockets para "Descifra el Código"
 * Control de salas (máx. 6 jugadores) con Sistema de Turnos Secuencial.
 * Herramientas 100% Gratuitas (Listo para Render, Glitch o Railway)
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Habilitamos CORS para permitir conexiones desde GitHub Pages
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

// Estructura en memoria para almacenar las salas activas
let rooms = {}; 

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // EVENTO: Unirse o Crear una Sala
    socket.on('joinRoom', ({ roomId, playerName, codeLength }) => {
        // Si la sala no existe, la inicializamos
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                codeLength: parseInt(codeLength) || 4, 
                players: {}, 
                status: 'waiting',      // 'waiting' o 'playing'
                turnOrder: [],          // Lista ordenada de IDs de socket
                currentTurnIndex: 0     // Índice del jugador que tiene el turno activo
            };
        }
        
        const room = rooms[roomId];

        // Restricción obligatoria: Máximo 6 participantes
        if (Object.keys(room.players).length >= 6) {
            return socket.emit('errorMsg', 'La sala está llena (Máximo 6 jugadores).');
        }

        // Si la partida ya empezó, impedir que se unan a mitad de juego
        if (room.status === 'playing') {
            return socket.emit('errorMsg', 'La partida ya ha comenzado en esta sala.');
        }
        
        // Registramos al nuevo jugador
        room.players[socket.id] = { 
            id: socket.id, 
            name: playerName, 
            secretCode: null, 
            attempts: [] 
        };

        socket.join(roomId);
        
        // Notificar a todos en la sala la actualización de participantes
        io.to(roomId).emit('roomUpdate', { room, roomId });
    });

    // EVENTO: Configurar el Código Secreto Oculto
    socket.on('setSecretCode', ({ roomId, secretCode }) => {
        const room = rooms[roomId];
        if (!room || !room.players[socket.id]) return;

        // Guardamos el código secreto enviado por este dispositivo
        room.players[socket.id].secretCode = secretCode;

        // Validamos si todos los jugadores conectados ya guardaron su código
        const allReady = Object.values(room.players).every(p => p.secretCode !== null);
        const totalPlayers = Object.keys(room.players).length;

        // El juego inicia si todos están listos y hay al menos 2 jugadores
        if (allReady && totalPlayers > 1) {
            room.status = 'playing';
            
            // Creamos el orden de turnos mezclando los IDs aleatoriamente para balancear el inicio
            room.turnOrder = Object.keys(room.players).sort(() => Math.random() - 0.5);
            room.currentTurnIndex = 0;
            
            io.to(roomId).emit('gameStarted', room);
        } else {
            // Informamos al dispositivo que su código fue aceptado y queda en espera
            io.to(roomId).emit('playerReady', { playerId: socket.id });
        }
    });

    // EVENTO: Enviar Ataque / Intentar Adivinar Código del Rival
    socket.on('submitGuess', ({ roomId, targetPlayerId, guess }) => {
        const room = rooms[roomId];
        if (!room || room.status !== 'playing') return;

        // VALIDACIÓN DE TURNO: Verificar si el socket que envía el ataque es el activo
        const currentTurnId = room.turnOrder[room.currentTurnIndex];
        if (socket.id !== currentTurnId) {
            return socket.emit('errorMsg', 'No es tu turno de atacar. Espera tu momento.');
        }

        const attacker = room.players[socket.id];
        const target = room.players[targetPlayerId];
        
        if (!attacker || !target) return;

        // Algoritmo de validación: Aciertos y Coincidencias
        let aciertos = 0;
        let coincidencias = 0;
        const targetCode = target.secretCode;

        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === targetCode[i]) {
                aciertos++; // Elemento correcto en la posición correcta
            } else if (targetCode.includes(guess[i])) {
                coincidencias++; // Elemento correcto en la posición incorrecta
            }
        }

        const result = { 
            targetName: target.name, 
            guess: guess.join(''), 
            aciertos, 
            coincidencias 
        };

        // Guardamos el intento en el historial del jugador atacante
        attacker.attempts.push(result);

        // CONDICIÓN DE VICTORIA: Si adivinó la longitud completa
        if (aciertos === room.codeLength) {
            io.to(roomId).emit('playerWon', { winnerName: attacker.name });
            delete rooms[roomId]; // Destruimos la sala al terminar la partida
        } else {
            // Avanzar el turno de forma circular al siguiente jugador del arreglo
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
            
            // Emitimos el resultado de manera global a la sala para actualizar los historiales visuales
            io.to(roomId).emit('attemptResult', { 
                room, 
                playerId: socket.id, 
                lastAttempt: result,
                nextTurnPlayerId: room.turnOrder[room.currentTurnIndex]
            });
        }
    });

    // EVENTO: Abandonar la sala o desconexión voluntaria
    socket.on('leaveRoom', ({ roomId }) => {
        handlePlayerExit(socket, roomId);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
        // Buscar en qué sala estaba el jugador desconectado y removerlo
        for (const roomId in rooms) {
            if (rooms[roomId].players[socket.id]) {
                handlePlayerExit(socket, roomId);
                break;
            }
        }
    });
});

// Función auxiliar para gestionar salidas limpias y no congelar los turnos
function handlePlayerExit(socket, roomId) {
    if (!rooms[roomId]) return;

    delete rooms[roomId].players[socket.id];

    // Si la sala se queda completamente vacía, la eliminamos de la memoria
    if (Object.keys(rooms[roomId].players).length === 0) {
        delete rooms[roomId];
    } else {
        // Si el juego ya estaba corriendo, debemos recalcular el sistema de turnos
        if (rooms[roomId].status === 'playing') {
            // Filtramos la lista de turnos para sacar al jugador ausente
            rooms[roomId].turnOrder = rooms[roomId].turnOrder.filter(id => id !== socket.id);
            
            // Corregimos el índice en caso de que quede fuera del nuevo rango
            if (rooms[roomId].currentTurnIndex >= rooms[roomId].turnOrder.length) {
                rooms[roomId].currentTurnIndex = 0;
            }
        }
        // Avisamos a los jugadores restantes el cambio de estado de la sala
        io.to(roomId).emit('roomUpdate', { room: rooms[roomId], roomId });
    }
}

// Inicialización del puerto para compatibilidad total con Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor de juego corriendo en el puerto ${PORT}`);
});
