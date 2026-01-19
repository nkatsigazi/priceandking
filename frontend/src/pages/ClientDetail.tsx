import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Chip, Accordion, 
  AccordionSummary, AccordionDetails, Dialog, DialogTitle, 
  DialogContent, Paper, Avatar, Badge, TextField, MenuItem, 
  DialogActions, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ArrowBack, ExpandMore, Person, Edit, ChatBubbleOutline, WarningAmber, Save } from '@mui/icons-material';
import api from '../api';

// Components
import ClientOverview from '../components/ClientOverview';
import ClientContacts from '../components/ClientContacts';
import Engagements from '../components/Engagements';
import ClientDocuments from '../components/ClientDocuments';
import ClientNotes from '../components/ClientNotes';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [client, setClient] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  
  // UI States
  const [contactsOpen, setContactsOpen] = useState(false);
  const [unresolvedNotesCount, setUnresolvedNotesCount] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  // Edit Form State
  const [editData, setEditData] = useState<any>({
    name: '',
    entity_type: '',
    industry: '',
    tax_id_number: '',
    risk_rating: '',
    fiscal_year_end: '',
    assigned_partner: ''
  });

  const fetchClient = async () => {
    try {
        const res = await api.get(`clients/${id}/`);
        setClient(res.data);
    } catch (err) {
        console.error("Failed to load client", err);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get('clients/partners/');
      setPartners(res.data);
    } catch (err) {
      console.error("Failed to fetch partners", err);
    }
  };

  useEffect(() => {
    fetchClient();
    fetchPartners();
  }, [id]);

  const handleOpenEdit = () => {
    setEditData({
      name: client.name || '',
      entity_type: client.entity_type || 'LLC',
      industry: client.industry || '',
      tax_id_number: client.tax_id_number || '',
      risk_rating: client.risk_rating || 'LOW',
      fiscal_year_end: client.fiscal_year_end || '',
      assigned_partner: client.partner?.id || ''
    });
    setEditOpen(true);
  };

  const handleUpdateClient = async () => {
    try {
      await api.patch(`clients/${id}/`, editData);
      setEditOpen(false);
      fetchClient();
    } catch (err) {
      alert("Failed to update client details");
    }
  };

  if (!client) return <Typography sx={{ p: 4 }}>Loading Client Data...</Typography>;

  return (
    <Box sx={{ maxWidth: 1600, margin: '0 auto', p: 2 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/clients')} sx={{ mb: 1, color: 'text.secondary' }}>
                Back to List
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a2035' }}>{client.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                        <Typography color="text.secondary">Client ID: #{client.id}</Typography>
                        <Chip label={client.industry} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }} />
                        <Chip label={client.entity_type} size="small" sx={{ bgcolor: '#f5f5f5' }} />
                        <Chip 
                            label={`${client.risk_rating} RISK`} 
                            size="small" 
                            color={client.risk_rating === 'HIGH' ? 'error' : 'success'} 
                        />
                    </Box>
                </Box>
                
                {/* EDIT BUTTON */}
                <Button 
                    variant="outlined" 
                    startIcon={<Edit />} 
                    onClick={handleOpenEdit}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Edit Client Details
                </Button>
            </Box>
        </Box>

        {/* Collapsible "Sticky" Notes Section */}
        <Accordion 
            sx={{ 
            mb: 4, 
            borderRadius: '12px !important', 
            overflow: 'hidden',
            border: unresolvedNotesCount > 0 ? '1px solid #ffe0b2' : '1px solid #e0e4e8',
            boxShadow: 'none',
            '&:before': { display: 'none' } 
            }} 
            defaultExpanded={unresolvedNotesCount > 0}
        >
            <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                {unresolvedNotesCount > 0 ? <WarningAmber sx={{ color: '#ef6c00' }} /> : <ChatBubbleOutline color="action" />}
                <Typography fontWeight="bold" sx={{ color: unresolvedNotesCount > 0 ? '#ef6c00' : 'text.primary', flexGrow: 1 }}>
                {unresolvedNotesCount > 0 ? 'Action Required: Internal Audit Notes' : 'Internal Client Notes'}
                </Typography>
                <Badge badgeContent={unresolvedNotesCount} color="error" overlap="rectangular">
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 1 }}>
                    [{unresolvedNotesCount}]
                </Typography>
                </Badge>
            </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#fffcf9', p: 0 }}>
            <ClientNotes 
                clientId={Number(id)} 
                onNotesCountChange={(count) => setUnresolvedNotesCount(count)} 
            />
            </AccordionDetails>
        </Accordion>


        <Grid container spacing={3}>
            {/* LEFT COLUMN: Static Data & Contacts Widget */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                <ClientOverview client={client} onUpdate={fetchClient} />
                
                {/* Contacts Widget (Summary Only) */}
                <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">Contacts</Typography>
                        <Button startIcon={<Edit />} size="small" onClick={() => setContactsOpen(true)}>Manage</Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: '#f9fafb', borderRadius: 1 }}>
                        <Avatar sx={{ bgcolor: '#1a2035' }}><Person /></Avatar>
                        <Box>
                            <Typography variant="subtitle2">View Contacts</Typography>
                            <Typography variant="caption" color="text.secondary">Click Manage to add/edit</Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* RIGHT COLUMN: Actionable Items */}
            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                <Engagements clientId={Number(id)} />
                <ClientDocuments clientId={Number(id)} />
            </Grid>
        </Grid>

        {/* --- DIALOGS --- */}

        {/* Full Contacts Management Modal */}
        <Dialog open={contactsOpen} onClose={() => setContactsOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Client Contacts Directory</DialogTitle>
            <DialogContent>
               <ClientContacts clientId={Number(id)} />
            </DialogContent>
        </Dialog>

        {/* Edit Client Details Modal */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Update Client Profile</DialogTitle>
            <Divider />
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
                
                <TextField 
                    label="Company Name" 
                    fullWidth 
                    value={editData.name} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                        select 
                        label="Entity Type" 
                        fullWidth 
                        value={editData.entity_type} 
                        onChange={(e) => setEditData({...editData, entity_type: e.target.value})}
                    >
                        <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                        <MenuItem value="LLC">LLC</MenuItem>
                        <MenuItem value="CORP">Corporation</MenuItem>
                        <MenuItem value="PARTNERSHIP">Partnership</MenuItem>
                        <MenuItem value="NGO">Non-Profit (NGO)</MenuItem>
                    </TextField>

                    <TextField 
                        label="Tax ID Number" 
                        fullWidth 
                        value={editData.tax_id_number} 
                        onChange={(e) => setEditData({...editData, tax_id_number: e.target.value})}
                    />
                </Box>

                <TextField 
                    label="Industry" 
                    fullWidth 
                    value={editData.industry} 
                    onChange={(e) => setEditData({...editData, industry: e.target.value})}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                        select 
                        label="Risk Rating" 
                        fullWidth 
                        value={editData.risk_rating} 
                        onChange={(e) => setEditData({...editData, risk_rating: e.target.value})}
                    >
                        <MenuItem value="LOW">Low Risk</MenuItem>
                        <MenuItem value="MEDIUM">Medium Risk</MenuItem>
                        <MenuItem value="HIGH">High Risk</MenuItem>
                    </TextField>

                    <TextField 
                        label="Fiscal Year End" 
                        type="date"
                        fullWidth 
                        InputLabelProps={{ shrink: true }}
                        value={editData.fiscal_year_end} 
                        onChange={(e) => setEditData({...editData, fiscal_year_end: e.target.value})}
                    />
                </Box>

                <TextField 
                    select 
                    label="Assigned Partner / Engagement Lead" 
                    fullWidth 
                    helperText="Re-assigning will change the primary contact person for this client."
                    value={editData.assigned_partner} 
                    onChange={(e) => setEditData({...editData, assigned_partner: e.target.value})}
                >
                    {partners.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                            {p.username} — {p.role}
                        </MenuItem>
                    ))}
                </TextField>

            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
                <Button 
                    variant="contained" 
                    startIcon={<Save />} 
                    onClick={handleUpdateClient}
                    sx={{ bgcolor: '#1a2035' }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};

export default ClientDetail;