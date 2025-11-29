from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import UserProfile, Skill
from .serializers import UserProfileSerializer, UserProfileCreateSerializer, SkillSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet для управления профилями пользователей"""
    
    queryset = UserProfile.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserProfileCreateSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
        """Автоматически устанавливаем user_id из токена при создании"""
        user_id = self.request.user.id if hasattr(self.request.user, 'id') else None
        if user_id:
            serializer.save(user_id=user_id)
        else:
            serializer.save()
    
    @swagger_auto_schema(
        operation_description="Получить профиль текущего пользователя"
    )
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить профиль текущего пользователя из JWT токена"""
        # Получаем user_id из JWT токена
        user_id = request.user.id if hasattr(request.user, 'id') else None
        
        if not user_id:
            return Response(
                {"detail": "User ID not found in token"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            profile = UserProfile.objects.get(user_id=user_id)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @swagger_auto_schema(
        operation_description="Добавить навык к профилю",
        request_body=SkillSerializer
    )
    @action(detail=True, methods=['post'])
    def add_skill(self, request, pk=None):
        """Добавить навык к профилю"""
        profile = self.get_object()
        serializer = SkillSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Удалить навык из профиля"
    )
    @action(detail=True, methods=['delete'], url_path='remove_skill/(?P<skill_id>[^/.]+)')
    def remove_skill(self, request, pk=None, skill_id=None):
        """Удалить навык из профиля"""
        profile = self.get_object()
        
        try:
            skill = Skill.objects.get(id=skill_id, profile=profile)
            skill.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Skill.DoesNotExist:
            return Response(
                {"detail": "Skill not found"},
                status=status.HTTP_404_NOT_FOUND
            )
