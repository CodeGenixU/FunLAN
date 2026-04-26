from ..database.model import db, users

class ActiveUsers:
    def __init__(self):
        self.users = {}

    def add_user(self, sid, user_id, username):
        user = {'user_id': user_id, 'username': username}
        self.users[sid] = user
    
    def remove_user(self, sid):
        self.users.pop(sid, None)

    def get_users(self):
        return self.users.values()
    
    def get(self, sid):
        return self.users.get(sid, None)


def add_user(username, password):
    user = users(username=username, password=password)
    db.session.add(user)
    db.session.commit()
    return user

def get_user(username):
    
    user = users.query.filter_by(username=username).first()
    return user
