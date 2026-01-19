from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import User
from .serializers import UserSerializer

class IsPartnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'PARTNER' or request.user.is_superuser)
        )

# Combine into ONE class
class StaffManageViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Allow anyone authenticated to see their own profile ('me')
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        # Restrict management actions to Partners/Admins
        return [IsPartnerOrAdmin()]

    def get_queryset(self):
        return User.objects.exclude(role='CLIENT').order_by('last_name')

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"message": "User deactivated"}, status=status.HTTP_204_NO_CONTENT)

# Add this for your urls.py path('staff/me/', get_current_user)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)