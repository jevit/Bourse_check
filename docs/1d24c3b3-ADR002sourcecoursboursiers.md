# ADR-002 — Source des cours boursiers

**Date** : 2026-05-01  
**Statut** : Accepté  
**Décideurs** : JV

---

## Contexte

L'application a besoin de cours boursiers (prix actuel, historique) pour calculer les plus-values latentes et performance. Le choix de la source impacte la fiabilité, le coût et la complexité d'intégration.

## Décision

**Yahoo Finance (yfinance API non officielle) en MVP**, avec abstraction derrière une interface pour migration future.

```java
public interface QuoteProvider {
    Quote getLatestQuote(String ticker);
    List<Quote> getHistoricalQuotes(String ticker, LocalDate from, LocalDate to);
}

// Implémentation MVP
@Service
public class YahooFinanceQuoteProvider implements QuoteProvider { ... }
```

## Alternatives évaluées

| Source | Avantage | Inconvénient |
|---|---|---|
| Yahoo Finance (non officielle) | Gratuit, large couverture | Instable, ToS grise |
| Alpha Vantage (free tier) | API officielle, 25 req/jour | Limite très basse |
| Boursorama scraping | Données françaises précises | Fragile, ToS |
| Financial Modeling Prep | API propre, fiable | Payant au-delà du free tier |

## Justification

- MVP solo → coût 0 acceptable
- L'interface `QuoteProvider` permet de swapper sans toucher au domaine
- Cache local des cours (TTL 15 min) pour réduire les appels

## Conséquences

- Implémenter un cache (Spring Cache + Caffeine)
- Prévoir une tâche planifiée (@Scheduled) pour rafraîchir les cours du portefeuille
- Risque : Yahoo peut casser l'API → prévu dans l'abstraction
