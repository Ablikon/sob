from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone

from .models import Submission, Review, Attachment
from .serializers import (
    SubmissionSerializer, SubmissionCreateSerializer,
    ReviewSerializer, AttachmentSerializer, GradeSubmissionSerializer
)

class SubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сдачами работ"""
    
    queryset = Submission.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubmissionCreateSerializer
        return SubmissionSerializer
    
    def get_queryset(self):
        """Фильтрация сдач"""
        queryset = Submission.objects.all()
        
        # Фильтр по проекту
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Фильтр по студенту
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Фильтр по преподавателю
        teacher_id = self.request.query_params.get('teacher_id')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        
        # Фильтр по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @swagger_auto_schema(
        operation_description="Получить мои сдачи",
        manual_parameters=[
            openapi.Parameter('role', openapi.IN_QUERY, type=openapi.TYPE_STRING, 
                            description="student или teacher")
        ]
    )
    @action(detail=False, methods=['get'])
    def my_submissions(self, request):
        """Получить сдачи текущего пользователя"""
        user_id = request.user.id if hasattr(request.user, 'id') else None
        role = request.query_params.get('role', 'student')
        
        if role == 'teacher':
            submissions = Submission.objects.filter(teacher_id=user_id)
        else:
            submissions = Submission.objects.filter(student_id=user_id)
        
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Оценить работу",
        request_body=GradeSubmissionSerializer
    )
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Оценить работу"""
        submission = self.get_object()
        serializer = GradeSubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            submission.grade = serializer.validated_data['grade']
            submission.status = serializer.validated_data['status']
            submission.reviewed_at = timezone.now()
            submission.save()
            
            # Создаем отзыв если есть комментарий
            comment = serializer.validated_data.get('comment')
            if comment:
                Review.objects.create(
                    submission=submission,
                    reviewer_id=request.user.id,
                    comment=comment,
                    rating=serializer.validated_data['grade']
                )
            
            return Response(SubmissionSerializer(submission).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Добавить прикрепленный файл",
        request_body=AttachmentSerializer
    )
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """Добавить прикрепленный файл"""
        submission = self.get_object()
        serializer = AttachmentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(submission=submission)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet для управления отзывами"""
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Фильтрация отзывов"""
        queryset = Review.objects.all()
        
        # Фильтр по сдаче
        submission_id = self.request.query_params.get('submission_id')
        if submission_id:
            queryset = queryset.filter(submission_id=submission_id)
        
        return queryset
