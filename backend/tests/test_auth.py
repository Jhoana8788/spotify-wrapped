import pytest


def test_invalid_jwt_token():
    """
    Tests access with an invalid JWT token.

    Returns:
        None
    """

    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    response = client.get(
        "/v1/artists/top",
        headers={
            "Authorization": "Bearer invalid_token"
        }
    )

    assert response.status_code == 401