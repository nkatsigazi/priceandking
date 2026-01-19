import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Grid, TextField, MenuItem, IconButton, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Typography, Divider, CircularProgress
} from '@mui/material';
import { Add, Close as CloseIcon, Delete as DeleteIcon, Save as SaveIcon, Description } from '@mui/icons-material';
import api from '../../api'; 

interface Client { id: number; name: string; }
interface InvoicesLineItem { description: string; quantity: number; unit_price: number; amount: number; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoicesModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);
  
  // Form State
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [lines, setLines] = useState<InvoicesLineItem[]>([{ description: 'Professional Services', quantity: 1, unit_price: 0, amount: 0 }]);

  // Fetch Clients when modal opens
  useEffect(() => {
    if (open) {
      setFetchingClients(true);
      
      // --- FIX 2: Use 'api.get' and remove '/api/' prefix (handled by baseURL) ---
      api.get('clients/') 
        .then(res => {
          // Handle both pagination results or direct list
          const data = res.data.results ? res.data.results : res.data;
          console.log("Clients fetched:", data); 
          setClients(Array.isArray(data) ? data : []);
          
          // Helper: Default due date to 30 days out
          const date = new Date();
          date.setDate(date.getDate() + 30);
          setDueDate(date.toISOString().split('T')[0]);
        })
        .catch(err => {
          console.error("Error fetching clients:", err);
          setClients([]);
        })
        .finally(() => setFetchingClients(false));
    }
  }, [open]);

  // Calculations
  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleLineChange = (index: number, field: keyof InvoicesLineItem, value: any) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    newLines[index].amount = newLines[index].quantity * newLines[index].unit_price;
    setLines(newLines);
  };

  const handleSubmit = async () => {
    if (!clientId) return alert("Please select a client to continue.");
    
    setLoading(true);
    try {
      // --- FIX 3: Use 'api.post' and remove '/api/' prefix ---
      await api.post('invoices/', { 
        client: clientId, 
        issue_date: issueDate, 
        due_date: dueDate, 
        tax_amount: taxAmount, 
        lines: lines, 
        status: 'DRAFT' 
      });
      onSuccess(); 
      onClose();
      // Reset form
      setLines([{ description: 'Professional Services', quantity: 1, unit_price: 0, amount: 0 }]);
      setClientId('');
    } catch (err) { 
      console.error(err);
      alert('Failed to save invoices.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#931111', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Description /> New Professional Invoices</Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField 
              select 
              label={fetchingClients ? "Loading Clients..." : "Select Client"} 
              fullWidth 
              value={clientId} 
              onChange={(e) => setClientId(e.target.value)}
              disabled={fetchingClients}
              error={!fetchingClients && clients.length === 0}
              helperText={!fetchingClients && clients.length === 0 ? "No clients assigned to you." : ""}
            >
               {clients.map((c) => (
                 <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
               ))}
            </TextField>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <TextField label="Issue Date" type="date" fullWidth value={issueDate} onChange={(e) => setIssueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Due Date" type="date" fullWidth value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          {/* Line Items Table */}
          <Grid item xs={12}>
            <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Qty/Hrs</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Rate</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell><TextField fullWidth variant="standard" value={line.description} onChange={(e) => handleLineChange(index, 'description', e.target.value)} /></TableCell>
                      <TableCell align="right"><TextField type="number" sx={{ width: 80 }} variant="standard" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value))} /></TableCell>
                      <TableCell align="right"><TextField type="number" sx={{ width: 100 }} variant="standard" value={line.unit_price} onChange={(e) => handleLineChange(index, 'unit_price', parseFloat(e.target.value))} /></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>${line.amount.toFixed(2)}</TableCell>
                      <TableCell>
                         <IconButton size="small" color="error" onClick={() => setLines(lines.filter((_, i) => i !== index))}><DeleteIcon fontSize="inherit" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button startIcon={<Add />} onClick={() => setLines([...lines, { description: '', quantity: 1, unit_price: 0, amount: 0 }])} sx={{ mt: 1 }}>Add Item</Button>
          </Grid>

          {/* Totals Section */}
          <Grid item xs={12} md={5} sx={{ ml: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">Subtotal</Typography><Typography variant="body2">${subtotal.toFixed(2)}</Typography></Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}><Typography variant="body2">Tax (%)</Typography><TextField size="small" type="number" sx={{ width: 60 }} variant="standard" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value))} /></Box>
               <Divider sx={{ my: 1 }} />
               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6">Total</Typography><Typography variant="h6" color="primary">${total.toFixed(2)}</Typography></Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f1f5f9' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ bgcolor: '#931111', borderRadius: 2 }}>
          Generate Invoices
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInvoicesModal;