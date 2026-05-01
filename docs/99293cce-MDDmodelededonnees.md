# Modèle de données — Portfolio Tracker

**Date** : 2026-05-01  
**Version** : 1.0 (MVP)

---

## Diagramme ERD (notation textuelle)

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Portfolio │1     *│   Transaction    │*     1│    Instrument   │
│─────────────│───────│──────────────────│───────│─────────────────│
│ id UUID PK  │       │ id UUID PK       │       │ ticker VARCHAR  │
│ name        │       │ portfolioId FK   │       │ name            │
│ description │       │ ticker FK        │       │ isin            │
│ currency    │       │ enveloppe        │       │ type            │
│ createdAt   │       │ type             │       │ currency        │
│ updatedAt   │       │ date             │       │ exchange        │
└─────────────┘       │ quantity NUM(18,6│       │ sector          │
                      │ unitPrice NUM(18,│       │ country         │
                      │ fees NUM(18,6)   │       └─────────────────┘
                      │ currency         │
                      │ notes            │       ┌─────────────────┐
                      │ createdAt        │       │      Quote      │
                      └──────────────────┘       │─────────────────│
                                                 │ ticker FK       │
┌─────────────────────┐                          │ date            │
│   DividendEvent     │                          │ closePrice      │
│─────────────────────│                          │ currency        │
│ id UUID PK          │                          │ source          │
│ ticker FK           │                          │ fetchedAt       │
│ portfolioId FK      │                          └─────────────────┘
│ exDividendDate      │
│ paymentDate         │       ┌─────────────────────┐
│ amountPerShare      │       │   PriceAlert        │
│ currency            │       │─────────────────────│
│ taxWithheld         │       │ id UUID PK          │
│ netAmount           │       │ ticker FK           │
└─────────────────────┘       │ portfolioId FK      │
                              │ type (ABOVE/BELOW)  │
                              │ targetPrice         │
                              │ isActive            │
                              │ triggeredAt         │
                              └─────────────────────┘
```

---

## Détail des entités

### Portfolio

```sql
CREATE TABLE portfolio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    currency    CHAR(3) NOT NULL DEFAULT 'EUR',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Instrument

```sql
CREATE TABLE instrument (
    ticker    VARCHAR(20) PRIMARY KEY,  -- ex: 'AI.PA', 'ASML'
    name      VARCHAR(200) NOT NULL,
    isin      CHAR(12),
    type      VARCHAR(20) NOT NULL,     -- STOCK | ETF | BOND | REIT
    currency  CHAR(3) NOT NULL,
    exchange  VARCHAR(20),              -- EPA, NASDAQ, AMS
    sector    VARCHAR(100),
    country   CHAR(2)                   -- ISO 3166
);
```

### Transaction

```sql
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'FEE', 'SPLIT', 'TRANSFER_IN', 'TRANSFER_OUT');
CREATE TYPE enveloppe_type   AS ENUM ('PEA', 'CTO', 'AV', 'PEE', 'PERCO');

CREATE TABLE transaction (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolio(id),
    ticker       VARCHAR(20) NOT NULL REFERENCES instrument(ticker),
    enveloppe    enveloppe_type NOT NULL,
    type         transaction_type NOT NULL,
    date         DATE NOT NULL,
    quantity     NUMERIC(18, 6) NOT NULL,   -- jamais FLOAT
    unit_price   NUMERIC(18, 6) NOT NULL,
    fees         NUMERIC(18, 6) NOT NULL DEFAULT 0,
    currency     CHAR(3) NOT NULL DEFAULT 'EUR',
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_price_positive    CHECK (unit_price >= 0)
);

CREATE INDEX idx_transaction_portfolio_ticker ON transaction(portfolio_id, ticker, date);
CREATE INDEX idx_transaction_date             ON transaction(date);
```

### Quote

```sql
CREATE TABLE quote (
    ticker      VARCHAR(20) NOT NULL REFERENCES instrument(ticker),
    date        DATE NOT NULL,
    close_price NUMERIC(18, 6) NOT NULL,
    currency    CHAR(3) NOT NULL,
    source      VARCHAR(50) NOT NULL DEFAULT 'YAHOO',
    fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (ticker, date)
);
```

### DividendEvent

```sql
CREATE TABLE dividend_event (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker           VARCHAR(20) NOT NULL REFERENCES instrument(ticker),
    portfolio_id     UUID NOT NULL REFERENCES portfolio(id),
    ex_dividend_date DATE NOT NULL,
    payment_date     DATE,
    amount_per_share NUMERIC(18, 6) NOT NULL,
    currency         CHAR(3) NOT NULL,
    tax_withheld     NUMERIC(18, 6) NOT NULL DEFAULT 0,
    net_amount       NUMERIC(18, 6) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### PriceAlert

```sql
CREATE TYPE alert_direction AS ENUM ('ABOVE', 'BELOW');

CREATE TABLE price_alert (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker       VARCHAR(20) NOT NULL REFERENCES instrument(ticker),
    portfolio_id UUID REFERENCES portfolio(id),
    type         alert_direction NOT NULL,
    target_price NUMERIC(18, 6) NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    triggered_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Agrégats calculés (jamais stockés)

| Agrégat | Formule |
|---|---|
| **Quantité détenue** | `Σ BUY.quantity - Σ SELL.quantity` |
| **PRU** | `Σ(qty_i * price_i + fees_i) / Σ qty_i` sur les BUY |
| **Valeur actuelle** | `quantité * dernier cours` |
| **Plus-value latente** | `valeur actuelle - (PRU * quantité)` |
| **Yield-on-Cost** | `dividende annuel / (PRU * quantité) * 100` |
| **TWR** | Time-Weighted Return sur la période |

---

## Règles métier importantes

- `NUMERIC(18,6)` obligatoire pour tous les montants — **jamais `FLOAT` ou `DOUBLE`**
- Une transaction `SELL` ne peut pas dépasser la quantité disponible à cette date
- Le `ticker` est la clé naturelle de `Instrument` (pas d'UUID)
- Les cours sont cachés 15 min en mémoire (Caffeine) avant appel Yahoo Finance
