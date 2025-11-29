#!/bin/bash

set -e

echo "🚀 Настройка Project Service..."

mkdir -p backend/project_service
cd backend/project_service || exit

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
    django-admin startproject project_service .
fi

if [ ! -d "projects" ]; then
    echo "📱 Создание приложения projects..."
    python manage.py startapp projects
fi

echo ""
echo "✅ Project Service настроен!"
echo ""
echo "Следующие шаги:"
echo "make migrate-project"
echo "make run-project"
