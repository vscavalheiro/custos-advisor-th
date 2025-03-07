import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import { getAccount, createAccount, updateAccount } from "../../api/accounts";
import { Account } from "../../interfaces/models";

const accountTypes = [
  { value: "bank", label: "Bank Account" },
  { value: "credit card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment" },
  { value: "expense", label: "Expense" },
];

const AccountForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Account>>({
    name: "",
    type: "bank",
    balance: 0,
  });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      fetchAccount(parseInt(id));
    }
  }, [id, isEditMode]);

  const fetchAccount = async (accountId: number) => {
    try {
      setLoading(true);
      const data = await getAccount(accountId);
      setFormData({
        name: data.name,
        type: data.type,
        balance: data.balance,
      });
    } catch (err: any) {
      console.error("Error fetching account:", err);
      setError("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "balance" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);

      if (isEditMode) {
        await updateAccount(parseInt(id), formData);
      } else {
        await createAccount(
          formData as Omit<Account, "id" | "user_id" | "created_at">
        );
      }

      navigate("/accounts");
    } catch (err: any) {
      console.error("Error saving account:", err);
      setError(err.response?.data?.error || "Failed to save account");
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

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? "Edit Account" : "Create New Account"}
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
                label="Account Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Account Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={saving}
              >
                {accountTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleChange}
                required
                disabled={saving || isEditMode}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ mr: 1 }}>
                      $
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : "Save Account"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Layout>
  );
};

export default AccountForm;
