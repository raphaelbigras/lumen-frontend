'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#34d399', '#f87171', '#475569', '#818cf8', '#fb923c'];

interface CategoryDonutProps {
  data: { category: string; count: number; percentage: number }[];
}

export function CategoryDonut({ data }: CategoryDonutProps) {
  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-lumen-text-primary mb-3">Par catégorie</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
