import os
from flask import Flask
from flask_cors import CORS
from cnn_model import load_model
from audio_search import search_engine
from routes import routes
import globals

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
MODEL_PATH = 'backend/models/audio_cnn_20epochs_best.pth'
SONGS_INDEX_PATH = 'backend/csv/GTZANindex.txt'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


globals.model, globals.device = load_model(MODEL_PATH)
globals.search_engine = search_engine

def load_songs_data(path):
    songs = []
    if not os.path.exists(path):
        return songs
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line: continue
                parts = line.split(' ::: ')
                if len(parts) >= 3:
                    filename = parts[0]
                    artist = parts[1]
                    title = parts[2]
                    genre = filename.split('.')[0].capitalize()
                    songs.append({'filename': filename, 'artist': artist, 'title': title, 'genre': genre})
    except Exception:
        pass
    return songs

globals.all_songs = load_songs_data(SONGS_INDEX_PATH)

app.register_blueprint(routes)

if __name__ == '__main__':
    app.run(debug=True, port=8000, use_reloader=False)
