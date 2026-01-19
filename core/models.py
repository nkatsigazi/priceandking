from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('PARTNER', 'Partner'),
        ('AUDIT_MGR', 'Audit Manager'),
        ('CONSULTANT', 'Consultant'),
        ('CLIENT', 'Client'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CONSULTANT')
    position = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    phone2 = models.CharField(max_length=20, blank=True)
    can_view_financials = models.BooleanField(default=False)
    can_manage_clients = models.BooleanField(default=False)

    # NEW PROFESSIONAL FIELDS
    bio = models.TextField(blank=True, help_text="Short professional biography")
    skills = models.JSONField(default=list, help_text="List of technical skills e.g. ['IFRS', 'GAAP', 'Python']")
    hourly_rate = models.DecimalField(max_digits=100, decimal_places=0, default=000)
    joining_date = models.DateField(null=True, blank=True)
    office_location = models.CharField(max_length=100, default='Headquarters')
    
    # KPIs (Cached/Denormalized for speed)
    billable_target = models.PositiveIntegerField(default=1600, help_text="Yearly billable hours target")
    
    # Avatar (Simulated with URL for now, or use ImageField)
    avatar_url = models.TextField(blank=True, null=True, help_text="Can be a URL or a Base64 encoded image string")

    # Use email for login instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=50)
    entity = models.CharField(max_length=100)
    entity_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)