from flask import Flask, request, jsonify, session, send_from_directory
from flask_socketio import SocketIO, emit, join_room, disconnect
import sqlite3
import os 
import uuid

active_users = {}

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

    cursor.execute('SELECT * FROM users WHERE username = ?', (username,)) # , chut gaya tha isliye error aa rha tha
    user = cursor.fetchone() # Fetch one use kar rahe so tuple hi return hoga
    if user:
        if user[2] != password: # isliye ye karne ka jarurat nhi h (user[0][2] != password)
            return jsonify({'status': 'Incorrect Password', 'data' : {'username': username}}), 400
        user_id = user[0] # and yaha bhi (user[0][0])
        
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
    socketio.emit('file', data, to=data['room'],) # TypeError: Server.emit() got an unexpected keyword argument 'broadcast'
    return jsonify({'status':'success', 'data' : data}), 200

@app.route('/download/<filename>', methods = ['GET'])
def download(filename):
    if 'user_id' not in session:
        return jsonify({'status':'error', 'message' : 'Not Authenticated'}), 400
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/active-users', methods = ['GET'])
def users():
    if 'user_id' not in session:
        return jsonify({'status':'error', 'message' : 'Not Authenticated'}), 400
    data = list(active_users.values())
    return jsonify({'status':'success', 'data' : data}), 200

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
    global active_users
    if 'user_id' not in session:
        return False
    else:

        session_id = request.sid

        active_users[session_id] = {
            'user_id': session['user_id'],
            'username': session['username']
        }

        join_room("global")

        join_room(f"user:{session['user_id']}")

        emit('user_joined', {
            "status": "success", 
            "data": {
                "user_id": session['user_id'], 
                "username": session['username']
            }
        }, room="global")

@socketio.on('message')
def handle_message(data):
    if 'user_id' not in session:
        disconnect()
        print("User not authenticated")
        return
    
    data = {
        "room": data['room'],
        "user_id": session['user_id'],
        "username": session['username'],
        "message": data['message'],
        "timestamp": data['timestamp']
    }
    
    emit('message', data, broadcast=True, room=data['room'])

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    if session_id in active_users:
        del active_users[session_id]
    emit('disconnection_established', 
    {"status": "success", "data": {
        "user_id": session['user_id'], 
        "username": session['username']
    }}, to = "global")

if __name__ == '__main__':
    if not os.path.exists('users.db'):
        Database()
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    socketio.run(app, debug=True)