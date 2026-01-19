import React, { useEffect, useState } from 'react';
import { 
  Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem
} from '@mui/material';
import { Add, Launch, PostAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Engagements = ({ clientId }: { clientId: number }) => {
  const [engagements, setEngagements] = useState([]);
  const [open, setOpen] = useState(false);
  const [newEng, setNewEng] = useState({ 
      name: '', year: new Date().getFullYear(), engagement_type: 'AUDIT', status: 'PLANNING', fee: '' 
  });
  
  const navigate = useNavigate();

  const fetchEngagements = async () => {
    try {
      const res = await api.get(`engagements/?client=${clientId}`);
      setEngagements(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  useEffect(() => { if (clientId) fetchEngagements(); }, [clientId]);

  const handleSave = async () => {
    await api.post('engagements/', { ...newEng, client: clientId });
    setOpen(false);
    fetchEngagements();
  };

  const handleCreateFromTemplate = async () => {
    try {
        // MATCHING THE BACKEND 'client_id' EXPECTATION
        await api.post('engagements/create_from_template/', {
            client_id: clientId,
            year: newEng.year
        });
        fetchEngagements();
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
        case 'COMPLETED': return 'success';
        case 'FIELDWORK': return 'warning';
        case 'PLANNING': return 'info';
        default: return 'default';
      }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Engagements</Typography>
        <Box sx={{ gap: 2, display: 'flex' }}>
            <Button 
                startIcon={<PostAdd />} 
                variant="contained" 
                color="secondary"
                onClick={handleCreateFromTemplate}
            >
                Start Audit (Template)
            </Button>
            
            <Button startIcon={<Add />} variant="outlined" onClick={() => setOpen(true)}>
                Empty Engagement
            </Button>
        </Box>
      </Box>

      <Table size="small">
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell align="right">Actions</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {engagements.map((eng: any) => (
                <TableRow 
                    key={eng.id} 
                    hover 
                    onClick={() => navigate(`/engagements/${eng.id}`)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                    <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                        {eng.name}
                    </TableCell>
                    <TableCell>{eng.year}</TableCell>
                    <TableCell>{eng.engagement_type}</TableCell>
                    <TableCell>
                        <Chip label={eng.status} size="small" color={getStatusColor(eng.status) as any} />
                    </TableCell>
                    <TableCell>${eng.fee}</TableCell>
                    <TableCell align="right">
                        <Launch sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </TableCell>
                </TableRow>
            ))}
            {engagements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No active engagements</TableCell>
                </TableRow>
            )}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Start New Engagement</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
            <TextField label="Engagement Name" fullWidth 
                onChange={e => setNewEng({...newEng, name: e.target.value})} />
            <TextField label="Year" type="number" fullWidth value={newEng.year} 
                onChange={e => setNewEng({...newEng, year: parseInt(e.target.value)})} />
            <TextField select label="Type" value={newEng.engagement_type} 
                onChange={e => setNewEng({...newEng, engagement_type: e.target.value})}>
                <MenuItem value="AUDIT">Audit</MenuItem>
                <MenuItem value="TAX">Tax</MenuItem>
                <MenuItem value="ADVISORY">Advisory</MenuItem>
            </TextField>
            <TextField label="Fee Estimate" type="number" fullWidth 
                onChange={e => setNewEng({...newEng, fee: e.target.value})} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Create</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Engagements;