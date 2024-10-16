---

# **Chat Cifrado en Tiempo Real con OpenPGP.js y Node.js**

Este proyecto es una aplicación de chat en tiempo real que permite a los usuarios comunicarse de forma segura utilizando cifrado de extremo a extremo (E2EE) con **OpenPGP.js** y **Socket.IO** en **Node.js**. Cada mensaje enviado es cifrado y firmado digitalmente, garantizando confidencialidad, integridad y autenticación.

## **Tabla de Contenidos**

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionamiento del Chat](#funcionamiento-del-chat)
- [Personalización](#personalización)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## **Características**

- **Cifrado de Extremo a Extremo**: Los mensajes se cifran con las claves públicas de los destinatarios y se descifran con las claves privadas correspondientes.
- **Firma Digital**: Cada mensaje se firma digitalmente para asegurar la autenticidad y la integridad.
- **Intercambio Automático de Claves Públicas**: Al conectarse, los usuarios intercambian sus claves públicas de forma automática.
- **Metadatos en Mensajes**: Los mensajes pueden incluir metadatos como asunto y marca de tiempo.
- **Interfaz Sencilla**: Una interfaz web básica para facilitar el uso y comprensión del chat.
- **Escalable**: Construido sobre Socket.IO, permite la comunicación en tiempo real entre múltiples clientes.

---

## **Tecnologías Utilizadas**

- **Node.js**: Entorno de ejecución para el servidor.
- **Express**: Framework web para Node.js.
- **Socket.IO**: Biblioteca para comunicación en tiempo real basada en eventos.
- **OpenPGP.js**: Biblioteca de JavaScript para implementar el estándar OpenPGP de cifrado.
- **HTML, CSS y JavaScript**: Tecnologías básicas para la interfaz de usuario.

---

## **Requisitos Previos**

- **Node.js** (versión 12 o superior): [Descargar Node.js](https://nodejs.org/)
- **NPM**: Normalmente incluido con Node.js.
- **Navegador Web**: Preferiblemente Chrome, Firefox o Edge.

---

## **Instalación**

Sigue estos pasos para instalar y ejecutar el proyecto en tu máquina local:

1. **Clonar el Repositorio**

   ```bash
   git clone https://github.com/tu_usuario/chat-cifrado.git
   cd chat-cifrado
   ```

2. **Instalar Dependencias**

   Ejecuta el siguiente comando en la raíz del proyecto para instalar las dependencias necesarias:

   ```bash
   npm install
   ```

---

## **Uso**

1. **Iniciar el Servidor**

   Ejecuta el siguiente comando para iniciar el servidor:

   ```bash
   node server.js
   ```

   Deberías ver un mensaje indicando que el servidor está corriendo:

   ```
   Servidor corriendo en puerto 3000
   ```

2. **Abrir el Cliente**

   Abre tu navegador web y visita:

   ```
   http://localhost:3000
   ```

3. **Conectar Múltiples Usuarios**

   Para simular múltiples usuarios, abre varias pestañas o ventanas en el navegador y carga la misma dirección.

4. **Enviar Mensajes**

   - Escribe un mensaje en el campo de texto.
   - Opcionalmente, agrega un asunto al mensaje.
   - Haz clic en **"Enviar"**.
   - El mensaje se cifrará, firmará y enviará a los demás usuarios conectados.

---

## **Estructura del Proyecto**

```
chat-cifrado/
├── server.js          # Código del servidor Node.js con Express y Socket.IO
├── package.json       # Archivo de configuración de NPM con dependencias
├── package-lock.json  # Archivo de bloqueo de dependencias
└── public/            # Archivos públicos accesibles por el cliente
    ├── index.html     # Página principal del chat
    ├── main.js        # Lógica del cliente para el chat cifrado
    └── styles.css     # Estilos CSS (opcional)
```

---

## **Funcionamiento del Chat**

1. **Generación de Claves**

   - Al cargar la página, cada cliente genera un par de claves (pública y privada) utilizando OpenPGP.js.
   - La clave privada se cifra con una contraseña (en el ejemplo, está hardcodeada para simplificar).

2. **Intercambio de Claves Públicas**

   - Cada cliente envía su clave pública al servidor.
   - El servidor mantiene una lista de usuarios y sus claves públicas.
   - El servidor envía la lista actualizada a todos los clientes cuando un usuario se conecta o desconecta.

3. **Cifrado y Envío de Mensajes**

   - Al enviar un mensaje, el cliente:
     - Crea un objeto que incluye el texto del mensaje y metadatos opcionales (asunto, timestamp).
     - Convierte el objeto a una cadena JSON.
     - Cifra el mensaje utilizando las claves públicas de los demás usuarios conectados.
     - Firma el mensaje con su clave privada.
     - Envía el mensaje cifrado al servidor.

4. **Recepción y Descifrado de Mensajes**

   - Al recibir un mensaje cifrado, el cliente:
     - Utiliza su clave privada para descifrar el mensaje.
     - Verifica la firma utilizando la clave pública del remitente.
     - Parsear el JSON para extraer el texto y los metadatos.
     - Muestra el mensaje en la interfaz del chat.

---

## **Personalización**

Puedes personalizar y mejorar el chat de varias maneras:

- **Agregar Autenticación de Usuarios**: Implementa un sistema de registro e inicio de sesión para que los usuarios tengan identidades persistentes.
- **Mejorar la Interfaz de Usuario**: Utiliza frameworks como React, Angular o Vue.js para crear una interfaz más interactiva y atractiva.
- **Almacenar Claves en el Navegador**: Usa `localStorage` o `IndexedDB` para almacenar las claves de los usuarios y evitar generarlas cada vez.
- **Implementar Chats Privados**: Permite a los usuarios iniciar conversaciones privadas cifradas con usuarios específicos.
- **Seguridad Adicional**: Solicita al usuario que ingrese su contraseña para descifrar su clave privada en cada sesión.

---

## **Consideraciones de Seguridad**

- **Contraseñas**: En este ejemplo, la contraseña de la clave privada está escrita en el código. En un entorno de producción, nunca debes almacenar contraseñas en texto plano o en el código fuente.
- **Gestión de Claves**: Asegúrate de proteger las claves privadas y no transmitirlas ni almacenarlas en el servidor.
- **Verificación de Identidad**: Implementa mecanismos para verificar la identidad de los usuarios y prevenir ataques de intermediario (Man-in-the-Middle).
- **Actualizaciones de Dependencias**: Mantén las dependencias actualizadas para protegerte contra vulnerabilidades conocidas.

---

## **Contribución**

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto:

1. Haz un fork del repositorio.
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`).
3. Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva característica'`).
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`).
5. Abre un Pull Request.

---

## **Licencia**

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## **Contacto**

Si tienes preguntas, problemas o sugerencias, no dudes en contactarme:

- **Email**: tu_email@example.com
- **GitHub**: [tu_usuario](https://github.com/tu_usuario)

---

## **Agradecimientos**

- **OpenPGP.js**: Por proporcionar una implementación sólida del estándar OpenPGP en JavaScript.
- **Socket.IO**: Por facilitar la comunicación en tiempo real entre clientes y servidores.
- **Comunidad Open Source**: Por compartir conocimientos y herramientas que hacen posibles proyectos como este.

---

