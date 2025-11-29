#!/bin/bash

set -e

echo "🚀 Настройка Auth Service..."

# Переходим в директорию auth_service
mkdir -p backend/auth_service
cd backend/auth_service || exit

# Создаем виртуальное окружение
echo "📦 Создание виртуального окружения..."
python3 -m venv venv

# Активируем виртуальное окружение
echo "⚡ Активация виртуального окружения..."
source venv/bin/activate

# Обновляем pip
echo "📥 Обновление pip..."
pip install --upgrade pip setuptools wheel

# Устанавливаем зависимости
echo "📥 Установка зависимостей..."
pip install Django==5.0.1
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.3.1
pip install "psycopg[binary]==3.2.13"
pip install drf-yasg==1.21.7
pip install python-dotenv==1.0.0

# Создаем Django проект если его нет
if [ ! -f "manage.py" ]; then
    echo "🏗️  Создание Django проекта..."
    django-admin startproject auth_service .
fi

# Создаем приложение authentication если его нет
if [ ! -d "authentication" ]; then
    echo "📱 Создание приложения authentication..."
    python manage.py startapp authentication
fi

echo ""
echo "✅ Auth Service настроен!"
echo ""
echo "📝 Следующие шаги:"
echo ""
echo "1. Убедитесь что PostgreSQL запущен (иконка слона в меню)"
echo ""
echo "2. Создайте базу данных:"
echo "   /Applications/Postgres.app/Contents/Versions/17/bin/createdb auth_db"
echo ""
echo "3. Примените миграции:"
echo "   cd backend/auth_service"
echo "   source venv/bin/activate"
echo "   python manage.py makemigrations"
echo "   python manage.py migrate"
echo ""
echo "4. Создайте суперпользователя:"
echo "   python manage.py createsuperuser"
echo ""
echo "5. Запустите сервер:"
echo "   python manage.py runserver 8001"
echo ""
echo "6. Откройте: http://localhost:8001/swagger/"
