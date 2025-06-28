import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Activity, Heart, Droplet, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function HealthDataVisualization() {
  const { state } = useHealth();
  const [activeMetric, setActiveMetric] = useState('bloodPressure');
  
  const mergeHealthData = (staticData, dynamicData) => {
    if (!dynamicData || dynamicData.length === 0) return staticData;
    
    const merged = [...staticData];
    dynamicData.forEach(item => {
      const existingIndex = merged.findIndex(d => d.date === item.date);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...item };
      } else {
        merged.push(item);
      }
    });
    
    return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const healthData = {
    bloodPressure: mergeHealthData([
      { date: '2025-01', systolic: 120, diastolic: 80, normal: 120 },
      { date: '2025-02', systolic: 118, diastolic: 78, normal: 120 },
      { date: '2025-03', systolic: 122, diastolic: 82, normal: 120 },
      { date: '2025-04', systolic: 125, diastolic: 85, normal: 120 },
      { date: '2025-05', systolic: 119, diastolic: 79, normal: 120 },
      { date: '2025-06', systolic: 121, diastolic: 80, normal: 120 },
    ], state.healthMetrics.bloodPressure || []),
    glucose: mergeHealthData([
      { date: '2025-01', value: 95, normal: 100 },
      { date: '2025-02', value: 98, normal: 100 },
      { date: '2025-03', value: 102, normal: 100 },
      { date: '2025-04', value: 97, normal: 100 },
      { date: '2025-05', value: 99, normal: 100 },
      { date: '2025-06', value: 96, normal: 100 },
    ], state.healthMetrics.glucose || []),
    cholesterol: mergeHealthData([
      { date: '2025-01', hdl: 60, ldl: 100, triglycerides: 150 },
      { date: '2025-02', hdl: 62, ldl: 98, triglycerides: 145 },
      { date: '2025-03', hdl: 59, ldl: 103, triglycerides: 155 },
      { date: '2025-04', hdl: 61, ldl: 101, triglycerides: 148 },
      { date: '2025-05', hdl: 63, ldl: 97, triglycerides: 142 },
      { date: '2025-06', hdl: 62, ldl: 99, triglycerides: 146 },
    ], state.healthMetrics.cholesterol || []),
    weight: mergeHealthData([
      { date: '2025-01', value: 70 },
      { date: '2025-02', value: 69.5 },
      { date: '2025-03', value: 69 },
      { date: '2025-04', value: 68.5 },
      { date: '2025-05', value: 68 },
      { date: '2025-06', value: 67.5 },
    ], state.healthMetrics.weight || [])
  };
  
  const healthDistribution = [
    { name: 'Excellent', value: 60 },
    { name: 'Good', value: 25 },
    { name: 'Fair', value: 10 },
    { name: 'Poor', value: 5 },
  ];
  
  const renderActiveChart = () => {
    switch (activeMetric) {
      case 'bloodPressure':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData.bloodPressure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="systolic" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" />
              <Line type="monotone" dataKey="normal" stroke="#ff7300" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'glucose':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={healthData.glucose}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="normal" stroke="#ff7300" strokeDasharray="5 5" fill="#ff7300" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'cholesterol':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData.cholesterol}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hdl" fill="#8884d8" />
              <Bar dataKey="ldl" fill="#82ca9d" />
              <Bar dataKey="triglycerides" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'weight':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData.weight}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={healthDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {healthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  const getMetricInsight = () => {
    const hasRecentData = state.reports.length > 0;
    const recentDataText = hasRecentData ? " Recent uploaded reports show updated values." : "";
    
    switch (activeMetric) {
      case 'bloodPressure':
        return `Your blood pressure has remained stable over the past 6 months, with values within the normal range.${recentDataText}`;
      case 'glucose':
        return `Your glucose levels have been consistent, with a slight elevation in March that returned to normal.${recentDataText}`;
      case 'cholesterol':
        return `Your HDL (good) cholesterol has improved slightly, while LDL (bad) cholesterol has decreased.${recentDataText}`;
      case 'weight':
        return `You've shown steady progress in weight management, with a gradual decrease over the past 6 months.${recentDataText}`;
      case 'distribution':
        return `Overall health metrics show excellent results in 60% of categories, with only 5% in the concerning range.${recentDataText}`;
      default:
        return "";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Health Data Visualization</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveMetric('bloodPressure')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              activeMetric === 'bloodPressure' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className="h-4 w-4 mr-2" />
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveMetric('glucose')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              activeMetric === 'glucose' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Droplet className="h-4 w-4 mr-2" />
            Glucose
          </button>
          <button
            onClick={() => setActiveMetric('cholesterol')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              activeMetric === 'cholesterol' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="h-4 w-4 mr-2" />
            Cholesterol
          </button>
          <button
            onClick={() => setActiveMetric('weight')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              activeMetric === 'weight' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Weight
          </button>
          <button
            onClick={() => setActiveMetric('distribution')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              activeMetric === 'distribution' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Health Distribution
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trend Analysis</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{getMetricInsight()}</p>
        </div>
        
        {renderActiveChart()}
        
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Data shown is from January to June 2025. Click on different metrics to view their trends.</p>
          {state.reports.length > 0 && (
            <p className="mt-2 text-blue-600 dark:text-blue-400">
              📊 {state.reports.length} medical report{state.reports.length > 1 ? 's' : ''} uploaded and integrated into your health data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthDataVisualization;