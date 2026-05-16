import psycopg2

from app.core.config import settings
from app.core.spotify_client import get_top_artists


def _get_conn():
    return psycopg2.connect(settings.DATABASE_URL)


# =========================================
# EXTRAER TOP ARTISTS
# =========================================

def extract_top_artists(token):

    data = get_top_artists(token)

    return data


# =========================================
# TRANSFORMAR TOP ARTISTS
# =========================================

def transform_top_artists(raw_artists):

    result = []

    # Si viene dict desde Spotify
    if isinstance(raw_artists, dict):
        items = raw_artists.get("items", [])

    # Si ya viene lista
    elif isinstance(raw_artists, list):
        items = raw_artists

    else:
        items = []

    for item in items:

        if not item.get("id"):
            continue

        result.append({
            "spotify_id": item.get("id"),

            "name": item.get("name"),

            "popularity": item.get("popularity"),

            "followers_count": (
                item.get("followers", {})
                .get("total")
            ),

            "genres": item.get("genres", []),
        })

    return result


# =========================================
# CARGAR ARTISTS
# =========================================

def load_artists(artists):

    inserted = 0
    skipped = 0

    with _get_conn() as conn:
        with conn.cursor() as cur:

            for a in artists:

                if not a.get("spotify_id"):
                    skipped += 1
                    continue

                cur.execute(
                    """
                    INSERT INTO dwh.dim_artists (
                        spotify_id,
                        name,
                        popularity,
                        followers_count,
                        genres,
                        loaded_at
                    )
                    VALUES (
                        %s,%s,%s,%s,%s,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (spotify_id)
                    DO NOTHING
                    """,
                    (
                        a["spotify_id"],
                        a["name"],
                        a.get("popularity"),
                        a.get("followers_count"),
                        a.get("genres", [])
                    )
                )

                if cur.rowcount == 1:
                    inserted += 1
                else:
                    skipped += 1

        conn.commit()

    return inserted, skipped


# =========================================
# CONSULTAR ARTISTS DB
# =========================================

def get_top_artists_from_db(spotify_id):

    with _get_conn() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    a.artist_id,
                    a.spotify_id,
                    a.name,
                    a.popularity,
                    a.followers_count,
                    a.genres,
                    a.loaded_at,
                    COUNT(f.id) AS play_count

                FROM dwh.dim_artists a

                JOIN dwh.fact_listening_history f
                    ON f.artist_id = a.artist_id

                JOIN dwh.dim_users u
                    ON u.user_id = f.user_id

                WHERE u.spotify_id = %s

                GROUP BY a.artist_id

                ORDER BY play_count DESC

                LIMIT 50
                """,
                (spotify_id,)
            )

            rows = cur.fetchall()

    cols = [
        "artist_id",
        "spotify_id",
        "name",
        "popularity",
        "followers_count",
        "genres",
        "loaded_at",
        "play_count"
    ]

    return [
        dict(zip(cols, row))
        for row in rows
    ]


# =========================================
# EXTRAER ARTISTS DEL HISTORY
# =========================================

def extract_artists_from_history(raw_history):

    result = []

    # Compatibilidad dict/list
    if isinstance(raw_history, dict):
        items = raw_history.get("items", [])

    elif isinstance(raw_history, list):
        items = raw_history

    else:
        items = []

    seen = set()

    for item in items:

        track = item.get("track", {})

        artists = track.get("artists", [])

        for artist in artists:

            spotify_id = artist.get("id")

            if not spotify_id:
                continue

            if spotify_id in seen:
                continue

            seen.add(spotify_id)

            result.append({
                "spotify_id": spotify_id,

                "name": artist.get("name"),

                "popularity": None,

                "followers_count": None,

                "genres": []
            })

    return result


# =========================================
# ENRIQUECER ARTISTS
# =========================================

def enrich_artists_with_details(artists, token):

    # Aquí luego puedes consultar Spotify
    # para traer popularity/followers/genres reales

    return artists


# =========================================
# EXTRAER TRACKS DEL HISTORY
# =========================================

def extract_tracks_from_history(raw_history):

    result = []

    # Compatibilidad dict/list
    if isinstance(raw_history, dict):
        items = raw_history.get("items", [])

    elif isinstance(raw_history, list):
        items = raw_history

    else:
        items = []

    seen = set()

    for item in items:

        track = item.get("track", {})

        spotify_id = track.get("id")

        if not spotify_id:
            continue

        if spotify_id in seen:
            continue

        seen.add(spotify_id)

        result.append(track)

    return result