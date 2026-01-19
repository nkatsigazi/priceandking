import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
  Button,
  Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Email,
  Phone,
  Verified,
  ArrowBack,
  AttachMoney,
  AccessTime
} from '@mui/icons-material';
import api from '../api';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('1');

  useEffect(() => {
    api.get(`staff/${id}/`).then(res => setUser(res.data));
  }, [id]);

  if (!user) return <Box p={4}>Loading Profile...</Box>;

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/staff')}
        sx={{ mb: 2 }}
      >
        Back to Directory
      </Button>

      {/* 🔥 MAIN LAYOUT — CSS GRID */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '360px 1fr'
          },
          gap: 3,
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN */}
        <Box>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user.avatar_url}
              sx={{
                width: 200,
                height: 200,
                mx: 'auto',
                mb: 2,
                bgcolor: '#1a2035',
                fontSize: 40
              }}
            >
              {user.username[0].toUpperCase()}
            </Avatar>

            <Typography variant="h5" fontWeight="bold">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user.position}
            </Typography>

            <Chip label={user.role} color="primary" size="small" sx={{ mt: 1, mb: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">
                  {user.phone || 'No phone listed'}
                  {user.phone2 ? ` / ${user.phone2}` : ''}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Verified fontSize="small" color="action" />
                <Typography variant="body2">
                  Since {user.joining_date || '2023'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Skills */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Skills & Competencies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(user.skills || ['GAAP', 'Taxation', 'Excel', 'Audit']).map(
                (skill: string) => (
                  <Chip key={skill} label={skill} variant="outlined" />
                )
              )}
            </Box>
          </Paper>
        </Box>

        {/* RIGHT COLUMN */}
        <Box sx={{ minWidth: 0 }}>
          {/* KPI ROW */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 2,
              mb: 3
            }}
          >
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                <AttachMoney color="primary" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rate
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  UGX {user.hourly_rate || '150'}/ Month
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: 2 }}>
                <AccessTime color="warning" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Utilization
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  82%
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* TABS */}
          <Paper>
            <TabContext value={tab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={(e, v) => setTab(v)}>
                  <Tab label="Biography" value="1" />
                  <Tab label="Current Engagements" value="2" />
                  <Tab label="Access Log" value="3" />
                </TabList>
              </Box>

              <TabPanel value="1">
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography color="text.secondary">
                  {user.bio ||
                    `${user.username} is a valued member of the PriceKing audit team. They specialize in statutory audits for mid-sized LLCs and have extensive experience with regulatory compliance.`}
                </Typography>
              </TabPanel>

              <TabPanel value="2">
                <Typography variant="body2" color="text.secondary">
                  Engagements where this staff member is lead auditor.
                </Typography>
              </TabPanel>

              <TabPanel value="3">
                <Typography variant="body2" color="text.secondary">
                  Login & access history coming soon.
                </Typography>
              </TabPanel>
            </TabContext>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default StaffDetail;