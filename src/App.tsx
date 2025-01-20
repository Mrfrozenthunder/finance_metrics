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
  ptPenetration: number; // percentage of members taking PT
  ptSubscriptionPrice: number;  // Monthly PT subscription price
  ptShareWithGym: number;      // Percentage share with gym
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
  fcfPercentage: number;  // Add this new property
  ptMembers: number;
}

interface Asset {
  name: string;
  cost: number;
  rate: number;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

interface InvestmentItem {
  id: string;
  name: string;
  cost: number;
  rate: number;
}

const initialExpenses: ExpenseItem[] = [
  { id: '1', name: 'Rent', amount: 620000 },
  { id: '2', name: 'Salary', amount: 270000 },
  { id: '3', name: 'Utilities', amount: 293000 },
  { id: '4', name: 'Franchise fee', amount: 148000 },
  { id: '5', name: 'Marketing', amount: 60000 },
];

const initialInvestments: InvestmentItem[] = [
  { id: '1', name: "Building (Interiors)", cost: 10000000, rate: 5 },
  { id: '2', name: "Machinery/Equipment", cost: 20000000, rate: 15 },
  { id: '3', name: "Franchise", cost: 3000000, rate: 25 },
  { id: '4', name: "Furniture & fixtures", cost: 5000000, rate: 10 },
  { id: '5', name: "Computers/Electronics", cost: 1500000, rate: 15 },
  { id: '6', name: "Software", cost: 500000, rate: 25 }
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
  loanInterest: 12,
  ptPenetration: 7, // 7% of members take PT
  ptSubscriptionPrice: 25000,  // ₹25,000 per month
  ptShareWithGym: 60,         // 60% share with gym
};

const metrics = [
  { label: 'Target Sales', key: 'targetSales' },
  { label: 'New Members', key: 'newMembers' },
  { label: 'Repeat Members', key: 'repeatMembers' },
  { label: 'Expired Members', key: 'expiredMembers' },
  { label: 'Total Members', key: 'totalMembers' },
  { label: 'Subscription Revenue', key: 'subscriptionRevenue', format: true },
  { label: 'PT Members', key: 'ptMembers' },
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
  { label: 'FCF %', key: 'fcfPercentage', percentage: true },  // Add this new metric
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

const calculateDepreciation = (year: number, investments: InvestmentItem[]): number => {
  return investments.reduce((total, asset) => {
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

const calculateMonthlyData = (assumptions: Assumptions, expenses: ExpenseItem[], investments: InvestmentItem[]): MonthlyData[] => {
  const data: MonthlyData[] = [];
  const months = assumptions.projectLife * 12;
  
  // Add month 0 (March 2025) with just the initial investment
  const initialInvestment = -investments.reduce((sum, a) => sum + a.cost, 0);
  data.push({
    month: '25-03', // March 2025
    year: 0,
    targetSales: 0,
    newMembers: 0,
    repeatMembers: 0,
    expiredMembers: 0,
    totalMembers: 0,
    startMembers: 0,
    subscriptionRevenue: 0,
    ptRevenue: 0,
    totalRevenue: 0,
    expenses: 0,
    grossMargin: 0,
    grossMarginPercentage: 0,
    ptSalesPercentage: 0,
    depreciation: 0,
    interest: 0,
    ebitda: 0,
    ebitdaPercentage: 0,
    pbt: 0,
    tax: 0,
    pat: 0,
    fcf: initialInvestment,
    dcf: initialInvestment,
    cumulativeFcf: initialInvestment,
    cumulativeDcf: initialInvestment,
    cumulativeNpv: initialInvestment,
    emi: 0,
    loanInterest: 0,
    loanPrincipal: 0,
    loanBalance: 0,
    fcfPercentage: 0,
    ptMembers: 0
  });

  let totalMembers = 0;
  let cumulativeFcf = initialInvestment;
  let cumulativeDcf = initialInvestment;
  let cumulativeNpv = initialInvestment;

  // Calculate EMI if loan is used
  const monthlyRate = assumptions.useLoan ? (assumptions.loanInterest / 12 / 100) : 0;
  const loanTenureMonths = assumptions.loanTenure * 12;
  const emi = assumptions.useLoan ? 
    (assumptions.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenureMonths)) / 
    (Math.pow(1 + monthlyRate, loanTenureMonths) - 1) : 0;
  
  let loanBalance = assumptions.useLoan ? assumptions.loanAmount : 0;

  // Start operational months from April 2025 (t=1 to months)
  for (let t = 1; t <= months; t++) {
    const year = Math.floor((t - 1) / 12); // Adjust year calculation
    const date = new Date(2025, 3 + (t - 1)); // Start from April (month 3)
    
    const repeatMembers = t < 12 ? 0 : Math.floor(data[t - 12].newMembers * (assumptions.retentionRate / 100));
    const expiredMembers = t < 12 ? 0 : Math.floor(data[t - 12].newMembers * (1 - assumptions.retentionRate / 100));
    const targetSales = assumptions.monthlyNewMembers;
    
    const roomLeft = assumptions.maxCapacity - totalMembers;
    const newMembers = Math.min(targetSales - repeatMembers, roomLeft);
    
    const startMembers = targetSales;
    
    totalMembers = Math.max(0, totalMembers + repeatMembers + newMembers - expiredMembers);

    const priceIncreaseFactor = Math.pow(1 + assumptions.annualPriceIncrease / 100, year);
    const subscriptionRevenue = startMembers * assumptions.subscriptionPrice * priceIncreaseFactor;
    const ptMembers = Math.floor(totalMembers * (assumptions.ptPenetration / 100));
    const ptRevenue = ptMembers * assumptions.ptSubscriptionPrice * 
                     (assumptions.ptShareWithGym / 100) * priceIncreaseFactor;
    const totalRevenue = subscriptionRevenue + ptRevenue;
    
    const expenseIncreaseFactor = Math.pow(1 + assumptions.annualExpenseIncrease / 100, year);
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0) * expenseIncreaseFactor;
    
    const grossMargin = totalRevenue - monthlyExpenses;
    const grossMarginPercentage = (grossMargin / totalRevenue) * 100;
    const ptSalesPercentage = (ptRevenue / totalRevenue) * 100;
    
    const monthlyDepreciation = calculateDepreciation(year, investments) / 12;
    
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
    
    // Calculate FCF (no initial investment deduction since we're past month 0)
    const fcf = pat + monthlyDepreciation;
    
    cumulativeFcf += fcf;
    
    // Discount from month 1 onwards
    const dcf = fcf / Math.pow(1 + assumptions.discountRate / 100, t / 12);
    cumulativeDcf += dcf;
    
    const npv = fcf / Math.pow(1 + assumptions.discountRate / 100, t / 12);
    cumulativeNpv += npv;

    // Calculate FCF percentage
    const fcfPercentage = totalRevenue !== 0 ? (fcf / totalRevenue) * 100 : 0;

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
      cumulativeNpv,
      fcfPercentage,
      ptMembers
    });
  }

  return data;
};

const calculateIRR = (monthlyFlows: number[]): number => {
  if (!monthlyFlows.length || !monthlyFlows.some(cf => cf > 0) || !monthlyFlows.some(cf => cf < 0)) {
    return 0;
  }

  const maxIterations = 1000;
  const tolerance = 0.000001;
  
  const npv = (monthlyRate: number): number => {
    return monthlyFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + monthlyRate, i), 0);
  };

  let low = -0.99;
  let high = 0.99;
  let guess = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    const npvAtGuess = npv(guess);
    
    if (Math.abs(npvAtGuess) < tolerance) {
      // Convert monthly rate to annual rate
      const annualRate = (Math.pow(1 + guess, 12) - 1) * 100;
      return annualRate;
    }

    if (npvAtGuess > 0) {
      low = guess;
    } else {
      high = guess;
    }
    
    guess = (low + high) / 2;
  }
  
  return 0;
};

