from datetime import datetime, timedelta, UTC

import os
import pytest
import psycopg2
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from jose import jwt

from main import app
from app.core.config import settings

load_dotenv()

ALGORITHM = "HS256"


# =========================================
# TEST CLIENT FIXTURE
# =========================================

@pytest.fixture
def client():
    """
    FastAPI test client.
    """
    return TestClient(app)


# =========================================
# AUTH HEADERS FIXTURE
# =========================================

@pytest.fixture
def auth_headers():
    """
    Generates JWT headers for testing.
    """

    payload = {
        "sub": "31egflcxzj3o624yqcbvx5dbqsu4",
        "exp": datetime.now(UTC) + timedelta(hours=1)
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "Authorization": f"Bearer {token}"
    }


# =========================================
# DB SESSION FIXTURE
# =========================================

@pytest.fixture
def db_session():
    """
    Connects to PostgreSQL (Neon) using DATABASE_URL from .env
    """

    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    conn.autocommit = True

    yield conn

    conn.close()