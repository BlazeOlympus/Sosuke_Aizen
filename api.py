from fastapi import APIRouter
from app.engine.rules import evaluate_root_cause
from app import db

router = APIRouter()

# In-memory database to store generated tickets for the frontend demo
isp_tickets_db = []

@router.get("/api/metrics")
def get_latest_metrics():
    """Endpoint for the frontend to fetch the historical telemetry feed."""
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT kind, value, captured_at, source FROM metrics ORDER BY captured_at DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/mock-isp/tickets")
def mock_isp_receive_ticket(ticket: dict):
    """The localized Mock ISP endpoint. Receives automated tickets."""
    print(f"\n🎫 TICKET RECEIVED AT ISP: {ticket['diagnosis']['classification']}")
    isp_tickets_db.append(ticket)
    return {"status": "ACKNOWLEDGED", "ticket_id": ticket["id"]}

@router.get("/mock-isp/tickets")
def get_all_tickets():
    """Frontend uses this to build the ISP Triage Board."""
    return isp_tickets_db