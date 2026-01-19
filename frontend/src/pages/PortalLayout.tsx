import { useState } from 'react';
import { 
    Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Typography, Avatar, Divider, Drawer, Badge, IconButton 
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    Dashboard, FolderCopy, Logout, 
    ChatBubbleOutline, Security 
} from '@mui/icons-material';
import Logo from '../assets/logo-white.svg';

const PortalLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [chatOpen, setChatOpen] = useState(false);

    const menuItems = [
        { label: 'Dashboard', icon: <Dashboard />, path: '/portal/overview' },
        { label: 'Documents', icon: <FolderCopy />, path: '/portal/documents' },
        { label: 'Engagements', icon: <Security />, path: '/engagements' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* SIDEBAR */}
            <Box sx={{ width: 280, bgcolor: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={Logo} alt="Price & King Logo" style={{ width: 'auto', height: 60 }} />
                </Box>

                
                <List sx={{ flexGrow: 1, px: 2 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton 
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{ 
                                    borderRadius: 2,
                                    '&.Mui-selected': { bgcolor: 'rgba(147, 17, 17, 0.2)', color: '#F87171' },
                                    '&.Mui-selected .MuiListItemIcon-root': { color: '#F87171' }
                                }}
                            >
                                <ListItemIcon sx={{ color: '#94A3B8', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* STAFF CHAT SECTION */}
                <Box sx={{ p: 2, m: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 'bold', display: 'block', mb: 1 }}>ASSIGNED STAFF</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Badge variant="dot" color="success">
                            <Avatar sx={{ width: 32, height: 32 }}>SA</Avatar>
                        </Badge>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="bold">Sarah Auditor</Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Manager</Typography>
                        </Box>
                        <IconButton size="small" sx={{ color: '#F87171' }} onClick={() => setChatOpen(true)}>
                            <ChatBubbleOutline fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ p: 2 }}>
                    <ListItemButton onClick={() => navigate('/login')} sx={{ color: '#94A3B8' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><Logout /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </Box>
            </Box>

            {/* MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1, ml: '280px', p: 4 }}>
                <Outlet />
            </Box>

            {/* CHAT DRAWER */}
            <Drawer anchor="right" open={chatOpen} onClose={() => setChatOpen(false)}>
                <Box sx={{ width: 350, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Chat with Sarah</Typography>
                    <Typography variant="body2" color="text.secondary">Secure encrypted line</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" sx={{ bgcolor: '#F1F5F9', p: 1, borderRadius: 1, display: 'block' }}>
                        Sarah: Hi! I noticed the bank statement for Q3 is missing the last page. Could you re-upload?
                    </Typography>
                </Box>
            </Drawer>
        </Box>
    );
};
export default PortalLayout;