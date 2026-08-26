"""Independent, explainable graph-scoring service for Abuse-Ring Sentinel."""
from collections import defaultdict
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Abuse-Ring Sentinel Scoring", version="0.1.0")

class Account(BaseModel):
    id: str
    created_at: datetime
    device_hash: str
    payment_token_hash: str
    address_hash: str
    ip_hash: str

class Redemption(BaseModel):
    account_id: str
    coupon_code: str
    discount_inr: int

class ScoreRequest(BaseModel):
    accounts: list[Account]
    redemptions: list[Redemption]

@app.get("/health")
def health():
    return {"status": "operational", "mode": "observation_only"}

@app.post("/score")
def score(payload: ScoreRequest):
    """Find clusters with >=3 accounts sharing two or more independent signals."""
    by_field = {field: defaultdict(list) for field in ("device_hash", "payment_token_hash", "address_hash", "ip_hash")}
    for account in payload.accounts:
        for field, grouped in by_field.items():
            grouped[getattr(account, field)].append(account)
    rings = []
    seen = set()
    for cluster in by_field["device_hash"].values():
        ids = tuple(sorted(account.id for account in cluster))
        if len(cluster) < 3 or ids in seen:
            continue
        seen.add(ids)
        shared = [field for field, grouped in by_field.items() if any(sorted(a.id for a in candidates) == list(ids) for candidates in grouped.values())]
        if len(shared) < 2:
            continue
        related = [redemption for redemption in payload.redemptions if redemption.account_id in ids]
        score = min(99, 30 + 34 + (13 if "address_hash" in shared else 0) + (7 if "ip_hash" in shared else 0) + 19)
        rings.append({"account_ids": ids, "score": score, "exposure_inr": sum(r.discount_inr for r in related), "recommendation": "manual_investigation_only", "signals": shared})
    return {"rings": rings, "automated_action": "none"}
