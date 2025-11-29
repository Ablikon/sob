from django.db import models

class Submission(models.Model):
    """Сдача работы"""
    
    STATUS_CHOICES = [
        ('pending', 'Ожидает проверки'),
        ('reviewing', 'На проверке'),
        ('approved', 'Принято'),
        ('rejected', 'Отклонено'),
        ('revision', 'Требует доработки'),
    ]
    
    project_id = models.IntegerField(verbose_name='ID проекта')
    student_id = models.IntegerField(verbose_name='ID студента')
    teacher_id = models.IntegerField(null=True, blank=True, verbose_name='ID преподавателя')
    
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    
    # Ссылки
    repository_url = models.URLField(blank=True, verbose_name='URL репозитория')
    demo_url = models.URLField(blank=True, verbose_name='URL демо')
    documentation_url = models.URLField(blank=True, verbose_name='URL документации')
    
    # Оценка
    grade = models.IntegerField(null=True, blank=True, verbose_name='Оценка')
    max_grade = models.IntegerField(default=100, verbose_name='Максимальная оценка')
    
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата сдачи')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата проверки')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Сдача работы'
        verbose_name_plural = 'Сдачи работ'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class Review(models.Model):
    """Отзыв преподавателя"""
    
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='reviews', verbose_name='Сдача')
    reviewer_id = models.IntegerField(verbose_name='ID проверяющего')
    
    comment = models.TextField(verbose_name='Комментарий')
    rating = models.IntegerField(null=True, blank=True, verbose_name='Рейтинг')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.reviewer_id} on {self.submission.title}"


class Attachment(models.Model):
    """Прикрепленный файл"""
    
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='attachments', verbose_name='Сдача')
    
    name = models.CharField(max_length=200, verbose_name='Название')
    file_url = models.URLField(verbose_name='URL файла')
    file_type = models.CharField(max_length=50, blank=True, verbose_name='Тип файла')
    file_size = models.IntegerField(null=True, blank=True, verbose_name='Размер файла (байты)')
    
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата загрузки')
    
    class Meta:
        verbose_name = 'Прикрепленный файл'
        verbose_name_plural = 'Прикрепленные файлы'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.name
