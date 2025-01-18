import React, { useState } from 'react';
import { 
  Container, Paper, TextField, Grid, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Box, ThemeProvider, createTheme, MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Fix type declarations for event handlers
type InputChangeEvent = React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>;
type TabChangeEvent = React.SyntheticEvent<{}, Event>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Assumptions {
  monthlyNewMembers: number;
  subscriptionPrice: number;
  annualPriceIncrease: number;
  ptRevenuePercentage: number;
  ptPrice: number;
  ptRevenueShare: number;
  annualExpenseIncrease: number;
  taxRate: number;
  projectLife: number;
  discountRate: number;
  reinvestmentRate: number;
  financingRate: number;
  maxCapacity: number;
  retentionRate: number;
  salvageValue: number;
  useLoan: boolean;
  loanAmount: number;
  loanTenure: number;  // in years
  loanInterest: number;  // annual rate
}

interface MonthlyData {
  month: string;
  year: number;
  targetSales: number;
  newMembers: number;
  repeatMembers: number;
  expiredMembers: number;
  totalMembers: number;
  startMembers: number;
  subscriptionRevenue: number;
  ptRevenue: number;
  totalRevenue: number;
  expenses: number;
  grossMargin: number;
  grossMarginPercentage: number;
  ptSalesPercentage: number;
  depreciation: number;
  interest: number;
  ebitda: number;
  ebitdaPercentage: number;
  pbt: number;
  tax: number;
  pat: number;
  fcf: number;
  dcf: number;
  cumulativeFcf: number;
  cumulativeDcf: number;
  cumulativeNpv: number;  // Add this new property
  emi: number;
  loanInterest: number;
  loanPrincipal: number;
  loanBalance: number;
}

interface Asset {
  name: string;
  cost: number;
  rate: number;
}

const assets: Asset[] = [
  { name: "Building (Interiors)", cost: 10000000, rate: 5 },
  { name: "Machinery/Equipment", cost: 20000000, rate: 15 },
  { name: "Franchise", cost: 3000000, rate: 25 },
  { name: "Furniture & fixtures", cost: 5000000, rate: 10 },
  { name: "Computers/Electronics", cost: 1500000, rate: 15 },
  { name: "Software", cost: 500000, rate: 25 }
];

const initialAssumptions: Assumptions = {
  monthlyNewMembers: 80,
  subscriptionPrice: 30000,
  annualPriceIncrease: 10,
  ptRevenuePercentage: 7,
  ptPrice: 25000,
  ptRevenueShare: 60,
  annualExpenseIncrease: 10,
  taxRate: 30,
  projectLife: 7,
  discountRate: 7,      // changed from 12
  reinvestmentRate: 15, // changed from 8
  financingRate: 10,    // changed from 12
  maxCapacity: 1000,
  retentionRate: 40,
  salvageValue: 10,
  useLoan: false,
  loanAmount: 20000000,
  loanTenure: 5,
  loanInterest: 12
};

const metrics = [
  { label: 'Target Sales', key: 'targetSales' },
  { label: 'New Members', key: 'newMembers' },
  { label: 'Repeat Members', key: 'repeatMembers' },
  { label: 'Expired Members', key: 'expiredMembers' },
  { label: 'Total Members', key: 'totalMembers' },
  { label: 'Subscription Revenue', key: 'subscriptionRevenue', format: true },
  { label: 'PT Revenue', key: 'ptRevenue', format: true },
  { label: 'Total Revenue', key: 'totalRevenue', format: true },
  { label: 'Monthly Expenses', key: 'expenses', format: true },
  { label: 'Gross Margin', key: 'grossMargin', format: true },
  { label: 'Gross Margin %', key: 'grossMarginPercentage', percentage: true },
  { label: 'PT Sales %', key: 'ptSalesPercentage', percentage: true },
  { label: 'Depreciation', key: 'depreciation', format: true },
  { label: 'Interest', key: 'interest', format: true },
  { label: 'EBITDA', key: 'ebitda', format: true },
  { label: 'EBITDA %', key: 'ebitdaPercentage', percentage: true },
  { label: 'PBT', key: 'pbt', format: true },
  { label: 'Tax', key: 'tax', format: true },
  { label: 'PAT', key: 'pat', format: true },
  { label: 'EMI', key: 'emi', format: true },
  { label: 'Loan Interest', key: 'loanInterest', format: true },
  { label: 'Loan Principal', key: 'loanPrincipal', format: true },
  { label: 'Loan Balance', key: 'loanBalance', format: true },
  { label: 'FCF', key: 'fcf', format: true },
  { label: 'Cumulative FCF', key: 'cumulativeFcf', format: true },
  { label: 'DCF', key: 'dcf', format: true },
  { label: 'Cumulative DCF', key: 'cumulativeDcf', format: true },
  { label: 'Cumulative NPV', key: 'cumulativeNpv', format: true }  // Add this new metric
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;  // Show 2 decimal places for Crores
  } else if (absValue >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;     // Show 2 decimal places for Lakhs
  } else {
    return `₹${value.toFixed(2)}`;                  // Show 2 decimal places for other values
  }
};

