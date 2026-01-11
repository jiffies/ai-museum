import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = (drift: number, volatility: number, steps: number) => {
  let value = 50;
  const data = [];
  for (let i = 0; i < steps; i++) {
    const change = (Math.random() - 0.5) * volatility + drift;
    value += change;
    if (value < 0) value = 0;
    data.push({ step: i, wealth: value.toFixed(2) });
    if (value === 0) break;
  }
  return data;
};

export const StatsChart: React.FC<{ drift: number, volatility: number, leverage: number }> = ({ drift, volatility, leverage }) => {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Generate new dummy data when props change to visualize the theory
    // Real drift in text is usually small, multiplier for visual
    const theoreticalData = generateData(drift, volatility * 5, 50);
    setData(theoreticalData);
    
    const interval = setInterval(() => {
        setData(generateData(drift, volatility * 5, 50));
    }, 2000); // Refresh graph every 2s to show "Probability"

    return () => clearInterval(interval);
  }, [drift, volatility, leverage]);

  return (
    <div className="w-full h-40 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Theoretical Projection (Monte Carlo)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="step" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="wealth" 
            stroke={drift < 0 ? "#f59e0b" : (drift > 0 ? "#10b981" : "#6366f1")} 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};