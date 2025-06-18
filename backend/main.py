from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
from auth import requires_auth

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev")
CORS(app)

UPLOAD_FOLDER = os.environ.get("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

mongo_client = MongoClient("mongodb://mongo:27017")
mongo_db = mongo_client["carx_db"]

@app.route("/photos", methods=["POST"])
@requires_auth(["user", "admin", "podadmin"])
def upload_photo():
    file = request.files["file"]
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    mongo_db.photos.insert_one({"filename": filename, "user_id": request.user["id"]})
    return jsonify({"message": "Uploaded"}), 201

@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/photos", methods=["GET"])
@requires_auth(["user", "admin", "podadmin"])
def get_photos():
    photos = list(mongo_db.photos.find({"user_id": request.user["id"]}, {"_id": 0}))
    return jsonify(photos)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
