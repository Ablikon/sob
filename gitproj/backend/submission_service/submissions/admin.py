from django.contrib import admin
from .models import Submission, Review, Attachment

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0

class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['title', 'student_id', 'status', 'grade', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['title', 'description']
    inlines = [ReviewInline, AttachmentInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('project_id', 'student_id', 'teacher_id', 'title', 'description', 'status')
        }),
        ('Ссылки', {
            'fields': ('repository_url', 'demo_url', 'documentation_url')
        }),
        ('Оценка', {
            'fields': ('grade', 'max_grade', 'reviewed_at')
        }),
    )

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['submission', 'reviewer_id', 'rating', 'created_at']
    list_filter = ['created_at']
    search_fields = ['comment']
