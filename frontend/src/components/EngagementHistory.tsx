import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, Avatar, CircularProgress, Tooltip } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { History, Description, Assignment, BusinessCenter, TaskAlt, DeleteForever, Info } from '@mui/icons-material';
import api from '../api';

const EngagementHistory = ({ engagementId }: { engagementId: string }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`engagements/${engagementId}/unified_history/`)
      .then(res => { setHistory(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [engagementId]);

  const getStyle = (action: string, type: string) => {
    if (action.includes("Deleted") || action.includes("Removed")) return { color: '#d32f2f', icon: <DeleteForever sx={{ fontSize: 18 }} /> };
    if (action.includes("Sign-off")) return { color: '#2e7d32', icon: <TaskAlt sx={{ fontSize: 18 }} /> };
    if (type === 'DOCUMENT') return { color: '#0288d1', icon: <Description sx={{ fontSize: 18 }} /> };
    if (type === 'PROCEDURE') return { color: '#7b1fa2', icon: <Assignment sx={{ fontSize: 18 }} /> };
    return { color: '#546e7a', icon: <Info sx={{ fontSize: 18 }} /> };
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 800, color: '#1a2027', letterSpacing: '-0.5px' }}>
        Engagement Evidence Log
      </Typography>

      <Timeline position="right" sx={{ p: 0 }}>
        {history.map((record, index) => {
          const style = getStyle(record.action, record.type);
          
          return (
            <TimelineItem key={index}>
              <TimelineOppositeContent sx={{ flex: 0.2, py: 2, fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>
                {new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                <br />
                {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: 'white', border: `2px solid ${style.color}`, boxShadow: 'none' }}>
                  {style.icon}
                </TimelineDot>
                {index !== history.length - 1 && <TimelineConnector sx={{ bgcolor: '#f0f0f0' }} />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2, px: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  bgcolor: record.action.includes("Deleted") ? '#fff5f5' : '#ffffff',
                  border: `1px solid ${record.action.includes("Deleted") ? '#feb2b2' : '#f0f0f0'}`,
                  transition: '0.3s',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: style.color }}>
                      {record.action}
                    </Typography>
                    <Tooltip title={`Performed by ${record.user}`}>
                      <Chip 
                        size="small" 
                        variant="outlined"
                        label={record.user} 
                        avatar={<Avatar sx={{ bgcolor: style.color }}>{record.user[0]}</Avatar>} 
                        sx={{ height: 24, fontSize: '0.65rem' }}
                      />
                    </Tooltip>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.5 }}>
                    {record.details}
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};

export default EngagementHistory;