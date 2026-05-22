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
  likes: '#a78bfa',
  reach: '#34d399',
  views: '#60a5fa',
  comments: '#f97316',
}

export function AnalyticsChart({ data, metrics = ['likes', 'reach'] }: AnalyticsChartProps) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#09090b', border: '1px solid #27272a', color: '#fff', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
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
  )
}
