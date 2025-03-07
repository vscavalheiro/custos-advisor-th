import api from "./axios";
import { ReportSummary } from "../interfaces/models";

export const getSummaryReport = async (
  startDate?: string,
  endDate?: string
): Promise<ReportSummary> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get<ReportSummary>("/reports/summary", { params });
  return response.data;
};

export const getMonthlyReport = async (
  year: number,
  month: number
): Promise<ReportSummary> => {
  const response = await api.get<ReportSummary>("/reports/monthly", {
    params: { year, month },
  });
  return response.data;
};
