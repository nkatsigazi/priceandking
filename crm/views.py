from django.shortcuts import render
from django.db import transaction
from rest_framework import viewsets, permissions, filters, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client, ClientContact, Engagement, ClientDocument, ClientNote, PBCRequest, EngagementTask
from .serializers import ClientSerializer, ClientContactSerializer, EngagementSerializer, EngagementTaskSerializer, ClientDocumentSerializer, ClientNoteSerializer, EngagementHistorySerializer, PBCRequestSerializer
from .permissions import IsPartnerOrAdmin
from core.models import User
from django.utils import timezone

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsPartnerOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'tax_id_number']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Client.objects.all().order_by('name')
        return Client.objects.filter(assigned_partner=user).order_by('name')

    # 1. New Action to fetch list of assignable users (Partners/Managers)
    @action(detail=False, methods=['get'])
    def partners(self, request):
        """Returns list of internal staff for dropdowns"""
        staff = User.objects.filter(
            role__in=['PARTNER', 'AUDIT_MGR', 'CONSULTANT']
        ).values('id', 'username', 'email', 'role')
        return Response(staff)

    # 2. Update perform_create to handle standard creation (if used)
    def perform_create(self, serializer):
        # Only auto-assign if not provided in payload
        if not serializer.validated_data.get('assigned_partner'):
            serializer.save(assigned_partner=self.request.user)
        else:
            serializer.save()

    # 3. Update the custom create method (World-Class Workflow)
    def create(self, request, *args, **kwargs):
        email = request.data.get('primary_email')
        password = request.data.get('initial_password')
        name = request.data.get('name')
        
        # Capture the manually selected partner ID
        assigned_partner_id = request.data.get('assigned_partner')
        
        # Default to current user if no partner selected
        if assigned_partner_id:
            assigned_partner = User.objects.get(pk=assigned_partner_id)
        else:
            assigned_partner = request.user

        with transaction.atomic():
            # 1. Create User (Portal Login)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                role='CLIENT'
            )

            # 2. Create Client Entity with manual partner assignment
            client = Client.objects.create(
                name=name,
                entity_type=request.data.get('entity_type'),
                tax_id_number=request.data.get('tax_id_number'),
                industry=request.data.get('industry'),
                fiscal_year_end=request.data.get('fiscal_year_end'),
                assigned_partner=assigned_partner  # <--- UPDATED
            )

            # 3. Create Contact
            ClientContact.objects.create(
                client=client,
                user=user,
                name=f"{name} Primary Admin",
                email=email,
                is_primary=True
            )

            serializer = self.get_serializer(client)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class ClientContactViewSet(viewsets.ModelViewSet):
    serializer_class = ClientContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.request.query_params.get('client')
        return ClientContact.objects.filter(client_id=client_id)

