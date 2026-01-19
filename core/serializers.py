from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Added: bio, skills, hourly_rate, joining_date, avatar_url, can_view_financials
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email', 'role', 'phone', 'phone2',
            'position', 'password', 'bio', 'skills', 'hourly_rate', 
            'joining_date', 'avatar_url', 'can_view_financials', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        # Handle password update separately if provided
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance