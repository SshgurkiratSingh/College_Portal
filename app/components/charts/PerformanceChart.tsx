import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AssessmentScore {
  name: string;
  type: string;
  averageScore: number;
  maxScore: number;
}

interface Props {
  assessments: AssessmentScore[];
  coCode: string;
}

const PerformanceChart: React.FC<Props> = ({ assessments, coCode }) => {
  const data = assessments.map(assessment => ({
    name: assessment.name,
    'Achievement %': ((assessment.averageScore / assessment.maxScore) * 100).toFixed(1),
    'Average Score': assessment.averageScore,
  }));

  return (
    <div className="w-full h-64">
      <h4 className="text-center text-sm font-medium mb-2">{coCode} Performance Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Achievement %"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="Average Score" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;