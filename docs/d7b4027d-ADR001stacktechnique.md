# ADR-001 — Stack technique

**Date** : 2026-05-01  
**Statut** : Accepté  
**Décideurs** : JV

---

## Contexte

Démarrage d'un portfolio tracker d'investissement personnel (actions, dividendes, YoC, projections FIRE). MVP solo, evolutif.

## Décision

| Couche | Choix | Alternative écartée |
|---|---|---|
| Backend | Java 21 + Spring Boot 3 | C# / Node |
| API | REST (JSON) | GraphQL |
| Frontend | React 18 + TypeScript | Vue, Angular |
| Base de données | PostgreSQL 16 | SQLite, MySQL |
| ORM | Spring Data JPA / Hibernate | JOOQ |
| Auth | JWT stateless (Spring Security) | Session, Keycloak |
| Build | Maven | Gradle |

## Justification

- Java 21 : LTS, Virtual Threads (Loom), maîtrise existante
- React + TypeScript : typage fort, ecosystème riche pour les graphiques (Recharts)
- PostgreSQL : robustesse, support natif JSON, extensions financières (numeric précis)
- JWT stateless : pas de session serveur, adapté app solo/API mobile future

## Conséquences

- Démarrage rapide avec Spring Initializr
- PostgreSQL requis en local (Docker Compose)
- Pas de SSR → SEO non prioritaire (app privée)
