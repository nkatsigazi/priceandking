from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from simple_history.models import HistoricalRecords

class Client(models.Model):
    ENTITY_CHOICES = [
        ('INDIVIDUAL', 'Individual'),
        ('LLC', 'Limited Liability Company'),
        ('CORP', 'Corporation'),
        ('PARTNERSHIP', 'Partnership'),
        ('NGO', 'Non-Profit'),
    ]

    name = models.CharField(max_length=255)
    tax_id_number = models.CharField(max_length=50, unique=True)
    entity_type = models.CharField(max_length=20, choices=ENTITY_CHOICES, default='LLC')
    industry = models.CharField(max_length=100, blank=True)
    assigned_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_clients'
    )
    fiscal_year_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # NEW FIELDS FOR DEPTH
    risk_rating = models.CharField(max_length=10, choices=[('LOW', 'Low'), ('MED', 'Medium'), ('HIGH', 'High')], default='LOW')
    billing_address = models.TextField(blank=True)
    primary_currency = models.CharField(max_length=3, default='USD')
    website = models.URLField(blank=True)
    
    # COMPLIANCE
    last_audit_date = models.DateField(null=True, blank=True)
    partner_rotation_due = models.DateField(null=True, help_text="Date when lead partner must rotate off")

    def __str__(self):
        return self.name

class ClientContact(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='contacts')
    # ADD THIS FIELD:
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='client_profile'
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.client.name})"

class ClientNote(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Note by {self.author} on {self.created_at}"

class Engagement(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('FIELDWORK', 'Fieldwork'),
        ('REVIEW', 'Partner Review'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    ]
    TYPE_CHOICES = [
        ('AUDIT', 'Audit'),
        ('TAX', 'Tax Preparation'),
        ('ADVISORY', 'Advisory'),
    ]

    # Expanded Fields for "World Class" Audit tracking
    history = HistoricalRecords() # Tracks every change, who made it, and when.
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='engagements')
    name = models.CharField(max_length=200)
    engagement_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='AUDIT')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    
    # New Fields
    start_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    lead_auditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='led_engagements')
    methodology = models.CharField(max_length=100, default='Standard Audit', help_text="e.g. GAAP, IFRS")
    completion_percentage = models.IntegerField(default=0) # Denormalized for dashboard speed

    year = models.IntegerField(default=2024)
    fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def update_progress(self):
        # Helper to auto-calculate progress based on tasks
        total = self.tasks.count()
        if total == 0: return
        completed = self.tasks.filter(status='DONE').count()
        self.completion_percentage = int((completed / total) * 100)
        self.save()

class EngagementTask(models.Model):
    TASK_STATUS = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('REVIEW', 'In Review'),
        ('DONE', 'Done'),
    ]

    history = HistoricalRecords()
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='PENDING')
    is_milestone = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # 1st Level Sign-off (Preparer)
    prepared_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='prepared_tasks', null=True, on_delete=models.SET_NULL)
    prepared_at = models.DateTimeField(null=True, blank=True)

    # 2nd Level Sign-off (Reviewer)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviewed_tasks', null=True, on_delete=models.SET_NULL)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.engagement.name})"

    def sign_off_prepare(self, user):
        self.prepared_by = user
        self.prepared_at = timezone.now()
        self.status = 'REVIEW' # Auto-move to review
        self.save()

    def sign_off_review(self, user):
        if self.prepared_by == user:
            raise ValueError("The preparer cannot be the reviewer.")
        if not self.prepared_by:
            raise ValueError("Task must be prepared before review.")
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.status = 'DONE'
        self.save()

@receiver([post_save, post_delete], sender=EngagementTask)
def update_engagement_progress(sender, instance, **kwargs):
    engagement = instance.engagement
    total = engagement.tasks.count()
    if total > 0:
        completed = engagement.tasks.filter(status='DONE').count()
        engagement.completion_percentage = int((completed / total) * 100)
    else:
        engagement.completion_percentage = 0
    engagement.save(update_fields=['completion_percentage'])

class ClientDocument(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='documents')
    # Link document to a specific engagement (optional)
    engagement = models.ForeignKey(Engagement, on_delete=models.SET_NULL, null=True, blank=True, related_name='workpapers')
    # engagement = models.ForeignKey('Engagement', on_delete=models.CASCADE, null=True, blank=True, related_name='documents') 
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    file = models.FileField(upload_to='client_docs/%Y/%m/')
    description = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    history = HistoricalRecords()
    category = models.CharField(
        max_length=50,
        choices=[
            ('GENERAL_LEDGER', 'General Ledger'),
            ('BANK_STATEMENT', 'Bank Statement'),
            ('TAX_RETURN', 'Tax Return'),
            ('PAYROLL', 'Payroll Records'),
            ('OTHER', 'Other')
        ],
        default='OTHER'
    )

    def __str__(self):
        return self.description


class PBCRequest(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'), 
        ('SUBMITTED', 'Submitted by Client'), 
        ('ACCEPTED', 'Accepted'), 
        ('REJECTED', 'Returned')
    ]
    
    engagement = models.ForeignKey(Engagement, on_delete=models.CASCADE, related_name='pbc_requests')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    attachment = models.FileField(upload_to='pbc_uploads/', null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title