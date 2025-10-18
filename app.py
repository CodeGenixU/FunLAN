from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    global username
    username = request.form['username']
    return render_template('serverchat.html')

@app.route('/send', methods = ['POST'])
def send():
    message = request.form['message']
    return jsonify({'status': 'success', 'data' : {'username': username, 'message': message}})

if __name__ == '__main__':
    app.run(debug=True)