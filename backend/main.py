from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
from auth import requires_auth
import requests

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev")
CORS(app)

UPLOAD_FOLDER = os.environ.get("UPLOAD_DIR", "/app/uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

mongo_client = MongoClient("mongodb://mongo:27017")
mongo_db = mongo_client["carx_db"]

KEYCLOAK_URL = "http://keycloak:8080"
REALM = "carx"
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


@app.route("/users", methods=["GET"])
@requires_auth(["admin"])
def list_users():
    admin_token = request.headers.get("Authorization", "").split(" ")[1]
    res = requests.get(
        f"{KEYCLOAK_URL}/admin/realms/{REALM}/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    users = res.json()
    simplified = [
        {"id": u["id"], "username": u["username"], "email": u.get("email")}
        for u in users
    ]
    return jsonify(simplified)


@app.route("/users/<user_id>/promote", methods=["POST"])
@requires_auth(["admin"])
def promote_user(user_id):
    admin_token = request.headers.get("Authorization", "").split(" ")[1]

    clients_res = requests.get(
        f"{KEYCLOAK_URL}/admin/realms/{REALM}/clients",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    client_id = next(
        (c["id"] for c in clients_res.json() if c["clientId"] == CLIENT_ID), None
    )

    role_res = requests.get(
        f"{KEYCLOAK_URL}/admin/realms/{REALM}/clients/{client_id}/roles",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    moderator_role = next(
        (r for r in role_res.json() if r["name"] == "moderator"), None
    )

    assign_res = requests.post(
        f"{KEYCLOAK_URL}/admin/realms/{REALM}/users/{user_id}/role-mappings/clients/{client_id}",
        headers={
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
        },
        json=[moderator_role],
    )

    return jsonify({"status": assign_res.status_code})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
