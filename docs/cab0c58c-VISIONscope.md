# Vision & Scope — Portfolio Tracker

**Date** : 2026-05-01  
**Version** : 1.0  
**Auteur** : JV

---

## Problème résolu

Les outils disponibles (Excel, Boursorama, Morning Star) ne permettent pas de suivre simultanément :
- le **PRU réel** (frais inclus) sur plusieurs enveloppes fiscales
- le **Yield-on-Cost** par ligne et sa projection future
- la **fiscalité nette** selon l'enveloppe au moment d'une vente
- la **progression vers un objectif FIRE** basé sur les revenus passifs

L'investisseur navigue entre plusieurs sources, recalcule manuellement et perd du temps à prendre des décisions d'achat/renforcement.

---

## Vision

> **Avoir en 30 secondes une réponse claire à : "Est-ce que je renforce, j'attends ou je vends ?"**

Un outil personnel, local, sans publicité, centré sur les données patrimoniales réelles d'un investisseur FIRE orienté dividendes croissants, multi-enveloppes (PEA, CTO, AV).

---

## Utilisateurs cibles

| Persona | Description |
|---|---|
| **Investisseur principal** | JV — suivi actif, décisions de renforcement mensuel, objectif FIRE ~14 ans |
| **(Post-MVP) Conjoint/famille** | Consultation lecture seule du portefeuille commun |

---

## Périmètre v1 (MVP)

### Dans le scope ✅

- Gestion multi-portefeuilles (PEA, CTO, AV séparés)
- Saisie et correction de transactions (achat, vente, dividende)
- Calcul automatique : PRU, PV latente, YoC, TWR
- Dashboard global + détail par position
- Suivi des revenus passifs (dividendes mensuels/annuels)
- Projection dividendes sur horizon paramétrable
- Simulation fiscale simplifiée (PEA / CTO flat tax / AV)
- Alertes de prix (seuil haut/bas)
- Import CSV broker (mapping configurable)
- Stockage local PostgreSQL, interface web React

### Hors scope v1 ❌

- Multi-utilisateurs / authentification multi-comptes
- Open banking / connexion broker automatique
- Application mobile native
- Fiscalité complexe (barème progressif, abattements pré-2018)
- Gestion obligataire ou produits dérivés
- Crypto-actifs
- Reporting comptable

---

## Critères de succès

| Critère | Cible |
|---|---|
| Temps pour voir le PRU + PV latente d'une ligne | < 5 secondes |
| Temps de saisie d'une transaction | < 60 secondes |
| Précision du calcul PRU | Identique à calcul manuel Excel |
| Disponibilité locale | 100% (pas de dépendance cloud critique) |
| Couverture des Must-Have US | 100% avant mise en production |

---

## Contraintes

| Type | Contrainte |
|---|---|
| **Technique** | Java 21 + React (stack maîtrisée) |
| **Données** | Stockage local obligatoire (données financières personnelles) |
| **Temps** | MVP utilisable en soirées/week-ends |
| **Coût** | 0€ d'infrastructure en MVP (Docker local) |
| **Légal** | Disclaimer fiscal obligatoire sur toutes les simulations |

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| API Yahoo Finance instable | Moyenne | Moyen | Cache 15 min + interface `QuoteProvider` swappable |
| Calcul fiscal incorrect | Faible | Élevé | Disclaimer + tests unitaires exhaustifs sur les cas fiscaux |
| Import CSV broker hétérogène | Élevée | Moyen | Mapping configurable + prévisualisation avant import |
| Scope creep (trop de features) | Élevée | Élevé | MoSCoW strict, backlog visible, MVP d'abord |

---

## Stack décidée (cf. ADR-001)

```
Backend  : Java 21 · Spring Boot 3 · PostgreSQL 16 · Spring Data JPA
Frontend : React 18 · TypeScript · Recharts · TailwindCSS
Infra    : Docker Compose local
```

---

## Prochaines étapes

1. ✅ ADRs (001 → 005)
2. ✅ Modèle de données
3. ✅ User Stories (MoSCoW)
4. ✅ Vision & Scope
5. ⬜ Wireframes basse fidélité (dashboard + détail position)
6. ⬜ Spring Initializr + structure projet backend
7. ⬜ Premiers endpoints REST (transactions CRUD)
8. ⬜ React scaffold + tableau de positions
