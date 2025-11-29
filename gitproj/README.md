# Student Project Hub 🎓

Платформа для управления студенческими проектами, командной работы и сдачи заданий.

## 🏗️ Архитектура

Проект построен на микросервисной архитектуре:

### Backend (Django + DRF)
- **Auth Service** (port 8001) - JWT аутентификация
- **User Service** (port 8002) - Профили студентов/преподавателей
- **Project Service** (port 8003) - Управление проектами
- **Submission Service** (port 8004) - Сдача работ и оценки

### Frontend
- **React + Vite** (port 5173) - SPA приложение

### Infrastructure
- **Nginx** (port 80) - API Gateway
- **PostgreSQL** - База данных для каждого сервиса
- **Docker Compose** - Оркестрация контейнеров

## 🚀 Быстрый старт (macOS с Postgres.app)

### Предварительные требования
- [Postgres.app](https://postgresapp.com/) установлен и запущен
- Node.js 20+
- Python 3.11+

### Шаг 0: Запустите PostgreSQL

```bash
# Проверьте статус PostgreSQL
make pg-check

# Если не запущен, запустите:
make pg-start

# Или вручную откройте Postgres.app из Applications
open -a Postgres
```

### Шаг 1: Создайте базы данных

```bash
# Убедитесь что Postgres.app запущен (иконка слона в меню)
make setup-db
```

### Шаг 2: Настройте Auth Service

```bash
# Автоматическая установка
make setup-auth

# Или вручную:
cd /Users/abylajhanbegimkulov/Desktop/sobes/gitproj
chmod +x setup_auth_service.sh
./setup_auth_service.sh
```

### Шаг 3: Примените миграции

```bash
make migrate-auth

# Или вручную:
cd backend/auth_service
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

### Шаг 4: Создайте суперпользователя

```bash
make createsuperuser

# Или вручную:
cd backend/auth_service
source venv/bin/activate
python manage.py createsuperuser
```

### Шаг 5: Запустите сервер

```bash
make run-auth

# Или вручную:
cd backend/auth_service
source venv/bin/activate
python manage.py runserver 8001
```

### Шаг 6: Проверьте работу

- **Swagger API**: http://localhost:8001/swagger/
- **Admin панель**: http://localhost:8001/admin/
- **API endpoints**: http://localhost:8001/api/

## 📡 API Endpoints

### Auth Service (http://localhost:8001/api/)
- `POST /register/` - Регистрация нового пользователя
- `POST /login/` - Вход (получение JWT токенов)
- `POST /logout/` - Выход (blacklist refresh token)
- `POST /token/refresh/` - Обновление access token
- `GET /users/` - Список пользователей
- `GET /users/me/` - Текущий пользователь

## 🛠️ Makefile команды

```bash
make help              # Показать все команды
make pg-check          # Проверить статус PostgreSQL
make pg-start          # Запустить PostgreSQL
make setup-db          # Создать базы данных
make setup-auth        # Настроить Auth Service
make migrate-auth      # Применить миграции
make run-auth          # Запустить Auth Service
make createsuperuser   # Создать суперпользователя
make clean             # Очистить __pycache__ и venv
```

## 📦 Структура проекта

```
gitproj/
├── backend/
│   ├── auth_service/
│   │   ├── auth_service/        # Django проект
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── ...
│   │   ├── authentication/      # Django приложение
│   │   │   ├── models.py        # Модель User
│   │   │   ├── serializers.py   # DRF сериализаторы
│   │   │   ├── views.py         # API views
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── venv/               # Виртуальное окружение
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   └── .env
│   ├── user_service/           # TODO
│   ├── project_service/        # TODO
│   └── submission_service/     # TODO
├── src/                        # React приложение
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── Makefile
└── README.md
```

## 🔧 Технологии

- **Backend**: Django 5.0, DRF, PostgreSQL, JWT
- **Frontend**: React 19, Vite
- **DevOps**: Docker, Docker Compose, Nginx
- **API Docs**: Swagger/OpenAPI (drf-yasg)

## ❓ Решение проблем

### PostgreSQL не запущен
```bash
# Проверьте статус
make pg-check

# Запустите PostgreSQL
make pg-start

# Или вручную:
# 1. Откройте Finder → Applications
# 2. Найдите Postgres.app
# 3. Запустите приложение
# 4. Убедитесь что иконка слона появилась в меню
```

### Connection refused error
```bash
# Это значит PostgreSQL не запущен
# Убедитесь что иконка слона есть в меню macOS
# Если нет - запустите Postgres.app
open -a Postgres
```

### Ошибка при создании базы данных
```bash
# Создайте базу вручную через Postgres.app:
# Откройте Postgres.app → кликните "Initialize"
# Или через терминал:
/Applications/Postgres.app/Contents/Versions/17/bin/createdb auth_db
```

### Ошибка psycopg
```bash
# Переустановите с правильной версией:
cd backend/auth_service
source venv/bin/activate
pip uninstall psycopg psycopg-binary
pip install "psycopg[binary]==3.2.3"
```

## 🐳 Быстрый старт через Docker (РЕКОМЕНДУЕТСЯ)

Запустить ВСЕ сервисы одной командой:

```bash
# Клонируйте репозиторий
cd /Users/abylajhanbegimkulov/Desktop/sobes/gitproj

# Запустите все сервисы
make docker-up

# Подождите 30-60 секунд, пока все запустится
```

**Готово!** Откройте http://localhost - все работает! 🎉

**Доступные сервисы:**
- Frontend: http://localhost
- Auth Service API: http://localhost:8001/swagger/
- User Service API: http://localhost:8002/swagger/
- Project Service API: http://localhost:8003/swagger/
- Submission Service API: http://localhost:8004/swagger/

**Управление:**
```bash
make docker-logs      # Посмотреть логи
make docker-down      # Остановить все
make docker-rebuild   # Пересобрать контейнеры
```

## 📝 Создание суперпользователя в Docker

```bash
# Войдите в контейнер auth_service
docker-compose exec auth_service python manage.py createsuperuser

# Введите данные для админа
```

## 📝 TODO

- [x] Настроить Auth Service
- [x] Создать User Service
- [x] Создать Project Service  
- [x] Создать Submission Service
- [x] Настроить Frontend
- [x] Docker контейнеры
- [ ] CI/CD
- [ ] Тесты

## 📄 Лицензия

MIT
