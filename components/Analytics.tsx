import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Database,
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import UsageChart from './charts/UsageChart';
import CustomTooltip from './ui/Tooltip';

interface AnalyticsData {
  totalPrompts: number;
  totalExecutions: number;
  avgResponseTime: number;
  successRate: number;
  activeUsers: number;
  trendsData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for analytics data
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalPrompts: 1247,
        totalExecutions: 956,
        avgResponseTime: 2.3,
        successRate: 94.2,
        activeUsers: 28,
        trendsData: {
          labels: timeRange === '7d' 
            ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
            : timeRange === '30d'
            ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            : ['Month 1', 'Month 2', 'Month 3'],
          datasets: [
            {
              label: 'Prompts Generated',
              data: timeRange === '7d' 
                ? [100, 150, 120, 180, 200, 170, 220]
                : timeRange === '30d'
                ? [650, 720, 580, 890]
                : [2150, 2380, 2120],
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
            {
              label: 'LLM Executions',
              data: timeRange === '7d' 
                ? [80, 120, 95, 140, 160, 135, 175]
                : timeRange === '30d'
                ? [520, 580, 465, 720]
                : [1720, 1890, 1680],
              borderColor: '#EC4899',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
            },
            {
              label: 'Neo4j Saves',
              data: timeRange === '7d' 
                ? [60, 90, 70, 110, 130, 105, 140]
                : timeRange === '30d'
                ? [390, 450, 350, 560]
                : [1290, 1420, 1260],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
          ],
        },
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    tooltip 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    tooltip: string;
  }) => (
    <CustomTooltip content={tooltip}>
      <div className="prompt-card p-6 hover:scale-105 transition-transform cursor-help">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </CustomTooltip>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="prompt-card p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-slate-400">Monitor your PromptCraft usage and performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="prompt-select w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          {/* Export Button */}
          <CustomTooltip content="Export analytics data as CSV">
            <button className="btn-primary bg-slate-700 hover:bg-slate-600">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </CustomTooltip>
        </div>
      </div>

      {/* Stats Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Prompts"
            value={analyticsData.totalPrompts.toLocaleString()}
            icon={BarChart3}
            color="text-purple-400"
            tooltip="Total number of prompts generated across all domains"
          />
          <StatCard
            title="LLM Executions"
            value={analyticsData.totalExecutions.toLocaleString()}
            icon={Zap}
            color="text-pink-400"
            tooltip="Number of times prompts were executed with LLM models"
          />
          <StatCard
            title="Avg Response Time"
            value={`${analyticsData.avgResponseTime}s`}
            icon={Activity}
            color="text-blue-400"
            tooltip="Average response time for LLM executions"
          />
          <StatCard
            title="Success Rate"
            value={`${analyticsData.successRate}%`}
            icon={TrendingUp}
            color="text-green-400"
            tooltip="Percentage of successful prompt executions"
          />
          <StatCard
            title="Active Users"
            value={analyticsData.activeUsers}
            icon={Users}
            color="text-orange-400"
            tooltip="Number of users who generated prompts in the selected time range"
          />
        </div>
      )}

      {/* Usage Chart */}
      {analyticsData && (
        <div className="prompt-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Usage Trends
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</span>
            </div>
          </div>
          
          <UsageChart 
            title=""
            data={analyticsData.trendsData}
          />
        </div>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="prompt-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-400" />
            Top Domains
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Banking', usage: 89, color: 'bg-blue-500' },
              { name: 'Healthcare', usage: 76, color: 'bg-green-500' },
              { name: 'Technology', usage: 65, color: 'bg-purple-500' },
              { name: 'Architecture', usage: 43, color: 'bg-orange-500' },
            ].map((domain) => (
              <div key={domain.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${domain.color}`}></div>
                  <span className="text-white text-sm">{domain.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${domain.color}`}
                      style={{ width: `${domain.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-400 text-sm w-8">{domain.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="prompt-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Model Performance
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Claude Sonnet 4', responseTime: '2.1s', successRate: 96 },
              { name: 'GPT-4 Turbo', responseTime: '1.8s', successRate: 94 },
              { name: 'Gemini Pro', responseTime: '2.5s', successRate: 92 },
              { name: 'DeepSeek Local', responseTime: '1.2s', successRate: 98 },
            ].map((model) => (
              <div key={model.name} className="service-item">
                <div>
                  <p className="text-white text-sm font-medium">{model.name}</p>
                  <p className="text-slate-400 text-xs">{model.responseTime} avg</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">{model.successRate}%</p>
                  <p className="text-slate-400 text-xs">success</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
