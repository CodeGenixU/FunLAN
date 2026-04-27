from flask import Flask
from flask_session import Session
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path

from dataclasses import dataclass
from datetime import timedelta

from .service.users import ActiveUsers
from .database.model import db
@dataclass
class Configuration():

    SECRET_KEY: str = "FunLAN"
    SESSION_USE_SIGNER: bool = True
    
    
    SESSION_PERMANENT: bool = False
    SESSION_TYPE: str = "filesystem"
    
    UPLOAD_FOLDER = "upload"
    PERMANENT_SESSION_LIFETIME: timedelta = timedelta(days=1)
    
    SESSION_FILE_DIR: str = "sessions"
    SESSION_REDIS = None
    SESSION_SQLALCHEMY = None
    SQLALCHEMY_DATABASE_URI: str= "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SESSION_MEMCACHED = None

    USER_DATABASE_URI: str = "sqlite:///users.db"

    def validate(self) -> None:

        if self.SESSION_TYPE not in {'filesystem', 'redis', 'memcached', 'sqlalchemy'}:
            raise ValueError("Invalid session type")
        elif self.SESSION_TYPE =='filesystem' and not self.SESSION_FILE_DIR:
            raise ValueError("Session file directory is not configured")
        elif self.SESSION_TYPE == 'redis' and not self.SESSION_REDIS:
            raise ValueError("Redis is not configured")
        elif self.SESSION_TYPE == 'memcached' and not self.SESSION_MEMCACHED:
            raise ValueError("Memcached is not configured")
        elif self.SESSION_TYPE == 'sqlalchemy' and not self.SESSION_SQLALCHEMY:
            raise ValueError("SQLAlchemy is not configured")
        
class Server():
    def __init__(self, config: Configuration):

        config.validate()

        self.server = Flask(__name__)

        self.server.extensions["active_users"] = ActiveUsers()

        self.server.config["SQLALCHEMY_DATABASE_URI"] = config.SQLALCHEMY_DATABASE_URI
        self.server.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = config.SQLALCHEMY_TRACK_MODIFICATIONS
        
        self.db = db.init_app(self.server)

        self.BASE_PATH = Path(self.server.instance_path)
        self.BASE_PATH.mkdir(parents=True, exist_ok=True)

        self.server.config["SECRET_KEY"] = config.SECRET_KEY
        self.server.config["SESSION_USE_SIGNER"] = config.SESSION_USE_SIGNER

        self.server.config["SESSION_PERMANENT"] = config.SESSION_PERMANENT
        if config.SESSION_PERMANENT:
            self.server.config["PERMANENT_SESSION_LIFETIME"] = config.PERMANENT_SESSION_LIFETIME

        self.SESSION_TYPE = config.SESSION_TYPE
        self.server.config["SESSION_TYPE"] = self.SESSION_TYPE

        if self.SESSION_TYPE == 'filesystem':
            self.SESSION_FILE_DIR_PATH = self.BASE_PATH / config.SESSION_FILE_DIR
            self.server.config["SESSION_FILE_DIR"] = str(self.SESSION_FILE_DIR_PATH)
            self.SESSION_FILE_DIR_PATH.mkdir(parents=True, exist_ok=True)


        elif self.SESSION_TYPE == 'redis':
            self.server.config["SESSION_REDIS"] = config.SESSION_REDIS 
        
        elif self.SESSION_TYPE == 'memcached':
            self.server.config["SESSION_MEMCACHED"] = config.SESSION_MEMCACHED
        
        elif self.SESSION_TYPE == 'sqlalchemy':
            self.server.config["SESSION_SQLALCHEMY"] = self.db

        self.server.config["UPLOAD_FOLDER"] = self.BASE_PATH / config.UPLOAD_FOLDER

        self.server.config["UPLOAD_FOLDER"].mkdir(parents=True, exist_ok=True)

        CORS(self.server, supports_credentials=True)

        Session(self.server)

        self.socket = SocketIO(self.server, cors_allowed_origins="*", manage_session= False)
        self.server.extensions["socketio"] = self.socket


    def run(self):
        if not self.server:
            raise ValueError("Server is not created")
        if not self.socket:
            raise ValueError("Socket is not created")

        with self.server.app_context():
            db.create_all()

        self.socket.run(self.server, host="0.0.0.0", port=5000, debug=True)
