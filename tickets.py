import uuid
import json
import httpx
from datetime import datetime

async def process_anomaly_and_ticket(anomaly_source: str, ping_ms: float, dns_ms: float, wifi_pct: float):
    """
    Generates an enterprise-grade JSON ticket payload and POSTs it to the ISP mock endpoint.
    """
    # 1. Generate a unique enterprise Incident ID (e.g., INC-4F9A2)
    ticket_id = f"INC-{uuid.uuid4().hex[:5].upper()}"
    
    # 2. Dynamically determine severity
    severity = "HIGH" if ping_ms > 200 or wifi_pct < 60 else "MEDIUM"
    
    # 3. Generate a context-aware plain English summary based on the anomaly trigger
    if anomaly_source == "ping":
        summary = f"High ICMP latency detected ({ping_ms}ms) while Wi-Fi signal remains strong ({wifi_pct}%). Probable cause: Upstream ISP routing issue or local network bufferbloat. Action recommended: Automated traceroute."
    elif anomaly_source == "wifi":
        summary = f"Severe Wi-Fi signal degradation detected ({wifi_pct}%). Probable cause: RF interference or distance from access point. Action recommended: Advise client to move closer to router."
    elif anomaly_source == "dns":
        summary = f"DNS resolution spike detected ({dns_ms}ms). Probable cause: ISP resolver outage or local network congestion. Action recommended: Fallback to secondary DNS."
    else:
        summary = f"General network anomaly detected. Latency: {ping_ms}ms, Signal: {wifi_pct}%."

    # 4. Construct the structured enterprise JSON payload
    ticket_payload = {
        "ticket_id": ticket_id,
        "severity": severity,
        "client_context": {
            "os": "macOS",               # Hardcoded for demo context
            "band": "5GHz",
            "bssid": "00:14:22:01:23:45",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        "telemetry_snapshot": {
            "ping_ms": ping_ms,
            "dns_ms": dns_ms,
            "wifi_signal_pct": wifi_pct
        },
        "diagnostic_summary": summary
    }

    # Print the beautiful JSON to your terminal for judges to see
    print(f"\n🎫 GENERATED TICKET PAYLOAD [{ticket_id}]:")
    print(json.dumps(ticket_payload, indent=2))

    # 5. Send it to your mock ISP ticketing endpoint
    try:
        # Assuming you have a FastAPI route at /mock-isp/tickets to receive this
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://127.0.0.1:8000/mock-isp/tickets",
                json=ticket_payload,
                timeout=3.0
            )
            if response.status_code == 200:
                print(f"✅ Ticket {ticket_id} successfully filed with ISP.")
    except Exception as e:
        print(f"⚠️ Failed to send ticket to ISP endpoint: {e}")
        # --- MANUAL OVERRIDE FOR TESTING ---
if __name__ == "__main__":
    import asyncio

    print("🚀 Initiating manual ticket generation sequence...")
    
    # Spin up an isolated event loop to run the async function
    asyncio.run(
        process_anomaly_and_ticket(
            anomaly_source="ping",
            ping_ms=512.4,        # Simulating a massive lag spike
            dns_ms=22.1,
            wifi_pct=98.0
        )
    )