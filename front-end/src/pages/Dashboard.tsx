// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAccounts } from "../api/accounts";
import { getTransactions } from "../api/transactions";
import { getSummaryReport } from "../api/reports";
import { Account, Transaction, ReportSummary } from "../interfaces/models";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Layout from "../components/Layout";

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch accounts
        const accountsData = await getAccounts();
        setAccounts(accountsData);

        // Fetch recent transactions
        const transactionsData = await getTransactions();
        // Sort by date (newest first) and take the first 5
        const sortedTransactions = transactionsData
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);
        setRecentTransactions(sortedTransactions);

        // Fetch summary report
        const summaryData = await getSummaryReport();
        setSummary(summaryData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: accounts.map((account) => account.name),
    datasets: [
      {
        label: "Account Balance",
        data: accounts.map((account) => account.balance),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography component="h1" variant="h5">
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Here's an overview of your financial accounts and recent
              transactions.
            </Typography>
          </Paper>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Balance
            </Typography>
            <Typography component="p" variant="h4">
              ${summary?.total_balance.toFixed(2) || "0.00"}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              across all accounts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Income
            </Typography>
            <Typography component="p" variant="h4" color="success.main">
              ${summary?.total_credits.toFixed(2) || "0.00"}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              total credits
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Expenses
            </Typography>
            <Typography component="p" variant="h4" color="error.main">
              ${summary?.total_debits.toFixed(2) || "0.00"}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              total debits
            </Typography>
          </Paper>
        </Grid>

        {/* Account Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Account Summary
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/accounts")}
              >
                Manage Accounts
              </Button>
            </Box>

            <Grid container spacing={2}>
              {accounts.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" sx={{ my: 2 }}>
                    No accounts found. Create your first account to get started.
                  </Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/accounts/new")}
                    >
                      Create Account
                    </Button>
                  </Box>
                </Grid>
              ) : (
                accounts.map((account) => (
                  <Grid item xs={12} sm={6} md={4} key={account.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {account.name}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          {account.type}
                        </Typography>
                        <Typography
                          variant="h5"
                          component="div"
                          color={
                            account.balance >= 0 ? "success.main" : "error.main"
                          }
                        >
                          ${account.balance.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Balance Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Balance Distribution
            </Typography>
            {accounts.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  No accounts to display
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{ height: 250, display: "flex", justifyContent: "center" }}
              >
                <Doughnut
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Recent Transactions
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/transactions")}
              >
                View All
              </Button>
            </Box>

            {recentTransactions.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ my: 2 }}>
                No transactions found. Add your first transaction to get
                started.
              </Typography>
            ) : (
              <List>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemText
                        primary={transaction.description}
                        secondary={new Date(
                          transaction.date
                        ).toLocaleDateString()}
                      />
                      <Typography
                        variant="body1"
                        color={
                          transaction.type === "credit"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {transaction.type === "credit" ? "+" : "-"}$
                        {transaction.amount.toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {recentTransactions.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/transactions/new")}
                >
                  Add Transaction
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
