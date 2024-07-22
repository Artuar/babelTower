from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from datetime import datetime
from pydub import AudioSegment
import soundfile as sf
from io import BytesIO

from babylon_sts import AudioProcessor

app = Flask(__name__)
CORS(app)

@app.route('/api/translate-audio', methods=['POST'])
def translate_audio():
    try:
        data = request.json
        file_base64 = data.get('file')
        language_to = data.get('language_to')
        language_from = data.get('language_from')
        model_name = data.get('model_name')
        sample_rate = 24000

        if not file_base64 or not language_to or not language_from:
            return jsonify({"error": "File, language_from and language_to are required"}), 400

        # Decode base64 file
        file_data = base64.b64decode(file_base64.split(';base64,')[-1])
        audio_segment = AudioSegment.from_file(BytesIO(file_data), format="mp3")
        audio_segment = audio_segment.set_frame_rate(sample_rate).set_channels(1)
        audio_data = np.array(audio_segment.get_array_of_samples())
        audio_data = audio_data.tobytes()

        timestamp = datetime.utcnow()

        # Processing the audio data
        try:
            # Creating an instance of AudioProcessor with the necessary parameters
            audio_processor = AudioProcessor(
                language_to=language_to[0],
                language_from=language_from[0],
                model_name=model_name[0],
                sample_rate=sample_rate
            )

            final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)
            output_io = BytesIO()
            sf.write(output_io, final_audio, sample_rate, format='mp3')
            processed_file_base64 = base64.b64encode(output_io.getvalue()).decode('utf-8')
        except ValueError as e:
            print(f"Error during synthesis: {e}")
            return jsonify({"error": f"Error during synthesis: {e}"}), 500

        return jsonify({"translatedAudio": f"data:audio/mpeg;base64,{processed_file_base64}"}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({"error": e or "Error processing the file"}), 500

if __name__ == '__main__':
    app.run(debug=True)
