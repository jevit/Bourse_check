-- Portfolio
CREATE TABLE portfolio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    currency    CHAR(3)      NOT NULL DEFAULT 'EUR',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Instrument
CREATE TABLE instrument (
    ticker    VARCHAR(20)  PRIMARY KEY,
    name      VARCHAR(200) NOT NULL,
    isin      CHAR(12),
    type      VARCHAR(20)  NOT NULL DEFAULT 'STOCK',
    currency  CHAR(3)      NOT NULL DEFAULT 'EUR',
    exchange  VARCHAR(20),
    sector    VARCHAR(100),
    country   CHAR(2)
);

-- Transaction
CREATE TABLE transaction (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID        NOT NULL REFERENCES portfolio(id) ON DELETE CASCADE,
    ticker       VARCHAR(20) NOT NULL REFERENCES instrument(ticker),
    enveloppe    VARCHAR(10) NOT NULL,
    type         VARCHAR(20) NOT NULL,
    date         DATE        NOT NULL,
    quantity     NUMERIC(18, 6) NOT NULL,
    unit_price   NUMERIC(18, 6) NOT NULL,
    fees         NUMERIC(18, 6) NOT NULL DEFAULT 0,
    currency     CHAR(3)     NOT NULL DEFAULT 'EUR',
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT chk_enveloppe CHECK (enveloppe IN ('PEA','CTO','AV','PEE','PERCO')),
    CONSTRAINT chk_type CHECK (type IN ('BUY','SELL','DIVIDEND','FEE','SPLIT','TRANSFER_IN','TRANSFER_OUT'))
);

CREATE INDEX idx_transaction_portfolio_ticker ON transaction(portfolio_id, ticker, date);
CREATE INDEX idx_transaction_date ON transaction(date);

-- Quote
CREATE TABLE quote (
    ticker      VARCHAR(20)    NOT NULL REFERENCES instrument(ticker),
    date        DATE           NOT NULL,
    close_price NUMERIC(18, 6) NOT NULL,
    currency    CHAR(3)        NOT NULL DEFAULT 'EUR',
    source      VARCHAR(50)    NOT NULL DEFAULT 'YAHOO',
    fetched_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),

    PRIMARY KEY (ticker, date)
);

-- DividendEvent
CREATE TABLE dividend_event (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker           VARCHAR(20)    NOT NULL REFERENCES instrument(ticker),
    portfolio_id     UUID           NOT NULL REFERENCES portfolio(id) ON DELETE CASCADE,
    ex_dividend_date DATE           NOT NULL,
    payment_date     DATE,
    amount_per_share NUMERIC(18, 6) NOT NULL,
    quantity         NUMERIC(18, 6) NOT NULL DEFAULT 1,
    currency         CHAR(3)        NOT NULL DEFAULT 'EUR',
    tax_withheld     NUMERIC(18, 6) NOT NULL DEFAULT 0,
    net_amount       NUMERIC(18, 6) NOT NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_dividend_portfolio_date ON dividend_event(portfolio_id, ex_dividend_date);

-- PriceAlert
CREATE TABLE price_alert (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker       VARCHAR(20)    NOT NULL REFERENCES instrument(ticker),
    portfolio_id UUID           REFERENCES portfolio(id) ON DELETE CASCADE,
    direction    VARCHAR(10)    NOT NULL,
    target_price NUMERIC(18, 6) NOT NULL,
    is_active    BOOLEAN        NOT NULL DEFAULT true,
    triggered_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT chk_direction CHECK (direction IN ('ABOVE', 'BELOW'))
);
