from rest_framework import serializers
# Update the import to include Vendor and Bill
from .models import Accounts, JournalsEntry, JournalsItem, Invoices, InvoicesLine, ExpenseClaim, Vendor, Bill

class AccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accounts
        fields = '__all__'

class JournalsItemSerializer(serializers.ModelSerializer):
    accounts_name = serializers.ReadOnlyField(source='accounts.name')
    class Meta:
        model = JournalsItem
        fields = ['id', 'accounts', 'accounts_name', 'debit', 'credit', 'description']

class JournalsEntrySerializer(serializers.ModelSerializer):
    items = JournalsItemSerializer(many=True)
    total_debit = serializers.SerializerMethodField()
    total_credit = serializers.SerializerMethodField()

    class Meta:
        model = JournalsEntry
        fields = '__all__'

    def get_total_debit(self, obj):
        return sum(item.debit for item in obj.items.all())

    def get_total_credit(self, obj):
        return sum(item.credit for item in obj.items.all())

class InvoicesLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoicesLine
        fields = ['id', 'description', 'quantity', 'unit_price', 'amount']
        read_only_fields = ['amount']

class InvoicesSerializer(serializers.ModelSerializer):
    lines = InvoicesLineSerializer(many=True)
    client_name = serializers.ReadOnlyField(source='client.name')
    
    class Meta:
        model = Invoices
        fields = '__all__'
        read_only_fields = ['subtotal', 'total', 'journals_entry', 'invoices_number']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        # Simple auto-increment logic for demo
        last_id = Invoices.objects.order_by('-id').first()
        new_id = (last_id.id + 1) if last_id else 1
        validated_data['invoices_number'] = f"INV-{2024}-{new_id:04d}"
        
        invoices = Invoices.objects.create(**validated_data)
        for line_data in lines_data:
            InvoicesLine.objects.create(invoices=invoices, **line_data)
        
        invoices.save() # Triggers total recalc
        return invoices

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name', 'email', 'tax_id', 'payment_terms', 'currency']

class BillSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.name')
    issue_date = serializers.DateField(input_formats=['%Y-%m-%d', 'iso-8601'], required=False)
    due_date = serializers.DateField(input_formats=['%Y-%m-%d', 'iso-8601'])

    class Meta:
        model = Bill
        fields = ['id', 'vendor', 'vendor_name', 'bill_number', 'issue_date', 'due_date', 'total_amount', 'status']