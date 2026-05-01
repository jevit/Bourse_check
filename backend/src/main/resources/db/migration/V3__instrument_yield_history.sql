-- V3: Historique dividende annuel par instrument (pour le calcul du yield normatif)
CREATE TABLE instrument_annual_dividend (
    ticker           VARCHAR(20)    NOT NULL REFERENCES instrument(ticker),
    year             SMALLINT       NOT NULL,
    annual_dividend  NUMERIC(18,6)  NOT NULL,
    PRIMARY KEY (ticker, year)
);

-- Colonnes de cache sur instrument (mises à jour par AnalysisService)
ALTER TABLE instrument
    ADD COLUMN IF NOT EXISTS hist_avg_yield  NUMERIC(8,4),
    ADD COLUMN IF NOT EXISTS current_yield   NUMERIC(8,4);
