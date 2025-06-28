import React, { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle, Plus, X, Zap } from 'lucide-react';

const DrugInteractionChecker = () => {
  const [medications, setMedications] = useState([]);
  const [newMed, setNewMed] = useState('');
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  const commonMeds = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Lisinopril', 'Metformin',
    'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Warfarin', 'Metoprolol'
  ];

  const drugDatabase = {
    'Warfarin': {
      interactions: ['Aspirin', 'Ibuprofen'],
      severity: 'high',
      effects: 'Increased bleeding risk'
    },
    'Aspirin': {
      interactions: ['Warfarin', 'Ibuprofen'],
      severity: 'medium',
      effects: 'Increased bleeding, stomach irritation'
    },
    'Metformin': {
      interactions: ['Alcohol'],
      severity: 'medium',
      effects: 'Increased risk of lactic acidosis'
    },
    'Lisinopril': {
      interactions: ['Ibuprofen'],
      severity: 'medium',
      effects: 'Reduced effectiveness, kidney problems'
    }
  };

  const addMedication = (med) => {
    if (med && !medications.includes(med)) {
      setMedications([...medications, med]);
      setNewMed('');
      checkInteractions([...medications, med]);
    }
  };

  const removeMedication = (med) => {
    const updated = medications.filter(m => m !== med);
    setMedications(updated);
    checkInteractions(updated);
  };

  const checkInteractions = (medList) => {
    setLoading(true);
    
    setTimeout(() => {
      const foundInteractions = [];
      
      for (let i = 0; i < medList.length; i++) {
        for (let j = i + 1; j < medList.length; j++) {
          const med1 = medList[i];
          const med2 = medList[j];
          
          if (drugDatabase[med1]?.interactions.includes(med2)) {
            foundInteractions.push({
              drugs: [med1, med2],
              severity: drugDatabase[med1].severity,
              effects: drugDatabase[med1].effects,
              recommendation: getSafetyRecommendation(drugDatabase[med1].severity)
            });
          }
        }
      }
      
      setInteractions(foundInteractions);
      setLoading(false);
    }, 1000);
  };

  const getSafetyRecommendation = (severity) => {
    switch (severity) {
      case 'high':
        return 'Consult doctor immediately. Do not take together without medical supervision.';
      case 'medium':
        return 'Monitor closely. Consult healthcare provider about timing and dosage.';
      default:
        return 'Generally safe but monitor for side effects.';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Drug Interaction Checker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Check for dangerous drug interactions using AI analysis
        </p>
      </div>

      {/* Add Medications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Medications
        </h2>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newMed}
            onChange={(e) => setNewMed(e.target.value)}
            placeholder="Enter medication name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addMedication(newMed)}
          />
          <button
            onClick={() => addMedication(newMed)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick add common medications:</p>
          <div className="flex flex-wrap gap-2">
            {commonMeds.map(med => (
              <button
                key={med}
                onClick={() => addMedication(med)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {med}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {medications.map(med => (
            <div key={med} className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <Pill className="h-4 w-4" />
              <span>{med}</span>
              <button
                onClick={() => removeMedication(med)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Results */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Interaction Analysis
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Analyzing drug interactions...</p>
          </div>
        ) : interactions.length > 0 ? (
          <div className="space-y-4">
            {interactions.map((interaction, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-1 ${
                    interaction.severity === 'high' ? 'text-red-500' :
                    interaction.severity === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      {interaction.drugs.join(' + ')} Interaction
                    </h3>
                    <p className="text-sm mb-2">
                      <strong>Effect:</strong> {interaction.effects}
                    </p>
                    <p className="text-sm">
                      <strong>Recommendation:</strong> {interaction.recommendation}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    interaction.severity === 'high' ? 'bg-red-200 text-red-800' :
                    interaction.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {interaction.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : medications.length > 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-semibold">No dangerous interactions detected!</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Your current medications appear to be safe to take together.
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add medications to check for interactions</p>
          </div>
        )}
      </div>

      {/* AI Insights */}
      {medications.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🤖 AI Health Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Medication Count:</p>
              <p className="text-gray-600 dark:text-gray-400">{medications.length} active medications</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Risk Level:</p>
              <p className={`${interactions.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {interactions.length > 0 ? 'Interactions Found' : 'Low Risk'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugInteractionChecker;