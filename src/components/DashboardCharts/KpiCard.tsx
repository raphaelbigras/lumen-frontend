interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral' | 'warning';
}

const TREND_COLORS = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-lumen-text-tertiary',
  warning: 'text-red-400',
};

export function KpiCard({ label, value, trend, trendType = 'neutral' }: KpiCardProps) {
  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
      <div className="text-[11px] text-lumen-text-tertiary uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-lumen-text-primary mt-1">{value}</div>
      {trend && <div className={`text-[11px] mt-0.5 ${TREND_COLORS[trendType]}`}>{trend}</div>}
    </div>
  );
}
