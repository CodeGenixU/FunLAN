from flask import current_app, session, request
from flask_socketio import Namespace, join_room, leave_room
from ..database.model import db, users
from datetime import datetime

class AdminNamespace(Namespace):
    
    def on_ban(self, user_id):
        user = current_app.extensions['active_users'].get(user_id) 
        
        current_app.extensions['socketio'].disconnect(user['sid'])
        current_app.extensions['active_users'].remove_user(user['sid'])
        db.session.query(users).filter_by(id=user_id).update({'temporary_ban': datetime.now()})
        db.session.commit()

        self.emit('user_banned', {
            "status": "success", 
            "data": {
                "user_id": user['user_id'], 
                "username": user['username']
            }
        })
    
    def on_terminate(self, user_id):
        user = current_app.extensions['active_users'].get(user_id) 

        current_app.extensions['socketio'].disconnect(user['sid'])
        current_app.extensions['active_users'].remove_user(user['sid'])
        db.session.query(users).filter_by(id=user_id).update({'permanent_ban': datetime.now()})
        db.session.commit()

        self.emit('user_terminated', {
            "status": "success", 
            "data": {
                "user_id": user['user_id'], 
                "username": user['username']
            }
        })
    
    def on_revoke(self, user_id):

        db.session.query(users).filter_by(id=user_id).update({
            'temporary_ban': None, 
            'permanent_ban': None
        })
        user = db.session.query(users).filter_by(id=user_id).first()
        db.session.commit()

        self.emit('user_revoke', {
            "status": "success", 
            "data": {
                "user_id": user.id,
                "username": user.username
            }
        })

    def on_disconnect(self):
        self.disconnect(request.sid)