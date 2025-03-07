import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import { getTransactions, deleteTransaction } from "../../api/transactions";
import { getAccounts } from "../../api/accounts";
import { Transaction, Account } from "../../interfaces/models";
import { format } from "date-fns";

const TransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAccount, setFilterAccount] = useState<number | "">("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch accounts for filter dropdown
      const accountsData = await getAccounts();
      setAccounts(accountsData);

      // Fetch all transactions initially
      const transactionsData = await getTransactions();
      // Sort by date (newest first)
      const sortedTransactions = transactionsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedTransactions);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (accountId: number | "") => {
    setFilterAccount(accountId);

    try {
      setLoading(true);

      // Fetch filtered transactions
      const transactionsData = await getTransactions(
        accountId === "" ? undefined : accountId
      );
      // Sort by date (newest first)
      const sortedTransactions = transactionsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedTransactions);
    } catch (err: any) {
      console.error("Error fetching filtered transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        setTransactions(
          transactions.filter((transaction) => transaction.id !== id)
        );
      } catch (err: any) {
        console.error("Error deleting transaction:", err);
        alert("Failed to delete transaction");
      }
    }
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? account.name : "Unknown Account";
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/transactions/new")}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterIcon color="action" />
          </Grid>
          <Grid item xs>
            <TextField
              select
              label="Filter by Account"
              value={filterAccount}
              onChange={(e) =>
                handleFilterChange(e.target.value as number | "")
              }
              fullWidth
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All Accounts</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper
          sx={{ p: 2, bgcolor: "error.light", color: "error.contrastText" }}
        >
          {error}
        </Paper>
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" gutterBottom>
            No transactions found. Add your first transaction to get started.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate("/transactions/new")}
            sx={{ mt: 2 }}
          >
            Add Transaction
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    {getAccountName(transaction.account_id)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type === "credit" ? "Credit" : "Debit"}
                      color={
                        transaction.type === "credit" ? "success" : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        transaction.type === "credit"
                          ? "success.main"
                          : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(transaction.id)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default TransactionsList;
