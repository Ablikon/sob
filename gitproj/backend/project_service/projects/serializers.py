from rest_framework import serializers
from .models import Project, ProjectMember, Task

class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMember
        fields = ['id', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'description', 'status', 'priority', 
                  'assignee_id', 'deadline', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'start_date', 'end_date', 
                  'deadline', 'owner_id', 'teacher_id', 'repository_url',
                  'members', 'tasks', 'members_count', 'tasks_count',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description', 'status', 'start_date', 'end_date', 
                  'deadline', 'owner_id', 'teacher_id', 'repository_url']
    
    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        # Автоматически добавляем владельца как участника
        ProjectMember.objects.create(
            project=project,
            user_id=validated_data['owner_id'],
            role='owner'
        )
        return project
