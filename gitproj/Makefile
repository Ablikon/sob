.PHONY: help setup-auth setup-db setup-user setup-project setup-submission setup-all migrate-all docker-up docker-down logs clean docker-logs docker-rebuild docker-clean

# Путь к PostgreSQL из Postgres.app
PG_PATH=/Applications/Postgres.app/Contents/Versions/17/bin

help:
	@echo "Student Project Hub - Команды управления"
	@echo ""
	@echo "🐳 Docker команды:"
	@echo "docker-up         - Запустить ВСЕ сервисы через Docker"
	@echo "docker-down       - Остановить Docker контейнеры"
	@echo "docker-logs       - Показать логи Docker"
	@echo "docker-rebuild    - Пересобрать контейнеры"
	@echo ""
	@echo "🗄️ Локальные команды:"
	@echo "pg-check          - Проверить статус PostgreSQL"
	@echo "pg-start          - Запустить PostgreSQL"
	@echo "setup-db          - Создать базы данных PostgreSQL"
	@echo ""
	@echo "setup-auth        - Настроить Auth Service"
	@echo "migrate-auth      - Применить миграции Auth Service"
	@echo "run-auth          - Запустить Auth Service"
	@echo ""
	@echo "setup-user        - Настроить User Service"
	@echo "migrate-user      - Применить миграции User Service"
	@echo "run-user          - Запустить User Service"
	@echo ""
	@echo "setup-project     - Настроить Project Service"
	@echo "migrate-project   - Применить миграции Project Service"
	@echo "run-project       - Запустить Project Service"
	@echo ""
	@echo "setup-submission  - Настроить Submission Service"
	@echo "migrate-submission - Применить миграции Submission Service"
	@echo "run-submission    - Запустить Submission Service"
	@echo ""
	@echo "setup-all         - Настроить все сервисы локально"
	@echo "migrate-all       - Применить все миграции"
	@echo "createsuperuser   - Создать суперпользователя"
	@echo "docker-up         - Запустить Docker контейнеры"
	@echo "docker-down       - Остановить Docker контейнеры"
	@echo "logs              - Показать логи Docker"

pg-check:
	@echo "🔍 Проверка PostgreSQL..."
	@if $(PG_PATH)/psql -l >/dev/null 2>&1; then \
		echo "✅ PostgreSQL запущен"; \
		$(PG_PATH)/psql -l | head -5; \
	else \
		echo "❌ PostgreSQL не запущен!"; \
		echo ""; \
		echo "Запустите Postgres.app:"; \
		echo "1. Найдите иконку слона в Applications"; \
		echo "2. Откройте Postgres.app"; \
		echo "3. Нажмите 'Initialize' или 'Start'"; \
		echo ""; \
		echo "Или запустите из терминала:"; \
		echo "open -a Postgres"; \
		exit 1; \
	fi

pg-start:
	@echo "🐘 Запуск PostgreSQL..."
	@open -a Postgres 2>/dev/null || echo "Postgres.app не найден в Applications"
	@echo "⏳ Ожидание запуска (3 сек)..."
	@sleep 3
	@make pg-check

setup-db: pg-check
	@echo "🗄️  Создание баз данных..."
	@$(PG_PATH)/createdb auth_db 2>/dev/null || echo "✓ База auth_db уже существует"
	@$(PG_PATH)/createdb user_db 2>/dev/null || echo "✓ База user_db уже существует"
	@$(PG_PATH)/createdb project_db 2>/dev/null || echo "✓ База project_db уже существует"
	@$(PG_PATH)/createdb submission_db 2>/dev/null || echo "✓ База submission_db уже существует"
	@echo "✅ Базы данных готовы"

setup-auth:
	@chmod +x setup_auth_service.sh
	@./setup_auth_service.sh

migrate-auth: pg-check setup-db
	@echo "🔄 Создание и применение миграций..."
	@cd backend/auth_service && \
	source venv/bin/activate && \
	python manage.py makemigrations authentication && \
	python manage.py makemigrations && \
	python manage.py migrate
	@echo "✅ Миграции применены"

run-auth: pg-check
	@cd backend/auth_service && \
	source venv/bin/activate && \
	python manage.py runserver 8001

setup-user:
	@chmod +x setup_user_service.sh
	@./setup_user_service.sh

migrate-user: pg-check setup-db
	@echo "🔄 Создание и применение миграций User Service..."
	@cd backend/user_service && \
	source venv/bin/activate && \
	python manage.py makemigrations profiles && \
	python manage.py makemigrations && \
	python manage.py migrate
	@echo "✅ Миграции применены"

run-user: pg-check
	@cd backend/user_service && \
	source venv/bin/activate && \
	python manage.py runserver 8002

setup-project:
	@chmod +x setup_project_service.sh
	@./setup_project_service.sh

migrate-project: pg-check setup-db
	@echo "🔄 Создание и применение миграций Project Service..."
	@cd backend/project_service && \
	source venv/bin/activate && \
	python manage.py makemigrations projects && \
	python manage.py makemigrations && \
	python manage.py migrate
	@echo "✅ Миграции применены"

run-project: pg-check
	@cd backend/project_service && \
	source venv/bin/activate && \
	python manage.py runserver 8003

setup-submission:
	@chmod +x setup_submission_service.sh
	@./setup_submission_service.sh

migrate-submission: pg-check setup-db
	@echo "🔄 Создание и применение миграций Submission Service..."
	@cd backend/submission_service && \
	source venv/bin/activate && \
	python manage.py makemigrations submissions && \
	python manage.py makemigrations && \
	python manage.py migrate
	@echo "✅ Миграции применены"

run-submission: pg-check
	@cd backend/submission_service && \
	source venv/bin/activate && \
	python manage.py runserver 8004

setup-all: setup-auth setup-user setup-project setup-submission
	@echo "✅ Все сервисы настроены!"

migrate-all: migrate-auth migrate-user migrate-project migrate-submission
	@echo "✅ Все миграции применены!"

createsuperuser:
	@cd backend/auth_service && \
	source venv/bin/activate && \
	python manage.py createsuperuser

docker-up:
	@echo "🐳 Запуск всех сервисов через Docker..."
	@docker-compose up --build -d
	@echo ""
	@echo "✅ Все сервисы запущены!"
	@echo ""
	@echo "🌐 Доступные сервисы:"
	@echo "Frontend:           http://localhost"
	@echo "Auth Service:       http://localhost:8001/swagger/"
	@echo "User Service:       http://localhost:8002/swagger/"
	@echo "Project Service:    http://localhost:8003/swagger/"
	@echo "Submission Service: http://localhost:8004/swagger/"
	@echo ""
	@echo "📊 Логи: make docker-logs"
	@echo "🛑 Остановить: make docker-down"

docker-down:
	@echo "🛑 Остановка Docker контейнеров..."
	@docker-compose down
	@echo "✅ Контейнеры остановлены"

docker-logs:
	@docker-compose logs -f

docker-rebuild:
	@echo "🔄 Пересборка контейнеров..."
	@docker-compose down
	@docker-compose up --build -d
	@echo "✅ Контейнеры пересобраны и запущены"

docker-clean:
	@echo "🧹 Очистка Docker..."
	@docker-compose down -v
	@docker system prune -f
	@echo "✅ Docker очищен"

logs:
	docker-compose logs -f

clean:
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name "venv" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Очищено"
