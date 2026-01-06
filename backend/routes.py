import os
import random
import torch
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils import allowed_file, transform_audio
import globals

routes = Blueprint('routes', __name__)

@routes.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

@routes.route('/api/predict', methods=['POST'])
def predict_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            input_tensor = transform_audio(filepath)
            if input_tensor is None:
                os.remove(filepath)
                return jsonify({'error': 'Error processing audio file'}), 500
            
            input_tensor = input_tensor.to(globals.device)
            
            with torch.no_grad():
                output = globals.model(input_tensor)
                prob_ai = torch.sigmoid(output).item()
                
                prob_ai = output.item()
                
                result_type = "Human-Made Classified" if prob_ai <= 0.5 else "AI Classified"
                
                if result_type == "Human-Made Classified":
                    if os.path.exists(filepath):
                        os.remove(filepath)
                
                return jsonify({
                    "filename": filename,
                    "probability": prob_ai,
                    "result": result_type,
                    "raw_output": output.item()
                })
                
        except Exception as e:
            print(f"Error processing prediction: {e}")
            # If error occurs, ensure cleanup
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
                  
    return jsonify({'error': 'Invalid file type'}), 400


@routes.route('/api/topkrealsongs', methods=['GET'])
def top_k_real_songs():
    filename = request.args.get('filename')
    k = int(request.args.get('k', 5))

    # Use OpenL3 + FAISS
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(filename))
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found on server'}), 404

    try:
        # 1. Embed query
        q_vec = globals.search_engine.embed_path(filepath)
        
        # 2. KNN Search
        results_df = globals.search_engine.knn_query_vector(q_vec, k=k)
        
        # 3. Format Response
        response_data = []
        rank = 1
        for _, row in results_df.iterrows():
            song_filename = os.path.basename(row.get('path', ''))
            matched_song = next((s for s in globals.all_songs if s['filename'] == song_filename), None)
            
            title = matched_song['title'] if matched_song else row.get('title', 'Unknown Title')
            artist = matched_song['artist'] if matched_song else row.get('artist', 'Unknown Artist')
            genre = matched_song['genre'] if matched_song else row.get('label', 'Unknown')
            
            score = float(row.get('score', 0))
            similarity = score * 100
            similarity = round(similarity, 3)
            
            if similarity > 100: similarity = 100
            if similarity < 0: similarity = 0
            
            response_data.append({
                "id": rank,
                "title": title,
                "artist": artist,
                "album": "GTZAN Dataset",
                "similarity": similarity,
                "genre": genre
            })
            rank += 1
            
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in topkrealsongs: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up the file now that we've found matches
        if os.path.exists(filepath):
            os.remove(filepath)

@routes.route('/api/song-details', methods=['GET'])
def get_song_details():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'error': 'Filename is required'}), 400
    
    # Simple exact match on filename first
    matched_song = next((s for s in globals.all_songs if s['filename'] == filename), None)
    
    if matched_song:
        return jsonify({
            'filename': matched_song['filename'],
            'artist': matched_song['artist'],
            'title': matched_song['title'],
            'genre': matched_song['genre'],
            'probability': 0.05, 
            'result': 'Human-Made Classified'
        })
    else:
        # If not found, return generic info based on filename
        return jsonify({
            'filename': filename,
            'artist': 'Unknown Artist',
            'title': os.path.splitext(filename)[0],
            'genre': 'Unknown',
            'probability': 0.05,
            'result': 'Human-Made Classified'
        })

