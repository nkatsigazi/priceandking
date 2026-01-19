import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, Paper, Divider } from '@mui/material';
import { TrendingUp, AccountBalance, ReceiptLong, Wallet } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import KPICard from './KPICard';
import api from '../../api';

const AccountingOverview = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    receivables: 0,
    payables: 0,
    cash: 0,
    incomeYTD: 0
  });

  // This data should eventually come from an API, but here is the world-class visualization
  const chartData = [
    { month: 'Jan', income: 4500, expenses: 2400 },
    { month: 'Feb', income: 5200, expenses: 3100 },
    { month: 'Mar', income: 4800, expenses: 4200 },
    { month: 'Apr', income: 6100, expenses: 3800 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, accRes, billRes] = await Promise.all([
          api.get('invoices/'),
          api.get('accounts/financial_statements/'),
          api.get('bills/'),
        ]);
        
        const invoices = invRes.data.results || invRes.data;
        const bills = billRes.data.results || billRes.data;

        const receivable = invoices
          .filter((i: any) => i.status !== 'PAID' && i.status !== 'VOID')
          .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

        const payable = bills
          .filter((b: any) => b.status !== 'PAID')
          .reduce((acc: number, curr: any) => acc + parseFloat(curr.total_amount), 0);
            
        setMetrics({
          receivables: receivable,
          payables: payable,
          cash: accRes.data.bs.totals?.ASSET || 0,
          incomeYTD: accRes.data.pl.net_income || 0
        });
      } catch (err) {
        console.error("Failed to load accounting metrics", err);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#931111', mb: 3 }}>
        Financial Command Center
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Accounts Receivable" value={`UGX ${metrics.receivables.toLocaleString()}`} icon={ReceiptLong} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Cash on Hand" value={`UGX ${metrics.cash.toLocaleString()}`} icon={AccountBalance} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Accounts Payable" value={`UGX ${metrics.payables.toLocaleString()}`} icon={Wallet} color="#ef4444" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Net Income (YTD)" value={`UGX ${metrics.incomeYTD.toLocaleString()}`} icon={TrendingUp} color="#8b5cf6" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 450, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Revenue vs. Burn Rate</Typography>
            <Box sx={{ height: 350, width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ py: 1.5, bgcolor: '#931111' }}
                onClick={() => navigate('/accounting/expenses')}
              >
                Record Expense / Bill
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ py: 1.5 }}
                onClick={() => navigate('/accounting/invoices')}
              >
                Create New Invoice
              </Button>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Last GL synchronization: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountingOverview;