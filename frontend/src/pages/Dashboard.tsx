import React, { useState } from 'react';
import { 
  Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, 
  Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Collapse, Avatar, IconButton
} from '@mui/material';
import { 
  Dashboard as DashIcon, People, AccountBalance, Logout, Security,
  ExpandLess, ExpandMore, FolderShared, Assignment, PersonAdd, Settings, Group,
  QueryStats, ReceiptLong, Wallet, Description
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Logo from '../assets/logo-white.svg';

const drawerWidth = 260;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Logic to determine active tab based on current URL
  const pathToTab: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/clients': 'Clients',
    '/engagements': 'Engagements',
    '/accounting': 'Accounting',
    '/staff': 'Staff Management',
    '/settings': 'Firm Settings',
  };

  // Find the longest matching path prefix
  const currentPath = Object.keys(pathToTab).reduce((longest, current) => {
    if (location.pathname.startsWith(current) && current.length > longest.length) {
      return current;
    }
    return longest;
  }, '');

  const activeTab = pathToTab[currentPath] || 'Dashboard';

  const [openClients, setOpenClients] = useState(true);
  const [openAdmin, setOpenAdmin] = useState(true);
  const [openAccounting, setOpenAccounting] = useState(true);

  const clientsActive = ['/clients', '/clients/new', '/engagements'].some(p => location.pathname.startsWith(p));
  const adminActive = ['/staff', '/settings'].some(p => location.pathname.startsWith(p));

  const selectedColor = '#98af4c';
  const sidebarBg = '#1f4d68';

  const listItemButtonSx = (isSub = false) => ({
    borderRadius: '8px',
    mb: 0.25,
    mx: 1,
    px: isSub ? 1.5 : 2,
    transition: 'all 0.2s',
    '&.Mui-selected': {
      bgcolor: 'rgba(152, 175, 76, 0.15)',
      '&:hover': { bgcolor: 'rgba(152, 175, 76, 0.25)' },
    },
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateX(4px)'
    }
  });

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* Top Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`, 
          bgcolor: '#fff', 
          color: '#000', 
          boxShadow: 1 
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {activeTab} Overview
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, color: 'text.secondary' }}>
            Welcome, Administrator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: sidebarBg,
            color: '#fff',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            borderRight: 'none',
            // CUSTOM SCROLLBAR STYLING
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
            // Firefox support
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.5) transparent',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={Logo} alt="Price & King Logo" style={{ width: 'auto', height: 60 }} />
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <List component="nav" sx={{ flexGrow: 1, px: 1 }}>
          {/* DASHBOARD */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/dashboard')}
              selected={location.pathname.startsWith('/dashboard')}
              sx={listItemButtonSx()}
            >
              <ListItemIcon sx={{ color: location.pathname.startsWith('/dashboard') ? selectedColor : '#fff' }}>
                <DashIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1.5, mx: 2, bgcolor: 'rgba(255, 255, 255, 0.26)' }} />

          {/* CRM & CLIENTS SECTION */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setOpenClients(!openClients)}
              selected={clientsActive}
              sx={listItemButtonSx()}
            >
              <ListItemIcon sx={{ color: clientsActive ? selectedColor : '#fff' }}>
                <People />
              </ListItemIcon>
              <ListItemText primary="CRM & Clients" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: clientsActive ? selectedColor : '#fff' }} />
              {openClients ? <ExpandLess sx={{ opacity: 0.5 }} /> : <ExpandMore sx={{ opacity: 0.5 }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openClients} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith('/clients') && !location.pathname.startsWith('/clients/new')}
                  onClick={() => navigate('/clients')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname.startsWith('/clients') && !location.pathname.startsWith('/clients/new') ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <FolderShared sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="All Clients" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith('/engagements')}
                  onClick={() => navigate('/engagements')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname.startsWith('/engagements') ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Assignment sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Engagements" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ my: 1.5, mx: 2, bgcolor: 'rgba(255, 255, 255, 0.26)' }} />

          {/* ACCOUNTING SECTION */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setOpenAccounting(!openAccounting)}
              selected={location.pathname.startsWith('/accounting')}
              sx={listItemButtonSx()}
            >
              <ListItemIcon sx={{ color: location.pathname.startsWith('/accounting') ? selectedColor : '#fff' }}>
                <AccountBalance />
              </ListItemIcon>
              <ListItemText primary="Accounting" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: location.pathname.startsWith('/accounting') ? selectedColor : '#fff' }} />
              {openAccounting ? <ExpandLess sx={{ opacity: 0.5 }} /> : <ExpandMore sx={{ opacity: 0.5 }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openAccounting} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/accounting'}
                  onClick={() => navigate('/accounting')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname === '/accounting' ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <QueryStats sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Overview" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/accounting/invoices'}
                  onClick={() => navigate('/accounting/invoices')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname === '/accounting/invoices' ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <ReceiptLong sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Sales & Invoices" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/accounting/expenses'}
                  onClick={() => navigate('/accounting/expenses')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname === '/accounting/expenses' ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Wallet sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Expenses & Bills" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/accounting/reports'}
                  onClick={() => navigate('/accounting/reports')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname === '/accounting/reports' ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Description sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Financial Reports" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>
              
               <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/accounting/coa'}
                  onClick={() => navigate('/accounting/coa')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname === '/accounting/coa' ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Settings sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Chart of Accounts" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ my: 1.5, mx: 2, bgcolor: 'rgba(255, 255, 255, 0.26)' }} />

          {/* ADMINISTRATION */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setOpenAdmin(!openAdmin)}
              selected={adminActive}
              sx={listItemButtonSx()}
            >
              <ListItemIcon sx={{ color: adminActive ? selectedColor : '#fff' }}>
                <Security />
              </ListItemIcon>
              <ListItemText primary="Administration" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: adminActive ? selectedColor : '#fff' }} />
              {openAdmin ? <ExpandLess sx={{ opacity: 0.5 }} /> : <ExpandMore sx={{ opacity: 0.5 }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openAdmin} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith('/staff')}
                  onClick={() => navigate('/staff')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname.startsWith('/staff') ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Group sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Staff Management" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith('/settings')}
                  onClick={() => navigate('/settings')}
                  sx={listItemButtonSx(true)}
                >
                  <ListItemIcon sx={{ minWidth: 35, color: location.pathname.startsWith('/settings') ? selectedColor : 'rgba(255,255,255,0.7)' }}>
                    <Settings sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Firm Settings" primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </List>

        {/* BOTTOM USER SECTION */}
        <Box sx={{ mt: 'auto', p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, border: `1px solid ${selectedColor}`, fontSize: '0.8rem' }}>A</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Administrator</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>Admin</Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ color: '#ef5350' }} onClick={handleLogout}>
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#feffe8',
          p: 3,
          height: '100vh',
          overflow: 'auto',
          width: `calc(100% - ${drawerWidth}px)`
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;