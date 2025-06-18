import requests
from jose import jwt
from flask import request, jsonify
import functools

KEYCLOAK_URL = "http://keycloak:8080"
REALM = "carx"
CLIENT_ID = "carx-spa"
ALGORITHMS = ["RS256"]

def get_public_key():
    url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"
    res = requests.get(url)
    jwks = res.json()
    return jwks["keys"]

def decode_token(token):
    jwks = get_public_key()
    return jwt.decode(token, jwks, algorithms=ALGORITHMS, audience=CLIENT_ID)

def requires_auth(required_roles=None):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", None)
            if not auth or not auth.startswith("Bearer "):
                return jsonify({"error": "Unauthorized"}), 401

            token = auth.split(" ")[1]
            try:
                decoded = decode_token(token)
                roles = decoded.get("realm_access", {}).get("roles", [])
                request.user = {
                    "id": decoded["sub"],
                    "email": decoded.get("email"),
                    "roles": roles
                }

                if required_roles:
                    if not any(role in roles for role in required_roles):
                        return jsonify({"error": "Forbidden"}), 403

                return f(*args, **kwargs)

            except Exception as e:
                return jsonify({"error": str(e)}), 401
        return wrapper
    return decorator
