import os
import torch
import numpy as np
import pandas as pd
import torchaudio

import torchopenl3
import faiss

HAS_ADVANCED_DEPS = True

class AudioSearchEngine:
    def __init__(self, cache_dir='backend/embeddings', csv_dir='backend/csv', 
                 target_sr=16000, duration=30.0, input_repr="mel128", 
                 content_type="music", embed_size=512):
        self.tmodel = None
        self.index = None
        self.meta_real = None
        self.has_deps = HAS_ADVANCED_DEPS
        
        self.target_sr = target_sr
        self.duration = duration
        self.samples = int(target_sr * duration)
        self.input_repr = input_repr
        self.content_type = content_type
        self.embed_size = embed_size
        
        # Configuration for embedding
        self.hop_size = 0.1
        self.center = True
        self.batch_size = 32

        self._initialize(cache_dir, csv_dir)

    def _initialize(self, cache_dir, csv_dir):
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load TorchOpenL3
        self.tmodel = torchopenl3.models.load_audio_embedding_model(
            input_repr=self.input_repr,
            content_type=self.content_type,
            embedding_size=self.embed_size
        ).to(device).eval()
        print("TorchOpenL3 model loaded.")

        # Load FAISS Index and Metadata
        meta_path = os.path.join(csv_dir, "gtzan_real_meta.csv")
        X_path = os.path.join(cache_dir, "gtzan_real_X_pooled.npy")
        
        if os.path.exists(meta_path) and os.path.exists(X_path):
            self.meta_real = pd.read_csv(meta_path)
            X = np.load(X_path)
            if X.ndim != 2:
                raise ValueError(f"Pooled embeddings must be (N, D), got {X.shape}")
            X = np.ascontiguousarray(X, dtype=np.float32)
            
            # Normalize X for Cosine Similarity (IndexFlatIP computes Inner Product)
            faiss.normalize_L2(X)

            d_emb = X.shape[1]
            self.index = faiss.IndexFlatIP(d_emb)
            self.index.add(X)
            print(f"FAISS index loaded. Total vectors: {self.index.ntotal}")
        else:
            print(f"Warning: Embeddings or Metadata not found. Paths checked: {meta_path}, {X_path}")

    def load_audio_fixed(self, path: str):
        wav, sr = torchaudio.load(path)
        wav = wav.mean(dim=0, keepdim=True)
        if sr != self.target_sr:
            wav = torchaudio.functional.resample(wav, sr, self.target_sr)
        wav = wav.squeeze(0)
        if wav.numel() > self.samples:
            wav = wav[:self.samples]
        elif wav.numel() < self.samples:
            wav = torch.nn.functional.pad(wav, (0, self.samples - wav.numel()))
        return wav.cpu().numpy().astype(np.float32), self.target_sr

    @torch.no_grad()
    def embed_path(self, path: str) -> np.ndarray:
        if not self.tmodel:
            raise ValueError("TorchOpenL3 model not loaded")
        
        audio, sr = self.load_audio_fixed(path)
        emb, ts = torchopenl3.get_audio_embedding(
            audio=audio, sr=sr, model=self.tmodel,
            hop_size=self.hop_size, center=self.center,
            batch_size=self.batch_size, verbose=0
        )
        if isinstance(emb, torch.Tensor):
            emb = emb.detach().cpu().numpy()
        else:
            emb = np.asarray(emb)
        if emb.ndim == 3 and emb.shape[0] == 1:
            emb = emb[0]
        v = emb.mean(axis=0)
        v /= np.linalg.norm(v) + 1e-12
        return v.astype(np.float32)

    def knn_query_vector(self, q_vec: np.ndarray, k: int = 10):
        if not self.index or self.meta_real is None:
            return pd.DataFrame()
        q = q_vec.astype(np.float32)[None, :]
        scores, idxs = self.index.search(q, k)
        out = self.meta_real.iloc[idxs[0]].copy()
        out["score"] = scores[0]
        return out

# Singleton instance
search_engine = AudioSearchEngine()

