from rest_framework import serializers
from .models import UserProfile, Skill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'level']

class UserProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_id', 'bio', 'avatar_url', 'phone',
            'university', 'faculty', 'course', 'group',
            'department', 'position',
            'github', 'linkedin', 'telegram',
            'skills', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserProfileCreateSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, required=False)
    
    class Meta:
        model = UserProfile
        fields = [
            'user_id', 'bio', 'avatar_url', 'phone',
            'university', 'faculty', 'course', 'group',
            'department', 'position',
            'github', 'linkedin', 'telegram',
            'skills'
        ]
    
    def create(self, validated_data):
        skills_data = validated_data.pop('skills', [])
        profile = UserProfile.objects.create(**validated_data)
        
        for skill_data in skills_data:
            Skill.objects.create(profile=profile, **skill_data)
        
        return profile
    
    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if skills_data is not None:
            instance.skills.all().delete()
            for skill_data in skills_data:
                Skill.objects.create(profile=instance, **skill_data)
        
        return instance