const calculateMIRR = (monthlyFlows: number[], reinvestmentRate: number, financingRate: number): number => {
  if (monthlyFlows.length < 2) return 0;

  // Convert annual rates to monthly
  const monthlyReinvestRate = (1 + reinvestmentRate / 100) ** (1/12) - 1;
  const monthlyFinancingRate = (1 + financingRate / 100) ** (1/12) - 1;
  
  const n = monthlyFlows.length - 1; // Total months

  // Calculate present value of negative flows using monthly financing rate
  const presentValue = Math.abs(
    monthlyFlows.reduce((sum, cf, i) => {
      if (cf >= 0) return sum;
      return sum + cf / Math.pow(1 + monthlyFinancingRate, i);
    }, 0)
  );

  // Calculate future value of positive flows using monthly reinvestment rate
  const futureValue = monthlyFlows.reduce((sum, cf, i) => {
    if (cf <= 0) return sum;
    return sum + cf * Math.pow(1 + monthlyReinvestRate, n - i);
  }, 0);

  if (presentValue === 0 || futureValue === 0) return 0;

  // Calculate monthly MIRR and convert to annual rate
  const monthlyMirr = Math.pow(futureValue / presentValue, 1/n) - 1;
  return ((1 + monthlyMirr) ** 12 - 1) * 100;
};

