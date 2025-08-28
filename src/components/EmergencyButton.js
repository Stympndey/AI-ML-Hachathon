import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import EmergencyAlert from './EmergencyAlert';

function EmergencyButton() {
  const { state } = useHealth();
  const [showAlert, setShowAlert] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (isMonitoring) {
      checkVitalSigns();
    }
  }, [state.healthMetrics, isMonitoring]);

  const checkVitalSigns = () => {
    const { heartRate, bloodPressure } = state.healthMetrics;
    
    // Check latest heart rate
    if (heartRate && heartRate.length > 0) {
      const latestHR = heartRate[heartRate.length - 1];
      if (latestHR.value > 120 || latestHR.value < 50) {
        triggerAutoAlert('Heart rate anomaly detected');
        return;
      }
    }

    // Check latest blood pressure
    if (bloodPressure && bloodPressure.length > 0) {
      const latestBP = bloodPressure[bloodPressure.length - 1];
      if (latestBP.systolic > 180 || latestBP.diastolic > 110) {
        triggerAutoAlert('Critical blood pressure detected');
        return;
      }
    }
  };

  const triggerAutoAlert = (reason) => {
    console.log(`Auto-triggering emergency alert: ${reason}`);
    setShowAlert(true);
  };

  const handleManualAlert = () => {
    setShowAlert(true);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleManualAlert}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse"
          title="Emergency Alert - Click for immediate help"
        >
          <AlertTriangle className="h-8 w-8" />
        </button>
        
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
          !
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-xs text-red-600 font-medium">EMERGENCY</span>
        </div>
      </div>

      {showAlert && (
        <EmergencyAlert onClose={() => setShowAlert(false)} />
      )}
    </>
  );
}

export default EmergencyButton;