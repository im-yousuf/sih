import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealTimeChartProps {
  title: string;
  data: any[];
  dataKey: string;
  unit: string;
  color: string;
}

export default function RealTimeChart({ title, data, dataKey, unit, color }: RealTimeChartProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="text-xs font-bold text-stone-800 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* Warm stone grid lines — readable on white background */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#a8a29e"
              tick={{ fill: '#78716c', fontSize: 10 }}
            />
            <YAxis
              stroke="#a8a29e"
              tick={{ fill: '#78716c', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d6d3d1',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: '#1c1917',
              }}
              labelStyle={{ color: '#78716c', fontSize: '11px' }}
              itemStyle={{ color: '#1c1917', fontWeight: 600 }}
              labelFormatter={formatTime}
              formatter={(value: number) => [value.toFixed(2), unit]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
