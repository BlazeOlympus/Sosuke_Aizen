import asyncio
import time
import traceback
from app import db
from app.collectors.ping import run_ping
from app.collectors.dns_probe import run_dns
from app.collectors.wifi import run_wifi
from app.engine.anomaly import check_for_anomaly
from app.services.tickets import process_anomaly_and_ticket

last_ticket_time = 0

async def background_polling_loop():
    global last_ticket_time
    print("NetSentinel Pipeline Active: Monitoring and Anomaly Detection online.")
    
    while True:
        try:
            # We open and close the connection cleanly inside the loop 
            # so it never gets locked or corrupted.
            conn = db.get_db_connection()
            
            ping_res, dns_res, wifi_res = await asyncio.gather(
                run_ping("8.8.8.8"), run_dns("google.com"), run_wifi()
            )
            
            cursor = conn.cursor()
            metrics_snapshot = {}
            
            for res in [ping_res, dns_res, wifi_res]:
                primary_value = 0.0
                if res.kind == "ping":
                    primary_value = res.metrics.get("latency_ms", 0.0)
                elif res.kind == "dns":
                    primary_value = res.metrics.get("dns_latency_ms", 0.0)
                elif res.kind == "wifi":
                    primary_value = res.metrics.get("signal_pct", 0.0)
                    
                metrics_snapshot[res.kind] = primary_value
                
                cursor.execute("""
                    INSERT INTO metrics (kind, captured_at, target, ok, value, source)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (res.kind, res.captured_at, res.target, res.ok, primary_value, res.source))
                
                # The Tripwire
                if res.ok and primary_value > 0 and res.kind in ["ping", "dns"]:
                    anomaly = check_for_anomaly(primary_value, res.kind)
                    if anomaly:
                        print(f"⚠️ ANOMALY DETECTED: {res.kind} spiked to {primary_value}")
                        
                        if time.time() - last_ticket_time > 60:
                            asyncio.create_task(process_anomaly_and_ticket(
                                anomaly, 
                                metrics_snapshot.get("ping", 0), 
                                metrics_snapshot.get("dns", 0), 
                                metrics_snapshot.get("wifi", 100)
                            ))
                            last_ticket_time = time.time()
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            # THIS IS THE TRAP: If anything fails, it prints the exact line number!
            print(f"\n🚨 PIPELINE CRASHED: {e}")
            traceback.print_exc()
            
        await asyncio.sleep(5)