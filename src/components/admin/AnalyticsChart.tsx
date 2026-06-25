'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  date: string
  likes?: number
  reach?: number
  views?: number
  comments?: number
}

interface AnalyticsChartProps {
  data: DataPoint[]
  metrics?: ('likes' | 'reach' | 'views' | 'comments')[]
}

const METRIC_COLORS = {
  likes:    'var(--chart-color-1)',
  reach:    'var(--chart-color-2)',
  views:    'var(--chart-color-3)',
  comments: 'var(--chart-color-4)',
}

export function AnalyticsChart({ data, metrics = ['likes', 'reach'] }: AnalyticsChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-zinc-600" style={{ height: 'var(--chart-h)', fontSize: 'var(--text-fluid-sm)' }}>
        No data yet
      </div>
    )
  }

  return (
    <div style={{ height: 'var(--chart-h)' }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
        <XAxis dataKey="date" tick={{ fill: 'oklch(0.45 0 0)', fontSize: 'var(--text-fluid-xs)' as unknown as number }} />
        <YAxis tick={{ fill: 'oklch(0.45 0 0)', fontSize: 'var(--text-fluid-xs)' as unknown as number }} />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.12 0 0)',
            border: '1px solid oklch(0.25 0 0)',
            color: 'oklch(0.98 0 0)',
            fontSize: 'var(--text-fluid-xs)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 'var(--text-fluid-xs)' }} />
        {metrics.map((metric) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={METRIC_COLORS[metric]}
            strokeWidth={1.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}
