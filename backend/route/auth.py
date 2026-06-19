from flask import Blueprint, request, jsonify, session
from ..service.users import add_user, get_user, check_user

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
    
    user = check_user(username,password)
    
    if user[0] == False:
        return jsonify({'status': 'Invalid Credentials', 'data' : {'username': username}}), 400
    elif user[0] == None:
        return jsonify({'status': 'User is Banned', 'data' : {'username': username}}), 403
    id = user[1].id
    
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