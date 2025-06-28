import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, Heart, Brain, TrendingUp, Users, Calendar, MessageSquare, Upload, Search, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Dynamic health data based on uploaded reports
const getHealthTrendData = (reports, healthMetrics) => {
  const baseData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 82 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 87 },
    { name: 'Jun', value: 92 }
  ];
  
  if (reports.length > 0) {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    const latestScore = calculateHealthScoreFromMetrics(healthMetrics);
    baseData.push({ name: currentMonth, value: latestScore });
  }
  
  return baseData;
};

const calculateHealthScoreFromMetrics = (metrics) => {
  let score = 85;
  
  if (metrics.bloodPressure?.length > 0) {
    const latest = metrics.bloodPressure[metrics.bloodPressure.length - 1];
    if (latest.systolic <= 120 && latest.diastolic <= 80) score += 5;
    else if (latest.systolic > 140 || latest.diastolic > 90) score -= 10;
  }
  
  if (metrics.glucose?.length > 0) {
    const latest = metrics.glucose[metrics.glucose.length - 1];
    if (latest.value <= 100) score += 3;
    else if (latest.value > 125) score -= 8;
  }
  
  return Math.min(Math.max(score, 0), 100);
};

const appointmentData = [
  { name: 'Mon', appointments: 4 },
  { name: 'Tue', appointments: 6 },
  { name: 'Wed', appointments: 8 },
  { name: 'Thu', appointments: 5 },
  { name: 'Fri', appointments: 7 },
  { name: 'Sat', appointments: 3 },
  { name: 'Sun', appointments: 2 }
];

