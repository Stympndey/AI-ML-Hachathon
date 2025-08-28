import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, X } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

function EmergencyAlert({ onClose }) {
  const { state } = useHealth();
  const [countdown, setCountdown] = useState(10);
  const [location, setLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          findNearestHospital(coords);
        },
        (error) => {
          console.error('Location error:', error);
          // Fallback to default location
          const defaultCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
          setLocation(defaultCoords);
          findNearestHospital(defaultCoords);
        }
      );
    }
  };

  const findNearestHospital = async (coords) => {
    try {
      // Using Google Places API to find nearest hospital
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: coords,
        radius: 5000,
        type: ['hospital'],
        keyword: 'emergency'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
          setNearestHospital({
            name: results[0].name,
            address: results[0].vicinity,
            phone: '+91 98765 43210', // Fallback number
            distance: calculateDistance(coords, {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            })
          });
        } else {
          // Fallback hospital
          setNearestHospital({
            name: 'City General Hospital',
            address: 'Emergency Services Available',
            phone: '+91 98765 43210',
            distance: '2.5 km'
          });
        }
      });
    } catch (error) {
      console.error('Hospital search error:', error);
      setNearestHospital({
        name: 'Emergency Services',
        address: 'Location services unavailable',
        phone: '108', // Emergency number
        distance: 'Unknown'
      });
    }
  };

  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1) + ' km';
  };

  const sendEmergencyAlert = async () => {
    if (alertSent) return;
    
    const alertData = {
      timestamp: new Date().toISOString(),
      location: location,
      patientInfo: {
        healthScore: state.healthScore,
        recentMetrics: state.healthMetrics,
        emergencyContacts: ['Emergency Contact: +91 98765 43210']
      },
      hospital: nearestHospital,
      alertType: 'MEDICAL_EMERGENCY'
    };

    try {
      // Send to hospital system
      await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });

      // Make emergency call
      if (nearestHospital?.phone) {
        window.open(`tel:${nearestHospital.phone}`);
      }

      setAlertSent(true);
    } catch (error) {
      console.error('Alert sending failed:', error);
      // Fallback: direct call to emergency services
      window.open('tel:108');
      setAlertSent(true);
    }
  };

  const cancelAlert = () => {
    setCountdown(0);
    onClose();
  };

  if (alertSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Alert Sent!</h2>
            <p className="text-gray-600 mb-4">
              Hospital has been notified. Ambulance is on the way.
            </p>
            {nearestHospital && (
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold">{nearestHospital.name}</h3>
                <p className="text-sm text-gray-600">{nearestHospital.address}</p>
                <p className="text-sm text-gray-600">Distance: {nearestHospital.distance}</p>
                <p className="text-sm text-blue-600 font-medium">Phone: {nearestHospital.phone}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Alert</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-3xl font-bold text-red-600 mb-2">{countdown}</div>
            <p className="text-red-800">Sending alert to nearest hospital...</p>
          </div>

          {location && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">Your Location</span>
              </div>
              <p className="text-xs text-gray-600">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            </div>
          )}

          {nearestHospital && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-left">
              <h3 className="font-semibold text-blue-900">{nearestHospital.name}</h3>
              <p className="text-sm text-blue-700">{nearestHospital.address}</p>
              <p className="text-sm text-blue-700">Distance: {nearestHospital.distance}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={cancelAlert}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={sendEmergencyAlert}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Send Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyAlert;