from rest_framework import serializers
from .models import Submission, Review, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'name', 'file_url', 'file_type', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'submission', 'reviewer_id', 'comment', 'rating', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class SubmissionSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    grade_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'project_id', 'student_id', 'teacher_id',
            'title', 'description', 'status',
            'repository_url', 'demo_url', 'documentation_url',
            'grade', 'max_grade', 'grade_percentage',
            'reviews', 'attachments',
            'submitted_at', 'reviewed_at', 'updated_at'
        ]
        read_only_fields = ['id', 'submitted_at', 'reviewed_at', 'updated_at']
    
    def get_grade_percentage(self, obj):
        if obj.grade and obj.max_grade:
            return round((obj.grade / obj.max_grade) * 100, 2)
        return None

class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            'project_id', 'student_id', 'teacher_id',
            'title', 'description',
            'repository_url', 'demo_url', 'documentation_url'
        ]

class GradeSubmissionSerializer(serializers.Serializer):
    grade = serializers.IntegerField(min_value=0)
    status = serializers.ChoiceField(choices=Submission.STATUS_CHOICES)
    comment = serializers.CharField(required=False, allow_blank=True)
