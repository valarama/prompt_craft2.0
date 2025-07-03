import React from 'react';
import { TrendingUp, Activity, Zap } from 'lucide-react';

interface UsageChartProps {
  title?: string;
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
}

const UsageChart: React.FC<UsageChartProps> = ({ 
  title = "Platform Usage Analytics",
  data
}) => {
  // Sample data if none provided
  const sampleData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Prompts Processed',
        data: [100, 150, 120, 180, 200, 175, 220],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
      },
      {
        label: 'LLM API Calls',
        data: [80, 120, 100, 140, 160, 130, 180],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
      },
    ],
  };

  const chartData = data || sampleData;
  const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        {title}
      </h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {chartData.datasets[0].data[chartData.datasets[0].data.length - 1]}
              </div>
              <div className="text-sm text-purple-300">Daily Prompts</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 text-xs text-green-400">+12% from yesterday</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {chartData.datasets[1].data[chartData.datasets[1].data.length - 1]}
              </div>
              <div className="text-sm text-purple-300">API Calls</div>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="mt-2 text-xs text-green-400">+8% from yesterday</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">96.8%</div>
              <div className="text-sm text-purple-300">Success Rate</div>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 text-xs text-green-400">+2.1% improvement</div>
        </div>
      </div>

      {/* Simple Bar Chart Visualization */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-purple-300">7-Day Trend</span>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-slate-300">Prompts</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-500 rounded mr-2"></div>
              <span className="text-slate-300">API Calls</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 h-32">
          {chartData.labels.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className="flex-1 flex flex-col justify-end space-y-1 w-full">
                <div 
                  className="bg-purple-500 rounded-t"
                  style={{ 
                    height: `${(chartData.datasets[0].data[index] / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <div 
                  className="bg-cyan-500 rounded-t"
                  style={{ 
                    height: `${(chartData.datasets[1].data[index] / maxValue) * 80}%`,
                    minHeight: '4px'
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-400 mt-2">{label.replace('Day ', 'D')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart.js Installation Notice */}
      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm">
          📊 <strong>Enhanced Charts Available:</strong> Install chart.js and react-chartjs-2 for interactive charts
        </p>
        <code className="text-xs text-blue-200 mt-1 block">
          npm install chart.js react-chartjs-2
        </code>
      </div>
    </div>
  );
};

export default UsageChart;
