-- ============================================================
--  XERALIT — PostgreSQL schema (healthcare BI star-ish model)
--  psql "$DATABASE_URL" -f sql/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS branch (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    city         TEXT NOT NULL,
    region       TEXT,
    opened_on    DATE,
    bed_capacity INT
);

CREATE TABLE IF NOT EXISTS department (
    id        SERIAL PRIMARY KEY,
    name      TEXT NOT NULL UNIQUE,
    specialty TEXT
);

-- One row per branch per month = the analytic fact table.
CREATE TABLE IF NOT EXISTS branch_monthly_metrics (
    id                  SERIAL PRIMARY KEY,
    branch_id           INT NOT NULL REFERENCES branch(id),
    period              DATE NOT NULL,                 -- first day of month
    revenue             NUMERIC(14,2) NOT NULL,
    operating_cost      NUMERIC(14,2) NOT NULL,
    net_profit          NUMERIC(14,2) GENERATED ALWAYS AS (revenue - operating_cost) STORED,
    patient_volume      INT NOT NULL,
    bed_occupancy_pct   NUMERIC(5,2),
    insurance_claims    INT,
    claims_approved     INT,
    satisfaction_pct    NUMERIC(5,2),
    cancellations       INT,
    UNIQUE (branch_id, period)
);

CREATE TABLE IF NOT EXISTS department_monthly_metrics (
    id            SERIAL PRIMARY KEY,
    branch_id     INT NOT NULL REFERENCES branch(id),
    department_id INT NOT NULL REFERENCES department(id),
    period        DATE NOT NULL,
    revenue       NUMERIC(14,2) NOT NULL,
    margin_pct    NUMERIC(5,2),
    UNIQUE (branch_id, department_id, period)
);

-- Model outputs persisted for audit / explainability.
CREATE TABLE IF NOT EXISTS forecast (
    id          SERIAL PRIMARY KEY,
    metric      TEXT NOT NULL,
    branch_id   INT REFERENCES branch(id),         -- NULL = group level
    period      DATE NOT NULL,
    method      TEXT NOT NULL,                     -- linear | prophet | xgboost
    yhat        NUMERIC(14,2),
    yhat_lower  NUMERIC(14,2),
    yhat_upper  NUMERIC(14,2),
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anomaly (
    id          SERIAL PRIMARY KEY,
    metric      TEXT NOT NULL,
    branch_id   INT REFERENCES branch(id),
    period      DATE NOT NULL,
    direction   TEXT CHECK (direction IN ('drop','spike')),
    sigma       NUMERIC(5,2),
    detail      TEXT,
    detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversation (
    id         SERIAL PRIMARY KEY,
    user_id    TEXT,
    role       TEXT CHECK (role IN ('user','assistant')),
    content    TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bmm_period   ON branch_monthly_metrics(period);
CREATE INDEX IF NOT EXISTS idx_bmm_branch   ON branch_monthly_metrics(branch_id);
CREATE INDEX IF NOT EXISTS idx_dmm_period   ON department_monthly_metrics(period);
CREATE INDEX IF NOT EXISTS idx_anomaly_dir  ON anomaly(direction);