class EngagementViewSet(viewsets.ModelViewSet):
    serializer_class = EngagementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Engagement.objects.all().order_by('-year')

        # SECURITY: If user is a Client, they only see their own engagements
        if user.role == 'CLIENT':
            return queryset.filter(client__contacts__user=user)
        
        # Filter by client if provided in URL
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset

    @action(detail=True, methods=['get'])
    def unified_history(self, request, pk=None):
        engagement = self.get_object()
        combined = []

        # 1. ENGAGEMENT LOGS
        for h in engagement.history.all():
            action_map = {'+': 'Engagement Opened', '~': 'Details Updated', '-': 'Engagement Deleted'}
            combined.append({
                'date': h.history_date,
                'user': h.history_user.username if h.history_user else 'System',
                'type': 'ENGAGEMENT',
                'action': action_map.get(h.history_type, 'Action'),
                'details': f"Status set to {h.status}. Progress: {h.completion_percentage}%",
                'severity': 'info'
            })

        # 2. PROCEDURE (TASK) LOGS - Handles Deletions and Sign-offs
        task_h = EngagementTask.history.filter(engagement=engagement)
        for h in task_h:
            # Determine exact action
            if h.history_type == '+':
                action = "New Procedure Added"
            elif h.history_type == '-':
                action = "❌ Procedure Removed"
            elif h.status == 'DONE':
                action = "✅ Audit Sign-off"
            elif h.status == 'REVIEW':
                action = "👀 Submitted for Review"
            else:
                action = "Procedure Modified"

            combined.append({
                'date': h.history_date,
                'user': h.history_user.username if h.history_user else 'System',
                'type': 'PROCEDURE',
                'action': action,
                'details': f"Ref: {h.title}",
                'severity': 'success' if h.status == 'DONE' else 'warning' if h.history_type == '-' else 'info'
            })

        # 3. WORKPAPER (DOCUMENT) LOGS
        if hasattr(ClientDocument, 'history'):
            doc_h = ClientDocument.history.filter(engagement=engagement)
            for h in doc_h:
                action = "📁 Workpaper Uploaded" if h.history_type == '+' else "Workpaper Modified"
                if h.history_type == '-': action = "🗑️ Workpaper Deleted"
                
                combined.append({
                    'date': h.history_date,
                    'user': h.history_user.username if h.history_user else 'System',
                    'type': 'DOCUMENT',
                    'action': action,
                    'details': f"File: {h.description}",
                    'severity': 'primary'
                })

        combined.sort(key=lambda x: x['date'], reverse=True)
        return Response(combined)

    @action(detail=False, methods=['post'])
    def create_with_user(self, request):
        """
        World-Class Workflow: Creates a Client (Company) AND a User (Login)
        """
        company_name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password') # In prod, send a 'Reset Password' link instead

        with transaction.atomic():
            # 1. Create the User Login
            user = User.objects.create_user(
                email=email,
                username=email,
                password=password,
                role='CLIENT'
            )

            # 2. Create the Client Entity
            client = Client.objects.create(
                name=company_name,
                assigned_partner=request.user
            )

            # 3. Link User to Client via Contact
            ClientContact.objects.create(
                client=client,
                user=user,
                name=company_name + " Primary Admin",
                email=email
            )

        return Response({"status": "Client and Login Created"}, status=201)

    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        """Instant Workspace Generation: Creates engagement + 15+ standard tasks."""
        client_id = request.data.get('client_id')
        year = request.data.get('year')
        template_type = request.data.get('template_type', 'AUDIT_CORE')

        if not client_id or not year:
            return Response({"error": "client_id and year are required"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 1. Create the Main Engagement
            engagement = Engagement.objects.create(
                client_id=client_id,
                name=f"{year} Statutory Audit",
                engagement_type='AUDIT',
                year=year,
                status='PLANNING'
            )

            # 2. Define the 'World-Class' Audit Program
            tasks = [
                "Pre-Engagement: Independence Declaration",
                "Planning: Materiality Calculation",
                "Risk Assessment: Fraud Brainstorming",
                "Internal Control: Revenue Cycle Walkthrough",
                "Internal Control: Payroll Cycle Walkthrough",
                "Fieldwork: Bank Confirmations",
                "Fieldwork: Fixed Asset Inspection",
                "Fieldwork: Trade Payables Circularization",
                "Review: Subsequent Events Testing",
                "Review: Going Concern Assessment",
                "Finalization: Management Representation Letter",
                "Finalization: Issue Audit Report"
            ]

            # 3. Bulk Create Tasks for Speed
            EngagementTask.objects.bulk_create([
                EngagementTask(engagement=engagement, title=title, status='PENDING') 
                for title in tasks
            ])

            # 4. Initialize PBC (Provided by Client) Requests
            pbc_items = ["Trial Balance", "General Ledger", "Bank Statements", "Fixed Asset Register"]
            for item in pbc_items:
                PBCRequest.objects.create(engagement=engagement, title=f"Required: {item}")

        return Response(EngagementSerializer(engagement).data, status=status.HTTP_201_CREATED)

class EngagementTaskViewSet(viewsets.ModelViewSet):
    serializer_class = EngagementTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        # Allow filtering by engagement ID (e.g., ?engagement=7)
        engagement_id = self.request.query_params.get('engagement')
        if engagement_id:
            return EngagementTask.objects.filter(engagement_id=engagement_id).order_by('id')
        
        # Default: return all tasks for engagements the user is part of (optional security)
        return EngagementTask.objects.all()

    def perform_create(self, serializer):
        # Auto-assign the creator if needed, or leave blank
        serializer.save()

    @action(detail=True, methods=['post'])
    def sign_off(self, request, pk=None):
        task = self.get_object()
        user = request.user

        # Logic: If not prepared, sign off as preparer
        if not task.prepared_by:
            task.prepared_by = user
            task.prepared_at = timezone.now()
            task.status = 'REVIEW' # Move to review stage
            task.save()
            return Response({'status': 'Prepared successfully'})

        # Logic: If prepared but not reviewed, sign off as reviewer
        if task.prepared_by and not task.reviewed_by:
            if task.prepared_by == user:
                return Response({'error': 'You cannot review your own work'}, status=400)
            
            task.reviewed_by = user
            task.reviewed_at = timezone.now()
            task.status = 'DONE'
            task.save()
            return Response({'status': 'Reviewed successfully'})

        return Response({'error': 'Task already fully signed off'}, status=400)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Custom endpoint to toggle status or sign off"""
        task = self.get_object()
        status_val = request.data.get('status')
        if status_val:
            task.status = status_val
            task.save()
        return Response({'status': 'updated', 'new_status': task.status})

class ClientNoteViewSet(viewsets.ModelViewSet):
    queryset = ClientNote.objects.all()
    serializer_class = ClientNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
            # 1. Get the base queryset
            queryset = self.queryset
            
            # 2. Only apply the client filter if we are listing (GET /api/notes/)
            # If we are doing a PATCH or GET /api/notes/3/, 'pk' will be in self.kwargs
            if self.action == 'list':
                client_id = self.request.query_params.get('client')
                if client_id:
                    queryset = queryset.filter(client_id=client_id)
            
            return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ClientDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = ClientDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        queryset = ClientDocument.objects.all().order_by('-uploaded_at')
        engagement_id = self.request.query_params.get('engagement')
        client_id = self.request.query_params.get('client')

        if engagement_id:
            return queryset.filter(engagement_id=engagement_id)
        if client_id:
            return queryset.filter(client_id=client_id)
        return ClientDocument.objects.none()

    def perform_create(self, serializer):
        engagement_id = self.request.data.get('engagement')
        client_id = self.request.data.get('client')

        if engagement_id:
            engagement = Engagement.objects.get(id=engagement_id)
            serializer.save(
                uploaded_by=self.request.user,
                engagement=engagement,
                client=engagement.client  # <--- critical fix
            )
        elif client_id:
            serializer.save(
                uploaded_by=self.request.user,
                client_id=client_id
            )
        else:
            raise serializers.ValidationError(
                "Must provide either engagement or client."
            )

# PORTAL VIEWSET (For Clients)
class PortalViewSet(viewsets.ModelViewSet):
    """
    Dedicated viewset for the Client Portal.
    Restricts data so clients only see what's requested of them.
    """
    serializer_class = PBCRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Look up requests through the ClientContact -> Client relationship
        return PBCRequest.objects.filter(engagement__client__contacts__user=user)

    @action(detail=True, methods=['post'])
    def upload(self, request, pk=None):
        pbc = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
        
        pbc.attachment = file
        pbc.status = 'SUBMITTED'
        pbc.save()
        return Response({'status': 'File uploaded successfully'})