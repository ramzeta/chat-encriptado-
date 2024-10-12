// public/main.js
const socket = io();

let userKeys; // Claves del usuario actual
let decryptedPrivateKey; // Clave privada descifrada
let userKeysReady = false; // Indicador de que las claves están listas
const publicKeys = {}; // Claves públicas de otros usuarios

// Generar par de claves y enviar la clave pública al servidor
(async () => {
  // Generar las claves
  userKeys = await openpgp.generateKey({
    type: 'ecc',
    curve: 'curve25519',
    userIDs: [{ name: 'Usuario', email: 'usuario@example.com' }],
    passphrase: 'contraseñaSegura',
  });

  // Leer y descifrar la clave privada
  const privateKey = await openpgp.readPrivateKey({ armoredKey: userKeys.privateKey });
  decryptedPrivateKey = await openpgp.decryptKey({
    privateKey,
    passphrase: 'contraseñaSegura',
  });

  userKeysReady = true;

  // Enviar la clave pública al servidor
  socket.emit('clave-publica', userKeys.publicKey);
})();

// Escuchar la lista actualizada de usuarios y sus claves públicas
socket.on('usuarios-actualizados', (usuarios) => {
  // Limpiar el objeto de claves públicas
  for (const id in publicKeys) {
    if (!usuarios[id]) {
      delete publicKeys[id];
    }
  }

  // Agregar nuevas claves públicas
  for (const [id, publicKeyArmored] of Object.entries(usuarios)) {
    if (id !== socket.id && !publicKeys[id]) {
      publicKeys[id] = publicKeyArmored;
      console.log(`Clave pública de ${id} almacenada.`);
    }
  }
});

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

  // Crear el mensaje cifrado y firmado
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

// Recibir y descifrar mensajes cifrados
socket.on('mensaje-cifrado', async (data) => {
  const { mensaje, remitenteId } = data;

  // Obtener la clave pública del remitente
  const remitentePublicKeyArmored = publicKeys[remitenteId];
  if (!remitentePublicKeyArmored) {
    console.error('Clave pública del remitente no encontrada.');
    return;
  }

  const remitentePublicKey = await openpgp.readKey({ armoredKey: remitentePublicKeyArmored });

  // Leer el mensaje cifrado
  const mensajeCifrado = await openpgp.readMessage({ armoredMessage: mensaje });

  // Descifrar y verificar el mensaje
  const { data: mensajeDescifrado, signatures } = await openpgp.decrypt({
    message: mensajeCifrado,
    decryptionKeys: decryptedPrivateKey,
    verificationKeys: remitentePublicKey,
  });

  // Verificar la firma
  const firmaValida = await signatures[0].verified;
  if (firmaValida) {
    // Mostrar el mensaje en el chat
    const chat = document.getElementById('chat');
    chat.innerHTML += `<div><strong>Usuario ${remitenteId}:</strong> ${mensajeDescifrado}</div>`;
  } else {
    console.error('La firma del mensaje no es válida.');
  }
});
