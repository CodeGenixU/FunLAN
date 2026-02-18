from flask import Flask, request, jsonify, session, send_from_directory
from flask_socketio import SocketIO, emit, join_room, disconnect
import sqlite3
import os 
import uuid

app = Flask(__name__)
app.secret_key = "Digital_Sorcerer"
socketio = SocketIO(app, cors_allowed_origins="*")

UPLOAD_FOLDER = 'uploads'

def Database():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL)
    ''')
    
    conn.commit()
    conn.close()

@app.route('/auth', methods = ['POST'])
def auth():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if not data:
        return jsonify({"error": "No data found"}), 400
    
    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE username = ?', (username))
    user = cursor.fetchone()
    if user:
        if user[0][2] != password:
            return jsonify({'status': 'Incorrect Password', 'data' : {'username': username}}), 400
        user_id = user[0][0]
        
        session['user_id'] = user_id
        session['username'] = username

        return jsonify({
            'status': 'success', 
            'data': {
                'username': username, 
                'user_id': user_id,
            }
        })
    else:
        conn.close()
        return jsonify({'status': 'Invalid Username', 'data' : {'username': username}}), 400

@app.route("/upload", methods = ['POST'])
def upload():
    if 'user_id' not in session:
        return jsonify({'status':'error', 'message' : 'Not Authenticated'}), 400
    if 'file' not in request.files:
        return jsonify({'status':'error', 'message' : 'No file found'}), 400
    file = request.files['file']
    filename = uuid.uuid4().hex + os.path.splitext(file.filename)[1]
    file.save(os.path.join(UPLOAD_FOLDER, filename))

    room = request.form.get('room')
    timestamp = request.form.get('timestamp')
    data = {
        "room": room,
        "filename": file.filename,
        "file_id": filename,
        "user_id": session['user_id'],
        "username": session['username'],
        "timestamp": timestamp
    }
    socketio.emit('file', data, broadcast=True, room=data['room'])
    return jsonify({'status':'success', 'data' : data}), 200

@app.route('/download/<filename>', methods = ['GET'])
def download(filename):
    if 'user_id' not in session:
        return jsonify({'status':'error', 'message' : 'Not Authenticated'}), 400
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/signup', methods = ['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    cred = (username,password)
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute(f"INSERT INTO users(username,password) values {cred}")
    conn.commit()
    conn.close()
    return jsonify({'status':'success', 'username' : username}), 200


@socketio.on('connect')
def handle_connect():
    if 'user_id' not in session:
        return False
    else:
        join_room("global")
        emit('connection_established', {"status": "success", "username": session['username']}, room="global")

@socketio.on('message')
def handle_message(data):
    if 'user_id' not in session:
        disconnect()
        return
    
    data = {
        "room": "global",
        "user_id": session['user_id'],
        "username": session['username'],
        "message": data['message'],
        "timestamp": data['timestamp']
    }
    
    emit('message', data, broadcast=True, room=data['room'])

@socketio.on('disconnect')
def handle_disconnect():
    emit('disconnection_established', {"status": "success", "data": "Disconnected from server"})

if __name__ == '__main__':
    if not os.path.exists('users.db'):
        Database()
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    socketio.run(app, debug=True)