from django.core.management.base import BaseCommand
from accounting.models import Account

class Command(BaseCommand):
    help = 'Populates the initial Chart of Accounts'

    def handle(self, *args, **kwargs):
        ACCOUNTS = [
            # ASSETS
            ('1000', 'Cash & Bank', 'ASSET', 'Primary operating bank accounts'),
            ('1200', 'Accounts Receivable', 'ASSET', 'Unpaid client invoices'),
            # LIABILITIES
            ('2000', 'Accounts Payable', 'LIABILITY', 'Money owed to vendors'),
            ('2100', 'Sales Tax Payable', 'LIABILITY', 'VAT/GST collected'),
            # EQUITY
            ('3000', 'Owner Capital', 'EQUITY', 'Initial investment'),
            ('3200', 'Retained Earnings', 'EQUITY', 'Profits reinvested'),
            # INCOME
            ('4000', 'Audit Fees', 'INCOME', 'Revenue from audits'),
            ('4100', 'Tax Advisory', 'INCOME', 'Revenue from tax services'),
            # EXPENSES
            ('5000', 'Salaries & Wages', 'EXPENSE', 'Staff payroll'),
            ('5100', 'Office Rent', 'EXPENSE', 'Office lease payments'),
            ('5200', 'Software Costs', 'EXPENSE', 'Tech stack and licenses'),
        ]

        self.stdout.write("Seeding Chart of Accounts...")
        
        count = 0
        for code, name, acc_type, desc in ACCOUNTS:
            obj, created = Account.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'account_type': acc_type,
                    'description': desc
                }
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} new accounts.'))