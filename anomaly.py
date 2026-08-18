from app.engine.baseline import calculate_baseline
import time

def check_for_anomaly(live_value: float, metric_kind: str) -> dict | None:
    """
    Compares live data against the baseline to detect sustained issues.
    Returns an Anomaly dictionary if triggered, else None.
    """
    baseline = calculate_baseline(metric_kind)
    
    # Absolute critical threshold OR relative threshold (2x baseline)
    is_critical = live_value > 150.0 and metric_kind == "ping"
    is_relative_spike = baseline > 0 and live_value > (baseline * 2.0)
    
    if is_critical or is_relative_spike:
        return {
            "id": f"anom_{int(time.time())}",
            "metric": metric_kind,
            "value": live_value,
            "baseline": baseline,
            "severity": "critical" if is_critical else "warning",
            "detected_at": int(time.time() * 1000)
        }
        
    return None