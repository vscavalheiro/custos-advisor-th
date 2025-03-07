import api from "./axios";
import { Account } from "../interfaces/models";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get<Account[]>("/accounts");
  return response.data;
};

export const getAccount = async (id: number): Promise<Account> => {
  const response = await api.get<Account>(`/accounts/${id}`);
  return response.data;
};

export const createAccount = async (
  accountData: Omit<Account, "id" | "user_id" | "created_at">
): Promise<Account> => {
  const response = await api.post<Account>("/accounts", accountData);
  return response.data;
};

export const updateAccount = async (
  id: number,
  accountData: Partial<Account>
): Promise<Account> => {
  const response = await api.put<Account>(`/accounts/${id}`, accountData);
  return response.data;
};

export const deleteAccount = async (id: number): Promise<void> => {
  await api.delete(`/accounts/${id}`);
};
