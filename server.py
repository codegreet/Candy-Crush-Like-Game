from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.1-8b-instant"

@app.route('/hint', methods=['POST'])
def get_hint():
    try:
        data = request.get_json()
        board = data.get("board", [])

        prompt = f"The current candy board is: {board}. Suggest the best next swap to make a match of 3 candies."

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are an AI assistant that helps with a candy match game."},
                {"role": "user", "content": prompt}
            ]
        }

        response = requests.post(GROQ_URL, headers=headers, json=payload)
        
        if response.status_code != 200:
            return jsonify({"error": f"Groq API returned {response.status_code}: {response.text}"}), 500
        
        result = response.json()
        hint_text = result.get("choices", [{}])[0].get("message", {}).get("content", "No hint received.")

        return jsonify({"hint": hint_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
