import sqlite3
import os

DB_PATH = "netsentinel.db"

def get_db_connection():
    """Creates a SQLite connection with WAL mode enabled and row factory set."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for concurrent write safety
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    """Initializes the metrics table if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL,
            captured_at INTEGER NOT NULL,
            target TEXT,
            ok BOOLEAN NOT NULL,
            value REAL,
            source TEXT DEFAULT 'live'
        )
    """)
    conn.commit()
    conn.close()

# Initialize the database immediately when imported
init_db()