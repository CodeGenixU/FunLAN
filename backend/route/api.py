from flask import Blueprint, request, jsonify, send_from_directory, current_app, session
from flask_socketio import emit
import uuid
from pathlib import Path


api = Blueprint('api', __name__)

@api.before_request
def before_request():
    return

@api.route('/active-users', methods=['GET'])
def active_users():
    data = [u for u in current_app.extensions['active_users'].get_users()]
    return jsonify({'status': 'success', 'data': data}), 200

@api.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'status':'error', 'message' : 'No file found'}), 400
    
    file = request.files['file']
    filename = uuid.uuid4().hex + Path(file.filename).suffix
    file.save(current_app.config['UPLOAD_FOLDER'] / filename)
    
    room = request.form.get('room')

    data = {
        "room": room,
        "filename": file.filename,
        "file_id": filename,
        "user_id": session['user_id'],
        "username": session['username'],
    }

    current_app.extensions['socketio'].emit('file', data, to=data['room'])
    return jsonify({'status': 'success', 'data': data}), 200

@api.route('/download/<path:filename>', methods=['GET','OPTIONS'])
def download(filename):
    print("Route")
    if request.method == 'OPTIONS':
        return "", 200
    b = Path(current_app.config['UPLOAD_FOLDER'] / filename).exists()
    print(b)
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
