"""
filename: tracks_service.py
author: Carlos Camargo
date: 2026-05-16
version: 1.0
description: Servicio ETL para extraer, transformar y cargar tracks desde Spotify hacia dwh.dim_tracks.
"""

import psycopg2
from app.core.config import settings
from app.core.spotify_client import get_top_tracks


def _get_conn():
    return psycopg2.connect(settings.DATABASE_URL)


# =========================
# EXTRACT
# =========================

def extract_top_tracks(token):
    """
    Extrae los top tracks del usuario desde Spotify.

    Args:
        token (str): Access token de Spotify.

    Returns:
        dict: JSON crudo retornado por Spotify.
    """

    return get_top_tracks(token)


# =========================
# TRANSFORM
# =========================

def transform_top_tracks(raw_tracks):
    """
    Transforma los tracks al modelo dimensional.

    Args:
        raw_tracks (dict | list): JSON crudo de Spotify.

    Returns:
        list[dict]: Tracks normalizados.
    """

    result = []

    # Soporta:
    # 1. Top tracks -> {"items": [...]}
    # 2. Recently played ya transformado -> [...]

    if isinstance(raw_tracks, dict):
        items = raw_tracks.get("items", [])

    elif isinstance(raw_tracks, list):
        items = raw_tracks

    else:
        return result

    for item in items:

        # recently-played trae "track"
        track = item.get("track", item)

        if not track:
            continue

        if not track.get("id"):
            continue

        artists = track.get("artists", [])

        result.append({
            "spotify_id": track.get("id"),
            "name": track.get("name"),
            "artist_spotify_id": (
                artists[0].get("id")
                if artists else None
            ),
            "album_name": (
                track.get("album", {})
                .get("name")
            ),
            "duration_ms": track.get("duration_ms"),
            "popularity": track.get("popularity"),
            "explicit": track.get("explicit"),
        })

    return result


# =========================
# LOAD
# =========================

def load_tracks(tracks):
    """
    Inserta tracks en dim_tracks.

    Args:
        tracks (list[dict]): Lista de tracks transformados.

    Returns:
        tuple: (inserted, skipped)
    """

    inserted = 0
    skipped = 0

    with _get_conn() as conn:

        with conn.cursor() as cur:

            for t in tracks:

                if not t.get("spotify_id"):
                    continue

                artist_id = None

                if t.get("artist_spotify_id"):

                    cur.execute(
                        """
                        SELECT artist_id
                        FROM dwh.dim_artists
                        WHERE spotify_id = %s
                        """,
                        (t["artist_spotify_id"],)
                    )

                    row = cur.fetchone()

                    if row:
                        artist_id = row[0]

                cur.execute(
                    """
                    INSERT INTO dwh.dim_tracks
                    (
                        spotify_id,
                        name,
                        artist_id,
                        album_name,
                        duration_ms,
                        popularity,
                        explicit,
                        loaded_at
                    )
                    VALUES
                    (
                        %s,%s,%s,%s,%s,%s,%s,CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (spotify_id) DO NOTHING
                    """,
                    (
                        t.get("spotify_id"),
                        t.get("name"),
                        artist_id,
                        t.get("album_name"),
                        t.get("duration_ms"),
                        t.get("popularity"),
                        t.get("explicit")
                    )
                )

                if cur.rowcount == 1:
                    inserted += 1
                else:
                    skipped += 1

        conn.commit()

    return inserted, skipped


# =========================
# QUERY
# =========================

def get_top_tracks_from_db(spotify_id):

    with _get_conn() as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    t.track_id,
                    t.spotify_id,
                    t.name,
                    t.artist_id,
                    t.album_name,
                    t.duration_ms,
                    t.popularity,
                    t.explicit,
                    t.loaded_at,
                    COUNT(f.id) AS play_count
                FROM dwh.dim_tracks t
                JOIN dwh.fact_listening_history f
                    ON f.track_id = t.track_id
                JOIN dwh.dim_users u
                    ON u.user_id = f.user_id
                WHERE u.spotify_id = %s
                GROUP BY t.track_id
                ORDER BY play_count DESC
                LIMIT 50
                """,
                (spotify_id,)
            )

            rows = cur.fetchall()

    cols = [
        "track_id",
        "spotify_id",
        "name",
        "artist_id",
        "album_name",
        "duration_ms",
        "popularity",
        "explicit",
        "loaded_at",
        "play_count"
    ]

    return [dict(zip(cols, row)) for row in rows]


# =========================
# HISTORY HELPERS
# =========================

def extract_tracks_from_history(raw_history):
    """
    Extrae tracks desde recently-played.

    Args:
        raw_history (list[dict]): Historial crudo.

    Returns:
        list[dict]: Tracks normalizados.
    """

    tracks = []

    for item in raw_history:

        track = item.get("track", {})

        if not track:
            continue

        if not track.get("id"):
            continue

        artists = track.get("artists", [])

        tracks.append({
            "spotify_id": track.get("id"),
            "name": track.get("name"),
            "artist_spotify_id": (
                artists[0].get("id")
                if artists else None
            ),
            "album_name": (
                track.get("album", {})
                .get("name")
            ),
            "duration_ms": track.get("duration_ms"),
            "popularity": track.get("popularity"),
            "explicit": track.get("explicit"),
        })

    unique_tracks = {
        t["spotify_id"]: t
        for t in tracks
        if t.get("spotify_id")
    }

    return list(unique_tracks.values())