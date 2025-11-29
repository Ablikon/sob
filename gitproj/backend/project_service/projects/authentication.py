from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import exceptions

class CustomJWTAuthentication(JWTAuthentication):
    """Кастомная JWT аутентификация для микросервисов"""
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None
        
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except InvalidToken:
            raise exceptions.AuthenticationFailed('Invalid token')
    
    def get_user(self, validated_token):
        """Создаём фейкового пользователя из токена"""
        try:
            user_id = validated_token.get('user_id')
            
            class SimpleUser:
                def __init__(self, user_id):
                    self.id = user_id
                    self.is_authenticated = True
            
            return SimpleUser(user_id)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid token payload')
