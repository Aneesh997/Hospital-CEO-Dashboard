"""Deterministic BI endpoints that power the dashboard charts."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.data.mock import generate
from app.services import analytics
from app.services.snapshot import build_snapshot

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/snapshot")
def snapshot():
    """Full BI snapshot (group KPIs, branches, departments, forecast, risks, recs)."""
    return build_snapshot()


@router.get("/timeseries")
def timeseries():
    """Raw 12-month series for every branch + group totals (for charting)."""
    return generate()


@router.get("/forecast")
def forecast(metric: str = Query("revenue"), periods: int = 3,
             method: str = Query("linear", pattern="^(linear|prophet|xgboost)$")):
    data = generate()
    series = data["totals"].get(metric)
    if series is None:
        return {"error": f"unknown metric '{metric}'",
                "available": list(data["totals"].keys())}
    return {"metric": metric, "method": method, "history": series,
            "forecast": analytics.forecast(series, periods, method)}  # type: ignore[arg-type]


@router.get("/anomalies")
def anomalies(threshold: float = 1.8):
    data = generate()
    flags = []
    for b in data["branches"]:
        flags += analytics.detect_anomalies(b["opex"], f"{b['name']} opex",
                                             data["months"], "₹", threshold)
    flags += analytics.detect_anomalies(data["totals"]["profit"], "Group net profit",
                                        data["months"], "₹", threshold)
    return {"threshold": threshold, "anomalies": flags}


@router.get("/recommendations")
def recommendations():
    return {"recommendations": analytics.recommendations(generate())}
