from django.db import models

class Project(models.Model):
    """Проект"""
    
    STATUS_CHOICES = [
        ('planning', 'Планирование'),
        ('in_progress', 'В процессе'),
        ('review', 'На проверке'),
        ('completed', 'Завершен'),
        ('archived', 'Архивирован'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning', verbose_name='Статус')
    
    # Даты
    start_date = models.DateField(null=True, blank=True, verbose_name='Дата начала')
    end_date = models.DateField(null=True, blank=True, verbose_name='Дата окончания')
    deadline = models.DateField(null=True, blank=True, verbose_name='Дедлайн')
    
    # Связи с другими сервисами
    owner_id = models.IntegerField(verbose_name='ID владельца')
    teacher_id = models.IntegerField(null=True, blank=True, verbose_name='ID преподавателя')
    
    # Репозиторий
    repository_url = models.URLField(blank=True, verbose_name='URL репозитория')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class ProjectMember(models.Model):
    """Участник проекта"""
    
    ROLE_CHOICES = [
        ('owner', 'Владелец'),
        ('member', 'Участник'),
        ('viewer', 'Наблюдатель'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members', verbose_name='Проект')
    user_id = models.IntegerField(verbose_name='ID пользователя')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member', verbose_name='Роль')
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата присоединения')
    
    class Meta:
        verbose_name = 'Участник проекта'
        verbose_name_plural = 'Участники проектов'
        unique_together = ['project', 'user_id']
    
    def __str__(self):
        return f"User {self.user_id} in {self.project.title}"


class Task(models.Model):
    """Задача в проекте"""
    
    STATUS_CHOICES = [
        ('todo', 'К выполнению'),
        ('in_progress', 'В процессе'),
        ('review', 'На проверке'),
        ('done', 'Выполнено'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('urgent', 'Срочный'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', verbose_name='Проект')
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo', verbose_name='Статус')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='Приоритет')
    
    assignee_id = models.IntegerField(null=True, blank=True, verbose_name='ID исполнителя')
    deadline = models.DateField(null=True, blank=True, verbose_name='Дедлайн')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.project.title})"
