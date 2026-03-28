'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { analyticsApi, DashboardData } from '../../../lib/api/analytics';
import { KpiCard } from '../../../components/DashboardCharts/KpiCard';
import { VolumeChart } from '../../../components/DashboardCharts/VolumeChart';
import { CategoryDonut } from '../../../components/DashboardCharts/CategoryDonut';
import { AgentPerformanceTable } from '../../../components/DashboardCharts/AgentPerformanceTable';
import { AttentionList } from '../../../components/DashboardCharts/AttentionList';
import { TicketStatusBadge } from '../../../components/TicketStatusBadge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
  });

  if (isLoading) return <div className="text-lumen-text-tertiary">Chargement...</div>;
  if (!data) return null;

  // User dashboard
  if (user?.role === 'USER') {
    const d = data as any;
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold">Tableau de bord</h1>
          <Link href="/billets/nouveau" className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold">
            + Nouveau billet
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <KpiCard label="Mes billets ouverts" value={d.myOpenCount} />
          <KpiCard label="En cours" value={d.myInProgressCount} />
          <KpiCard label="Résolus" value={d.myResolvedCount} />
        </div>
        <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Mes billets</h3>
          {d.myTickets?.map((t: any) => (
            <Link key={t.id} href={`/billets/${t.id}`} className="flex items-center justify-between py-2 border-b border-lumen-border-secondary last:border-b-0 hover:bg-lumen-hover rounded px-1">
              <div className="text-xs">{t.title}</div>
              <TicketStatusBadge status={t.status} />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Agent/Admin dashboard
  const d = data as DashboardData;
  return (
    <div>
      <h1 className="text-lg font-bold mb-5">Tableau de bord</h1>

      <div className="grid grid-cols-5 gap-3 mb-5">
        <KpiCard label="Billets ouverts" value={d.kpis.openCount} trend={`${d.kpis.openTrend > 0 ? '\u2191' : '\u2192'} ${d.kpis.openTrend}%`} trendType={d.kpis.openTrend > 10 ? 'down' : 'neutral'} />
        <KpiCard label="En cours" value={d.kpis.inProgressCount} />
        <KpiCard label="R\u00e9solus (mois)" value={d.kpis.resolvedMonthCount} trend={`${d.kpis.resolvedMonthTrend > 0 ? '\u2191' : '\u2193'} ${Math.abs(d.kpis.resolvedMonthTrend)}%`} trendType={d.kpis.resolvedMonthTrend >= 0 ? 'up' : 'down'} />
        <KpiCard label="Temps m\u00e9dian r\u00e9solution" value={`${d.kpis.medianResolutionHours}h`} trend={`${d.kpis.medianResolutionTrend > 0 ? '\u2191' : '\u2193'} ${Math.abs(d.kpis.medianResolutionTrend)}h`} trendType={d.kpis.medianResolutionTrend <= 0 ? 'up' : 'down'} />
        <KpiCard label="Non assign\u00e9s" value={d.kpis.unassignedCount} trendType={d.kpis.unassignedCount > 0 ? 'warning' : 'neutral'} trend={d.kpis.unassignedCount > 0 ? '\u26a0 n\u00e9cessite attention' : '\u2713'} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="col-span-2">
          <VolumeChart data={d.volumeByWeek} />
        </div>
        <CategoryDonut data={d.byCategory} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AgentPerformanceTable data={d.agentPerformance} />
        <AttentionList tickets={d.attentionNeeded} />
      </div>
    </div>
  );
}
