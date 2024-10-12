// public/main.js
const socket = io();

let userKeys;
let userKeysReady = false;
const publicKeys = {}; // Almacenar claves públicas de otros usuarios

// Generar par de claves
(async () => {
  userKeys = await openpgp.generateKey({
    type: 'ecc',
    curve: 'ed25519',
    userIDs: [{ name: 'Usuario', email: 'usuario@example.com' }],
    passphrase: 'contraseñaSegura',
  });
  userKeysReady = true;

  // Enviar clave pública al servidor
  socket.emit('clave-publica', userKeys.publicKey);
})();

// Enviar mensaje cifrado
document.getElementById('enviar').addEventListener('click', async () => {
    if (!userKeysReady) {
      alert('Las claves aún se están generando. Por favor, espera unos segundos.');
      return;
    }
  
    const mensajeTexto = document.getElementById('mensaje').value;
  
    // Cifrar el mensaje con las claves públicas de los demás usuarios
    const encryptionKeys = [];
    for (const publicKeyArmored of Object.values(publicKeys)) {
      const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
      encryptionKeys.push(publicKey);
    }
  
    if (encryptionKeys.length === 0) {
      alert('No hay otros usuarios conectados para recibir el mensaje.');
      return;
    }
  
    // Leer y descifrar tu clave privada
    const decryptedPrivateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: userKeys.privateKey }),
      passphrase: 'contraseñaSegura',
    });
  
    // Cifrar el mensaje
    const mensajeCifrado = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: mensajeTexto }),
      encryptionKeys: encryptionKeys,
      signingKeys: decryptedPrivateKey,
    });
  
    // Enviar mensaje cifrado al servidor
    socket.emit('mensaje-cifrado', { mensaje: mensajeCifrado });
  
    // Mostrar mensaje en el chat
    const chat = document.getElementById('chat');
    chat.innerHTML += `<div><strong>Tú:</strong> ${mensajeTexto}</div>`;
    document.getElementById('mensaje').value = '';
  });
  

// Recibir mensajes cifrados
socket.on('mensaje-cifrado', async (data) => {
  const { mensaje, remitenteId } = data;

  // Obtener la clave pública del remitente
  const remitentePublicKeyArmored = publicKeys[remitenteId];
  if (!remitentePublicKeyArmored) {
    console.error('Clave pública del remitente no encontrada.');
    return;
  }

  const remitentePublicKey = await openpgp.readKey({ armoredKey: remitentePublicKeyArmored });

  // Descifrar el mensaje
  const mensajeDescifrado = await openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: mensaje }),
    decryptionKeys: await openpgp.decryptKey({
      privateKey: userKeys.privateKey,
      passphrase: 'contraseñaSegura',
    }),
    verificationKeys: remitentePublicKey,
  });

  // Mostrar mensaje en el chat
  const chat = document.getElementById('chat');
  chat.innerHTML += `<div><strong>Otro:</strong> ${mensajeDescifrado.data}</div>`;
});

// Manejar la recepción de claves públicas de otros usuarios
socket.on('usuario-conectado', (data) => {
  const { socketId, publicKey } = data;
  publicKeys[socketId] = publicKey;
  console.log(`Usuario conectado: ${socketId}`);
});

// Manejar la desconexión de usuarios
socket.on('usuario-desconectado', (socketId) => {
  delete publicKeys[socketId];
  console.log(`Usuario desconectado: ${socketId}`);
});
