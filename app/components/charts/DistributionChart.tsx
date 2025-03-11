import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Props {
  distribution: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  coCode: string;
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6dd5ed', '#95d5b2'];

const DistributionChart: React.FC<Props> = ({ distribution, coCode }) => {
  const data = [
    { name: 'Level 0', value: distribution.level0 },
    { name: 'Level 1', value: distribution.level1 },
    { name: 'Level 2', value: distribution.level2 },
    { name: 'Level 3', value: distribution.level3 },
  ];

  return (
    <div className="w-full h-64">
      <h4 className="text-center text-sm font-medium mb-2">{coCode} Level Distribution</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;