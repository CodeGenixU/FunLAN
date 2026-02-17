from flask import Flask, render_template, request, jsonify, session, sessions
from flask_socketio import SocketIO, emit
import sqlite3
import uuid

app = Flask(__name__)
app.secret_key = "Digital_Sorcerer"
socketio = SocketIO(app, cors_allowed_origins="*")

def Database():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL)
    ''')
    
    cursor.execute('''
        CREATE TABLE sessions (
            session_id TEXT PRIMARY KEY,
            user_id INTEGER,
            ip_address TEXT,
            connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id))
    ''')
    conn.commit()
    conn.close()

@app.route('/auth', methods = ['POST'])
def auth():
    username = request.form.get('username')
    password = request.form.get('password')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    if user:
        session_id = str(uuid.uuid4())
        user_id = user[0]
        ip_address = request.remote_addr
        
        session['user_id'] = user_id
        session['username'] = username
        session['session_id'] = session_id

        cursor.execute('''
            INSERT INTO sessions (session_id, user_id, ip_address)
            VALUES (?, ?, ?)
        ''', (session_id, user_id, ip_address))
        conn.commit()
        conn.close()
        return jsonify({
            'status': 'success', 
            'data': {
                'username': username, 
                'user_id': user_id,
                'session_id': session_id
            }
        })
    else:
        conn.close()
        return jsonify({'status': 'error', 'data' : {'username': username}})

@app.route('/signup', methods = ['POST'])
def signup():
    username = request.form.get('username')
    password = request.form.get('password')
    cred = (username,password)
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute(f"INSERT INTO users(username,password) values {cred} ")
    conn.commit()
    conn.close()
    return jsonify({'status':'success', 'username' : username})


@socketio.on('connect')
def handle_connect():
    emit('connection_established', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    emit('disconnection_established', {'data': 'Disconnected from server'})

if __name__ == '__main__':
    socketio.run(app, debug=True)