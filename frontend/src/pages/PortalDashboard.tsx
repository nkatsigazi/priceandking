import React, { useEffect, useState } from 'react';
import { 
    Paper, Typography, Box, Button, CircularProgress, 
    Card, CardContent, Alert, LinearProgress, FormControl, 
    InputLabel, Select, MenuItem, Container
} from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { CloudUpload } from '@mui/icons-material';
import api from '../api';
import Logo from '../assets/logo-white.svg';

const PortalDashboard = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [docTypes, setDocTypes] = useState<any>({});

    const fetchPortal = async () => {
        try {
            const res = await api.get('portal/'); 
            setRequests(res.data || []);
            
            const types: any = {};
            res.data.forEach((r: any) => types[r.id] = 'GENERAL_LEDGER');
            setDocTypes(types);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPortal(); }, []);

    const handleUpload = async (id: number, file: File) => {
        setUploadingId(id);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', docTypes[id]);

        try {
            await api.post(`portal/${id}/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchPortal();
        } catch (err) {
            alert("Upload failed.");
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) return <LinearProgress color="error" />;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Client Portal</Typography>
                <Typography color="text.secondary">Manage your audit requests and secure documents.</Typography>
            </Box>

            <Grid container spacing={3}>
                {requests.filter(r => r.status === 'OPEN').map((req) => (
                    // PROPERTY FIX: Changed size={{ xs: 12 }} to item xs={12}
                    <Grid item xs={12} key={req.id}>
                        <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flexGrow: 1, minWidth: '300px' }}>
                                    <Typography variant="h6" fontWeight="bold">{req.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {req.description || "No description provided."}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: { xs: 1, md: 0 } }}>
                                    <FormControl size="small" sx={{ minWidth: 200 }}>
                                        <InputLabel>Document Type</InputLabel>
                                        <Select
                                            value={docTypes[req.id] || 'GENERAL_LEDGER'}
                                            label="Document Type"
                                            onChange={(e) => setDocTypes({...docTypes, [req.id]: e.target.value})}
                                        >
                                            <MenuItem value="GENERAL_LEDGER">General Ledger</MenuItem>
                                            <MenuItem value="BANK_STATEMENT">Bank Statement</MenuItem>
                                            <MenuItem value="TAX_RETURN">Tax Return</MenuItem>
                                            <MenuItem value="PAYROLL">Payroll Records</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Button
                                        variant="contained"
                                        component="label"
                                        disabled={uploadingId === req.id}
                                        startIcon={uploadingId === req.id ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                                        sx={{ bgcolor: '#1a2035', px: 4, whiteSpace: 'nowrap' }}
                                    >
                                        {uploadingId === req.id ? "Sending..." : "Upload"}
                                        <input type="file" hidden onChange={(e) => e.target.files && handleUpload(req.id, e.target.files[0])} />
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                
                {requests.filter(r => r.status === 'OPEN').length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="success">All caught up! No pending document requests.</Alert>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default PortalDashboard;