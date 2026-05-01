# ADR-005 — Infrastructure locale (MVP)

**Date** : 2026-05-01  
**Statut** : Accepté  
**Décideurs** : JV

---

## Contexte

Application personnelle, pas de multi-utilisateurs en MVP. L'objectif est de démarrer vite avec un environnement reproductible, sans coût cloud.

## Décision

**Tout en local via Docker Compose**, déploiement sur VPS simple si besoin de mobilité.

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/portfolio
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:8080

volumes:
  postgres_data:
```

## Alternatives écartées

| Option | Raison du rejet |
|---|---|
| Heroku / Render | Coût, cold start, données sensibles hors France |
| SQLite | Pas de types NUMERIC précis, pas de concurrence future |
| H2 in-memory | Données perdues au redémarrage |
| Supabase cloud | Données financières personnelles → préférence locale |

## Justification

- Docker Compose = environnement reproductible en 1 commande
- PostgreSQL local = données financières sous contrôle
- Migration VPS possible sans changement de stack (même Docker Compose)

## Conséquences

- `make up` / `make down` pour démarrer/arrêter
- Backups PostgreSQL via `pg_dump` scriptés (cron ou Makefile)
- `.env` non commité, `.env.example` versionné
