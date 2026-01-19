import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem,
  Avatar, Chip, Tooltip, FormControl, InputLabel, Select
} from '@mui/material';
import { AddBusiness } from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]); // State for dropdown
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Expanded state to include credentials and partner assignment
  const [newClient, setNewClient] = useState({
    name: '',
    entity_type: 'LLC',
    tax_id_number: '',
    industry: '',
    fiscal_year_end: '',
    primary_email: '', 
    initial_password: '',
    assigned_partner: '' // New field for manual assignment
  });

  const fetchClients = async () => {
    try {
      const res = await api.get('clients/');
      setClients(res.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  // Fetch list of partners/managers for the dropdown
  const fetchPartners = async () => {
    try {
      // Assumes you implemented the @action(detail=False) def partners(self)... in Django
      const res = await api.get('clients/partners/'); 
      setPartners(res.data);
    } catch (err) {
      console.error("Failed to fetch partners", err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchPartners();
  }, []);

  const handleSave = async () => {
    try {
      // Backend create() method handles Client, User, and Partner assignment
      await api.post('clients/', newClient);
      setOpen(false);
      
      // Reset Form
      setNewClient({
        name: '',
        entity_type: 'LLC',
        tax_id_number: '',
        industry: '',
        fiscal_year_end: '',
        primary_email: '',
        initial_password: '',
        assigned_partner: ''
      });
      
      fetchClients();
    } catch (err: any) {
      alert("Error creating client: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#931111' }}>
            Client CRM
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddBusiness />}
            onClick={() => setOpen(true)}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#000' } }}
          >
            Add New Client
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Client & Industry</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned Partner</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Active Audits</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow 
                  key={client.id} 
                  hover 
                  sx={{ cursor: 'pointer' }} 
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">{client.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.industry || 'Unspecified Industry'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={client.risk_rating || 'LOW'} 
                      size="small" 
                      color={client.risk_rating === 'HIGH' ? 'error' : 'success'} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#931111' }}>
                        {client.partner?.username?.[0] || 'U'}
                      </Avatar>
                      <Typography variant="body2">
                        {client.partner?.username || 'Unassigned'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Total active engagements">
                      <Chip label={`${client.active_engagements_count || 0} Engagements`} size="small" />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text" color="primary">View Workspace</Button>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No clients found. Click "Add New Client" to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Add Client Dialog with Portal Access & Partner Assignment */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Client & Portal Account</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="subtitle2" color="primary">Company Entity Details</Typography>
          <TextField
            label="Company Name"
            fullWidth
            required
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Entity Type"
              fullWidth
              value={newClient.entity_type}
              onChange={(e) => setNewClient({ ...newClient, entity_type: e.target.value })}
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
              value={newClient.tax_id_number}
              onChange={(e) => setNewClient({ ...newClient, tax_id_number: e.target.value })}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Industry"
              fullWidth
              value={newClient.industry}
              onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
            />
            
            <TextField
                label="Fiscal Year End"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newClient.fiscal_year_end}
                onChange={(e) => setNewClient({ ...newClient, fiscal_year_end: e.target.value })}
            />
          </Box>

          {/* NEW PARTNER SELECTION */}
          <FormControl fullWidth>
            <InputLabel>Assigned Partner / Lead</InputLabel>
            <Select
              label="Assigned Partner / Lead"
              value={newClient.assigned_partner}
              onChange={(e) => setNewClient({ ...newClient, assigned_partner: e.target.value })}
            >
              <MenuItem value=""><em>Assign to Me (Default)</em></MenuItem>
              {partners.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                   {p.username} ({p.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>Portal Access (Primary Contact)</Typography>
          <TextField
            label="Primary Login Email"
            type="email"
            fullWidth
            required
            placeholder="client@example.com"
            value={newClient.primary_email}
            onChange={(e) => setNewClient({ ...newClient, primary_email: e.target.value })}
          />
          <TextField
            label="Initial Password"
            type="password"
            fullWidth
            required
            value={newClient.initial_password}
            onChange={(e) => setNewClient({ ...newClient, initial_password: e.target.value })}
          />

        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            Save Client & Create Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Clients;