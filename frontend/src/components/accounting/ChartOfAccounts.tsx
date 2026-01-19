import { useState, useEffect } from 'react';
import { 
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, 
  Paper, Button, Chip, Typography, Box, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions 
} from '@mui/material';
import { SettingsInputComponent } from '@mui/icons-material';
import api from '../../api';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const fetchAccounts = async () => {
    try {
        const res = await api.get('accounts/');
        const data = res.data.results || res.data;
        setAccounts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleUpdateAccount = async () => {
    try {
        await api.patch(`accounts/${editingAccount.id}/`, {
            name: editingAccount.name,
            code: editingAccount.code
        });
        fetchAccounts();
        setEditingAccount(null);
    } catch (e) { alert("Error updating account"); }
  };

  const handleSeed = async () => {
    if(!window.confirm("This will create standard accounts. Continue?")) return;
    await api.post('accounts/seed/');
    fetchAccounts();
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsInputComponent /> Chart of Accounts
        </Typography>
        <Button variant="outlined" onClick={handleSeed}>Initialize Standard Accounts</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((acc) => (
              <TableRow key={acc.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{acc.code}</TableCell>
                <TableCell>{acc.name}</TableCell>
                <TableCell><Chip label={acc.account_type} size="small" variant="outlined" /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setEditingAccount(acc)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* EDIT DIALOG */}
      <Dialog open={Boolean(editingAccount)} onClose={() => setEditingAccount(null)}>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Account Code" 
            fullWidth 
            value={editingAccount?.code || ''} 
            onChange={(e) => setEditingAccount({...editingAccount, code: e.target.value})}
          />
          <TextField 
            label="Account Name" 
            fullWidth 
            value={editingAccount?.name || ''} 
            onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingAccount(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateAccount}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChartOfAccounts;