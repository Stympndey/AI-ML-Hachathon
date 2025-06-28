import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, CheckCircle } from 'lucide-react';
import { facilities as allFacilities } from '../data/facilities';

function FacilitySearch() {
  const { state, dispatch } = useHealth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [filters, setFilters] = useState({
    type: 'all',
    distance: 10,
    rating: 0,
    priceRange: 'all'
  });

  const [facilities, setFacilities] = useState(allFacilities);

  useEffect(() => {
    dispatch({ type: 'SET_FACILITIES', payload: facilities });
  }, [facilities, dispatch]);
  
  const isFromRecommendation = location.state?.searchQuery;
  
  useEffect(() => {
    if (isFromRecommendation) {
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [isFromRecommendation]);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filters.type === 'all' || facility.type.toLowerCase() === filters.type.toLowerCase();
    const matchesDistance = facility.distance <= filters.distance;
    const matchesRating = facility.rating >= filters.rating;
    
    return matchesSearch && matchesType && matchesDistance && matchesRating;
  });

  const bookAppointment = (facility) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      id: Date.now(),
      appointmentId: Math.floor(100000 + Math.random() * 900000),
      facilityName: facility.name,
      date: tomorrow.toLocaleDateString('en-GB'),
      time: '10:00 AM',
      service: 'General Consultation',
      status: 'confirmed',
      name: 'Patient Name',
      phone: '+91 98765 43210',
      reason: 'General consultation and health checkup',
      doctorDetails: {
        name: 'Dr. ' + ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][Math.floor(Math.random() * 5)],
        specialty: facility.type === 'Hospital' ? 'General Medicine' : 'Family Medicine',
        experience: '10+ years experience',
        photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
      }
    };
    
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointmentData });
    
    navigate('/appointment-confirmation', {
      state: { appointment: appointmentData }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isFromRecommendation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Recommended based on your medical report analysis
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                We've pre-filtered facilities that match your health needs.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Medical Facilities</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search facilities or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="laboratory">Laboratory</option>
          </select>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Distance (km)</label>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.distance}
              onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
              className="w-full"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">{filters.distance} km</span>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
              className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
            >
              <option value="0">Any</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      <div id="search-results" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{facility.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{facility.type}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {facility.priceRange}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                {facility.address} • {facility.distance} km away
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {facility.rating} rating
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                {facility.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4 mr-2" />
                {facility.hours}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Services</h4>
              <div className="flex flex-wrap gap-2">
                {facility.services.map((service, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pricing</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium dark:text-white">Consultation</div>
                  <div className="text-gray-600 dark:text-gray-300">₹{facility.cost.consultation}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium dark:text-white">Blood Test</div>
                  <div className="text-gray-600 dark:text-gray-300">₹{facility.cost.bloodTest}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium dark:text-white">X-Ray</div>
                  <div className="text-gray-600 dark:text-gray-300">₹{facility.cost.xray}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => bookAppointment(facility)}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No facilities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default FacilitySearch;