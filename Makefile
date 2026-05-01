.PHONY: up down logs backup restore build dev

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

backup:
	docker compose exec postgres pg_dump -U portfolio portfolio > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore:
	@echo "Usage: make restore FILE=backup_xxx.sql"
	docker compose exec -T postgres psql -U portfolio portfolio < $(FILE)

dev-backend:
	cd backend && ./mvnw spring-boot:run

dev-frontend:
	cd frontend && npm run dev