interface ValuationMetrics {
  npv: number;
  irr: number;
  mirr: number;
  paybackPeriod: number;
  discountedPaybackPeriod: number;
}

const calculateValuationMetrics = (data: MonthlyData[], assumptions: Assumptions): ValuationMetrics | null => {
  if (!data.length) return null;

  const monthlyFCF = data.map(d => d.fcf);
  
  // Log analysis
  console.log('=== Monthly Cash Flow Analysis ===');
  console.log('Month | Date | Cash Flow (₹) | Cumulative CF (₹) | Cumulative DCF (₹)');
  console.log('--------------------------------------------------------------------');
  monthlyFCF.forEach((cf, i) => {
    const monthData = data[i];
    console.log(
      `${i} | ${monthData.month} | ${formatCurrency(cf)} | ${formatCurrency(monthData.cumulativeFcf)} | ${formatCurrency(monthData.cumulativeDcf)}`
    );
  });
  console.log('--------------------------------------------------------------------');
  
  const npv = data[data.length - 1].cumulativeNpv;
  const irr = calculateIRR(monthlyFCF);
  const mirr = calculateMIRR(monthlyFCF, assumptions.reinvestmentRate, assumptions.financingRate);
  const paybackPeriod = data.findIndex(d => d.cumulativeFcf > 0) / 12;
  const discountedPaybackPeriod = data.findIndex(d => d.cumulativeDcf > 0) / 12;

  return { npv, irr, mirr, paybackPeriod, discountedPaybackPeriod };
};

type NumericInputs = Exclude<keyof Assumptions, 'useLoan'>;

