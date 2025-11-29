from django.contrib import admin
from .models import UserProfile, Skill

class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'university', 'faculty', 'course', 'created_at']
    list_filter = ['university', 'faculty', 'course']
    search_fields = ['user_id', 'bio', 'university', 'faculty']
    inlines = [SkillInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user_id', 'bio', 'avatar_url', 'phone')
        }),
        ('Студент', {
            'fields': ('university', 'faculty', 'course', 'group')
        }),
        ('Преподаватель', {
            'fields': ('department', 'position')
        }),
        ('Социальные сети', {
            'fields': ('github', 'linkedin', 'telegram')
        }),
    )
