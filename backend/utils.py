import os
import torch
import torch.nn.functional as F
import torchaudio
import librosa
from flask import jsonify

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'flac'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def transform_audio(file_path, target_sample_rate=22050, max_ms=4000):
    try:
        # Load with librosa
        waveform, sr = librosa.load(file_path, sr=target_sample_rate)
    except Exception as e:
        print(f"Error loading audio: {e}")
        return None

    waveform = torch.from_numpy(waveform).unsqueeze(0)

    max_len = int(target_sample_rate * max_ms / 1000)
    if waveform.shape[1] > max_len:
        waveform = waveform[:, :max_len]
    else:
        padding = max_len - waveform.shape[1]
        waveform = F.pad(waveform, (0, padding))

    mel_transform = torchaudio.transforms.MelSpectrogram(
        sample_rate=target_sample_rate,
        n_mels=64
    )
    spec = mel_transform(waveform)
    spec = torchaudio.transforms.AmplitudeToDB()(spec)

    return spec.unsqueeze(0)
