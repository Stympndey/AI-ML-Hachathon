import React, { createContext, useContext, useReducer } from 'react';

const HealthContext = createContext();

const initialState = {
  user: null,
  reports: [],
  recommendations: [],
  appointments: [],
  facilities: [],
  chatHistory: [],
  healthMetrics: {
    bloodPressure: [],
    glucose: [],
    cholesterol: [],
    weight: [],
    heartRate: [],
    bmi: []
  },
  healthScore: 92
};

function healthReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'UPDATE_HEALTH_METRICS':
      return { 
        ...state, 
        healthMetrics: { ...state.healthMetrics, ...action.payload },
        healthScore: action.healthScore || state.healthScore
      };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'SET_FACILITIES':
      return { ...state, facilities: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] };
    default:
      return state;
  }
}

export function HealthProvider({ children }) {
  const [state, dispatch] = useReducer(healthReducer, initialState);

  const extractHealthMetrics = (reportText) => {
    const metrics = {};
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Extract blood pressure
    const bpMatch = reportText.match(/(\d{2,3})\/(\d{2,3})\s*mmHg/i);
    if (bpMatch) {
      metrics.bloodPressure = [{ date: currentDate, systolic: parseInt(bpMatch[1]), diastolic: parseInt(bpMatch[2]) }];
    }
    
    // Extract glucose
    const glucoseMatch = reportText.match(/glucose[:\s]*(\d+)\s*mg\/dl/i);
    if (glucoseMatch) {
      metrics.glucose = [{ date: currentDate, value: parseInt(glucoseMatch[1]) }];
    }
    
    // Extract cholesterol
    const totalCholMatch = reportText.match(/total[\s\w]*cholesterol[:\s]*(\d+)\s*mg\/dl/i);
    const hdlMatch = reportText.match(/hdl[:\s]*(\d+)\s*mg\/dl/i);
    const ldlMatch = reportText.match(/ldl[:\s]*(\d+)\s*mg\/dl/i);
    
    if (totalCholMatch || hdlMatch || ldlMatch) {
      metrics.cholesterol = [{
        date: currentDate,
        total: totalCholMatch ? parseInt(totalCholMatch[1]) : null,
        hdl: hdlMatch ? parseInt(hdlMatch[1]) : null,
        ldl: ldlMatch ? parseInt(ldlMatch[1]) : null
      }];
    }
    
    // Extract heart rate
    const hrMatch = reportText.match(/heart rate[:\s]*(\d+)\s*bpm/i);
    if (hrMatch) {
      metrics.heartRate = [{ date: currentDate, value: parseInt(hrMatch[1]) }];
    }
    
    // Extract BMI
    const bmiMatch = reportText.match(/bmi[:\s]*(\d+\.?\d*)/i);
    if (bmiMatch) {
      metrics.bmi = [{ date: currentDate, value: parseFloat(bmiMatch[1]) }];
    }
    
    return metrics;
  };

  const enhancedDispatch = (action) => {
    if (action.type === 'ADD_REPORT' && action.payload.extractedText) {
      const extractedMetrics = extractHealthMetrics(action.payload.extractedText);
      
      // Calculate health score based on metrics
      let healthScore = 85; // Base score
      
      if (extractedMetrics.bloodPressure?.[0]) {
        const bp = extractedMetrics.bloodPressure[0];
        if (bp.systolic <= 120 && bp.diastolic <= 80) healthScore += 5;
        else if (bp.systolic > 140 || bp.diastolic > 90) healthScore -= 10;
      }
      
      if (extractedMetrics.glucose?.[0]) {
        const glucose = extractedMetrics.glucose[0].value;
        if (glucose <= 100) healthScore += 3;
        else if (glucose > 125) healthScore -= 8;
      }
      
      // Dispatch the report
      dispatch(action);
      
      // Update health metrics if any were extracted
      if (Object.keys(extractedMetrics).length > 0) {
        dispatch({
          type: 'UPDATE_HEALTH_METRICS',
          payload: extractedMetrics,
          healthScore: Math.min(Math.max(healthScore, 0), 100)
        });
      }
    } else {
      dispatch(action);
    }
  };

  return (
    <HealthContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}