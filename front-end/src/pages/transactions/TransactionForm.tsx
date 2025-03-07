import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  Paper,
  TextField,
  Box,
  CircularProgress,
  MenuItem,
  Grid,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import { getAccounts } from "../../api/accounts";
import { createTransaction } from "../../api/transactions";
import { Account, Transaction } from "../../interfaces/models";

interface LocationState {
  accountId?: number;
}

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accountId } = (location.state as LocationState) || {};

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    account_id: accountId || 0,
    amount: 0,
    type: "credit",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);

      // If no accountId was passed and we have accounts, set the first one as default
      if (!accountId && data.length > 0) {
        setFormData((prev) => ({ ...prev, account_id: data[0].id }));
      }
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "amount"
          ? parseFloat(value) || 0
          : name === "account_id"
          ? parseInt(value)
          : value,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      date: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.account_id) {
      setError("Please select an account");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    try {
      setSaving(true);
      await createTransaction(formData as Omit<Transaction, "id">);
      navigate("/transactions");
    } catch (err: any) {
      console.error("Error saving transaction:", err);
      setError(err.response?.data?.error || "Failed to save transaction");
    } finally {
      setSaving(false);
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

  if (accounts.length === 0) {
    return (
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/transactions")}
          >
            Back to Transactions
          </Button>
        </Box>

        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No Accounts Available
          </Typography>
          <Typography variant="body1" paragraph>
            You need to create at least one account before adding transactions.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/accounts/new")}>
            Create Account
          </Button>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/transactions")}
        >
          Back to Transactions
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Transaction
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Account"
                name="account_id"
                value={formData.account_id || ""}
                onChange={handleChange}
                required
                disabled={saving || !!accountId}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} (${account.balance.toFixed(2)})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                disabled={saving}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ mr: 1 }}>
                      $
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                required
                disabled={saving}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Transaction Type</FormLabel>
                <RadioGroup
                  row
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="credit"
                    control={<Radio />}
                    label="Credit (Income)"
                    disabled={saving}
                  />
                  <FormControlLabel
                    value="debit"
                    control={<Radio />}
                    label="Debit (Expense)"
                    disabled={saving}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : "Save Transaction"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Layout>
  );
};

export default TransactionForm;
