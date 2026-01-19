import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, LinearProgress, Chip, 
    Tab, Paper, Breadcrumbs, Link as MuiLink 
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { 
    Assignment, Description, Dashboard, 
    CheckCircle, AccessTime 
} from '@mui/icons-material';
import api from '../api';

// Child Components
import EngagementOverview from '../components/EngagementOverview';
import EngagementDocs from '../components/EngagementDocs';
import EngagementTasks from '../components/EngagementTasks';
import EngagementHistory from '../components/EngagementHistory';

const EngagementWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<any>(null);
  const [tab, setTab] = useState('1');

  const fetchEngagement = async () => {
    try {
        const res = await api.get(`engagements/${id}/`);
        setEngagement(res.data);
    } catch (err) {
        console.error("Failed to load engagement", err);
    }
  };

  useEffect(() => { 
    if (id) fetchEngagement(); 
  }, [id]);

  if (!engagement) return <LinearProgress />;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa' }}>
      
      {/* 1. Workspace Header */}
      <Paper sx={{ p: 3, borderRadius: 0, borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
        
        <Breadcrumbs sx={{ mb: 2 }}>
            <MuiLink 
                component="button" 
                variant="body2"
                color="inherit" 
                onClick={() => navigate('/clients')}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
                Clients
            </MuiLink>
            
            <MuiLink 
                component="button" 
                variant="body2"
                color="inherit" 
                onClick={() => navigate(`/clients/${engagement.client}`)}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
                {engagement.client_name}
            </MuiLink>

            <Typography variant="body2" color="text.primary" fontWeight="500">
                {engagement.name}
            </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              {engagement.year} {engagement.engagement_type}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#931111' }}>
              {engagement.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                    icon={engagement.status === 'COMPLETED' ? <CheckCircle/> : <AccessTime/>} 
                    label={engagement.status} 
                    color={engagement.status === 'COMPLETED' ? "success" : "primary"} 
                    variant="outlined" 
                    size="small" 
                />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right', minWidth: 250 }}>
             <Typography variant="body2" color="text.secondary" fontWeight="500">
                Overall Audit Progress
             </Typography>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                 <LinearProgress 
                    variant="determinate" 
                    value={engagement.completion_percentage || 0} 
                    color={engagement.completion_percentage === 100 ? "success" : "primary"}
                    sx={{ width: '100%', height: 10, borderRadius: 5, bgcolor: '#ebeef5' }} 
                 />
                 <Typography variant="h6" fontWeight="bold">
                    {Math.round(engagement.completion_percentage || 0)}%
                 </Typography>
             </Box>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ mt: 3 }}>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={(_, v) => setTab(v)}>
                        <Tab icon={<Dashboard fontSize="small"/>} iconPosition="start" label="Overview" value="1" />
                        <Tab icon={<Assignment fontSize="small"/>} iconPosition="start" label="Audit Checklist" value="2" />
                        <Tab icon={<Description fontSize="small"/>} iconPosition="start" label="Workpapers" value="3" />
                        <Tab label="History Log" value="4" />
                    </TabList>
                </Box>
            </TabContext>
        </Box>
      </Paper>

      {/* 2. Workspace Content Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <TabContext value={tab}>
          <TabPanel value="1" sx={{ p: 0 }}>
             <EngagementOverview data={engagement} onUpdate={fetchEngagement} onSwitchToTasks={() => setTab('2')} />
          </TabPanel>
          
          <TabPanel value="2" sx={{ p: 0 }}>
             {/* LINKED: When a task is updated here, fetchEngagement is called above */}
             <EngagementTasks 
                engagementId={Number(id)} 
                onUpdate={fetchEngagement} 
             />
          </TabPanel>
          
          <TabPanel value="3" sx={{ p: 0 }}>
             <EngagementDocs engagementId={Number(id)} />
          </TabPanel>

          <TabPanel value="4">
            <EngagementHistory engagementId={id!} />
        </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default EngagementWorkspace;