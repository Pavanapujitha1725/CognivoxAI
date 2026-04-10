import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { AnalyticsTopic, AnalyticsComplexity } from '../types';

interface AnalyticsChartsProps {
  topics: AnalyticsTopic[];
  complexity: AnalyticsComplexity[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ topics, complexity }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Topic Distribution */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Topic Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topics}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {topics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {topics.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                    {topic.name} ({topic.value}%)
                </div>
            ))}
        </div>
      </div>

      {/* Concept Complexity */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Concept Complexity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={complexity}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="concept" type="category" width={100} stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {complexity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};