import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Chip, Button, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, 
  MenuItem, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
    Edit, EventNote, Payments, Rule, 
    AssignmentInd, QueryStats 
} from '@mui/icons-material';
import api from '../api';

const EngagementOverview = ({ data, onUpdate, onSwitchToTasks }: any) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleSave = async () => {
    try {
        await api.patch(`engagements/${data.id}/`, formData);
        setOpen(false);
        onUpdate(); 
    } catch (err) {
        console.error("Save failed", err);
    }
  };

  const StatBox = ({ label, value, icon, color }: any) => (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.lighter`, color: `${color}.main`, display: 'flex' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography variant="subtitle1" fontWeight="bold">{value || 'Not Set'}</Typography>
        </Box>
    </Paper>
  );

  return (
    <Box>
        <Grid container spacing={3}>
            {/* Main Details Card */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">Audit Summary</Typography>
                        <Button startIcon={<Edit />} size="small" onClick={() => setOpen(true)}>Edit Details</Button>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        This {data.engagement_type.toLowerCase()} engagement for <strong>{data.client_name}</strong> covers 
                        the fiscal period of {data.year}. Current methodology applied is <strong>{data.methodology}</strong>.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatBox label="Budgeted Fee" value={`$${data.fee}`} icon={<Payments />} color="primary" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatBox label="Methodology" value={data.methodology} icon={<Rule />} color="secondary" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatBox label="Fiscal Year" value={data.year} icon={<EventNote />} color="info" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatBox label="Lead Auditor" value={data.lead_auditor_name || 'Unassigned'} icon={<AssignmentInd />} color="success" />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Side Progress Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <QueryStats sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        {data.completion_percentage}%
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>Audit Completion</Typography>
                    <Box sx={{ px: 4 }}>
                        <Button fullWidth variant="contained" color="primary" onClick={onSwitchToTasks}>
                            Review Checklist
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </Grid>

        {/* Edit Modal */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>Update Engagement</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField 
                    label="Engagement Name" 
                    fullWidth 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <TextField 
                    label="Methodology" 
                    fullWidth 
                    value={formData.methodology} 
                    onChange={e => setFormData({...formData, methodology: e.target.value})} 
                />
                <TextField 
                    label="Fee" 
                    type="number"
                    fullWidth 
                    value={formData.fee} 
                    onChange={e => setFormData({...formData, fee: e.target.value})} 
                />
                <TextField 
                    select 
                    label="Status" 
                    fullWidth 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <MenuItem value="PLANNING">Planning</MenuItem>
                    <MenuItem value="FIELDWORK">Fieldwork</MenuItem>
                    <MenuItem value="REVIEW">Final Review</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Changes</Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};

export default EngagementOverview;