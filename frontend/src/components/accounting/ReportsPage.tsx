import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Tabs,
  Tab, Button, Skeleton, Stack, Alert,
  alpha, useTheme,
} from '@mui/material';
import {
  TrendingUp, AccountBalanceWallet, Print,
  PictureAsPdf, CheckCircle, Error as ErrorIcon,
} from '@mui/icons-material';
import api from '../../api';

const ReportsPage = () => {
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    api
      .get('accounts/financial_statements/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        <Skeleton variant="rectangular" height={680} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Failed to load financial statements. Please try again later.
      </Alert>
    );
  }

  const ReportLine = ({ label, code, amount, bold = false, total = false }: any) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        py: total ? 2 : 1.2,
        px: 1.5,
        borderBottom: total ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        bgcolor: total ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
        borderRadius: total ? 2 : 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
        {code && (
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 48, fontFamily: 'monospace' }}>
            {code}
          </Typography>
        )}
        <Typography
          variant={total ? 'subtitle1' : 'body2'}
          sx={{
            fontWeight: bold || total ? 700 : 400,
            color: total ? 'primary.main' : 'text.primary',
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        variant={total ? 'h6' : 'body2'}
        sx={{
          fontWeight: total ? 800 : bold ? 700 : 500,
          color: total ? 'primary.dark' : 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {formatCurrency(amount)}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        sx={{
          mb: 4,
          bgcolor: '#00000000',
          border: `0px solid #00000000`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color="#931111">
              Financial Statements
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Fiscal Year 2026 • Price & King Management Portal
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              size="medium"
              color="inherit"
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              color="primary"
              disableElevation
            >
              Export PDF
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1.05rem',
            },
          }}
        >
          <Tab icon={<TrendingUp />} iconPosition="start" label="Profit & Loss" />
          <Tab icon={<AccountBalanceWallet />} iconPosition="start" label="Balance Sheet" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {tabValue === 0 ? (
            <Grid container spacing={4}>
              {/* Income */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight={700} color="success.dark" gutterBottom>
                  Revenue
                </Typography>
                {data.pl.data.INCOME.map((item: any) => (
                  <ReportLine
                    key={item.code}
                    label={item.name}
                    code={item.code}
                    amount={item.balance}
                  />
                ))}
                <ReportLine
                  label="Total Gross Revenue"
                  amount={data.pl.totals.INCOME}
                  bold
                  total
                />
              </Grid>

              {/* Expenses */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight={700} color="error.dark" gutterBottom>
                  Expenses
                </Typography>
                {data.pl.data.EXPENSE.map((item: any) => (
                  <ReportLine
                    key={item.code}
                    label={item.name}
                    code={item.code}
                    amount={item.balance}
                  />
                ))}
                <ReportLine
                  label="Total Operating Expenses"
                  amount={data.pl.totals.EXPENSE}
                  bold
                  total
                />
              </Grid>

              {/* Result */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 4,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: `2px dashed ${theme.palette.success.light}`,
                  }}
                >
                  <Typography variant="subtitle2" color="success.dark" gutterBottom>
                    NET OPERATING INCOME
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    color={data.pl.net_income >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(data.pl.net_income)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            // ─────────────── BALANCE SHEET ───────────────
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                  Assets
                </Typography>
                {data.bs.data.ASSET.map((item: any) => (
                  <ReportLine key={item.code} label={item.name} code={item.code} amount={item.balance} />
                ))}
                <ReportLine label="TOTAL ASSETS" amount={data.bs.totals.ASSET} total bold />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight={700} color="warning.dark" gutterBottom>
                  Liabilities
                </Typography>
                {data.bs.data.LIABILITY.map((item: any) => (
                  <ReportLine key={item.code} label={item.name} code={item.code} amount={item.balance} />
                ))}
                <ReportLine label="TOTAL LIABILITIES" amount={data.bs.totals.LIABILITY} total bold />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight={700} color="info.dark" gutterBottom>
                  Equity
                </Typography>
                {data.bs.data.EQUITY.map((item: any) => (
                  <ReportLine key={item.code} label={item.name} code={item.code} amount={item.balance} />
                ))}
                <ReportLine label="TOTAL EQUITY" amount={data.bs.totals.EQUITY} total bold />

                <Paper
                  variant="outlined"
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: data.bs.check === 0 ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.error.main, 0.08),
                    borderColor: data.bs.check === 0 ? 'success.light' : 'error.light',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {data.bs.check === 0 ? (
                      <CheckCircle color="success" fontSize="large" />
                    ) : (
                      <ErrorIcon color="error" fontSize="large" />
                    )}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {data.bs.check === 0 ? 'Balanced' : 'Out of Balance'}
                      </Typography>
                      {data.bs.check !== 0 && (
                        <Typography variant="h6" color="error" fontWeight={800}>
                          {formatCurrency(Math.abs(data.bs.check))}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsPage;