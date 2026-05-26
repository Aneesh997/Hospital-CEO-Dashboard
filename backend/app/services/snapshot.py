"""Builds the compact JSON snapshot used to ground the LLM and feed the dashboard."""
from __future__ import annotations

from app.data.mock import generate
from app.services import analytics


def build_snapshot() -> dict:
    data = generate()
    t = data["totals"]
    last = 11
    return {
        "currency": "INR",
        "period": "trailing 12 months, current = May 2026",
        "group": {
            "revenue_mtd": round(t["revenue"][last]),
            "net_margin_pct": round(t["profit"][last] / t["revenue"][last] * 100, 1),
            "profit_mtd": round(t["profit"][last]),
            "patients_mtd": t["patients"][last],
            "avg_occupancy_pct": round(t["occupancy"][last], 1),
            "avg_csat_pct": round(t["satisfaction"][last], 1),
            "mom_growth_pct": round((t["revenue"][last] / t["revenue"][last - 1] - 1) * 100, 1),
            "cancellation_rate_pct": round(t["cancellations"][last] / t["patients"][last] * 100, 1),
            "health_score": analytics.health_score(data),
        },
        "months": data["months"],
        "revenue_series_lakh": [round(v / 1e5) for v in t["revenue"]],
        "profit_series_lakh": [round(v / 1e5) for v in t["profit"]],
        "branches": [{
            "name": b["name"],
            "revenue_mtd_lakh": round(b["revenue"][last] / 1e5),
            "profit_mtd_lakh": round(b["profit"][last] / 1e5),
            "occupancy_pct": round(b["occupancy"][last]),
            "csat_pct": round(b["satisfaction"][last]),
            "mom_growth_pct": round((b["revenue"][last] / b["revenue"][last - 1] - 1) * 100, 1),
        } for b in data["branches"]],
        "departments": [{"name": d["name"], "revenue_lakh": round(d["revenue"] / 1e5),
                         "growth_pct": d["growth"]} for d in data["departments"]],
        "forecast_next_quarter_revenue_lakh": [
            round(f["value"] / 1e5) for f in analytics.forecast(t["revenue"], 3)],
        "detected_risks": (
            analytics.detect_anomalies(
                next(b for b in data["branches"] if b["name"] == "Bengaluru")["opex"],
                "Bengaluru operating cost", data["months"], "₹")
            + analytics.detect_anomalies(t["profit"], "Group net profit", data["months"], "₹")
        ),
        "recommendations": analytics.recommendations(data),
    }
