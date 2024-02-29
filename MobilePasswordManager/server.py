from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/hello', methods=['POST'])
def hello_world():
    data = request.json
    message = data['message']
    response_message = message + ", World!"
    return jsonify({'message': response_message})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
