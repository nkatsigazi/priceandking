import { useState } from 'react';
import {
  Box, Typography, Paper, Chip, Tabs, Tab, TextField,
  Button, Switch, FormControlLabel, Divider, Avatar,
  Select, MenuItem, FormControl, InputLabel, Autocomplete,
  Stack, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Save, Shield, Business, Rule, Mail, Language, Lock, NotificationsActive, IntegrationInstructions } from '@mui/icons-material';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  // Sample data for selects
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  const timezones = ['UTC', 'GMT+1', 'EST', 'PST', 'CST', 'AEST'];
  const complianceStandards = ['IFRS', 'GAAP', 'IAS', 'SOX', 'GDPR', 'HIPAA'];

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#931111' }}>
        System Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure Price & King firm-wide standards, security protocols, and global configurations for international operations.
      </Typography>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            bgcolor: '#f8f9fa',
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, py: 2, minWidth: 150 }
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Business sx={{ fontSize: 20 }} />} iconPosition="start" label="Firm Profile" />
          <Tab icon={<Rule sx={{ fontSize: 20 }} />} iconPosition="start" label="Audit Methodology" />
          <Tab icon={<Shield sx={{ fontSize: 20 }} />} iconPosition="start" label="Security & Access" />
          <Tab icon={<Mail sx={{ fontSize: 20 }} />} iconPosition="start" label="Notifications" />
          <Tab icon={<Language sx={{ fontSize: 20 }} />} iconPosition="start" label="Globalization" />
          <Tab icon={<IntegrationInstructions sx={{ fontSize: 20 }} />} iconPosition="start" label="Integrations" />
        </Tabs>
        <Box sx={{ p: 4 }}>
          {/* TAB 1: FIRM PROFILE */}
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="h6" fontWeight="bold">Public Branding</Typography>
                <Typography variant="body2" color="text.secondary">This appears on the Client Portal, generated Audit Reports, and global communications.</Typography>
                <Box sx={{ mt: 2, p: 3, border: '2px dashed #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
                  <Avatar src="/path/to/logo.png" sx={{ bgcolor: '#4caf50', width: 80, height: 80, mx: 'auto', mb: 2 }} alt="Firm Logo" />
                  <Button variant="outlined" size="small">Upload New Logo</Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>Recommended: SVG or PNG, 500x500px</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField fullWidth label="Firm Legal Name" defaultValue="Price & King Audit & Assurance" sx={{ mb: 3 }} />
                <TextField fullWidth label="Primary Office Address" multiline rows={3} defaultValue="123 Financial District, Suite 500, New York, NY 10001" sx={{ mb: 3 }} />
                <TextField fullWidth label="Firm Website" defaultValue="https://priceandking.com" sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField fullWidth label="Firm Tax ID" defaultValue="XX-XXXXXXX" />
                  <TextField fullWidth label="Professional License #" defaultValue="CPA-99821" />
                </Box>
                <Autocomplete
                  multiple
                  options={['New York', 'London', 'Tokyo', 'Singapore', 'Dubai', 'Sydney']}
                  defaultValue={['New York']}
                  renderInput={(params) => <TextField {...params} label="Global Office Locations" />}
                />
              </Grid>
            </Grid>
          )}
          {/* TAB 2: AUDIT METHODOLOGY */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Standard Audit Procedures</Typography>
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Enforce Peer Review (Two-party sign-off required for all tasks)"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Auto-generate 'Fraud Brainstorming' for all new Audit engagements"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch color="success" />}
                label="Enable AI-Assisted Risk Assessment (Beta)"
                sx={{ mb: 4, display: 'block' }}
              />
              <Divider sx={{ mb: 4 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Compliance Standards</Typography>
              <Autocomplete
                multiple
                options={complianceStandards}
                defaultValue={['IFRS', 'GAAP']}
                renderInput={(params) => <TextField {...params} label="Default Compliance Frameworks" />}
                sx={{ mb: 4 }}
              />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Default PBC Templates</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These items are automatically requested when a new engagement workspace is generated. Customize for global standards.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {['Trial Balance', 'General Ledger', 'Bank Statements', 'Fixed Asset Register', 'Tax Returns', 'Inventory Listings', 'Contracts & Agreements'].map((item) => (
                  <Chip key={item} label={item} onDelete={() => {}} sx={{ mr: 1, mb: 1 }} />
                ))}
                <Chip label="Add New" onClick={() => {}} variant="outlined" sx={{ mr: 1, mb: 1 }} />
              </Stack>
            </Box>
          )}
          {/* TAB 3: SECURITY & ACCESS */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Access Control</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage system-wide session security, IP restrictions, and advanced protocols for global compliance.</Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Session Timeout</InputLabel>
                <Select defaultValue="8h" label="Session Timeout">
                  <MenuItem value="1h">1 Hour</MenuItem>
                  <MenuItem value="8h">8 Hours (Standard Shift)</MenuItem>
                  <MenuItem value="24h">24 Hours</MenuItem>
                  <MenuItem value="custom">Custom...</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Require MFA for all Partner-level accounts"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Enable IP Whitelisting for Sensitive Operations"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch color="error" />}
                label="Audit Log Retention (90 Days Minimum for GDPR)"
                sx={{ mb: 4, display: 'block' }}
              />
              <Divider sx={{ mb: 4 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Data Encryption</Typography>
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Enforce AES-256 Encryption for All Data at Rest"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Enable End-to-End Encryption for Client Communications"
                sx={{ display: 'block' }}
              />
            </Box>
          )}
          {/* TAB 4: NOTIFICATIONS */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Notification Preferences</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Customize alerts, emails, and in-app notifications for team and clients.</Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Default Notification Channel</InputLabel>
                <Select defaultValue="email" label="Default Notification Channel">
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="inapp">In-App Only</MenuItem>
                  <MenuItem value="sms">SMS (Premium)</MenuItem>
                  <MenuItem value="all">All Channels</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Send Daily Engagement Summary to Partners"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Notify Clients on PBC Uploads/Requests"
                sx={{ mb: 4, display: 'block' }}
              />
              <Divider sx={{ mb: 4 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Custom Templates</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <NotificationsActive sx={{ color: '#4caf50' }} />
                  <TextField fullWidth label="New Engagement Welcome Email" multiline rows={3} defaultValue="Dear [Client], Welcome to Price & King..." />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Lock sx={{ color: '#ef5350' }} />
                  <TextField fullWidth label="Security Alert Template" multiline rows={3} defaultValue="Alert: Unusual login detected from [IP]..." />
                </Box>
              </Stack>
            </Box>
          )}
          {/* TAB 5: GLOBALIZATION */}
          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>International Settings</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Configure for global operations, ensuring compliance with international standards.</Typography>
              <Autocomplete
                options={languages}
                defaultValue="English"
                renderInput={(params) => <TextField {...params} label="Default Language" />}
                sx={{ mb: 3 }}
              />
              <Autocomplete
                options={currencies}
                defaultValue="USD"
                renderInput={(params) => <TextField {...params} label="Default Currency" />}
                sx={{ mb: 3 }}
              />
              <Autocomplete
                options={timezones}
                defaultValue="UTC"
                renderInput={(params) => <TextField {...params} label="Default Timezone" />}
                sx={{ mb: 4 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="success" />}
                label="Enable Multi-Language Support for Client Portals"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch color="success" />}
                label="Auto-Detect User Location for Regional Compliance"
                sx={{ display: 'block' }}
              />
            </Box>
          )}
          {/* TAB 6: INTEGRATIONS */}
          {tabValue === 5 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Third-Party Integrations</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Connect with world-class tools for seamless global workflows.</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4285F4' }}>G</Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">Google Workspace</Typography>
                      <Typography variant="body2" color="text.secondary">Sync calendars and docs</Typography>
                    </Box>
                    <Tooltip title="Connect">
                      <Button variant="contained" size="small" color="primary">Connect</Button>
                    </Tooltip>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#FF6600' }}>Q</Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">QuickBooks</Typography>
                      <Typography variant="body2" color="text.secondary">Import accounting data</Typography>
                    </Box>
                    <Tooltip title="Connect">
                      <Button variant="contained" size="small" color="primary">Connect</Button>
                    </Tooltip>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#0A66C2' }}>L</Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">LinkedIn</Typography>
                      <Typography variant="body2" color="text.secondary">Client prospecting</Typography>
                    </Box>
                    <Tooltip title="Connect">
                      <Button variant="contained" size="small" color="primary">Connect</Button>
                    </Tooltip>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#25D366' }}>W</Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">WhatsApp Business</Typography>
                      <Typography variant="body2" color="text.secondary">Client communications</Typography>
                    </Box>
                    <Tooltip title="Connect">
                      <Button variant="contained" size="small" color="primary">Connect</Button>
                    </Tooltip>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined">Cancel</Button>
            <Button variant="contained" color="success" startIcon={<Save />}>Save Changes</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;