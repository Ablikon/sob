from django.contrib import admin
from .models import Project, ProjectMember, Task

class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 1

class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ['title', 'status', 'priority', 'assignee_id', 'deadline']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'owner_id', 'start_date', 'deadline', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']
    inlines = [ProjectMemberInline, TaskInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'status')
        }),
        ('Даты', {
            'fields': ('start_date', 'end_date', 'deadline')
        }),
        ('Участники', {
            'fields': ('owner_id', 'teacher_id')
        }),
        ('Репозиторий', {
            'fields': ('repository_url',)
        }),
    )

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee_id', 'deadline']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description']