const calculateDepreciation = (year: number): number => {
  return assets.reduce((total, asset) => {
    let assetValue = asset.cost;
    for (let i = 0; i <= year; i++) {
      if (i === year) {
        return total + (assetValue * (asset.rate / 100));
      }
      assetValue = assetValue * (1 - asset.rate / 100);
    }
    return total;
  }, 0);
};

const calculateMonthlyData = (assumptions: Assumptions): MonthlyData[] => {
  const data: MonthlyData[] = [];
  const months = assumptions.projectLife * 12;
  let totalMembers = 0;
  let cumulativeFcf = 0;
  let cumulativeDcf = 0;
  let cumulativeNpv = 0;
  
  // Calculate EMI if loan is used
  const monthlyRate = assumptions.useLoan ? (assumptions.loanInterest / 12 / 100) : 0;
  const loanTenureMonths = assumptions.loanTenure * 12;
  const emi = assumptions.useLoan ? 
    (assumptions.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenureMonths)) / 
    (Math.pow(1 + monthlyRate, loanTenureMonths) - 1) : 0;
  
  let loanBalance = assumptions.useLoan ? assumptions.loanAmount : 0;

  for (let t = 0; t < months; t++) {
    const year = Math.floor(t / 12);
    const date = new Date(2025, 3 + t);
    
    const repeatMembers = t < 12 ? 0 : Math.floor(data[t - 12].newMembers * (assumptions.retentionRate / 100));
    const expiredMembers = t < 12 ? 0 : Math.floor(data[t - 12].newMembers * (1 - assumptions.retentionRate / 100));
    const targetSales = assumptions.monthlyNewMembers;
    
    const roomLeft = assumptions.maxCapacity - totalMembers;
    const newMembers = Math.min(targetSales - repeatMembers, roomLeft);
    
    const startMembers = targetSales;
    
    totalMembers = Math.max(0, totalMembers + repeatMembers + newMembers - expiredMembers);

    const priceIncreaseFactor = Math.pow(1 + assumptions.annualPriceIncrease / 100, year);
    const subscriptionRevenue = startMembers * assumptions.subscriptionPrice * priceIncreaseFactor;
    const ptRevenue = totalMembers * (assumptions.ptRevenuePercentage / 100) * 
                     assumptions.ptPrice * (assumptions.ptRevenueShare / 100) * priceIncreaseFactor;
    const totalRevenue = subscriptionRevenue + ptRevenue;
    
    const expenseIncreaseFactor = Math.pow(1 + assumptions.annualExpenseIncrease / 100, year);
    const monthlyExpenses = (720000 + 324000 + 351600 + 177600 + 71996.4) * expenseIncreaseFactor;
    
    const grossMargin = totalRevenue - monthlyExpenses;
    const grossMarginPercentage = (grossMargin / totalRevenue) * 100;
    const ptSalesPercentage = (ptRevenue / totalRevenue) * 100;
    
    const monthlyDepreciation = calculateDepreciation(year) / 12;
    
    // Calculate loan components first
    const loanInterest = loanBalance * monthlyRate;
    const loanPrincipal = t < loanTenureMonths ? (emi - loanInterest) : 0;
    loanBalance = Math.max(0, loanBalance - loanPrincipal);
    
    // Update EBITDA calculation
    const ebitda = grossMargin;
    const ebitdaPercentage = (ebitda / totalRevenue) * 100;
    
    // Include loan interest in PBT calculation
    const pbt = ebitda - monthlyDepreciation - loanInterest;
    const tax = pbt * (assumptions.taxRate / 100);
    const pat = pbt - tax;
    
    // Calculate FCF:
    // 1. Start with PAT
    // 2. Add back depreciation (non-cash expense)
    // 3. Include full initial investment (not reduced by loan)
    const fcf = pat + monthlyDepreciation - 
                (t === 0 ? assets.reduce((sum, a) => sum + a.cost, 0) : 0);
    
    cumulativeFcf += fcf;
    
    const dcf = fcf / Math.pow(1 + assumptions.discountRate / 100, t / 12);
    cumulativeDcf += dcf;
    
    // Calculate NPV
    const npv = fcf / Math.pow(1 + assumptions.discountRate / 100, t / 12);
    cumulativeNpv += npv;

    data.push({
      month: `${date.getFullYear().toString().slice(-2)}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      year,
      targetSales,
      newMembers,
      repeatMembers,
      expiredMembers,
      totalMembers,
      startMembers,
      subscriptionRevenue,
      ptRevenue,
      totalRevenue,
      expenses: monthlyExpenses,
      grossMargin,
      grossMarginPercentage,
      ptSalesPercentage,
      depreciation: monthlyDepreciation,
      interest: loanInterest, // Update interest to use loan interest
      ebitda,
      ebitdaPercentage,
      pbt,
      tax,
      pat,
      emi,
      loanInterest,
      loanPrincipal,
      loanBalance,
      fcf,
      dcf,
      cumulativeFcf,
      cumulativeDcf,
      cumulativeNpv
    });
  }

  return data;
};

const calculateIRR = (cashFlows: number[]): number => {
  const maxIterations = 1000;
  const tolerance = 0.000001;
  
  let guess = 0.1;
  
  const f = (rate: number) => {
    return cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  };
  
  const df = (rate: number) => {
    return cashFlows.reduce((sum, cf, i) => sum - i * cf / Math.pow(1 + rate, i + 1), 0);
  };
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = f(guess);
    if (Math.abs(fx) < tolerance) {
      return guess * 100;
    }
    guess = guess - fx / df(guess);
  }
  
  return 0;
};

const calculateMIRR = (cashFlows: number[], reinvestmentRate: number, financingRate: number): number => {
  const positiveCFs = cashFlows.map((cf, i) => cf > 0 ? cf * Math.pow(1 + reinvestmentRate / 100, cashFlows.length - 1 - i) : 0);
  const negativeCFs = cashFlows.map((cf, i) => cf < 0 ? cf * Math.pow(1 + financingRate / 100, -i) : 0);
  
  const terminalValue = positiveCFs.reduce((sum, cf) => sum + cf, 0);
  const presentValue = Math.abs(negativeCFs.reduce((sum, cf) => sum + cf, 0));
  
  return (Math.pow(terminalValue / presentValue, 1 / (cashFlows.length - 1)) - 1) * 100;
};

function App() {
  const [assumptions, setAssumptions] = useState<Assumptions>(initialAssumptions);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: TabChangeEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCalculate = () => {
    const data = calculateMonthlyData(assumptions);
    setMonthlyData(data);
  };

  // Update the handleInputChange function to handle boolean values
  const handleInputChange = (field: keyof Assumptions) => (event: InputChangeEvent) => {
    let value: number | boolean;
    
    if (field === 'useLoan') {
      value = event.target.value === 'true';
    } else {
      // Convert empty string to 0 instead of keeping it as string
      value = event.target.value === '' ? 0 : Number(event.target.value);
    }
    
    setAssumptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateValuationMetrics = () => {
    if (!monthlyData.length) return null;

    const yearlyFCF = monthlyData.reduce((acc, curr) => {
      const year = curr.year;
      if (!acc[year]) acc[year] = 0;
      acc[year] += curr.fcf;
      return acc;
    }, {} as Record<number, number>);

    const fcfArray = Object.values(yearlyFCF);
    const npv = monthlyData[monthlyData.length - 1].cumulativeNpv;
    const irr = calculateIRR(fcfArray);
    const mirr = calculateMIRR(fcfArray, assumptions.reinvestmentRate, assumptions.financingRate);
    const paybackPeriod = monthlyData.findIndex(d => d.cumulativeFcf > 0) / 12;

    return { npv, irr, mirr, paybackPeriod };
  };

  const valuationMetrics = monthlyData.length ? calculateValuationMetrics() : null;

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
          Gym Financial Model
        </Typography>

        <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
            Key Assumptions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Monthly Target Sales"
                type="number"
                value={assumptions.monthlyNewMembers}
                onChange={handleInputChange('monthlyNewMembers') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Maximum Capacity"
                type="number"
                value={assumptions.maxCapacity}
                onChange={handleInputChange('maxCapacity') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Subscription Price (INR)"
                type="number"
                value={assumptions.subscriptionPrice}
                onChange={handleInputChange('subscriptionPrice') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Annual Price Increase (%)"
                type="number"
                value={assumptions.annualPriceIncrease}
                onChange={handleInputChange('annualPriceIncrease') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Discount Rate (%)"
                type="number"
                value={assumptions.discountRate}
                onChange={handleInputChange('discountRate') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Project Life (Years)"
                type="number"
                value={assumptions.projectLife}
                onChange={handleInputChange('projectLife') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Reinvestment Rate (%)"
                type="number"
                value={assumptions.reinvestmentRate}
                onChange={handleInputChange('reinvestmentRate') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Financing Rate (%)"
                type="number"
                value={assumptions.financingRate}
                onChange={handleInputChange('financingRate') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#666' }}>Loan Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Use Loan"
                select
                value={assumptions.useLoan.toString()}
                onChange={handleInputChange('useLoan') as React.ChangeEventHandler<HTMLInputElement>}
                variant="outlined"
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
            {assumptions.useLoan && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Loan Amount (INR)"
                    type="number"
                    value={assumptions.loanAmount}
                    onChange={handleInputChange('loanAmount') as React.ChangeEventHandler<HTMLInputElement>}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Loan Tenure (Years)"
                    type="number"
                    value={assumptions.loanTenure}
                    onChange={handleInputChange('loanTenure') as React.ChangeEventHandler<HTMLInputElement>}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Loan Interest Rate (%)"
                    type="number"
                    value={assumptions.loanInterest}
                    onChange={handleInputChange('loanInterest') as React.ChangeEventHandler<HTMLInputElement>}
                    variant="outlined"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={handleCalculate}
                size="large"
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }}
              >
                Calculate
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {monthlyData.length > 0 && (
          <>
            <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
                Valuation Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>NPV</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.npv ? formatCurrency(valuationMetrics.npv) : '₹0.00'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>IRR</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.irr ? valuationMetrics.irr.toFixed(2) + '%' : '0%'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>MIRR</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.mirr ? valuationMetrics.mirr.toFixed(2) + '%' : '0%'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>Payback Period</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.paybackPeriod ? valuationMetrics.paybackPeriod.toFixed(2) + ' years' : '0 years'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ mb: 4, boxShadow: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Tab label="Financial Metrics" sx={{ textTransform: 'none' }} />
                <Tab label="Depreciation Schedule" sx={{ textTransform: 'none' }} />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 4 }}>
                  <LineChart width={1000} height={400} data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="ebitda" stroke="#1976d2" name="EBITDA" />
                    <Line type="monotone" dataKey="pat" stroke="#2e7d32" name="PAT" />
                    <Line type="monotone" dataKey="fcf" stroke="#ed6c02" name="FCF" />
                  </LineChart>
                </Box>

                <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell 
                          sx={{ 
                            fontWeight: 'bold', 
                            minWidth: 150,
                            position: 'sticky',
                            left: 0,
                            backgroundColor: '#f5f5f5',
                            zIndex: 3
                          }}
                        >
                          Metric
                        </TableCell>
                        {monthlyData.map(data => (
                          <TableCell key={data.month} align="right" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                            {data.month}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.map(({ label, key, format, percentage }) => (
                        <TableRow key={key} hover>
                          <TableCell 
                            sx={{ 
                              fontWeight: 'bold', 
                              minWidth: 150,
                              position: 'sticky',
                              left: 0,
                              backgroundColor: 'white',
                              zIndex: 2,
                              borderRight: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          >
                            {label}
                          </TableCell>
                          {monthlyData.map(data => (
                            <TableCell key={`${data.month}-${key}`} align="right" sx={{ minWidth: 100 }}>
                              {percentage 
                                ? `${Math.round(data[key as keyof MonthlyData])}%`
                                : format 
                                  ? formatCurrency(data[key as keyof MonthlyData])
                                  : Math.round(data[key as keyof MonthlyData])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Initial Cost</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                        {Array.from({ length: Number(assumptions.projectLife) }, (_, i) => (
                          <TableCell key={i} align="right" sx={{ fontWeight: 'bold' }}>
                            Year {i + 1}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assets.map(asset => {
                        let currentValue = asset.cost;
                        const yearlyDepreciation = [];
                        
                        for (let i = 0; i < Number(assumptions.projectLife); i++) {
                          const depreciation = currentValue * (asset.rate / 100);
                          yearlyDepreciation.push(depreciation);
                          currentValue -= depreciation;
                        }

                        return (
                          <TableRow key={asset.name} hover>
                            <TableCell sx={{ fontWeight: 'bold' }}>{asset.name}</TableCell>
                            <TableCell align="right">{formatCurrency(asset.cost)}</TableCell>
                            <TableCell align="right">{asset.rate}%</TableCell>
                            {yearlyDepreciation.map((dep, i) => (
                              <TableCell key={i} align="right">{formatCurrency(dep)}</TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;