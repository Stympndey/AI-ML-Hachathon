import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, User, FileText, Download, Share2, ArrowLeft, Check, Copy } from 'lucide-react';

function AppointmentConfirmation() {
  const location = useLocation();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const { appointment } = location.state || { 
    appointment: {
      facilityName: 'Unknown Facility',
      date: 'Not specified',
      time: 'Not specified',
      doctorDetails: {
        name: 'Unknown Doctor',
        specialty: 'General Medicine',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    }
  };

  const appointmentId = appointment.appointmentId || Math.floor(100000 + Math.random() * 900000);
  
  const downloadAppointment = () => {
    const appointmentData = {
      appointmentId,
      facilityName: appointment.facilityName,
      date: appointment.date,
      time: appointment.time,
      doctor: appointment.doctorDetails?.name,
      specialty: appointment.doctorDetails?.specialty,
      patientName: appointment.name || 'Patient Name',
      phone: appointment.phone || 'Phone number',
      reason: appointment.reason || 'General consultation',
      address: '123 Healthcare Street, Medical District',
      contactPhone: '+91 98765 43210',
      instructions: [
        'Please bring your ID proof and insurance card (if applicable)',
        'Wear a mask during your visit',
        'Reschedule if you have fever or COVID-19 symptoms',
        'Arrive 15 minutes before your appointment time'
      ]
    };
    
    const content = `APPOINTMENT CONFIRMATION\n\n` +
      `Appointment ID: #${appointmentData.appointmentId}\n` +
      `Date & Time: ${appointmentData.date} at ${appointmentData.time}\n\n` +
      `FACILITY DETAILS:\n` +
      `Name: ${appointmentData.facilityName}\n` +
      `Address: ${appointmentData.address}\n` +
      `Phone: ${appointmentData.contactPhone}\n\n` +
      `DOCTOR DETAILS:\n` +
      `Name: ${appointmentData.doctor}\n` +
      `Specialty: ${appointmentData.specialty}\n\n` +
      `PATIENT DETAILS:\n` +
      `Name: ${appointmentData.patientName}\n` +
      `Phone: ${appointmentData.phone}\n` +
      `Reason: ${appointmentData.reason}\n\n` +
      `IMPORTANT INSTRUCTIONS:\n` +
      appointmentData.instructions.map(instruction => `• ${instruction}`).join('\n') +
      `\n\nGenerated on: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment_${appointmentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };
  
  const shareAppointment = async () => {
    const shareText = `🏥 APPOINTMENT CONFIRMED\n\n` +
      `📅 ${appointment.date} at ${appointment.time}\n` +
      `🏥 ${appointment.facilityName}\n` +
      `👨‍⚕️ Dr. ${appointment.doctorDetails?.name}\n` +
      `📞 +91 98765 43210\n` +
      `🆔 Appointment ID: #${appointmentId}\n\n` +
      `Please arrive 15 minutes early. Bring ID proof and insurance card.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Appointment Confirmation',
          text: shareText
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (error) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <Link to="/" className="flex items-center text-blue-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Appointment Confirmed!</h1>
              <p className="mt-1 opacity-90">Your appointment has been successfully scheduled</p>
            </div>
            <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              Confirmed
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="bg-blue-500 p-2 rounded-full">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm opacity-90">Appointment Date & Time</p>
              <p className="font-medium">{appointment.date} at {appointment.time}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Appointment Details</h2>
            <span className="text-sm text-gray-500">ID: #{appointmentId}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{appointment.facilityName}</h3>
                  <p className="text-sm text-gray-600">123 Healthcare Street, Medical District</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Contact</h3>
                  <p className="text-sm text-gray-600">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Reason for Visit</h3>
                  <p className="text-sm text-gray-600">{appointment.reason || 'General consultation'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Your Doctor</h3>
              <div className="flex items-center">
                <img 
                  src={appointment.doctorDetails?.photo || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                  alt={appointment.doctorDetails?.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{appointment.doctorDetails?.name}</h4>
                  <p className="text-sm text-gray-600">{appointment.doctorDetails?.specialty}</p>
                  <p className="text-sm text-gray-600">{appointment.doctorDetails?.experience || '10+ years experience'}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Please arrive 15 minutes before your appointment time. Bring any relevant medical records or test results.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">{appointment.name || 'Patient Name'}</h4>
                <p className="text-sm text-gray-600">{appointment.phone || 'Phone number'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={downloadAppointment}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transition-all duration-200"
            >
              {downloadSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Appointment
                </>
              )}
            </button>
            <button 
              onClick={shareAppointment}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center transition-all duration-200"
            >
              {shareSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Details
                </>
              )}
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">Important Information:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Please bring your ID proof and insurance card (if applicable)</li>
              <li>Wear a mask during your visit</li>
              <li>Reschedule if you have fever or COVID-19 symptoms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentConfirmation;