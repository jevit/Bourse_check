-- V2: Watchlist + instrument metadata enrichi
ALTER TABLE instrument
    ADD COLUMN IF NOT EXISTS payout_ratio      NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS dividend_years    INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS five_year_dgr     NUMERIC(6,4),
    ADD COLUMN IF NOT EXISTS pe_ratio          NUMERIC(8,2),
    ADD COLUMN IF NOT EXISTS notes             TEXT;

CREATE TABLE watchlist_item (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker           VARCHAR(20)    NOT NULL REFERENCES instrument(ticker),
    portfolio_id     UUID           REFERENCES portfolio(id) ON DELETE CASCADE,
    target_price     NUMERIC(18,6),
    max_weight_pct   NUMERIC(5,2)   DEFAULT 5.0,
    notes            TEXT,
    is_active        BOOLEAN        NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_watchlist_portfolio ON watchlist_item(portfolio_id);
