from flask import Blueprint, request, jsonify, session
from ..service.users import add_user, get_user

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data found"}), 400
    
    username = data['username']
    password = data['password']
    
    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400
    
    user = get_user(username)
    
    if not user:
        return jsonify({'status': 'Invalid Username', 'data' : {'username': username}}), 400
    
    if user.password != password:
        return jsonify({'status': 'Incorrect Password', 'data' : {'username': username}}), 400
    
    id = user.id
    
    session['user_id'] = id
    session['username'] = username
    
    return jsonify({'status': 'success', 'data': {
        'username': username,
        'user_id': id
    }}), 200

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    username = data['username']
    password = data['password']
    
    user = get_user(username)
        
    if user:
        return jsonify({'status': 'Username already exists', 'data' : {'username': username}}), 400
    else:
        add_user(username, password)
        return jsonify({'status': 'success', 'username' : username}), 200

@auth.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'status': 'success'}), 200