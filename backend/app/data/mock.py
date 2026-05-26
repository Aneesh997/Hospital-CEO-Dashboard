"""
Synthetic but realistic multi-branch hospital-group dataset.

Mirrors the series the dashboard renders so the backend `/snapshot` endpoint
and the frontend stay consistent. Deterministic (seeded) for reproducible demos.
Swap `generate()` for real PostgreSQL queries in production — the shape stays the same.
"""
from __future__ import annotations

import math
import random

MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]
BRANCHES = ["Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi"]
DEPARTMENTS = ["Cardiology", "Oncology", "Orthopedics", "Diagnostics",
               "Pediatrics", "Emergency", "Neurology"]
_BASE = {"Chennai": 5.2e7, "Bengaluru": 4.8e7, "Hyderabad": 3.9e7, "Mumbai": 6.1e7, "Delhi": 4.4e7}


def generate(seed: int = 42) -> dict:
    rng = random.Random(seed)
    branches = []
    for bi, name in enumerate(BRANCHES):
        g = 0.012 + rng.random() * 0.02
        rev, opex, pat, occ, claims, sat, canc = [], [], [], [], [], [], []
        for i in range(12):
            season = 1 + 0.06 * math.sin(i / 2)
            month_rev = _BASE[name] * ((1 + g) ** i) * season * (0.97 + rng.random() * 0.06)
            ox = month_rev * (0.62 + rng.random() * 0.04)
            if name == "Bengaluru" and i >= 8:           # deliberate cost overrun
                ox = month_rev * (0.79 + rng.random() * 0.03)
            if i == 6:                                   # system-wide December dip
                month_rev *= 0.88
            rev.append(month_rev)
            opex.append(ox)
            pat.append(round(month_rev / 9800 * (0.96 + rng.random() * 0.08)))
            occ.append(min(97, 70 + i * 0.7 + (6 if bi == 3 else 0) + rng.random() * 6
                           - (8 if (name == "Bengaluru" and i >= 8) else 0)))
            claims.append(round(month_rev * 0.34 / 26000))
            sat.append(min(96, 80 + i * 0.5 + rng.random() * 4
                           - (5 if (name == "Bengaluru" and i >= 8) else 0)))
            canc.append(round(pat[i] * (0.04 + (0.03 if (name == "Bengaluru" and i >= 8) else 0)
                                        + rng.random() * 0.02)))
        branches.append({
            "name": name, "revenue": rev, "opex": opex, "patients": pat, "occupancy": occ,
            "claims": claims, "satisfaction": sat, "cancellations": canc,
            "profit": [r - o for r, o in zip(rev, opex)],
        })

    def agg(key, i): return sum(b[key][i] for b in branches)
    totals = {
        "revenue":   [agg("revenue", i) for i in range(12)],
        "opex":      [agg("opex", i) for i in range(12)],
        "patients":  [agg("patients", i) for i in range(12)],
        "claims":    [agg("claims", i) for i in range(12)],
        "cancellations": [agg("cancellations", i) for i in range(12)],
        "occupancy": [sum(b["occupancy"][i] for b in branches) / len(branches) for i in range(12)],
        "satisfaction": [sum(b["satisfaction"][i] for b in branches) / len(branches) for i in range(12)],
    }
    totals["profit"] = [r - o for r, o in zip(totals["revenue"], totals["opex"])]

    dep_share = [0.20, 0.18, 0.14, 0.16, 0.10, 0.13, 0.09]
    dep_growth = [8.2, 21.4, 6.1, 16.7, 4.3, -2.1, 11.5]
    last_rev = totals["revenue"][11]
    departments = [{"name": d, "revenue": last_rev * dep_share[i], "growth": dep_growth[i]}
                   for i, d in enumerate(DEPARTMENTS)]

    return {"months": MONTHS, "branches": branches, "totals": totals, "departments": departments}


if __name__ == "__main__":
    import json
    print(json.dumps(generate(), indent=2)[:800], "...")
