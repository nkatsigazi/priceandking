import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Grid, Chip, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem 
} from '@mui/material';
import { Edit, Business, CalendarToday, Person } from '@mui/icons-material';
import api from '../api';

const ClientOverview = ({ client, onUpdate }: { client: any, onUpdate: () => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleEdit = () => {
    setFormData(client);
    setOpen(true);
  };

  const handleSave = async () => {
    await api.patch(`clients/${client.id}/`, formData);
    setOpen(false);
    onUpdate();
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ color: 'text.secondary', mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight="500">{value || '-'}</Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Client Overview</Typography>
        </Box>

        <InfoRow icon={<Business />} label="Entity Type" value={client.entity_type} />
        <InfoRow icon={<Person />} label="Assigned Partner" value={client.partner?.username || 'Unassigned'} />
        <InfoRow icon={<CalendarToday />} label="Fiscal Year End" value={client.fiscal_year_end} />
        
        <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box sx={{ mt: 1 }}>
                <Chip 
                    label={client.is_active ? "Active Client" : "Inactive"} 
                    color={client.is_active ? "success" : "default"} 
                    size="small" 
                />
            </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ClientOverview;