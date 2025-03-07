import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Button,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import { getAccount } from "../../api/accounts";
import { getTransactions, deleteTransaction } from "../../api/transactions";
import { Account, Transaction } from "../../interfaces/models";
import { format } from "date-fns";

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAccountData(parseInt(id));
    }
  }, [id]);

  const fetchAccountData = async (accountId: number) => {
    try {
      setLoading(true);

      // Fetch account details
      const accountData = await getAccount(accountId);
      setAccount(accountData);

      // Fetch account transactions
      const transactionsData = await getTransactions(accountId);
      // Sort by date (newest first)
      const sortedTransactions = transactionsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedTransactions);
    } catch (err: any) {
      console.error("Error fetching account data:", err);
      setError("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);

        // Refresh account data after deletion
        if (id) {
          fetchAccountData(parseInt(id));
        }
      } catch (err: any) {
        console.error("Error deleting transaction:", err);
        alert("Failed to delete transaction");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !account) {
    return (
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/accounts")}
          >
            Back to Accounts
          </Button>
        </Box>

        <Paper
          sx={{ p: 3, bgcolor: "error.light", color: "error.contrastText" }}
        >
          {error || "Account not found"}
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/accounts")}
        >
          Back to Accounts
        </Button>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/accounts/${id}/edit`)}
        >
          Edit Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Account Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="h5" component="h1" gutterBottom>
                  {account.name}
                </Typography>
                <Chip
                  label={account.type}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Created on{" "}
                  {format(new Date(account.created_at), "MMMM d, yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography
                      variant="h4"
                      component="div"
                      color={
                        account.balance >= 0 ? "success.main" : "error.main"
                      }
                      sx={{ fontWeight: "bold" }}
                    >
                      ${account.balance.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Transactions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate("/transactions/new", {
                    state: { accountId: account.id },
                  })
                }
                size="small"
              >
                Add Transaction
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {transactions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No transactions found for this account.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    navigate("/transactions/new", {
                      state: { accountId: account.id },
                    })
                  }
                  sx={{ mt: 1 }}
                >
                  Add First Transaction
                </Button>
              </Box>
            ) : (
              <List>
                {transactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body1">
                              {transaction.description}
                            </Typography>
                            <Typography
                              variant="body1"
                              color={
                                transaction.type === "credit"
                                  ? "success.main"
                                  : "error.main"
                              }
                              sx={{ fontWeight: "bold" }}
                            >
                              {transaction.type === "credit" ? "+" : "-"}$
                              {transaction.amount.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        secondary={format(
                          new Date(transaction.date),
                          "MMMM d, yyyy"
                        )}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default AccountDetails;
