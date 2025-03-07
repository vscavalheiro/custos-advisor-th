import api from "./axios";
import { Transaction } from "../interfaces/models";

export const getTransactions = async (
  accountId?: number
): Promise<Transaction[]> => {
  const params = accountId ? { account_id: accountId } : {};
  const response = await api.get<Transaction[]>("/transactions", { params });
  return response.data;
};

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await api.get<Transaction>(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (
  transactionData: Omit<Transaction, "id">
): Promise<Transaction> => {
  const response = await api.post<Transaction>(
    "/transactions",
    transactionData
  );
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};