function Dashboard() {
  const { state } = useHealth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChart, setSelectedChart] = useState(null);
  const [healthScore, setHealthScore] = useState(state.healthScore || 92);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [healthData, setHealthData] = useState(getHealthTrendData(state.reports, state.healthMetrics));
  
  useEffect(() => {
    setHealthData(getHealthTrendData(state.reports, state.healthMetrics));
    setHealthScore(state.healthScore || 92);
  }, [state.reports, state.healthMetrics, state.healthScore]);
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev < healthScore) {
          return Math.min(prev + 2, healthScore);
        }
        return prev;
      });
    }, 50);
    
    if (animatedScore >= healthScore) {
      clearInterval(timer);
    }
    
    return () => clearInterval(timer);
  }, [healthScore, animatedScore]);

  const stats = [
    {
      title: 'Health Score',
      value: `${animatedScore}%`,
      change: '+5%',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      insight: 'Your health score improved due to regular exercise and better sleep patterns.',
      trend: 'improving',
      riskLevel: 'low'
    },
    {
      title: 'Active Reports',
      value: state.reports.length.toString(),
      change: '+2',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      insight: 'Recent blood work shows improved cholesterol levels.',
      trend: 'stable',
      riskLevel: 'low'
    },

    {
      title: 'Appointments',
      value: state.appointments.length.toString(),
      change: '+3',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      insight: 'Next cardiology checkup scheduled. All vitals within normal range.',
      trend: 'stable',
      riskLevel: 'low'
    }
  ];

  const getInsightIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const handleChartClick = (data, chartType) => {
    setSelectedChart({ data, chartType, timestamp: Date.now() });
  };

  const getChartInsight = (data, chartType) => {
    if (chartType === 'health') {
      const trend = data.value > 85 ? 'excellent' : data.value > 70 ? 'good' : 'needs attention';
      return `${data.name}: Health score is ${trend}. ${data.value > 85 ? 'Keep up the great work!' : 'Consider lifestyle improvements.'}`;
    } else {
      const trend = data.appointments > 5 ? 'busy' : data.appointments > 3 ? 'moderate' : 'light';
      return `${data.name}: ${trend} schedule with ${data.appointments} appointments. ${data.appointments > 6 ? 'Consider spacing out appointments.' : 'Good balance.'}`;
    }
  };

  const CustomTooltip = ({ active, payload, label, chartType }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {chartType === 'health' ? `Health Score: ${payload[0].value}%` : `Appointments: ${payload[0].value}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getChartInsight(data, chartType)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click for detailed analysis
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&h=300&fit=crop&crop=center" 
          alt="Medical Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Health Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Welcome back! Here's your health overview for {currentTime.toLocaleDateString()}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative group"
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white transition-all duration-500">
                    {stat.title === 'Health Score' ? (
                      <span className="inline-block transform transition-transform duration-300 group-hover:scale-110">
                        {stat.value}
                      </span>
                    ) : stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{stat.change} from last week</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} self-start sm:self-center transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                </div>
              </div>
              
              {hoveredStat === index && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-xl z-10 transform transition-all duration-200 opacity-100">
                  <div className="flex items-start space-x-2">
                    {getInsightIcon(stat.riskLevel)}
                    <div>
                      <p className="text-sm font-medium mb-1">AI Insight</p>
                      <p className="text-xs text-gray-300">{stat.insight}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.trend === 'improving' ? 'bg-green-600 text-green-100' :
                          stat.trend === 'increasing' ? 'bg-blue-600 text-blue-100' :
                          'bg-gray-600 text-gray-100'
                        }`}>
                          {stat.trend}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.riskLevel === 'low' ? 'bg-green-600 text-green-100' :
                          stat.riskLevel === 'medium' ? 'bg-yellow-600 text-yellow-100' :
                          'bg-red-600 text-red-100'
                        }`}>
                          {stat.riskLevel} risk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Health Trends</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>Click points for insights</span>
            </div>
          </div>
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData} onClick={(data) => data && handleChartClick(data.activePayload?.[0]?.payload, 'health')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip chartType="health" />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6, className: 'hover:r-8 transition-all cursor-pointer' }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Weekly Appointments</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Hover for details</span>
            </div>
          </div>
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} onClick={(data) => data && handleChartClick(data.activePayload?.[0]?.payload, 'appointments')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip chartType="appointments" />} />
                <Bar dataKey="appointments" className="cursor-pointer">
                  {appointmentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.appointments > 6 ? '#EF4444' : entry.appointments > 4 ? '#F59E0B' : '#10B981'}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Chart Details</h3>
              <button 
                onClick={() => setSelectedChart(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Data Insight</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {getChartInsight(selectedChart.data, selectedChart.chartType)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChart.chartType === 'health' ? `${selectedChart.data.value}%` : selectedChart.data.appointments}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedChart.chartType === 'health' ? 'Health Score' : 'Appointments'}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedChart.chartType === 'health' ? '↗' : selectedChart.data.appointments > 5 ? '⚠' : '✓'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedChart.chartType === 'health' ? 'Trending Up' : selectedChart.data.appointments > 5 ? 'Busy Day' : 'Normal'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedChart.chartType === 'health' ? (
                    selectedChart.data.value > 85 ? [
                      '• Continue current health routine',
                      '• Consider sharing tips with family',
                      '• Schedule preventive checkups'
                    ] : [
                      '• Focus on sleep and nutrition',
                      '• Increase physical activity',
                      '• Consult healthcare provider'
                    ]
                  ) : (
                    selectedChart.data.appointments > 5 ? [
                      '• Consider rescheduling non-urgent appointments',
                      '• Plan rest time between appointments',
                      '• Prepare questions in advance'
                    ] : [
                      '• Good appointment balance',
                      '• Use free time for self-care',
                      '• Stay consistent with routine'
                    ]
                  )}.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => navigate('/chat')}
          className="group relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-500 text-white overflow-hidden hover:scale-105 hover:-translate-y-2"
        >
          <img 
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop&crop=center" 
            alt="AI Medical Assistant" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          />
          <div className="relative z-10">
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">AI Health Assistant</h3>
            <p className="text-sm sm:text-base text-blue-100 opacity-90">Get intelligent medical guidance with clinical reasoning</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/upload')}
          className="group relative bg-gradient-to-br from-green-500 to-teal-600 p-4 sm:p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-500 text-white overflow-hidden hover:scale-105 hover:-translate-y-2"
        >
          <img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center" 
            alt="Medical Reports" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          />
          <div className="relative z-10">
            <Upload className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Upload Reports</h3>
            <p className="text-sm sm:text-base text-green-100 opacity-90">Upload and analyze medical documents with AI</p>
          </div>
        </div>



        <div 
          onClick={() => navigate('/health-data')}
          className="group relative bg-gradient-to-br from-yellow-500 to-orange-600 p-4 sm:p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-500 text-white overflow-hidden hover:scale-105 hover:-translate-y-2"
        >
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center" 
            alt="Health Data" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          />
          <div className="relative z-10">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Health Data</h3>
            <p className="text-sm sm:text-base text-yellow-100 opacity-90">Visualize and track your health metrics</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/facilities')}
          className="group relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 sm:p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-500 text-white overflow-hidden hover:scale-105 hover:-translate-y-2"
        >
          <img 
            src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=200&fit=crop&crop=center" 
            alt="Hospital Building" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          />
          <div className="relative z-10">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Find Healthcare</h3>
            <p className="text-sm sm:text-base text-purple-100 opacity-90">Search hospitals, clinics, and specialists</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Recent Activity</h3>
        <div className="space-y-3 sm:space-y-4">
          {state.reports.length > 0 ? (
            state.reports.slice(-3).reverse().map((report, index) => {
              const timeAgo = new Date(report.uploadDate).toLocaleDateString();
              return (
                <div key={report.id} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                      {report.filename} uploaded
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{timeAgo}</p>
                    {report.analysis?.summary && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {report.analysis.summary.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            [
              { color: 'bg-gray-400', title: 'No reports uploaded yet', time: 'Upload your first report' },
              { color: 'bg-blue-500', title: 'Welcome to CareConnect', time: 'Start by uploading a health report' },
              { color: 'bg-green-500', title: 'AI analysis ready', time: 'Get insights from your medical data' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 ${activity.color} rounded-full flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;