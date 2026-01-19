from rest_framework.permissions import BasePermission

# crm/permissions.py

class IsPartnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        # Must be authenticated and either Partner or Superuser
        is_auth = bool(request.user and request.user.is_authenticated)
        is_staff = request.user.role == 'PARTNER' or request.user.is_superuser
        return is_auth and is_staff

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        # Allow any Partner to VIEW (GET) any client
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Restrict EDITING (POST, PATCH, DELETE) to the assigned partner
        if hasattr(obj, 'assigned_partner'):
            return obj.assigned_partner == request.user
        
        return False