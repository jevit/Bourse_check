# ADR-003 — Modèle de persistance des transactions

**Date** : 2026-05-01  
**Statut** : Accepté  
**Décideurs** : JV

---

## Contexte

Le cœur du domaine est la **transaction** (achat, vente, dividende reçu). Le PRU, le YoC, la plus-value latente et le gain réalisé en dépendent tous. Le modèle doit être exact et auditables.

## Décision

Approche **event-sourcing léger** : toutes les transactions sont immuables et stockées. Les agrégats (PRU, YoC, quantité) sont **calculés à la volée** ou mis en cache, jamais stockés comme source de vérité.

```
Transaction (immuable)
├── id UUID
├── portfolioId
├── ticker
├── type : BUY | SELL | DIVIDEND | FEE | SPLIT
├── date
├── quantity (NUMERIC 18,6)
├── unitPrice (NUMERIC 18,6)
├── fees (NUMERIC 18,6)
├── currency
└── enveloppe : PEA | CTO | AV
```

Le PRU est recalculé :
```
PRU = Σ(quantity_i * unitPrice_i + fees_i) / Σ(quantity_i)  [achats uniquement]
```

## Alternatives écartées

- **Stocker le PRU directement** → risque d'incohérence si correction de transaction
- **Un seul objet Position mutable** → perte de l'historique, non auditable

## Justification

- Correction d'une transaction = simple UPDATE, tout se recalcule
- Import CSV de l'historique broker facilité
- Auditabilité totale (exigence fiscale implicite)

## Conséquences

- Les calculs agrégés (PRU, YoC, PV latente) sont dans des services dédiés
- Prévoir des index sur `(ticker, portfolioId, date)` pour les requêtes historiques
- `NUMERIC(18,6)` obligatoire — jamais `FLOAT` pour des montants financiers
