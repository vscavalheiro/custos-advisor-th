import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Layout from "../../components/Layout";
import { getSummaryReport } from "../../api/reports";
import { getAccounts } from "../../api/accounts";
import { ReportSummary, Account } from "../../interfaces/models";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(
    startOfMonth(new Date())
  );
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(new Date()));
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAccounts();
    // Load current month report by default
    fetchReport();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const data = await getSummaryReport(formattedStartDate, formattedEndDate);
      setReportData(data);
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleQuickDateRange = (months: number) => {
    const end = new Date();
    const start = subMonths(startOfMonth(end), months - 1);
    setStartDate(start);
    setEndDate(endOfMonth(end));
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id.toString() === accountId);
    return account ? account.name : "Unknown Account";
  };

  // Prepare chart data
  const barChartData = {
    labels:
      reportData && reportData.by_account
        ? Object.keys(reportData.by_account).map((id) => getAccountName(id))
        : [],
    datasets: [
      {
        label: "Income",
        data:
          reportData && reportData.by_account
            ? Object.values(reportData.by_account).map((a) => a.total_credits)
            : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Expenses",
        data:
          reportData && reportData.by_account
            ? Object.values(reportData.by_account).map((a) => a.total_debits)
            : [],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const pieChartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: reportData
          ? [reportData.total_credits, reportData.total_debits]
          : [0, 0],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout>
      <Typography variant="h5" component="h1" gutterBottom>
        Financial Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Date Range
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickDateRange(1)}
              >
                This Month
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickDateRange(3)}
              >
                Last 3 Months
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickDateRange(6)}
              >
                Last 6 Months
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickDateRange(12)}
              >
                This Year
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchReport}
              disabled={loading || !startDate || !endDate}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    ${reportData.total_credits.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    ${reportData.total_debits.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Net Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    color={
                      reportData.total_balance >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    ${reportData.total_balance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for different visualizations */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="report tabs"
              >
                <Tab icon={<BarChartIcon />} label="By Account" />
                <Tab icon={<PieChartIcon />} label="Income vs Expenses" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ height: 400 }}>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Income and Expenses by Account",
                      },
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Income</TableCell>
                      <TableCell align="right">Expenses</TableCell>
                      <TableCell align="right">Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData &&
                      reportData.by_account &&
                      Object.entries(reportData.by_account).map(
                        ([accountId, data]) => (
                          <TableRow key={accountId}>
                            <TableCell>{getAccountName(accountId)}</TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "success.main" }}
                            >
                              ${data.total_credits.toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "error.main" }}
                            >
                              ${data.total_debits.toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color:
                                  data.total_credits - data.total_debits >= 0
                                    ? "success.main"
                                    : "error.main",
                                fontWeight: "bold",
                              }}
                            >
                              $
                              {(data.total_credits - data.total_debits).toFixed(
                                2
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{ height: 400, display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ width: "50%" }}>
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: "Income vs Expenses",
                        },
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>

              <Typography variant="body1" paragraph>
                During the selected period (
                {startDate && format(startDate, "MMM d, yyyy")} to{" "}
                {endDate && format(endDate, "MMM d, yyyy")}), your total income
                was{" "}
                <strong style={{ color: "#4caf50" }}>
                  ${reportData.total_credits.toFixed(2)}
                </strong>{" "}
                and your total expenses were{" "}
                <strong style={{ color: "#f44336" }}>
                  ${reportData.total_debits.toFixed(2)}
                </strong>
                , resulting in a net{" "}
                {reportData.total_balance >= 0 ? "profit" : "loss"} of{" "}
                <strong
                  style={{
                    color:
                      reportData.total_balance >= 0 ? "#4caf50" : "#f44336",
                  }}
                >
                  ${Math.abs(reportData.total_balance).toFixed(2)}
                </strong>
                .
              </Typography>
            </TabPanel>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">
            Select a date range and click "Generate Report" to view financial
            data.
          </Typography>
        </Paper>
      )}
    </Layout>
  );
};

export default Reports;
