from rest_framework import serializers
from django.db import transaction
from .models import Client, ClientContact, ClientNote, Engagement, EngagementTask, ClientDocument, PBCRequest
from core.serializers import UserSerializer
from core.models import User

class ClientContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientContact
        fields = ['id', 'client', 'name', 'email', 'phone', 'is_primary']

    def validate(self, data):
        if data.get('is_primary'):
            exists = ClientContact.objects.filter(
                client=data['client'],
                is_primary=True
            ).exists()
            if exists:
                raise serializers.ValidationError(
                    "This client already has a primary contact."
                )
        return data

class ClientNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = ClientNote
        fields = ['id', 'client', 'content', 'created_at', 'author', 'author_name', 'parent', 'replies', 'is_resolved']
        read_only_fields = ['created_at', 'author']

    def get_replies(self, obj):
        # Recursive serialization for threads
        if obj.replies.exists():
            return ClientNoteSerializer(obj.replies.all(), many=True).data
        return []

class EngagementTaskSerializer(serializers.ModelSerializer):
    preparer_name = serializers.ReadOnlyField(source='prepared_by.username')
    reviewer_name = serializers.ReadOnlyField(source='reviewed_by.username')
    
    class Meta:
        model = EngagementTask
        fields = '__all__'

class EngagementSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    tasks = EngagementTaskSerializer(many=True, read_only=True)
    client_name = serializers.ReadOnlyField(source='client.name')
    
    class Meta:
        model = Engagement
        fields = '__all__'
        
    def get_task_count(self, obj):
        return obj.tasks.count()

class ClientDocumentSerializer(serializers.ModelSerializer):
    uploader_name = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = ClientDocument
        fields = [
            'id',
            'client',
            'engagement',
            'file',
            'description',
            'uploaded_at',
            'uploaded_by',
            'uploader_name',
            'file_name',
            'is_verified',
            'category',
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by', 'client']

    def get_uploader_name(self, obj):
        return obj.uploaded_by.username if obj.uploaded_by else "System"

    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else ""

class ClientSerializer(serializers.ModelSerializer):
    partner = UserSerializer(source='assigned_partner', read_only=True)
    # Allow writing the ID. Filter queryset to only internal staff roles.
    assigned_partner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['PARTNER', 'AUDIT_MGR', 'CONSULTANT']),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['created_at']

class EngagementHistorySerializer(serializers.ModelSerializer):
    history_user_name = serializers.ReadOnlyField(source='history_user.username')
    
    class Meta:
        model = Engagement.history.model
        fields = ['history_id', 'history_date', 'history_type', 'history_user_name', 'fee', 'status', 'completion_percentage']

class PBCRequestSerializer(serializers.ModelSerializer):
    # Add extra fields to make it look professional on the frontend
    engagement_name = serializers.ReadOnlyField(source='engagement.name')
    
    class Meta:
        model = PBCRequest
        fields = ['id', 'engagement', 'engagement_name', 'title', 'description', 'status', 'attachment', 'requested_at']