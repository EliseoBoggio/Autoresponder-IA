# Autoresponder-IA
Este proyecto crea una webhook con Ngrok que se conecta a un servidor de python el cual realiza la conexion con la IA Llama3, a su vez se conecta a whatsapp a traves de un codigo qr que se genera con JavaScript

Se debe descargar y ejecutar llama3, en cmd
ollama run llama3

Luego ejecutar el servidor, en cmd
python server.py

En otra consola crear la webhook con ngrok
ngrok http 5000

Crear el codigo qr y escanearlo con WP
node index.js
