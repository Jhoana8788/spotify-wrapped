import pytest
from unittest.mock import patch
from datetime import datetime, timezone


FAKE_PROFILE = {
    "user_id": 1,
    "spotify_id": "31egflcxzj3o624yqcbvx5dbqsu4",
    "display_name": "Test User",
    "email": "test@test.com",
    "country": "CO",
    "followers": 10,
    "product": "premium",
    "loaded_at": datetime(2026, 1, 1, tzinfo=timezone.utc)
}


def test_get_profile_success(client, auth_headers):
    with patch("app.v1.routers.profile.get_profile", return_value=FAKE_PROFILE):
        response = client.get("/v1/profile/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["spotify_id"] == "31egflcxzj3o624yqcbvx5dbqsu4"
    assert data["display_name"] == "Test User"
    assert data["email"] == "test@test.com"


def test_get_profile_not_found(client, auth_headers):
    with patch("app.v1.routers.profile.get_profile", return_value=None):
        response = client.get("/v1/profile/me", headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Perfil no encontrado."


def test_get_profile_unauthorized(client):
    response = client.get("/v1/profile/me")

    assert response.status_code == 401