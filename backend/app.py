from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

@app.route('/api/translate-audio', methods=['POST'])
def translate_audio():
    try:
        data = request.json
        file_base64 = data.get('file')
        language = data.get('language')

        if not file_base64 or not language:
            return jsonify({"error": "File and language are required"}), 400

        # Decode base64 file
        file_data = base64.b64decode(file_base64.split(';base64,')[-1])

        return jsonify({"translatedAudio": f"data:audio/mp3;base64,{file_data}"}), 200
    except Exception as e:
        print('Error:', str(e))
        return jsonify({"error": "Error processing the file"}), 500

if __name__ == '__main__':
    app.run(debug=True)
