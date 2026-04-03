import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { serverFetch } from '@/lib/api/server-client';
import { KpiCard } from '../../../components/DashboardCharts/KpiCard';
import { AgentPerformanceTable } from '../../../components/DashboardCharts/AgentPerformanceTable';
import { AttentionList } from '../../../components/DashboardCharts/AttentionList';
import { TicketStatusBadge } from '../../../components/TicketStatusBadge';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../../lib/translations';
import { RefreshButton } from '../../../components/RefreshButton';
import Link from 'next/link';
import { VolumeChart } from '../../../components/DashboardCharts/VolumeChart';
import { CategoryDonut } from '../../../components/DashboardCharts/CategoryDonut';
import type { DashboardData, UserDashboardData } from '../../../lib/api/analytics';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role || 'USER';
  const data = await serverFetch<DashboardData | UserDashboardData>('/analytics/dashboard');

  if (role === 'USER') {
    const d = data as UserDashboardData;
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            <RefreshButton />
            <Link href="/billets/nouveau" className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold">
              + Nouveau billet
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-5">
          <KpiCard label="Total" value={d.myTotalCount} />
          <KpiCard label="Ouverts" value={d.myOpenCount} trendType={d.myOpenCount > 0 ? 'warning' : 'neutral'} />
          <KpiCard label="En cours" value={d.myInProgressCount} />
          <KpiCard label="En attente" value={d.myPendingCount} />
          <KpiCard label="Resolus / Fermes" value={d.myResolvedCount + d.myClosedCount} trend={d.medianResolutionHours > 0 ? `~${d.medianResolutionHours}h mediane` : undefined} trendType="up" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="col-span-2">
            <Suspense fallback={<div className="h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl animate-pulse" />}>
              <VolumeChart data={d.volumeByWeek || []} />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl animate-pulse" />}>
            <CategoryDonut data={d.byCategory || []} />
          </Suspense>
        </div>

        <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Mes billets recents</h3>
          {d.myTickets?.length === 0 && (
            <p className="text-xs text-lumen-text-tertiary py-4 text-center">Aucun billet pour le moment</p>
          )}
          {d.myTickets?.map((t: any) => (
            <Link key={t.id} href={`/billets/${t.id}`} className="flex items-center justify-between py-2.5 border-b border-lumen-border-secondary last:border-b-0 hover:bg-lumen-hover rounded px-2 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLORS[t.priority] || 'bg-lumen-text-tertiary'}`} />
                <span className="text-xs text-lumen-text-primary truncate">{t.title}</span>
                {t.category && (
                  <span className="text-[10px] text-lumen-text-tertiary bg-lumen-bg-secondary border border-lumen-border-primary rounded-full px-2 py-0.5 shrink-0">{t.category.name}</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[10px] text-lumen-text-tertiary">{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</span>
                <TicketStatusBadge status={t.status} />
              </div>
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Tableau de bord</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-5 gap-3 mb-5">
        <KpiCard label="Billets ouverts" value={d.kpis.openCount} trend={`${d.kpis.openTrend > 0 ? '\u2191' : '\u2192'} ${d.kpis.openTrend}%`} trendType={d.kpis.openTrend > 10 ? 'down' : 'neutral'} />
        <KpiCard label="En cours" value={d.kpis.inProgressCount} />
        <KpiCard label="Resolus (mois)" value={d.kpis.resolvedMonthCount} trend={`${d.kpis.resolvedMonthTrend > 0 ? '\u2191' : '\u2193'} ${Math.abs(d.kpis.resolvedMonthTrend)}%`} trendType={d.kpis.resolvedMonthTrend >= 0 ? 'up' : 'down'} />
        <KpiCard label="Temps median resolution" value={`${d.kpis.medianResolutionHours}h`} trend={`${d.kpis.medianResolutionTrend > 0 ? '\u2191' : '\u2193'} ${Math.abs(d.kpis.medianResolutionTrend)}h`} trendType={d.kpis.medianResolutionTrend <= 0 ? 'up' : 'down'} />
        <KpiCard label="Non assignes" value={d.kpis.unassignedCount} trendType={d.kpis.unassignedCount > 0 ? 'warning' : 'neutral'} trend={d.kpis.unassignedCount > 0 ? '\u26a0 necessite attention' : '\u2713'} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="col-span-2">
          <Suspense fallback={<div className="h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl animate-pulse" />}>
            <VolumeChart data={d.volumeByWeek} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl animate-pulse" />}>
          <CategoryDonut data={d.byCategory} />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AgentPerformanceTable data={d.agentPerformance} />
        <AttentionList tickets={d.attentionNeeded} />
      </div>
    </div>
  );
}
