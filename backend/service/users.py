from ..database.model import db, users
from datetime import datetime
class ActiveUsers:
    def __init__(self):
        self.users = {}
        self.socket = {}

    def __getitem__(self, sid):
        return self.users.get(sid, None)

    def add_user(self, sid, user_id, username):
        user = {'user_id': user_id, 'username': username}
        self.users[sid] = user
        self.socket[user_id] = sid
    
    def remove_user(self, sid):
        self.socket.pop(self.users[sid]['user_id'], None)
        self.users.pop(sid, None)

    def get_users(self):
        return self.users.values()
    
    def get(self, user_id):
        sid = self.socket.get(user_id, None)
        user = self.users.get(sid, None)
        user['sid'] = sid
        return user

    

def add_user(username, password):
    user = users(username=username, password=password)
    db.session.add(user)
    db.session.commit()
    return user

def get_user(username):

    user = users.query.filter_by(username=username).first()
    return user

def check_user(username, password):
    
    user = get_user(username)
    
    if not user or not password:
        return False,{}
    
    if password != user.password:
        return False,{}
    
    if user.permanent_ban:
        return None,{}
    
    if user.temporary_ban and datetime.now() - user.temporary_ban < datetime.timedelta(days=1):
        return None,{}

    return True,user

def get_users():
    
    user = users.query.all()

    data = [
        {
            'user_id': u.id,
            'username': u.username, 
            'temporary_ban': u.temporary_ban.isoformat() if u.temporary_ban else None,
            'permanent_ban': u.permanent_ban.isoformat() if u.permanent_ban else None
            } for u in user]

    return data