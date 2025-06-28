import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HealthProvider } from './context/HealthContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import ReportUpload from './components/ReportUpload';
import AIAssistant from './components/AIAssistant';
import HealthDataVisualization from './components/HealthDataVisualization';
import FacilitySearchDark from './components/FacilitySearchDark';
import DrugInteractionChecker from './components/DrugInteractionChecker';

function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<ReportUpload />} />
                <Route path="/chat" element={<AIAssistant />} />
                <Route path="/health-data" element={<HealthDataVisualization />} />
                <Route path="/facilities" element={<FacilitySearchDark />} />
                <Route path="/drug-checker" element={<DrugInteractionChecker />} />
              </Routes>
            </main>
          </div>
        </Router>
      </HealthProvider>
    </ThemeProvider>
  );
}

export default App;