import apiClient from './client';

export interface DashboardData {
  kpis: {
    openCount: number;
    openTrend: number;
    inProgressCount: number;
    inProgressTrend: number;
    resolvedMonthCount: number;
    resolvedMonthTrend: number;
    medianResolutionHours: number;
    medianResolutionTrend: number;
    unassignedCount: number;
  };
  volumeByWeek: { week: string; count: number }[];
  byCategory: { category: string; count: number; percentage: number }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    resolvedCount: number;
    medianResolutionHours: number;
    currentAssigned: number;
  }[];
  attentionNeeded: any[];
}

export interface UserDashboardData {
  myOpenCount: number;
  myInProgressCount: number;
  myResolvedCount: number;
  myTickets: any[];
}

export const analyticsApi = {
  getDashboard: () => apiClient.get<DashboardData | UserDashboardData>('/analytics/dashboard').then((r) => r.data),
};
