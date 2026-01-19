import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Box
} from '@mui/material';
import api from '../api';

const ClientContacts = ({ clientId }: { clientId: number }) => {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    is_primary: false
  });

  const fetchContacts = async () => {
    const res = await api.get(`client-contacts/?client=${clientId}`);
    setContacts(res.data);
  };

  useEffect(() => {
    fetchContacts();
  }, [clientId]);

  const handleSave = async () => {
    await api.post('client-contacts/', {
      ...form,
      client: clientId
    });
    setOpen(false);
    setForm({ name: '', email: '', phone: '', is_primary: false });
    fetchContacts();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Contact
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Primary</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.is_primary ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth label="Email" onChange={e => setForm({...form, email: e.target.value})} />
          <TextField fullWidth label="Phone" onChange={e => setForm({...form, phone: e.target.value})} />
          <FormControlLabel
            control={<Switch onChange={e => setForm({...form, is_primary: e.target.checked})} />}
            label="Primary Contact"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientContacts;