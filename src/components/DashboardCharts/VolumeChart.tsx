'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeChartProps {
  data: { week: string; count: number }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const formatted = data.map((d, i) => ({
    ...d,
    label: `S${i + 1}`,
  }));

  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-lumen-text-primary mb-3">Volume de billets — 8 dernières semaines</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={formatted}>
          <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#12151e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' }} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
