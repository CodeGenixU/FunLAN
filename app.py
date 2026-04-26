from dotenv import load_dotenv
from backend.extension import Server, Configuration
from backend.route.api import api
from backend.route.auth import auth
from backend.socket.socket import ChatNamespace


load_dotenv()

config = Configuration()

server = Server(config)

server.server.register_blueprint(api, url_prefix='/api')
server.server.register_blueprint(auth, url_prefix='/auth')

server.socket.on_namespace(ChatNamespace())

server.run()