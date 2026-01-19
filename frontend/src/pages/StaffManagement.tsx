import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Chip, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
  InputAdornment, FormControlLabel, Switch, Avatar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PersonAdd, Security, Visibility, VisibilityOff, Edit, AddCircle
} from '@mui/icons-material';
import api from '../api';

// Initial state for a fresh user
const INITIAL_USER = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  phone2: '',
  password: '',
  role: 'CONSULTANT',
  position: '',
  bio: '',
  hourly_rate: '',
  avatar_url: '',
  joining_date: new Date().toISOString().split('T')[0], // Default to today
  skills: [], // Array of strings
  can_view_financials: false
};

const StaffManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  // Dialog State
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>(INITIAL_USER);
  
  // UI Helpers
  const [showPassword, setShowPassword] = useState(false);
  const [newSkill, setNewSkill] = useState(''); // Temp state for skill input

  const fetchUsers = async () => {
    try {
      const res = await api.get('staff/');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setFormData(INITIAL_USER);
    setIsEditMode(false);
    setOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setFormData({
      ...user,
      phone: user.phone || '',
      phone2: user.phone2 || '',
      // If joining_date is missing, fallback to date_joined (YYYY-MM-DD)
      joining_date: user.joining_date || (user.date_joined ? user.date_joined.split('T')[0] : ''),
      password: '', // Clear password field for security
      skills: user.skills || [] // Ensure it's an array
    });
    setIsEditMode(true);
    setOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This sets the avatar_url to a base64 string
        setFormData({ ...formData, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // 1. Prepare Payload
      const payload = { ...formData };
      
      // If editing and password is empty, remove it so we don't overwrite with empty string
      if (isEditMode && !payload.password) {
        delete payload.password;
      }
      
      // Ensure username is set (backend logic usually handles this, but good safety)
      if (!isEditMode) {
        payload.username = payload.email;
      }

      // 2. Send Request
      if (isEditMode) {
        await api.patch(`staff/${formData.id}/`, payload);
      } else {
        await api.post('staff/', payload);
      }

      // 3. Cleanup
      setOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err.response?.data);
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleToggleCapability = async (userId: number, currentStatus: boolean) => {
    try {
      await api.patch(`staff/${userId}/`, {
        can_view_financials: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update permissions.");
    }
  };

  // --- Skills Logic ---

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s: string) => s !== skillToRemove)
    });
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#931111' }}>
            Staff & Roles
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            startIcon={<PersonAdd />}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#000' } }}
          >
            Add New Staff
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Capabilities</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: any, index: number) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/staff/${user.id}`)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Small Avatar beside the name */}
                      <Avatar
                        src={user.avatar_url}
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: '#1a2035', 
                          fontSize: '0.875rem' 
                        }}
                      >
                        {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                      </Avatar>
                      
                      <Typography variant="body2" fontWeight="bold">
                        {user.first_name} {user.last_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'PARTNER' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.position}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security sx={{ color: user.can_view_financials ? '#2e7d32' : '#9e9e9e', fontSize: 20 }} />
                      <Switch
                        checked={user.can_view_financials || false}
                        onChange={() => handleToggleCapability(user.id, user.can_view_financials)}
                        size="small"
                        color="success"
                      />
                      Finance
                    </Box>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton onClick={() => handleOpenEdit(user)} color="primary">
                      <Edit />
                    </IconButton>
                    Edit
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ borderBottom: '1px solid #eee', mb: 2 }}>
          {isEditMode ? 'Edit Staff Profile' : 'Create New Staff Member'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            
            {/* 1. Identity Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="First Name"
                fullWidth
                value={formData.first_name || ''}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Last Name"
                fullWidth
                value={formData.last_name || ''}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone Number"
                fullWidth
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Other Phone Number"
                fullWidth
                value={formData.phone2 || ''}
                onChange={(e) => setFormData({...formData, phone2: e.target.value})}
              />
            </Grid>
            {/* Only show password field when creating a NEW user */}
            {!isEditMode && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            {/* 2. Professional Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Role"
                fullWidth
                value={formData.role || 'CONSULTANT'}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <MenuItem value="PARTNER">Partner</MenuItem>
                <MenuItem value="AUDIT_MGR">Audit Manager</MenuItem>
                <MenuItem value="CONSULTANT">Consultant</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Position Title"
                fullWidth
                placeholder="e.g. Senior Auditor"
                value={formData.position || ''}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Hourly Rate ($)"
                type="number"
                fullWidth
                value={formData.hourly_rate || ''}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Joining Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.joining_date || ''}
                onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Avatar
                  src={formData.avatar_url}
                  sx={{ width: 80, height: 80, bgcolor: '#1a2035', fontSize: 30 }}
                >
                  {formData.first_name ? formData.first_name[0] : '?'}
                </Avatar>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Profile Picture</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<AddCircle />}
                    >
                      Upload Image
                      <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                    </Button>
                    {formData.avatar_url && (
                      <Button 
                        color="error" 
                        size="small" 
                        onClick={() => setFormData({ ...formData, avatar_url: '' })}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  <TextField
                    label="Or paste Image URL"
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    value={formData.avatar_url || ''}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Professional Biography"
                multiline
                rows={3}
                fullWidth
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </Grid>

            {/* 3. Skills Manager */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Skills (Type and press Enter to add)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <TextField 
                  size="small" 
                  placeholder="Add skill (e.g. GAAP)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                />
                <IconButton onClick={handleAddSkill} color="primary">
                  <AddCircle />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.skills && formData.skills.map((skill: string, index: number) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            
            {/* 4. Capabilities Toggle inside Dialog (Optional duplicate of table view) */}
            <Grid size={{ xs: 12 }}>
               <FormControlLabel
                control={
                  <Switch
                    checked={formData.can_view_financials || false}
                    onChange={(e) => setFormData({...formData, can_view_financials: e.target.checked})}
                  />
                }
                label="Grant Access to Financial Data"
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            {isEditMode ? "Save Changes" : "Create Staff Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffManagement;