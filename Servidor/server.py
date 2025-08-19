from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    print("[DEBUG] JSON recibido:", data)

    user_prompt = data.get("query", {}).get("message", "")
    message = f"Respondé brevemente y en pocas palabras: {user_prompt}"
    print(f"[DEBUG] Mensaje modificado: {message}")

    if not message:
        return jsonify({"replies": []}), 200

    try:
        llama_payload = {
            "model": "llama3",
            "stream": False,
            "messages": [{"role": "user", "content": message}]
        }

        response = requests.post("http://localhost:11434/api/chat", json=llama_payload)
        response.raise_for_status()
        full_response = response.json()["message"]["content"]
        print(f"[DEBUG] Respuesta IA: {full_response}")

    except Exception as e:
        print(f"[ERROR] Fallo al consultar Llama3: {e}")
        full_response = "Ocurrió un error al procesar tu mensaje."

    return jsonify({"replies": [full_response]}), 200

# Nuevo endpoint para Baileys
@app.route('/llama', methods=['POST'])
def llama_direct():
    data = request.get_json()
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"response": "No recibí ningún mensaje."}), 400

    try:
        llama_payload = {
            "model": "llama3",
            "stream": False,
            "messages": [{"role": "user", "content": prompt}]
        }

        response = requests.post("http://localhost:11434/api/chat", json=llama_payload)
        response.raise_for_status()
        full_response = response.json()["message"]["content"]

    except Exception as e:
        print(f"[ERROR] Fallo al consultar LLaMA3: {e}")
        full_response = "Ocurrió un error al procesar tu mensaje."

    return jsonify({"response": full_response}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

