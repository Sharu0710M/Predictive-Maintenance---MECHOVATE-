
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SensorChartProps {
  data: number[];
  color: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({ data, color }) => {
  const chartData = data.map((val, i) => ({ val, i }));
  
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
