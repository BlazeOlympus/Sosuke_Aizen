from pydantic import BaseModel
from typing import Literal, Dict, Optional, Any

ProbeKind = Literal["ping", "dns", "http", "gateway", "wifi", "throughput", "traceroute"]

class ProbeResult(BaseModel):
    kind: ProbeKind
    captured_at: int                                   
    target: Optional[str] = None
    ok: bool                                           
    unavailable: bool = False                          
    error: Optional[str] = None                        
    metrics: Dict[str, Optional[float | str]]          
    detail: Optional[Dict[str, Any]] = None            
    source: Literal["live", "simulation"] = "live"