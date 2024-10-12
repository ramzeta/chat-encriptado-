// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Almacenar las claves públicas de los usuarios conectados
const usuarios = {};

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Escuchar la clave pública enviada por el cliente
  socket.on('clave-publica', (publicKeyArmored) => {
    usuarios[socket.id] = publicKeyArmored;
    console.log(`Clave pública recibida de ${socket.id}`);

    // Enviar la lista actualizada de usuarios y claves públicas a todos los clientes
    io.emit('usuarios-actualizados', usuarios);
  });

  // Escuchar mensajes cifrados enviados por el cliente
  socket.on('mensaje-cifrado', (data) => {
    // Reenviar el mensaje a todos los demás clientes
    socket.broadcast.emit('mensaje-cifrado', {
      mensaje: data.mensaje,
      remitenteId: socket.id,
    });
  });

  // Manejar la desconexión de usuarios
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    delete usuarios[socket.id];
    // Notificar a los clientes que la lista de usuarios ha cambiado
    io.emit('usuarios-actualizados', usuarios);
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3333;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
