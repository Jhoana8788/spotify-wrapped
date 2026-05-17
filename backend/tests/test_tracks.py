import pytest


def test_top_tracks_endpoint(client, auth_headers):
    """
    Tests the protected top tracks endpoint.

    Args:
        client: FastAPI test client fixture.
        auth_headers: JWT authentication headers fixture.

    Returns:
        None
    """

    response = client.get(
        "/v1/tracks/top",
        headers=auth_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)