from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from core.views import StaffManageViewSet, get_current_user
from accounting.views import AccountsViewSet, InvoicesViewSet, JournalsViewSet, VendorViewSet, BillViewSet
from crm.views import ClientViewSet, ClientContactViewSet, EngagementViewSet, EngagementTaskViewSet, ClientDocumentViewSet, ClientNoteViewSet
from portal.views import PortalViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'staff', StaffManageViewSet, basename='staff')
router.register(r'accounts', AccountsViewSet, basename='accounts')
router.register(r'invoices', InvoicesViewSet, basename='invoices')
router.register(r'journalss', JournalsViewSet, basename='journalss')
router.register(r'vendors', VendorViewSet, basename='vendors')
router.register(r'bills', BillViewSet, basename='bills')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'client-contacts', ClientContactViewSet, basename='client-contacts')
router.register(r'engagements', EngagementViewSet, basename='engagements')
router.register(r'engagement-tasks', EngagementTaskViewSet, basename='engagement-task')
router.register(r'documents', ClientDocumentViewSet, basename='documents')
router.register(r'notes', ClientNoteViewSet, basename='notes')
router.register(r'portal', PortalViewSet, basename='portal')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Login URL
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('staff/me/', get_current_user, name='staff-me'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)