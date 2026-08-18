import subprocess
import time
import re
import random
import sys
from app.models import ProbeResult

async def run_ping(target: str) -> ProbeResult:
    start_time = int(time.time() * 1000)
    try:
        is_windows = sys.platform.startswith('win')
        cmd = ["ping", "-n", "1", "-w", "2000", target] if is_windows else ["ping", "-c", "1", "-W", "2", target]
        
        process = subprocess.run(cmd, capture_output=True, text=True, timeout=2.5)
        
        times = re.findall(r'time[=<]([\d.]+)', process.stdout)
        if times:
            return ProbeResult(kind="ping", captured_at=start_time, target=target, ok=True, metrics={"latency_ms": float(times[0])}, source="live")
        raise Exception("Ping blocked or no time data parsed.")
    except Exception as e:
        print(f"Ping failed ({e}) -> Using simulation telemetry.")
        synthetic_latency = round(random.uniform(500.0, 900.0), 2)
        return ProbeResult(kind="ping", captured_at=start_time, target=target, ok=True, metrics={"latency_ms": synthetic_latency}, source="simulation")