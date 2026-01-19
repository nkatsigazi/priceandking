from django.db import models
from django.conf import settings
from django.utils import timezone
from simple_history.models import HistoricalRecords
from django.core.exceptions import ValidationError
from decimal import Decimal

# ---------------------------------------------------------
# 1. GENERAL LEDGER CORE (Chart of Accounts & Journalss)
# ---------------------------------------------------------

class Accounts(models.Model):
    """
    Chart of Accounts. 
    Hierarchical structure for Balance Sheet and P&L generation.
    """
    TYPE_CHOICES = (
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('INCOME', 'Revenue/Income'),
        ('EXPENSE', 'Expense'),
    )
    
    code = models.CharField(max_length=20, unique=True, help_text="e.g. 1000 for Cash, 4000 for Sales")
    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class JournalsEntry(models.Model):
    """
    A packet of debits and credits.
    Strictly enforcing Double-Entry: Total Debits must equal Total Credits.
    """
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('POSTED', 'Posted'),
        ('CANCELED', 'Voided'),
    )

    date = models.DateField(default=timezone.now)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True, help_text="External Ref (e.g. Invoice #101)")
    
    # Links to other apps for auditability
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    related_client = models.ForeignKey('crm.Client', on_delete=models.SET_NULL, null=True, blank=True)
    related_engagement = models.ForeignKey('crm.Engagement', on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    posted_at = models.DateTimeField(null=True, blank=True)
    
    history = HistoricalRecords()

    def validate_balanced(self):
        debits = sum(item.debit for item in self.items.all())
        credits = sum(item.credit for item in self.items.all())
        if debits != credits:
            raise ValidationError(f"Entry not balanced. Debits: {debits}, Credits: {credits}")

    def post(self):
        self.validate_balanced()
        self.status = 'POSTED'
        self.posted_at = timezone.now()
        self.save()

class JournalsItem(models.Model):
    """Individual line items in a journals entry."""
    entry = models.ForeignKey(JournalsEntry, related_name='items', on_delete=models.CASCADE)
    accounts = models.ForeignKey(Accounts, on_delete=models.PROTECT)
    debit = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    description = models.CharField(max_length=200, blank=True)

    def clean(self):
        if self.debit > 0 and self.credit > 0:
            raise ValidationError("A single line cannot have both debit and credit.")

# ---------------------------------------------------------
# 2. SUB-LEDGERS: INVOICING (Accounts Receivable)
# ---------------------------------------------------------

class Invoices(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent to Client'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('VOID', 'Void'),
    )

    client = models.ForeignKey('crm.Client', on_delete=models.PROTECT, related_name='invoicess')
    engagement = models.ForeignKey('crm.Engagement', on_delete=models.SET_NULL, null=True, blank=True)
    
    invoices_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    notes = models.TextField(blank=True)
    
    # Link to the GL Entry once posted
    journals_entry = models.OneToOneField(JournalsEntry, on_delete=models.SET_NULL, null=True, blank=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        # Auto-calculate totals
        if self.pk:
            self.subtotal = sum(line.amount for line in self.lines.all())
            self.total = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)

class InvoicesLine(models.Model):
    invoices = models.ForeignKey(Invoices, related_name='lines', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2) # Cached calc

    def save(self, *args, **kwargs):
        self.amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        # Trigger parent update
        self.invoices.save()

# ---------------------------------------------------------
# 3. EXPENSE MANAGEMENT (Accounts Payable / Staff Reimburse)
# ---------------------------------------------------------

class ExpenseClaim(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REIMBURSED', 'Reimbursed'),
        ('REJECTED', 'Rejected'),
    )

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    description = models.CharField(max_length=255)
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    receipt = models.FileField(upload_to='expenses/%Y/%m/', null=True, blank=True)
    
    # Identify if this is billable to a client
    is_billable = models.BooleanField(default=False)
    client = models.ForeignKey('crm.Client', on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='approved_expenses', on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.employee} - {self.amount}"

# ---------------------------------------------------------
# 4. ASSET MANAGEMENT STUB
# ---------------------------------------------------------
class Asset(models.Model):
    name = models.CharField(max_length=200)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    useful_life_years = models.IntegerField(default=5)
    depreciation_method = models.CharField(max_length=50, default='STRAIGHT_LINE')
    accumulated_depreciation = models.DecimalField(max_digits=12, decimal_places=2, default=0)

# ---------------------------------------------------------
# NEW: VENDOR MANAGEMENT (Accounts Payable)
# ---------------------------------------------------------
class Vendor(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    payment_terms = models.CharField(max_length=100, default='Net 30')
    currency = models.CharField(max_length=3, default='USD')
    
    def __str__(self):
        return self.name

class Bill(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
        ('VOID', 'Void'),
    )

    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name='bills')
    bill_number = models.CharField(max_length=50)
    issue_date = models.DateField(default=timezone.localdate) 
    due_date = models.DateField()
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    # Link to General Ledger
    journal_entry = models.OneToOneField('JournalsEntry', on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-calc due date if missing (simple +30 days logic)
        if not self.due_date:
            self.due_date = self.issue_date + timezone.timedelta(days=30)
        super().save(*args, **kwargs)