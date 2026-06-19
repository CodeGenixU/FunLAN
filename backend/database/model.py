from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class users(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    temporary_ban = db.Column(db.DateTime, default=None, nullable=True)
    permanent_ban = db.Column(db.DateTime, default=None, nullable=True)