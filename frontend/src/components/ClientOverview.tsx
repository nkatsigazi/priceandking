import { 
  Paper, Typography, Box, Chip
} from '@mui/material';
import { Business, CalendarToday, Person } from '@mui/icons-material';

// 1. Define the interface to include onUpdate
interface ClientOverviewProps {
  client: any;
  onUpdate: () => Promise<void> | void; // Add this line
}

  const ClientOverview = ({ client, onUpdate: _onUpdate }: ClientOverviewProps) => {

  const InfoRow = ({ icon, label, value }: any) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ color: 'text.secondary', mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight="500">{value || '-'}</Typography>
      </Box>
    </Box>
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">Client Overview</Typography>
      </Box>

      <InfoRow icon={<Business />} label="Entity Type" value={client.entity_type} />
      <InfoRow icon={<Person />} label="Assigned Partner" value={client.partner?.username || 'Unassigned'} />
      <InfoRow icon={<CalendarToday />} label="Fiscal Year End" value={client.fiscal_year_end} />
      
      <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Status</Typography>
          <Box sx={{ mt: 1 }}>
              <Chip 
                  label={client.is_active ? "Active Client" : "Inactive"} 
                  color={client.is_active ? "success" : "default"} 
                  size="small" 
              />
          </Box>
      </Box>
    </Paper>
  );
};

export default ClientOverview;