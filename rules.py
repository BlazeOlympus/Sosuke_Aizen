def evaluate_root_cause(ping_ms: float, dns_ms: float, wifi_pct: float) -> dict:
    """
    Deterministic rule engine.
    Evaluates current metrics to determine the exact fault domain.
    """
    classification = "UNKNOWN"
    confidence = 0.0
    evidence = []
    
    # 1. Check for ISP vs Local Wi-Fi faults
    if ping_ms > 150:
        evidence.append(f"Internet RTT critical ({ping_ms}ms)")
        if wifi_pct and wifi_pct < 40:
            classification = "LOCAL_WIFI"
            evidence.append(f"Weak Wi-Fi signal ({wifi_pct}%)")
            confidence = 0.90
        else:
            classification = "UPSTREAM_ISP"
            evidence.append("Wi-Fi signal healthy, fault is upstream")
            confidence = 0.85
            
    # 2. Check for DNS faults
    elif dns_ms > 150:
        classification = "DNS"
        evidence.append(f"DNS resolution slow ({dns_ms}ms)")
        confidence = 0.95
        
    # 3. Baseline Healthy
    elif ping_ms > 0 and ping_ms < 60 and dns_ms < 100:
        classification = "HEALTHY"
        confidence = 1.0
        
    return {
        "classification": classification,
        "confidence": confidence,
        "evidence": evidence
    }