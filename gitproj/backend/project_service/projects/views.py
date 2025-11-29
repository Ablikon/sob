from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Project, ProjectMember, Task
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer,
    ProjectMemberSerializer, TaskSerializer
)

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet для управления проектами"""
    
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        """Фильтрация проектов - возвращаем ВСЕ проекты по умолчанию"""
        queryset = Project.objects.all().prefetch_related('members', 'tasks')
        
        # Фильтр по статусу (опционально)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Фильтр по владельцу (опционально)
        owner_id = self.request.query_params.get('owner_id')
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        
        return queryset.distinct()
    
    @swagger_auto_schema(
        operation_description="Получить мои проекты"
    )
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Получить проекты текущего пользователя"""
        user_id = request.user.id if hasattr(request.user, 'id') else None
        projects = Project.objects.filter(members__user_id=user_id)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Добавить участника в проект",
        request_body=ProjectMemberSerializer
    )
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Добавить участника в проект"""
        project = self.get_object()
        serializer = ProjectMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Удалить участника из проекта"
    )
    @action(detail=True, methods=['delete'], url_path='remove_member/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        """Удалить участника из проекта"""
        project = self.get_object()
        
        try:
            member = ProjectMember.objects.get(project=project, user_id=user_id)
            if member.role == 'owner':
                return Response(
                    {"detail": "Cannot remove project owner"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectMember.DoesNotExist:
            return Response(
                {"detail": "Member not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet для управления задачами"""
    
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Фильтрация задач"""
        queryset = Task.objects.all()
        
        # Фильтр по проекту
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Фильтр по исполнителю
        assignee_id = self.request.query_params.get('assignee_id')
        if assignee_id:
            queryset = queryset.filter(assignee_id=assignee_id)
        
        # Фильтр по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @swagger_auto_schema(
        operation_description="Получить мои задачи"
    )
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Получить задачи текущего пользователя"""
        user_id = request.user.id if hasattr(request.user, 'id') else None
        tasks = Task.objects.filter(assignee_id=user_id)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
