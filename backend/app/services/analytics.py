"""
Analytics engine: forecasting, anomaly detection, recommendations.

The default implementations are dependency-light (pure-python linear trend +
z-score) so the demo runs anywhere. Production hooks for Prophet / XGBoost are
included behind a `method=` switch and activate automatically when the optional
libraries are installed (see requirements-ml.txt).
"""
from __future__ import annotations

import math
from typing import Literal

ForecastMethod = Literal["linear", "prophet", "xgboost"]


# ---- forecasting -----------------------------------------------------------
def _linear(series: list[float], periods: int) -> list[dict]:
    n = len(series)
    xs = list(range(n))
    mx, my = sum(xs) / n, sum(series) / n
    num = sum((xs[i] - mx) * (series[i] - my) for i in range(n))
    den = sum((xs[i] - mx) ** 2 for i in range(n)) or 1
    m = num / den
    b = my - m * mx
    resid = [series[i] - (m * i + b) for i in range(n)]
    sd = math.sqrt(sum(r * r for r in resid) / n)
    out = []
    for j in range(periods):
        v = m * (n + j) + b
        out.append({"value": max(0, v), "lower": max(0, v - 1.6 * sd), "upper": v + 1.6 * sd})
    return out


def forecast(series: list[float], periods: int = 3, method: ForecastMethod = "linear") -> list[dict]:
    """Forecast the next `periods` points with a 1.6σ confidence band."""
    if method == "prophet":
        try:
            import pandas as pd
            from prophet import Prophet
            df = pd.DataFrame({
                "ds": pd.date_range("2025-06-01", periods=len(series), freq="MS"),
                "y": series,
            })
            m = Prophet(interval_width=0.9).fit(df)
            fut = m.make_future_dataframe(periods=periods, freq="MS")
            fc = m.predict(fut).tail(periods)
            return [{"value": max(0, r.yhat), "lower": max(0, r.yhat_lower), "upper": r.yhat_upper}
                    for r in fc.itertuples()]
        except ImportError:
            pass  # fall back to linear
    if method == "xgboost":
        try:
            import numpy as np
            from xgboost import XGBRegressor
            X = np.arange(len(series)).reshape(-1, 1)
            model = XGBRegressor(n_estimators=200, max_depth=3, learning_rate=0.1)
            model.fit(X, np.array(series))
            future_X = np.arange(len(series), len(series) + periods).reshape(-1, 1)
            preds = model.predict(future_X)
            return [{"value": max(0, float(p)), "lower": max(0, float(p) * 0.92),
                     "upper": float(p) * 1.08} for p in preds]
        except ImportError:
            pass
    return _linear(series, periods)


# ---- anomaly detection -----------------------------------------------------
def detect_anomalies(series: list[float], label: str, months: list[str],
                     unit: str = "", threshold: float = 1.8) -> list[dict]:
    """Z-score on month-over-month deltas. Flags drops and spikes >= threshold σ."""
    deltas = [series[i] - series[i - 1] for i in range(1, len(series))]
    mu = sum(deltas) / len(deltas)
    sd = math.sqrt(sum((d - mu) ** 2 for d in deltas) / len(deltas)) or 1
    flags = []
    for i, d in enumerate(deltas):
        z = (d - mu) / sd
        if abs(z) >= threshold:
            flags.append({
                "metric": label, "month": months[i + 1], "unit": unit,
                "type": "drop" if d < 0 else "spike",
                "sigma": round(abs(z), 1), "delta": round(d, 2),
            })
    return flags


# ---- recommendation engine -------------------------------------------------
def recommendations(data: dict) -> list[dict]:
    """Rule-based strategic recommendations derived from the dataset.
    (LLM-generated recommendations are produced separately via the AI router.)"""
    recs = []
    t = data["totals"]
    last = 11

    # cost overrun by branch
    for b in data["branches"]:
        ratio = b["opex"][last] / b["revenue"][last]
        if ratio > 0.75:
            recoverable = (ratio - 0.66) * b["revenue"][last]
            recs.append({
                "type": "cost_optimization", "severity": "high",
                "title": f"Audit {b['name']} cost base",
                "detail": f"Opex ratio at {ratio*100:.0f}% (target ~66%). "
                          f"~₹{recoverable/1e5:.0f}L/mo recoverable.",
            })

    # growth / expansion
    top_dept = max(data["departments"], key=lambda d: d["growth"])
    if top_dept["growth"] > 12:
        recs.append({
            "type": "expansion", "severity": "opportunity",
            "title": f"Expand {top_dept['name']} capacity",
            "detail": f"{top_dept['growth']:.0f}% growth — strongest ROI for capex allocation.",
        })

    # occupancy / staffing
    low_occ = min(data["branches"], key=lambda b: b["occupancy"][last])
    if low_occ["occupancy"][last] < 75:
        recs.append({
            "type": "operations", "severity": "medium",
            "title": f"Demand stimulation — {low_occ['name']}",
            "detail": f"Occupancy {low_occ['occupancy'][last]:.0f}%; marketing + referral focus advised.",
        })
    return recs


# ---- health score ----------------------------------------------------------
def health_score(data: dict) -> int:
    t = data["totals"]; last = 11
    margin = t["profit"][last] / t["revenue"][last] * 100
    occ = t["occupancy"][last]
    sat = t["satisfaction"][last]
    growth = (t["revenue"][last] / t["revenue"][last - 1] - 1) * 100
    canc = t["cancellations"][last] / t["patients"][last] * 100
    score = margin * 1.4 + (occ - 60) * 0.5 + (sat - 70) * 0.6 + growth * 1.5 - canc * 2 + 18
    return max(0, min(100, round(score)))
