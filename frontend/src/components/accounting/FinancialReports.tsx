import React from 'react';
import { Box, Typography, Grid, Paper, Alert, Divider } from '@mui/material';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';

interface AccountReportItem {
  name: string;
  code: string;
  balance: number | string;
}

interface BalanceSheetData {
  data: {
    ASSET?: AccountReportItem[];
    LIABILITY?: AccountReportItem[];
    EQUITY?: AccountReportItem[];
  };
  totals: {
    ASSET: number;
    LIABILITY: number;
    EQUITY: number;
  };
  check: number;
}

const FinancialReports = ({ data }: { data: BalanceSheetData | null }) => {
  if (!data) return <Alert severity="info">Loading balance sheet...</Alert>;

  const Section = ({ title, items }: { title: string, items: AccountReportItem[] }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ bgcolor: '#f1f5f9', p: 1, borderRadius: 1, fontWeight: 700, mb: 1 }}>{title}</Typography>
      {items.map((acc) => (
        <Box key={acc.code} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="body2">{acc.code} - {acc.name}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>${parseFloat(String(acc.balance)).toLocaleString()}</Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Total {title}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
             ${(data.totals?.[title.toUpperCase().replace('S', '') as keyof typeof data.totals] || 0).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        <Section title="Assets" items={data.data?.ASSET || []} />
        <Section title="Liabilities" items={data.data?.LIABILITY || []} />
        <Section title="Equity" items={data.data?.EQUITY || []} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fcfdf2', borderColor: '#e2e8f0', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: '#931111', fontWeight: 700 }}>Quick Audit Check</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Assets</Typography><Typography fontWeight={600}>${data.totals?.ASSET?.toLocaleString()}</Typography></Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Liab + Equity</Typography><Typography fontWeight={600}>${((data.totals?.LIABILITY || 0) + (data.totals?.EQUITY || 0)).toLocaleString()}</Typography></Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: data.check === 0 ? 'success.main' : 'error.main' }}>
            {data.check === 0 ? <CheckCircle /> : <ErrorOutline />}
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{data.check === 0 ? "Books are Balanced" : "Unbalanced Entry Found"}</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FinancialReports;