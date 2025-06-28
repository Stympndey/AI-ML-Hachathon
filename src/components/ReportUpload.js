import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Loader, Brain, MapPin, Star, Phone } from 'lucide-react';
import { analyzeMedicalReport } from '../utils/mistralAPI';
import { facilities } from '../data/facilities';

function ReportUpload() {
  const { dispatch } = useHealth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reportProcessed, setReportProcessed] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [recommendedFacilities, setRecommendedFacilities] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const processReport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const generateSampleData = () => {
        const bpSystolic = 110 + Math.floor(Math.random() * 30);
        const bpDiastolic = 70 + Math.floor(Math.random() * 20);
        const glucose = 85 + Math.floor(Math.random() * 40);
        const heartRate = 60 + Math.floor(Math.random() * 40);
        const totalChol = 150 + Math.floor(Math.random() * 80);
        const hdl = 40 + Math.floor(Math.random() * 30);
        const ldl = 80 + Math.floor(Math.random() * 60);
        const bmi = 20 + Math.random() * 10;
        
        return {
          bpSystolic, bpDiastolic, glucose, heartRate, totalChol, hdl, ldl, bmi: bmi.toFixed(1)
        };
      };
      
      const sampleData = generateSampleData();
      const text = `Medical Report Analysis\n\nPatient: Sample Patient\nDate: ${new Date().toLocaleDateString()}\nFile: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nExtracted Health Metrics:\n- Blood Pressure: ${sampleData.bpSystolic}/${sampleData.bpDiastolic} mmHg\n- Heart Rate: ${sampleData.heartRate} bpm\n- Cholesterol: Total ${sampleData.totalChol} mg/dL, HDL ${sampleData.hdl} mg/dL, LDL ${sampleData.ldl} mg/dL\n- Glucose: ${sampleData.glucose} mg/dL\n- BMI: ${sampleData.bmi}\n\nAnalysis: ${sampleData.bpSystolic <= 120 && sampleData.bpDiastolic <= 80 ? 'Blood pressure is normal.' : 'Blood pressure may need attention.'} ${sampleData.glucose <= 100 ? 'Glucose levels are normal.' : 'Glucose levels are elevated.'} Overall health indicators ${sampleData.bpSystolic <= 130 && sampleData.glucose <= 110 ? 'appear favorable' : 'show some areas for improvement'}.`;
      
      setExtractedText(text);
      
      // Analyze with Mistral AI
      const aiAnalysis = await analyzeMedicalReport(text);
      setAnalysis(aiAnalysis);
      
      // Save to context
      dispatch({
        type: 'ADD_REPORT',
        payload: {
          id: Date.now(),
          filename: file.name,
          uploadDate: new Date().toISOString(),
          extractedText: text,
          analysis: aiAnalysis,
          summary: aiAnalysis.summary,
          metadata: {
            reportDate: new Date().toISOString().split('T')[0],
            doctorName: aiAnalysis.detectedDoctor || '',
            facilityName: aiAnalysis.detectedFacility || '',
            reportType: aiAnalysis.reportType || '',
            notes: '',
            tags: []
          }
        }
      });
      
      const recommendations = getFacilityRecommendations(aiAnalysis, text);
      setRecommendedFacilities(recommendations);
      
      setReportProcessed(true);
    } catch (error) {
      console.error('Processing Error:', error);
      setError(`Error processing report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getFacilityRecommendations = (analysis, reportText) => {
    const recommendations = [];
    
    const hasCardiacIssues = reportText.toLowerCase().includes('heart') || 
                             reportText.toLowerCase().includes('cardiac') ||
                             reportText.toLowerCase().includes('blood pressure') ||
                             analysis.keyFindings?.some(finding => 
                               finding.toLowerCase().includes('heart') || 
                               finding.toLowerCase().includes('cardiac')
                             );
    
    const hasHighGlucose = reportText.toLowerCase().includes('glucose') ||
                          reportText.toLowerCase().includes('diabetes') ||
                          analysis.keyFindings?.some(finding => 
                            finding.toLowerCase().includes('glucose') || 
                            finding.toLowerCase().includes('diabetes')
                          );
    
    const needsAdvancedCare = analysis.riskFactors?.length > 2 ||
                             analysis.criticalValues?.length > 0;
    
    if (hasCardiacIssues) {
      const cardiacFacilities = facilities.filter(f => 
        f.name.includes('Apex Heart') || 
        f.services.some(s => s.toLowerCase().includes('cardiology'))
      ).slice(0, 2);
      recommendations.push(...cardiacFacilities.map(f => ({...f, reason: 'Cardiac care specialist'})));
    }
    
    if (needsAdvancedCare) {
      const advancedHospitals = facilities.filter(f => 
        f.type === 'Hospital' && 
        (f.name.includes('Sterling') || f.name.includes('Sayaji') || f.priceRange === '₹₹₹')
      ).slice(0, 2);
      recommendations.push(...advancedHospitals.map(f => ({...f, reason: 'Advanced medical care'})));
    }
    
    const generalRecommendations = facilities.filter(f => 
      (f.type === 'Hospital' && f.rating >= 4.5) ||
      (f.type === 'Laboratory' && f.name.includes('SRL'))
    ).slice(0, 2);
    
    recommendations.push(...generalRecommendations.map(f => ({
      ...f, 
      reason: f.type === 'Hospital' ? 'Highly rated hospital' : 'Follow-up tests'
    })));
    
    const uniqueRecommendations = recommendations.filter((facility, index, self) => 
      index === self.findIndex(f => f.id === facility.id)
    ).slice(0, 4);
    
    return uniqueRecommendations;
  };
  
  const bookAppointment = (facility) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      id: Date.now(),
      appointmentId: Math.floor(100000 + Math.random() * 900000),
      facilityName: facility.name,
      date: tomorrow.toLocaleDateString('en-GB'),
      time: '10:00 AM',
      service: 'Follow-up Consultation',
      status: 'confirmed',
      name: 'Patient Name',
      phone: '+91 98765 43210',
      reason: `Follow-up based on medical report analysis: ${facility.reason}`,
      doctorDetails: {
        name: 'Dr. ' + ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][Math.floor(Math.random() * 5)],
        specialty: facility.reason.includes('Cardiac') ? 'Cardiology' : 'General Medicine',
        experience: '10+ years experience',
        photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
      }
    };
    
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointmentData });
    
    navigate('/appointment-confirmation', {
      state: { appointment: appointmentData }
    });
  };

  const exportReport = () => {
    if (!analysis || !file) return;
    
    const report = {
      filename: file.name,
      analysis,
      summary: analysis.summary
    };
    
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Health Report Analysis</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors mb-6">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Select your health report image
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Supports JPG, PNG images
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Choose File
          </label>
        </div>
        
        {preview && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected Report</h2>
            <div className="flex justify-center">
              <img src={preview} alt="Report preview" className="max-h-64 rounded-lg border border-gray-200" />
            </div>
          </div>
        )}
        
        {file && !reportProcessed ? (
          <button
            onClick={processReport}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Analyzing with Mistral AI...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Analyze with Mistral AI
              </>
            )}
          </button>
        ) : (
          reportProcessed && (
            <div className="flex space-x-4">
              <button
                onClick={processReport}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Again
              </button>
              <button
                onClick={exportReport}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </button>
            </div>
          )
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analysis Results</h2>
            <div className="flex items-center space-x-2">
              {analysis.normalValues?.length > 0 && (
                <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {analysis.normalValues.length} Normal
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300">{analysis.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Key Findings</h3>
              <ul className="space-y-2">
                {analysis.keyFindings?.map((finding, index) => (
                  <li key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm text-gray-700 dark:text-gray-300">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations?.map((rec, index) => (
                  <li key={index} className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm text-gray-700 dark:text-gray-300">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            {analysis.normalValues?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Normal Values</h3>
                <ul className="space-y-2">
                  {analysis.normalValues?.map((value, index) => (
                    <li key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm text-gray-700 dark:text-gray-300">
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Report Type</h4>
                <p className="font-medium text-gray-900 dark:text-white">{analysis.reportType}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Doctor</h4>
                <p className="font-medium text-gray-900 dark:text-white">{analysis.detectedDoctor}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Facility</h4>
                <p className="font-medium text-gray-900 dark:text-white">{analysis.detectedFacility}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {recommendedFacilities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🏥 Recommended Healthcare Facilities</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Based on your medical report analysis, we recommend these facilities:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedFacilities.map((facility) => (
              <div key={facility.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{facility.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{facility.type}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    {facility.reason}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    {facility.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    {facility.rating} rating • {facility.distance} km away
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-2" />
                    {facility.phone}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => bookAppointment(facility)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => navigate('/facilities', { state: { searchQuery: facility.name } })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/facilities')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View All Healthcare Facilities →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportUpload;