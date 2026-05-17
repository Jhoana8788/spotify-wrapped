import pytest


def test_recent_history_endpoint(client, auth_headers):
    """
    Tests the protected recently played history endpoint.

    Args:
        client: FastAPI test client fixture.
        auth_headers: JWT authentication headers fixture.

    Returns:
        None
    """

    response = client.get(
        "/v1/history/recently-played",
        headers=auth_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)