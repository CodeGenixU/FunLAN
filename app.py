from flask import Flask, request, jsonify, session, send_from_directory
from flask_socketio import SocketIO, emit, join_room, disconnect
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os 
import uuid
from flask_cors import CORS


load_dotenv()

active_users = {}

UPLOAD_FOLDER = 'uploads'

DATABASE_URL = f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

app = Flask(__name__)

CORS(app)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)


@app.route('/auth', methods = ['POST'])
def auth():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if not data:
        return jsonify({"error": "No data found"}), 400
    
    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400
    
    user = users.query.filter_by(username=username).first()
    if user:
        if user.password != password: 
            return jsonify({'status': 'Incorrect Password', 'data' : {'username': username}}), 400
        user_id = user.id 
        
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
        return jsonify({'status': 'Invalid Username', 'data' : {'username': username}}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'status': 'success'}), 200

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
def activeUsers():
    if 'user_id' not in session:
        return jsonify({'status':'error', 'message' : 'Not Authenticated'}), 400
    data = list(active_users.values())
    return jsonify({'status':'success', 'data' : data}), 200

@app.route('/signup', methods = ['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    db.session.add(users(username=username, password=password))
    db.session.commit()
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

@socketio.on('typing')
def handle_typing(data):
    if 'user_id' not in session:
        return
        
    room = data.get('room')
    is_typing = data.get('isTyping')
    
    emit('typing', {
        'room': room,
        'user_id': session['user_id'],
        'username': session['username'],
        'isTyping': is_typing
    }, room=room, include_self=False)

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
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    with app.app_context():
        db.create_all()

    socketio.run(app, debug=True)