export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  user_id: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  amount: number;
  type: "credit" | "debit";
  description: string;
  date: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ReportSummary {
  total_balance: number;
  total_credits: number;
  total_debits: number;
  by_account: {
    [key: string]: {
      account_type: string;
      total_credits: number;
      total_debits: number;
      transactions: Transaction[];
    };
  };
}
