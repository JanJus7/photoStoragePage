import requests
from jose import jwt
from flask import request, jsonify
import functools

KEYCLOAK_URL = "http://keycloak:8080"
REALM = "carXpage"
ALGORITHMS = ["RS256"]

ALLOWED_ISSUERS = [
    "http://localhost:8080/realms/carXpage",
    "http://keycloak:8080/realms/carXpage"
]

def get_keycloak_config():
    url = f"{KEYCLOAK_URL}/realms/{REALM}/.well-known/openid-configuration"
    return requests.get(url).json()

def get_jwks():
    return requests.get(get_keycloak_config()["jwks_uri"]).json()["keys"]

def decode_token(token):
    config = get_keycloak_config()
    jwks = get_jwks()
    last_error = None
    for issuer in ALLOWED_ISSUERS:
        try:
            return jwt.decode(
                token,
                jwks,
                algorithms=ALGORITHMS,
                options={
                    "verify_aud": False,
                    "verify_iss": False
                }
            )
        except jwt.JWTClaimsError as e:
            last_error = e
    raise last_error

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
                roles = []
                for client_roles in decoded.get("resource_access", {}).values():
                    roles.extend(client_roles.get("roles", []))

                request.user = {
                    "id": decoded.get("sub"),
                    "email": decoded.get("email"),
                    "roles": roles,
                    "raw": decoded,
                }

                if required_roles:
                    if not any(role in roles for role in required_roles):
                        return jsonify({"error": "Forbidden"}), 403

                return f(*args, **kwargs)

            except Exception as e:
                return jsonify({"error": f"Unauthorized: {str(e)}"}), 401

        return wrapper
    return decorator
