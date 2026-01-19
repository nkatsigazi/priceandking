from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Accounts, JournalsEntry, Invoices, Vendor, Bill
from .serializers import (
    AccountsSerializer, JournalsEntrySerializer, InvoicesSerializer, 
    VendorSerializer, BillSerializer
)
from .services import AccountingService

class AccountsViewSet(viewsets.ModelViewSet):
    queryset = Accounts.objects.all().order_by('code')
    serializer_class = AccountsSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def seed(self, request):
        """One-click setup for Chart of Accounts so it's not empty"""
        defaults = [
            ('1000', 'Cash on Hand', 'ASSET'),
            ('1200', 'Accounts Receivable', 'ASSET'),
            ('1500', 'Equipment & Machinery', 'ASSET'),
            ('2000', 'Accounts Payable', 'LIABILITY'),
            ('2100', 'Sales Tax Payable', 'LIABILITY'),
            ('3000', 'Owner Equity', 'EQUITY'),
            ('4000', 'Sales Revenue', 'INCOME'),
            ('4100', 'Consulting Income', 'INCOME'),
            ('5000', 'Rent Expense', 'EXPENSE'),
            ('5100', 'Salaries & Wages', 'EXPENSE'),
            ('5200', 'Software Subscriptions', 'EXPENSE'),
        ]
        created_count = 0
        for code, name, type_ in defaults:
            obj, created = Accounts.objects.get_or_create(
                code=code, 
                defaults={'name': name, 'account_type': type_}
            )
            if created: created_count += 1
        return Response({'message': f'Created {created_count} standard accounts.'})

    @action(detail=False, methods=['get'])
    def financial_statements(self, request):
        """Generates P&L and Balance Sheet together"""
        # --- PROFIT & LOSS ---
        income = Accounts.objects.filter(account_type='INCOME')
        expenses = Accounts.objects.filter(account_type='EXPENSE')
        
        pl_data = {'INCOME': [], 'EXPENSE': []}
        pl_totals = {'INCOME': 0, 'EXPENSE': 0}

        def get_balance(qs, type_name):
            for acc in qs:
                # Calculate Net Movement (Post-close trial balance style)
                txs = acc.journalsitem_set.filter(entry__status='POSTED')
                debits = txs.aggregate(Sum('debit'))['debit__sum'] or 0
                credits = txs.aggregate(Sum('credit'))['credit__sum'] or 0
                
                # Income = Credit normal, Expense = Debit normal
                balance = (credits - debits) if type_name == 'INCOME' else (debits - credits)
                
                if balance != 0:
                    pl_data[type_name].append({'name': acc.name, 'code': acc.code, 'balance': balance})
                    pl_totals[type_name] += balance
        
        get_balance(income, 'INCOME')
        get_balance(expenses, 'EXPENSE')

        net_income = pl_totals['INCOME'] - pl_totals['EXPENSE']

        # --- BALANCE SHEET ---
        bs_data = {'ASSET': [], 'LIABILITY': [], 'EQUITY': []}
        bs_totals = {'ASSET': 0, 'LIABILITY': 0, 'EQUITY': 0}
        
        bs_accounts = Accounts.objects.filter(account_type__in=['ASSET', 'LIABILITY', 'EQUITY'])

        for acc in bs_accounts:
            txs = acc.journalsitem_set.filter(entry__status='POSTED')
            debits = txs.aggregate(Sum('debit'))['debit__sum'] or 0
            credits = txs.aggregate(Sum('credit'))['credit__sum'] or 0
            
            if acc.account_type == 'ASSET':
                balance = debits - credits
            else:
                balance = credits - debits
            
            if balance != 0:
                bs_data[acc.account_type].append({'name': acc.name, 'code': acc.code, 'balance': balance})
                bs_totals[acc.account_type] += balance

        # Add Net Income to Equity for the report (Retained Earnings simulation)
        bs_totals['EQUITY'] += net_income
        bs_data['EQUITY'].append({'name': 'Net Income (Current Period)', 'code': '9999', 'balance': net_income})

        return Response({
            'pl': {
                'data': pl_data,
                'totals': pl_totals,
                'net_income': net_income
            },
            'bs': {
                'data': bs_data,
                'totals': bs_totals,
                'check': bs_totals['ASSET'] - (bs_totals['LIABILITY'] + bs_totals['EQUITY'])
            }
        })

class InvoicesViewSet(viewsets.ModelViewSet):
    queryset = Invoices.objects.all().order_by('-id') 
    serializer_class = InvoicesSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def finalize_and_send(self, request, pk=None):
        """Locks the invoice and posts to GL"""
        invoices = self.get_object()
        if invoices.status != 'DRAFT':
            return Response({'error': 'Only draft invoices can be finalized'}, status=400)
        
        invoices.status = 'SENT'
        invoices.save()
        
        # Post to GL automatically
        AccountingService.post_invoices_to_gl(invoices, request.user)
        
        return Response({'status': 'Invoice Finalized and Posted to GL'})

class JournalsViewSet(viewsets.ModelViewSet):
    queryset = JournalsEntry.objects.all().order_by('-date')
    serializer_class = JournalsEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all().order_by('-due_date')
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]