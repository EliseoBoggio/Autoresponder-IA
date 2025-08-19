import qrcode from "qrcode-terminal";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import axios from "axios";

const iniciarBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version } = await fetchLatestBaileysVersion(); // siempre usa la última versión

  const sock = makeWASocket({
    auth: state,
    version, // usa siempre la versión más reciente
    browser: ["Chrome", "EliseoBot", "10.0"], // simula un navegador moderno
  });

  // Evento de conexión (único y correcto)
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true }); // muestra el QR en consola
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexión cerrada. ¿Reconectar?", shouldReconnect);
      if (shouldReconnect) iniciarBot();
    } else if (connection === "open") {
      console.log("✅ Conectado a WhatsApp");
    }
  });

  // Guardar las credenciales al cambiar
  sock.ev.on("creds.update", saveCreds);

  // Responder a mensajes nuevos
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    if (texto) {
      console.log("[DEBUG] Mensaje recibido:", texto);

      try {
        const response = await axios.post("http://localhost:5000/webhook", {
          query: {
            message: texto,
          },
        });

        const respuestaIA = response.data.replies[0];
        console.log("[DEBUG] Respuesta IA:", respuestaIA);

        await sock.sendMessage(msg.key.remoteJid, {
          text: respuestaIA,
        });
      } catch (error) {
        console.error(
          "[ERROR] Fallo al enviar mensaje a Llama o WhatsApp:",
          error.message
        );
        await sock.sendMessage(msg.key.remoteJid, {
          text: "Ocurrió un error al procesar tu mensaje.",
        });
      }
    }
  });
};

iniciarBot();

