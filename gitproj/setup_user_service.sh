#!/bin/bash

set -e

echo "🚀 Настройка User Service..."

mkdir -p backend/user_service
cd backend/user_service || exit

echo "📦 Создание виртуального окружения..."
python3 -m venv venv

echo "⚡ Активация виртуального окружения..."
source venv/bin/activate

echo "📥 Обновление pip..."
pip install --upgrade pip setuptools wheel

echo "📥 Установка зависимостей..."
pip install Django==5.0.1
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.3.1
pip install "psycopg[binary]==3.2.13"
pip install drf-yasg==1.21.7
pip install python-dotenv==1.0.0
pip install requests==2.31.0

if [ ! -f "manage.py" ]; then
    echo "🏗️  Создание Django проекта..."
    django-admin startproject user_service .
fi

if [ ! -d "profiles" ]; then
    echo "📱 Создание приложения profiles..."
    python manage.py startapp profiles
fi

echo ""
echo "✅ User Service настроен!"
echo ""
echo "Следующие шаги:"
echo "make migrate-user"
echo "make run-user"
