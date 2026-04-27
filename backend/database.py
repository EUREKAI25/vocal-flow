import sqlite3
import os
from pathlib import Path

DB_PATH = Path(os.getenv("DB_PATH", Path(__file__).parent / "vocal_flow.db"))
UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", Path(__file__).parent / "uploads"))


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                username    TEXT    NOT NULL UNIQUE,
                password_hash TEXT  NOT NULL,
                created_at  TEXT    DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS recordings (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER NOT NULL REFERENCES users(id),
                created_at       TEXT    DEFAULT (datetime('now')),
                program          TEXT    NOT NULL,
                audio_filename   TEXT,
                segment_source   TEXT,
                syllables        TEXT,
                score_similarity REAL,
                score_intonation REAL,
                score_rhythm     REAL,
                score_intensity  REAL,
                score_relief     REAL,
                score_monotony   REAL,
                relief_label     TEXT,
                comment          TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_recordings_user
                ON recordings(user_id, created_at DESC);
        """)
