import pytest
from unittest.mock import patch


def test_etl_run_endpoint(client, auth_headers, db_session):

    cursor = db_session.cursor()
    cursor.execute("""
        INSERT INTO dwh.dim_users (spotify_id)
        VALUES (%s)
        ON CONFLICT (spotify_id) DO NOTHING
    """, ('31egflcxzj3o624yqcbvx5dbqsu4',))

    with patch("app.v1.services.etl_service.get_valid_spotify_token", return_value="fake_access_token"), \
         patch("app.v1.services.etl_service.get_user_profile", return_value={
             "id": "31egflcxzj3o624yqcbvx5dbqsu4",
             "display_name": "Test User",
             "email": "test@test.com",
             "country": "CO",
             "followers": {"total": 10},
             "product": "premium"
         }), \
         patch("app.v1.services.etl_service.get_recently_played", return_value=[]), \
         patch("app.v1.services.etl_service.upsert_user", return_value=None), \
         patch("app.v1.services.etl_service.extract_top_artists", return_value=[]), \
         patch("app.v1.services.etl_service.extract_top_tracks", return_value=[]):

        response = client.post("/v1/etl/run", headers=auth_headers)

    assert response.status_code in [200, 201], f"Error: {response.json()}"
    data = response.json()
    assert data["status"] == "success"
    assert "duration_ms" in data