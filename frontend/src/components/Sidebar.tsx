import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore, People, AccountBalance, Dashboard as DashIcon, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [openCrm, setOpenCrm] = React.useState(false);

  return (
    <div style={{ width: 250, background: '#1a2035', color: '#fff', height: '100vh' }}>
      <div style={{ padding: 20, fontWeight: 'bold', fontSize: 24, color: '#4caf50' }}>
        Price & King
      </div>
      <List component="nav">
        
        {/* Dashboard */}
        <ListItemButton onClick={() => navigate('/dashboard')}>
          <ListItemIcon><DashIcon style={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* CRM Module with Sub-items */}
        <ListItemButton onClick={() => setOpenCrm(!openCrm)}>
          <ListItemIcon><People style={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="CRM & Clients" />
          {openCrm ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openCrm} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/clients')}>
              <ListItemText primary="All Clients" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/clients/new')}>
              <ListItemText primary="Onboard Client" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Accounting */}
        <ListItemButton onClick={() => navigate('/accounting')}>
          <ListItemIcon><AccountBalance style={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="Accounting" />
        </ListItemButton>

        {/* Admin only */}
        <ListItemButton onClick={() => navigate('/admin/users')}>
          <ListItemIcon><Security style={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="Staff Management" />
        </ListItemButton>

      </List>
    </div>
  );
};

export default Sidebar;