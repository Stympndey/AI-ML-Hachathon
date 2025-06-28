import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ReportUpload from './components/ReportUpload';
import FacilitySearch from './components/FacilitySearchDark';
import AIAssistant from './components/AIAssistant';
import AppointmentConfirmation from './components/AppointmentConfirmation';
import HealthDataVisualization from './components/HealthDataVisualization';
import { HealthProvider } from './context/HealthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<ReportUpload />} />
                <Route path="/facilities" element={<FacilitySearch />} />
                <Route path="/chat" element={<AIAssistant />} />
                <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
                <Route path="/health-data" element={<HealthDataVisualization />} />
              </Routes>
            </main>
          </div>
        </Router>
      </HealthProvider>
    </ThemeProvider>
  );
}

export default App;