from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

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
        password = validated_data.pop('password', None)
        
        # If email is changed, keep username in sync
        if 'email' in validated_data:
            validated_data['username'] = validated_data['email']
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class MyTokenSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        self.fields.pop('username', None)

    def validate(self, attrs):
        # Map 'email' to 'username' so the parent class can process it
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

# Then use this serializer in your view
class MyTokenView(TokenObtainPairView):
    serializer_class = MyTokenSerializer