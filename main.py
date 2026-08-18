import os
import time
import asyncio
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Project imports
from app import db
from app.services import pipeline

app = FastAPI(title="NetSentinel API")

# --- 1. CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. BACKGROUND TELEMETRY ENGINE ---
@app.on_event("startup")
async def startup_event():
    print("🚀 Firing up the background telemetry engine...")
    asyncio.create_task(pipeline.background_polling_loop())

# --- 3. MOCK ISP INBOX ENDPOINT ---
@app.post("/mock-isp/tickets")
async def receive_mock_ticket(ticket: dict):
    print("\n" + "=" * 50)
    print("📨 [ISP SERVER MOCK] RECEIVED AUTOMATED TICKET")
    print("=" * 50)
    print(f"Ticket ID: {ticket.get('ticket_id')}")
    print(f"Severity:  {ticket.get('severity')}")
    print(f"Summary:   {ticket.get('diagnostic_summary')}")
    print("=" * 50 + "\n")
    return {"status": "success", "message": "Ticket successfully ingested by ISP"}

# --- 4. ENGINEERING LOG EXPORT ---
@app.get("/api/logs/export")
def export_engineering_logs(limit: int = 500):
    try:
        conn = db.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT kind, captured_at, target, ok, value, source FROM metrics ORDER BY captured_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()

        logs = []
        for row in rows:
            logs.append({
                "kind": row["kind"],
                "timestamp_ms": row["captured_at"],
                "target": row["target"],
                "status": "OK" if row["ok"] else "FAIL",
                "value": row["value"],
                "source": row["source"]
            })
            
        return JSONResponse(content={"export_timestamp": int(time.time() * 1000), "total_records": len(logs), "data": logs})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- 5. TICKET STATUS POLLING ---
@app.get("/api/tickets/status")
def get_ticket_status():
    return {"ticket_id": "INC-7C274", "status": "Investigating", "updated_at": int(time.time() * 1000)}

# --- 6. SERVE STATIC FRONTEND ---
# This dynamically finds your 'static' folder no matter where you run the server from
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")