from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
from auth import requires_auth

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev")
CORS(app)

UPLOAD_FOLDER = os.environ.get("UPLOAD_DIR", "/app/uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

mongo_client = MongoClient("mongodb://mongo:27017")
mongo_db = mongo_client["carx_db"]

KEYCLOAK_URL = "http://keycloak:8080"
REALM = "carXpage"
CLIENT_ID = "carx-spa"


@app.route("/photos", methods=["POST"])
@requires_auth(["user", "moderator", "admin"])
def upload_photo():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

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
@requires_auth(["user", "moderator", "admin"])
def get_photos():
    roles = request.user.get("roles", [])
    if "admin" in roles or "moderator" in roles:
        photos = list(mongo_db.photos.find({}, {"_id": 0}))
    else:
        photos = list(mongo_db.photos.find({"user_id": request.user["id"]}, {"_id": 0}))
    return jsonify(photos)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