function App() {
  // Add new state for result tabs
  const [inputTabValue, setInputTabValue] = useState(0);
  const [resultTabValue, setResultTabValue] = useState(0);
  const [assumptions, setAssumptions] = useState<Assumptions>(initialAssumptions);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [valuationMetrics, setValuationMetrics] = useState<{ npv: number; irr: number; mirr: number; paybackPeriod: number; discountedPaybackPeriod: number } | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [investments, setInvestments] = useState<InvestmentItem[]>(initialInvestments);

  // Update tab handlers
  const handleInputTabChange = (_event: TabChangeEvent, newValue: number) => {
    setInputTabValue(newValue);
  };

  const handleResultTabChange = (_event: TabChangeEvent, newValue: number) => {
    setResultTabValue(newValue);
  };

  const handleCalculate = () => {
    const data = calculateMonthlyData(assumptions, expenses, investments);
    setMonthlyData(data);
    
    // Pass assumptions to calculateValuationMetrics
    const metrics = calculateValuationMetrics(data, assumptions);
    setValuationMetrics(metrics);
  };

  // Update the handleInputChange function to handle boolean values
  const handleInputChange = (field: keyof Assumptions) => (event: InputChangeEvent) => {
    if (field === 'useLoan') {
      setAssumptions(prev => ({
        ...prev,
        [field]: event.target.value === 'true'
      }));
      return;
    }

    // For numeric inputs, allow empty string to clear the field
    const numField = field as NumericInputs;
    const value = event.target.value === '' ? '' : parseFloat(event.target.value as string);
    
    setAssumptions(prev => ({
      ...prev,
      [numField]: value
    }));
  };

  const handleAddExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      name: 'New Expense',
      amount: 0
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleAddInvestment = () => {
    const newInvestment: InvestmentItem = {
      id: Date.now().toString(),
      name: 'New Investment',
      cost: 0,
      rate: 0
    };
    setInvestments([...investments, newInvestment]);
  };

  const handleExpenseChange = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const handleInvestmentChange = (id: string, field: keyof InvestmentItem, value: any) => {
    setInvestments(investments.map(investment => 
      investment.id === id ? { ...investment, [field]: value } : investment
    ));
  };

  // Add calculation helpers
  const calculateTotalMonthlyExpense = (): number => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const calculateTotalInvestment = (): number => {
    return investments.reduce((total, investment) => total + investment.cost, 0);
  };

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

          <Tabs 
            value={inputTabValue} 
            onChange={handleInputTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Tab label="Basic Assumptions" sx={{ textTransform: 'none' }} />
            <Tab label="Monthly Expenses" sx={{ textTransform: 'none' }} />
            <Tab label="Investments" sx={{ textTransform: 'none' }} />
          </Tabs>

          <TabPanel value={inputTabValue} index={0}>
            {/* Revenue & Capacity Parameters */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                Revenue & Growth Parameters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Monthly Target Sales"
                    type="number"
                    value={assumptions.monthlyNewMembers}
                    onChange={handleInputChange('monthlyNewMembers')}
                    variant="outlined"
                    helperText="Number of new members targeted per month"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Subscription Price (INR)"
                    type="number"
                    value={assumptions.subscriptionPrice}
                    onChange={handleInputChange('subscriptionPrice')}
                    variant="outlined"
                    helperText="Monthly membership fee"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Maximum Capacity"
                    type="number"
                    value={assumptions.maxCapacity}
                    onChange={handleInputChange('maxCapacity')}
                    variant="outlined"
                    helperText="Maximum members the facility can handle"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Annual Price Increase (%)"
                    type="number"
                    value={assumptions.annualPriceIncrease}
                    onChange={handleInputChange('annualPriceIncrease')}
                    variant="outlined"
                    helperText="Yearly increase in subscription prices"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Annual Expense Increase (%)"
                    type="number"
                    value={assumptions.annualExpenseIncrease}
                    onChange={handleInputChange('annualExpenseIncrease')}
                    variant="outlined"
                    helperText="Yearly increase in operating expenses"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Personal Training Parameters */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                Personal Training Parameters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PT Penetration (%)"
                    type="number"
                    value={assumptions.ptPenetration}
                    onChange={handleInputChange('ptPenetration')}
                    variant="outlined"
                    helperText="Percentage of members taking PT services"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PT Share with Gym (%)"
                    type="number"
                    value={assumptions.ptShareWithGym}
                    onChange={handleInputChange('ptShareWithGym')}
                    variant="outlined"
                    helperText="Percentage of PT revenue retained by gym"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PT Subscription Price (INR)"
                    type="number"
                    value={assumptions.ptSubscriptionPrice}
                    onChange={handleInputChange('ptSubscriptionPrice')}
                    variant="outlined"
                    helperText="Monthly PT subscription fee"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Project Parameters */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                Project Timeline & Valuation Parameters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Project Life (Years)"
                    type="number"
                    value={assumptions.projectLife}
                    onChange={handleInputChange('projectLife')}
                    variant="outlined"
                    helperText="Duration of project analysis in years"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Discount Rate (%)"
                    type="number"
                    value={assumptions.discountRate}
                    onChange={handleInputChange('discountRate')}
                    variant="outlined"
                    helperText="Annual rate used for DCF calculations"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Salvage Value (%)"
                    type="number"
                    value={assumptions.salvageValue}
                    onChange={handleInputChange('salvageValue')}
                    variant="outlined"
                    helperText="Recoverable value at end of project life"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Financial Parameters */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                Financial Analysis Parameters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Reinvestment Rate (%)"
                    type="number"
                    value={assumptions.reinvestmentRate}
                    onChange={handleInputChange('reinvestmentRate')}
                    variant="outlined"
                    helperText="Annual rate for reinvesting positive cash flows"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Financing Rate (%)"
                    type="number"
                    value={assumptions.financingRate}
                    onChange={handleInputChange('financingRate')}
                    variant="outlined"
                    helperText="Annual rate for financing negative cash flows"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Loan Details - existing code */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                Loan Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Use Loan"
                    select
                    value={assumptions.useLoan.toString()}
                    onChange={handleInputChange('useLoan')}
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
                        onChange={handleInputChange('loanAmount')}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Loan Tenure (Years)"
                        type="number"
                        value={assumptions.loanTenure}
                        onChange={handleInputChange('loanTenure')}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Loan Interest Rate (%)"
                        type="number"
                        value={assumptions.loanInterest}
                        onChange={handleInputChange('loanInterest')}
                        variant="outlined"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={inputTabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button onClick={handleAddExpense} variant="outlined">
                Add Expense
              </Button>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Total Monthly Expense: {formatCurrency(calculateTotalMonthlyExpense())}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '60%', fontWeight: 'bold', textAlign: 'center' }}>
                      Expense Name
                    </TableCell>
                    <TableCell sx={{ width: '40%', fontWeight: 'bold', textAlign: 'center' }}>
                      Monthly Amount (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell sx={{ width: '60%' }}>
                        <TextField
                          fullWidth
                          value={expense.name}
                          onChange={(e) => handleExpenseChange(expense.id, 'name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell sx={{ width: '40%' }}>
                        <TextField
                          fullWidth
                          type="number"
                          value={expense.amount}
                          onChange={(e) => handleExpenseChange(expense.id, 'amount', parseFloat(e.target.value))}
                          InputProps={{
                            sx: { textAlign: 'right' }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={inputTabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button onClick={handleAddInvestment} variant="outlined">
                Add Investment
              </Button>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Total Investment: {formatCurrency(calculateTotalInvestment())}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '40%', fontWeight: 'bold', textAlign: 'center' }}>
                      Investment Name
                    </TableCell>
                    <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>
                      Cost (₹)
                    </TableCell>
                    <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>
                      Depreciation Rate (%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell sx={{ width: '40%' }}>
                        <TextField
                          fullWidth
                          value={investment.name}
                          onChange={(e) => handleInvestmentChange(investment.id, 'name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ width: '30%' }}>
                        <TextField
                          fullWidth
                          type="number"
                          value={investment.cost}
                          onChange={(e) => handleInvestmentChange(investment.id, 'cost', parseFloat(e.target.value))}
                          InputProps={{
                            sx: { textAlign: 'right' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ width: '30%' }}>
                        <TextField
                          fullWidth
                          type="number"
                          value={investment.rate}
                          onChange={(e) => handleInvestmentChange(investment.id, 'rate', parseFloat(e.target.value))}
                          InputProps={{
                            sx: { textAlign: 'right' }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleCalculate}
              size="large"
              sx={{ 
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
          </Box>
        </Paper>

        {monthlyData.length > 0 && (
          <>
            <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
                Valuation Metrics
              </Typography>
              <Grid container spacing={3}>
             <Grid item xs={12} sm={6} md={2}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>NPV</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.npv ? formatCurrency(valuationMetrics.npv) : '₹0.00'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>IRR</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.irr ? valuationMetrics.irr.toFixed(2) + '%' : '0%'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>MIRR</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.mirr ? valuationMetrics.mirr.toFixed(2) + '%' : '0%'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>Payback Period</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.paybackPeriod ? valuationMetrics.paybackPeriod.toFixed(2) + ' years' : '0 years'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>Discounted Payback</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {valuationMetrics?.discountedPaybackPeriod ? valuationMetrics.discountedPaybackPeriod.toFixed(2) + ' years' : '0 years'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ mb: 4, boxShadow: 3 }}>
              <Tabs 
                value={resultTabValue} 
                onChange={handleResultTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Tab label="Financial Metrics" sx={{ textTransform: 'none' }} />
                <Tab label="Depreciation Schedule" sx={{ textTransform: 'none' }} />
              </Tabs>

              <TabPanel value={resultTabValue} index={0}>
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
                          {monthlyData.map(data => {
                            const value = data[key as keyof MonthlyData];
                            if (!isNumber(value)) return <TableCell key={`${data.month}-${key}`} align="right">-</TableCell>;
                            
                            return (
                              <TableCell key={`${data.month}-${key}`} align="right" sx={{ minWidth: 100 }}>
                                {percentage 
                                  ? `${Math.round(value)}%`
                                  : format 
                                    ? formatCurrency(value)
                                    : Math.round(value)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={resultTabValue} index={1}>
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
                      {investments.map(asset => {
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

// Add helper function for type checking
const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};