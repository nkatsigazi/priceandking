import { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid } from '@mui/material';
import api from '../../api';

const CreateVendorModal = ({ open, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });

    const handleSubmit = async () => {
    // 1. Basic validation before sending
    if (!formData.name.trim()) {
        alert("Vendor Name is required");
        return;
    }

    try {
        const payload = {
        name: formData.name,
        email: formData.email || null, // Convert empty strings to null if allowed
        tax_id: formData.tax_id || "",
        payment_terms: "Net 30", // Default value
        currency: "USD"          // Default value
        };

        await api.post('vendors/', payload);
        onSuccess();
        onClose();
        // Reset form
        setFormData({ name: '', email: '', phone: '', address: '', tax_id: '' });
    } catch (err: any) {
        // 2. Log the actual backend error to the console
        console.error("Backend Validation Error:", err.response?.data);
        alert("Check console for errors: " + JSON.stringify(err.response?.data));
    }
    };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24, p: 4 
      }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Add New Vendor</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Vendor Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Tax ID / VAT" fullWidth value={formData.tax_id} onChange={(e) => setFormData({...formData, tax_id: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Address" multiline rows={2} fullWidth value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="contained" fullWidth sx={{ bgcolor: '#931111' }} onClick={handleSubmit}>Save Vendor</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateVendorModal;