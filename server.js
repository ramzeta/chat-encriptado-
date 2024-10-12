// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir archivos estáticos
app.use(express.static('public'));

// Almacenar claves públicas de los usuarios
const usuarios = {};

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Recibir y almacenar la clave pública del usuario
  socket.on('clave-publica', (publicKeyArmored) => {
    usuarios[socket.id] = publicKeyArmored;

    // Enviar la clave pública del nuevo usuario a los demás
    socket.broadcast.emit('usuario-conectado', {
      socketId: socket.id,
      publicKey: publicKeyArmored,
    });

    // Enviar las claves públicas de los usuarios existentes al nuevo usuario
    for (const [id, publicKey] of Object.entries(usuarios)) {
      if (id !== socket.id) {
        socket.emit('usuario-conectado', {
          socketId: id,
          publicKey: publicKey,
        });
      }
    }
  });

  // Escuchar mensajes cifrados
  socket.on('mensaje-cifrado', (data) => {
    // Reenviar el mensaje y el ID del remitente a los demás clientes
    socket.broadcast.emit('mensaje-cifrado', {
      mensaje: data.mensaje,
      remitenteId: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);

    // Eliminar la clave pública del usuario desconectado
    delete usuarios[socket.id];

    // Notificar a los demás usuarios
    socket.broadcast.emit('usuario-desconectado', socket.id);
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3333;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
