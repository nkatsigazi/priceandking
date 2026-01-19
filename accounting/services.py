from django.db import transaction
from .models import JournalsEntry, JournalsItem, Accounts
from django.utils import timezone

class AccountingService:
    @staticmethod
    def post_invoices_to_gl(invoices, user):
        """
        Creates a Double-Entry Journals for a Sales Invoices.
        Dr Accounts Receivable
           Cr Sales Revenue
           Cr Sales Tax Payable
        """
        if invoices.status != 'SENT' or invoices.journals_entry:
            return # Already posted or not ready

        with transaction.atomic():
            # 1. Get Accounts (In a real app, fetch these from Settings)
            ar_accounts = Accounts.objects.get(code='1200') # Accounts Receivable
            sales_accounts = Accounts.objects.get(code='4000') # Sales Income
            tax_accounts = Accounts.objects.get(code='2100')   # Tax Payable

            # 2. Create Header
            je = JournalsEntry.objects.create(
                date=invoices.issue_date,
                description=f"Invoices #{invoices.invoices_number} - {invoices.client.name}",
                reference=invoices.invoices_number,
                created_by=user,
                related_client=invoices.client,
                related_engagement=invoices.engagement,
                status='POSTED',
                posted_at=timezone.now()
            )

            # 3. Create Debit (AR)
            JournalsItem.objects.create(
                entry=je, accounts=ar_accounts, 
                debit=invoices.total, credit=0
            )

            # 4. Create Credits (Revenue)
            JournalsItem.objects.create(
                entry=je, accounts=sales_accounts,
                debit=0, credit=invoices.subtotal
            )

            # 5. Create Credit (Tax)
            if invoices.tax_amount > 0:
                JournalsItem.objects.create(
                    entry=je, accounts=tax_accounts,
                    debit=0, credit=invoices.tax_amount
                )
            
            # 6. Link back
            invoices.journals_entry = je
            invoices.save()
            
            return je