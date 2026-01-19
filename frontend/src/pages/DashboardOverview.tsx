import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, LinearProgress, Stack, Avatar } from '@mui/material';
import { 
  Business, 
  Assignment, 
  QueryStats, 
  WarningAmber, 
  CheckCircleOutline, 
  AccountBalance 
} from '@mui/icons-material';
import api from '../api';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeEngagements: 0,
    highRiskClients: 0,
    avgCompletion: 0,
    completedAudits: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientRes, engRes] = await Promise.all([
          api.get('clients/'),
          api.get('engagements/')
        ]);

        const clients = clientRes.data;
        const engagements = engRes.data;

        // Calculate metrics from live data
        const active = engagements.filter((e: any) => e.status !== 'COMPLETED').length;
        const completed = engagements.filter((e: any) => e.status === 'COMPLETED').length;
        const highRisk = clients.filter((c: any) => c.risk_rating === 'HIGH').length;
        
        const totalProgress = engagements.reduce((acc: number, curr: any) => 
            acc + (curr.completion_percentage || 0), 0);
        
        const totalTasks = engagements.reduce((acc: number, curr: any) => 
            acc + (curr.task_count || 0), 0);

        setStats({
          totalClients: clients.length,
          activeEngagements: active,
          highRiskClients: highRisk,
          avgCompletion: engagements.length > 0 ? Math.round(totalProgress / engagements.length) : 0,
          completedAudits: completed,
          totalTasks: totalTasks
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="600" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ color: '#1a2035', my: 1 }}>
            {value}
          </Typography>
          {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, borderRadius: 2 }}>
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );

  if (loading) return <Box sx={{ p: 4 }}><Typography>Calculating metrics...</Typography></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1600, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#931111' }}>
        Practice Management Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: High Level Totals */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="TOTAL CLIENTS" 
            value={stats.totalClients} 
            icon={<Business />} 
            color="#1976d2" 
            subtext="Active entity accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="ACTIVE ENGAGEMENTS" 
            value={stats.activeEngagements} 
            icon={<Assignment />} 
            color="#ed6c02" 
            subtext="Workflows in progress"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="HIGH RISK ENTITIES" 
            value={stats.highRiskClients} 
            icon={<WarningAmber />} 
            color="#d32f2f" 
            subtext="Requiring partner oversight"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="COMPLETED AUDITS" 
            value={stats.completedAudits} 
            icon={<CheckCircleOutline />} 
            color="#2e7d32" 
            subtext="Archive ready"
          />
        </Grid>

        {/* Row 2: Progress & Volume */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Overall Engagement Progress</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Weighted completion percentage across all open audit workspaces.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h2" fontWeight="bold" color="primary">{stats.avgCompletion}%</Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.avgCompletion} 
                  sx={{ height: 12, borderRadius: 5, bgcolor: '#f0f2f5' }} 
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
                Target: 100% completion by fiscal year end
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#1a351a', color: 'white' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">Resource Volume</Typography>
              <Box>
                <Typography variant="h4">{stats.totalTasks}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Audit Procedures</Typography>
              </Box>
              <Box>
                <Typography variant="h4">0</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Pending Review Sign-offs</Typography>
              </Box>
              <Box sx={{ pt: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Statistics updated in real-time based on staff activity.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;