from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Расширенная модель пользователя"""
    
    ROLE_CHOICES = [
        ('student', 'Студент'),
        ('teacher', 'Преподаватель'),
        ('admin', 'Администратор'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='Email')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student', verbose_name='Роль')
    student_id = models.CharField(max_length=50, blank=True, null=True, verbose_name='ID студента')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
