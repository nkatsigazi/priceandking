import { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { Add, ReceiptLong } from '@mui/icons-material';
import api from '../../api'; // Use configured API
import CreateInvoicesModal from './CreateInvoiceModal';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('invoices/');
      const data = res.data.results || res.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handlePostToGL = async (id: number) => {
    try {
        await api.post(`invoices/${id}/finalize_and_send/`);
        fetchInvoices();
    } catch (e) {
        alert("Error posting to GL");
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLong /> Sales Invoices
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setModalOpen(true)}
          sx={{ bgcolor: '#931111' }}
        >
          New Invoice
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{inv.invoices_number}</TableCell>
                <TableCell>{inv.client_name || inv.client?.name}</TableCell>
                <TableCell>{inv.issue_date}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                    UGX {parseFloat(inv.total || 0).toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                      label={inv.status} 
                      size="small" 
                      color={inv.status === 'PAID' ? 'success' : inv.status === 'SENT' ? 'info' : 'warning'} 
                      variant="outlined" 
                  />
                </TableCell>
                <TableCell align="right">
                  {inv.status === 'DRAFT' && (
                    <Button size="small" variant="contained" onClick={() => handlePostToGL(inv.id)}>
                      Post to GL
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">No invoices found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateInvoicesModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchInvoices} 
      />
    </Box>
  );
};

export default InvoicesPage;