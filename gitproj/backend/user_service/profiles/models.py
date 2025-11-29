from django.db import models

class UserProfile(models.Model):
    """Профиль пользователя (расширение из Auth Service)"""
    
    user_id = models.IntegerField(unique=True, verbose_name='ID пользователя')
    bio = models.TextField(blank=True, verbose_name='О себе')
    avatar_url = models.URLField(blank=True, verbose_name='URL аватара')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    
    # Для студентов
    university = models.CharField(max_length=200, blank=True, verbose_name='Университет')
    faculty = models.CharField(max_length=200, blank=True, verbose_name='Факультет')
    course = models.IntegerField(null=True, blank=True, verbose_name='Курс')
    group = models.CharField(max_length=50, blank=True, verbose_name='Группа')
    
    # Для преподавателей
    department = models.CharField(max_length=200, blank=True, verbose_name='Кафедра')
    position = models.CharField(max_length=100, blank=True, verbose_name='Должность')
    
    # Социальные сети
    github = models.URLField(blank=True, verbose_name='GitHub')
    linkedin = models.URLField(blank=True, verbose_name='LinkedIn')
    telegram = models.CharField(max_length=100, blank=True, verbose_name='Telegram')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Profile #{self.user_id}"


class Skill(models.Model):
    """Навыки пользователя"""
    
    SKILL_LEVELS = [
        ('beginner', 'Начальный'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
        ('expert', 'Эксперт'),
    ]
    
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills', verbose_name='Профиль')
    name = models.CharField(max_length=100, verbose_name='Название')
    level = models.CharField(max_length=20, choices=SKILL_LEVELS, default='intermediate', verbose_name='Уровень')
    
    class Meta:
        verbose_name = 'Навык'
        verbose_name_plural = 'Навыки'
        unique_together = ['profile', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"
