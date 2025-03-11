import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  coCode: string;
  targetLevel: number;
  actualLevel: number;
  studentDistribution: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
}

interface Props {
  data: ChartData[];
}

const AttainmentChart: React.FC<Props> = ({ data }) => {
  const transformedData = data.map(item => ({
    coCode: item.coCode,
    'Target Level': item.targetLevel,
    'Actual Level': item.actualLevel,
    'Level 0': item.studentDistribution.level0,
    'Level 1': item.studentDistribution.level1,
    'Level 2': item.studentDistribution.level2,
    'Level 3': item.studentDistribution.level3,
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="coCode" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Target Level" fill="#8884d8" />
          <Bar dataKey="Actual Level" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttainmentChart;