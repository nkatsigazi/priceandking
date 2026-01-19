import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, TextField, InputAdornment,
  MenuItem, Stack, IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions
} from '@mui/material';
import {
  Search, Add, Visibility, FilterList, 
  Event, Business, TrendingUp, MonetizationOn,
   Launch, PostAdd
} from '@mui/icons-material';
import api from '../api';

const Engagements = ({ clientId }: { clientId: number }) => {
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
    const [newEng, setNewEng] = useState({ 
        name: '', year: new Date().getFullYear(), engagement_type: 'AUDIT', status: 'PLANNING', fee: '' 
    });
  
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchEngagements = async () => {
    try {
      const res = await api.get('engagements/');
      setEngagements(res.data);
    } catch (err) {
      console.error("Failed to fetch engagements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, []);

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
    switch (status) {
      case 'PLANNING': return { bgcolor: '#e3f2fd', color: '#1976d2' };
      case 'FIELDWORK': return { bgcolor: '#fff3e0', color: '#ef6c00' };
      case 'REVIEW': return { bgcolor: '#f3e5f5', color: '#9c27b0' };
      case 'COMPLETED': return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      default: return { bgcolor: '#f5f5f5', color: '#757575' };
    }
  };

  const filteredEngagements = engagements.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 4, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#931111', mb: 1 }}>
            Engagement Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage active audits, tax preparations, and advisory projects across all clients.
          </Typography>
        </Box>
        {/*<Box sx={{ gap: 2, display: 'flex' }}>
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
        </Box>*/}
      </Box>

      {/* STATS OVERVIEW */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Active Projects', count: engagements.length, icon: <TrendingUp />, color: '#1976d2' },
          { label: 'In Fieldwork', count: engagements.filter(e => e.status === 'FIELDWORK').length, icon: <Business />, color: '#ef6c00' },
          { label: 'Pending Review', count: engagements.filter(e => e.status === 'REVIEW').length, icon: <Visibility />, color: '#9c27b0' },
        ].map((stat, i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color }}>{stat.icon}</Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">{stat.label.toUpperCase()}</Typography>
                <Typography variant="h5" fontWeight="bold">{stat.count}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Search by engagement or client name..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            sx={{ minWidth: 200 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PLANNING">Planning</MenuItem>
            <MenuItem value="FIELDWORK">Fieldwork</MenuItem>
            <MenuItem value="REVIEW">Review</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* ENGAGEMENTS TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Engagement & Client</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEngagements.map((engagement) => (
              <TableRow key={engagement.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography fontWeight="bold" color="text.secondary">{engagement.year}</Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => navigate(`/engagements/${engagement.id}`)}
                    >
                      {engagement.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      <Business sx={{ fontSize: 12 }} /> {engagement.client_name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={engagement.engagement_type} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                </TableCell>
                <TableCell sx={{ width: 250 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={engagement.completion_percentage} 
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#eee' }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight="bold">
                      {engagement.completion_percentage}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={engagement.status} 
                    size="small" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      ...getStatusColor(engagement.status)
                    }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Workspace">
                    <IconButton size="small" onClick={() => navigate(`/engagements/${engagement.id}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredEngagements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No engagements found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
};

// Helper component for Stat Cards
const Avatar = ({ children, sx }: { children: React.ReactNode, sx?: any }) => (
  <Box sx={{ 
    width: 48, height: 48, borderRadius: 2, 
    display: 'flex', alignItems: 'center', 
    justifyContent: 'center', ...sx 
  }}>
    {children}
  </Box>
);

export default Engagements;