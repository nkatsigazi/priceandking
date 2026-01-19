import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, Modal, TextField, MenuItem 
} from '@mui/material';
import { Wallet, Add } from '@mui/icons-material';
import api from '../../api';
import CreateVendorModal from './CreateVendorModal';

const ExpensesPage = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  
  const [newBill, setNewBill] = useState({
    vendor: '',
    bill_number: '',
    total_amount: '',
    due_date: new Date().toLocaleDateString('en-CA')
  });

  const fetchData = async () => {
    try {
      const [billRes, vendorRes] = await Promise.all([
        api.get('bills/'),
        api.get('vendors/')
      ]);
      setBills(billRes.data.results || billRes.data);
      setVendors(vendorRes.data.results || vendorRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

    const handleCreateBill = async () => {
        // Basic frontend check
        if (!newBill.vendor || !newBill.total_amount || !newBill.bill_number) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                vendor: parseInt(newBill.vendor), // Ensure this is an ID (integer)
                bill_number: newBill.bill_number,
                total_amount: parseFloat(newBill.total_amount), // Ensure this is a float/decimal
                due_date: newBill.due_date, // Should be YYYY-MM-DD
                status: 'DRAFT'
            };

            console.log("Sending Payload:", payload); // Debugging line
            await api.post('bills/', payload);
            
            fetchData();
            setOpen(false);
        } catch (err: any) {
            // THIS WILL TELL YOU EXACTLY WHAT IS WRONG:
            console.error("Server responded with:", err.response?.data);
            alert("Error: " + JSON.stringify(err.response?.data));
        }
    };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wallet /> Vendor Bills & Expenses
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ bgcolor: '#931111' }}>
          Record Bill
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>No bills recorded yet.</TableCell></TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{bill.bill_number}</TableCell>
                  <TableCell>{bill.vendor_name || 'Generic Vendor'}</TableCell>
                  <TableCell>{bill.due_date}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>UGX {parseFloat(bill.total_amount).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip label={bill.status} color={bill.status === 'PAID' ? 'success' : 'warning'} size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE BILL MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24, p: 4 
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Record New Vendor Bill</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* VENDOR SELECT WITH QUICK-ADD */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField 
                    select label="Vendor" fullWidth 
                    value={newBill.vendor} 
                    onChange={(e) => setNewBill({...newBill, vendor: e.target.value})}
                >
                    {vendors.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                </TextField>
                <Button 
                    variant="outlined" 
                    onClick={() => setVendorModalOpen(true)} 
                    sx={{ minWidth: '45px', height: '56px' }}
                >
                    <Add />
                </Button>
            </Box>

            <TextField label="Bill Number" fullWidth value={newBill.bill_number} onChange={(e) => setNewBill({...newBill, bill_number: e.target.value})} />
            <TextField label="Total Amount" type="number" fullWidth value={newBill.total_amount} onChange={(e) => setNewBill({...newBill, total_amount: e.target.value})} />
            <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newBill.due_date} onChange={(e) => setNewBill({...newBill, due_date: e.target.value})} />
            
            <Button variant="contained" fullWidth onClick={handleCreateBill} sx={{ mt: 2, bgcolor: '#931111', py: 1.5 }}>
                Save Bill
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* QUICK ADD VENDOR MODAL */}
      <CreateVendorModal 
        open={vendorModalOpen} 
        onClose={() => setVendorModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </Box>
  );
};

export default ExpensesPage;