from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'ok', 'message': 'AICU Season4 API is running'})

@app.route('/api/info')
def app_info():
    return jsonify({
        "app": "ACIU Season4",
        "version": "1.0.0-alpha"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 