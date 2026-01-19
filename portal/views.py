# portal/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from crm.models import PBCRequest, Engagement, ClientDocument
from accounting.models import Invoices
from crm.serializers import ClientDocumentSerializer, PBCRequestSerializer  # Import PBCRequestSerializer

class PortalViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_client(self):
        if not hasattr(self.request.user, 'client_profile'):
            return None
        return self.request.user.client_profile.client

    def list(self, request):
        """Fetch list of pending PBC requests for the client's portal dashboard."""
        client = self.get_client()
        if not client:
            return Response({'error': 'No client associated with this user'}, status=status.HTTP_403_FORBIDDEN)

        # Filter to open/pending requests across all engagements
        queryset = PBCRequest.objects.filter(
            engagement__client=client,
            status__in=['OPEN', 'REJECTED']
        ).order_by('-requested_at')
        
        serializer = PBCRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        client = self.get_client()
        if not client: return Response(status=403)

        # Dashboard Aggregation
        pending = PBCRequest.objects.filter(engagement__client=client, status__in=['OPEN', 'REJECTED'])
        engagements = Engagement.objects.filter(client=client).exclude(status='ARCHIVED')
        
        return Response({
            "client_name": client.name,
            "pending_count": pending.count(),
            "engagements": list(engagements.values('id', 'name', 'status', 'completion_percentage', 'year')),
            "recent_activity": self._get_recent_activity(client)
        })

    def _get_recent_activity(self, client):
        # Merge recent uploads and status changes for a timeline view
        docs = ClientDocument.objects.filter(client=client).order_by('-uploaded_at')[:5]
        return [{"type": "upload", "desc": d.description, "date": d.uploaded_at} for d in docs]

    @action(detail=False, methods=['get'])
    def documents(self, request):
        """The Client Vault: View all history"""
        client = self.get_client()
        # Get PBC requests that have files attached OR general documents
        docs = ClientDocument.objects.filter(client=client).order_by('-uploaded_at')
        return Response(ClientDocumentSerializer(docs, many=True).data)

    @action(detail=True, methods=['post'], url_path='upload')
    def upload(self, request, pk=None):
        client = self.get_client()
        pbc = get_object_or_404(PBCRequest, pk=pk, engagement__client=client)
        
        file = request.FILES.get('file')
        doc_type = request.data.get('document_type', 'OTHER')  # Matches frontend 'document_type'
        
        if not file: return Response({'error': 'No file'}, status=400)

        # Update PBC
        pbc.attachment = file
        pbc.status = 'SUBMITTED'
        pbc.save()

        # Create Record with Metadata
        doc = ClientDocument.objects.create(
            client=client,
            engagement=pbc.engagement,
            uploaded_by=request.user,
            file=file,
            description=f"{doc_type}: {pbc.title}",
            category=doc_type
        )

        return Response({'status': 'Uploaded', 'file_url': doc.file.url})

    @action(detail=True, methods=['delete'])
    def remove_document(self, request, pk=None):
        """Allow client to remove their own document ONLY if not yet verified"""
        client = self.get_client()
        doc = get_object_or_404(ClientDocument, pk=pk, client=client, uploaded_by=request.user)
        
        if doc.is_verified:
            return Response({'error': 'Cannot delete verified audit evidence.'}, status=400)
            
        doc.delete()
        return Response({'status': 'Document removed'})