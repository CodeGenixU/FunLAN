from flask import current_app, session, request
from flask_socketio import Namespace, join_room, leave_room


def authenticate():
    
    id = session.get('user_id', None)
    username = session.get('username', None)

    if not id or not username:
        return False
    return True

def is_authenticated(sid) -> tuple:
    data = current_app.extensions['active_users'].get(sid)
    return (True,data) if data else (False,{})

class ChatNamespace(Namespace):

    def on_connect(self, auth = None):
        if not authenticate():
            self.disconnect(request.sid)
            return
        sid = request.sid
        user_id = session['user_id']
        username = session['username']


        current_app.extensions['active_users'].add_user(sid,user_id, username)

        join_room('global')
        join_room(f"user:{user_id}")

        self.emit('user_joined', {
            "status": "success", 
            "data": {
                "user_id": session['user_id'], 
                "username": session['username']
            }
        })

    def on_disconnect(self):
        sid = request.sid

        auth = is_authenticated(sid)
        if not auth[0]:
            self.disconnect(sid)
            return
        user = auth[1]

        current_app.extensions['active_users'].remove_user(sid)

        leave_room('global')
        leave_room(f"user:{user['user_id']}")

        self.emit('user_left', {
            "status": "success", 
            "data": {
                "user_id": user['user_id'], 
                "username": user['username']
            }
        })


    def on_message(self, message):
        sid = request.sid

        auth = is_authenticated(sid)
        if not auth[0]:
            self.disconnect(sid)
            return
        
        user = auth[1]
    
        data = {
        "room": message['room'],
        "user_id": user['user_id'],
        "username": user['username'],
        "message": message['message'],
        "timestamp": message['timestamp']
        }
        self.emit('message', data, room=data['room'])


    def on_typing(self, data):
        sid = request.sid

        auth = is_authenticated(sid)
        if not auth[0]:
            self.disconnect(sid)
            return
        user = auth[1]

        room = data.get('room')
        is_typing = data.get('isTyping')
        
        self.emit('typing', {
        'room': room,
        'user_id': user['user_id'],
        'username': user['username'],
        'isTyping': is_typing
            }, room=room, include_self=False)