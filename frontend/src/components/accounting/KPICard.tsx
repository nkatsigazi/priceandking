import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface KPICardProps {
    title: string;
    value: string;
    icon: any;
    color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderLeft: `5px solid ${color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ bgcolor: `${color}15`, p: 1, borderRadius: 1, display: 'flex', mr: 2 }}>
          {React.createElement(icon, { sx: { color: color } })}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
    </CardContent>
  </Card>
);

export default KPICard;