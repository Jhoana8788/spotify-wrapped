import pytest
from fastapi.testclient import TestClient
from main import app

from jose import jwt

from datetime import datetime, timedelta
from app.core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

def create_jwt():

    payload = {
        "sub": "fake_user",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return f"Bearer {token}"

client = TestClient(app)

def test_top_artists_endpoint():

    response = client.get(
        "/v1/artists/top",
        headers={
            "Authorization": create_jwt()
        }
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)