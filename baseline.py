from app import db

def calculate_baseline(metric_kind: str, limit: int = 50) -> float:
    """
    Calculates the baseline (average) for a specific metric based on recent healthy data.
    """
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Grab the most recent successful probes
    cursor.execute("""
        SELECT value FROM metrics 
        WHERE kind = ? AND ok = 1 AND value IS NOT NULL 
        ORDER BY captured_at DESC LIMIT ?
    """, (metric_kind, limit))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return 0.0
        
    # Calculate the average
    values = [row["value"] for row in rows]
    return round(sum(values) / len(values), 2)