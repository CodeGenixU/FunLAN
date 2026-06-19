from flask import Blueprint, request, jsonify, session
from ..service.users import get_users

admin = Blueprint('admin',__name__)

@admin.route('/users', methods = ['GET'])
def get_users():
    return jsonify({'status': 'success', 'data': get_users()}), 200