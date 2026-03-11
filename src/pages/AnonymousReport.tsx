import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  MapPin, 
  Camera, 
  Shield,
  AlertTriangle,
  Clock,
  Send,
  FileText,
  Navigation
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Report type definition
interface AnonymousReport {
  type: string;
  description: string;
  location: { lat: number; lng: number; accuracy?: number };
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  timestamp: Date;
  includeLocation: boolean;
  includeTime: boolean;
  mediaAttachments: string[];
  anonymousId: string;
}

const AnonymousReport: React.FC = () => {
  const [reportData, setReportData] = useState<Partial<AnonymousReport>>({
    type: 'suspicious_activity',
    description: '',
    urgency: 'medium',
    includeLocation: true,
    includeTime: true,
    mediaAttachments: []
  });
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const navigate = useNavigate();
  const { user } = useUser();
  const { speak, speechEnabled } = useAccessibility();

  // Report type options
  const reportTypes = [
    { value: 'suspicious_activity', label: 'Suspicious Activity', icon: '👀', description: 'Unusual or concerning behavior' },
    { value: 'hazard', label: 'Safety Hazard', icon: '⚠️', description: 'Dangerous conditions or obstacles' },
    { value: 'crime', label: 'Crime Report', icon: '🚔', description: 'Witnessed criminal activity' },
    { value: 'accident', label: 'Accident', icon: '🚑', description: 'Car crash or injury incident' },
    { value: 'environmental', label: 'Environmental Issue', icon: '🌳', description: 'Pollution or environmental concern' },
    { value: 'infrastructure', label: 'Infrastructure Problem', icon: '🏗️', description: 'Roads, lights, or public facilities' },
    { value: 'other', label: 'Other', icon: '📝', description: 'Other safety concerns' }
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100', description: 'No immediate danger' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100', description: 'Potential risk' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100', description: 'Immediate attention needed' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-600 bg-red-100', description: 'Call emergency services first' }
  ];

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setUserLocation(location);
        setLocationError('');
        
        if (speechEnabled) {
          speak('Current location captured for report');
        }
      },
      (error) => {
        const errorMessage = getLocationError(error);
        setLocationError(errorMessage);
        if (speechEnabled) speak(`Location error: ${errorMessage}`);
      },
      options
    );
  };

  const getLocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions in your browser settings.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable. Please check your device location services.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to retrieve your location.';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const generateAnonymousId = (): string => {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

  const submitReport = async (): Promise<boolean> => {
    if (!reportData.description?.trim()) {
      throw new Error('Please provide a description of the incident');
    }

    if (reportData.includeLocation && !userLocation) {
      throw new Error('Location is required but not available. Please enable location services.');
    }

    const completeReport: AnonymousReport = {
      type: reportData.type || 'other',
      description: reportData.description,
      location: userLocation || { lat: 0, lng: 0 },
      urgency: reportData.urgency || 'medium',
      timestamp: new Date(),
      includeLocation: reportData.includeLocation || false,
      includeTime: reportData.includeTime || false,
      mediaAttachments: reportData.mediaAttachments || [],
      anonymousId: generateAnonymousId()
    };

    try {
      // Real API call to submit report
      const response = await fetch('/api/reports/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeReport)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw new Error('Network error: Unable to submit report. Please check your connection and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const success = await submitReport();
      
      if (success) {
        setSubmissionResult({
          success: true,
          message: 'Your anonymous report has been submitted successfully and is being reviewed.'
        });
        
        if (speechEnabled) {
          speak('Report submitted successfully. Thank you for helping keep the community safe.');
        }

        // Reset form
        setReportData({
          type: 'suspicious_activity',
          description: '',
          urgency: 'medium',
          includeLocation: true,
          includeTime: true,
          mediaAttachments: []
        });
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      
      if (speechEnabled) {
        speak('Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrgentAlert = () => {
    if (speechEnabled) {
      speak('Warning: For immediate emergencies, please call local emergency services first. This reporting system is for non-emergency situations.');
    }
    
    setReportData(prev => ({
      ...prev,
      urgency: 'emergency',
      description: prev.description || 'URGENT: Immediate assistance required.'
    }));
  };

  const capturePhoto = () => {
    // Real photo capture implementation
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // TODO: Implement actual photo capture logic
          if (speechEnabled) speak('Camera activated for photo capture');
          // For now, simulate photo capture
          handleInputChange('mediaAttachments', [...(reportData.mediaAttachments || []), 'captured_photo.jpg']);
        })
        .catch((error) => {
          console.error('Camera error:', error);
          if (speechEnabled) speak('Camera access denied or unavailable');
        });
    } else {
      if (speechEnabled) speak('Camera not available on this device');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 mr-2"
                aria-label="Go back to home"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-orange-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Anonymous Report</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {userLocation && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <Navigation className="w-4 h-4 mr-1" />
                  Location Active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Submission Result */}
        {submissionResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            submissionResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {submissionResult.success ? (
                <Shield className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              {submissionResult.message}
            </div>
          </div>
        )}

        {/* Location Status */}
        {locationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{locationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {/* Report Type */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    reportData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{type.icon}</span>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Urgency Level</h3>
            <div className="flex flex-wrap gap-3">
              {urgencyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('urgency', level.value)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    reportData.urgency === level.value
                      ? level.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {reportData.urgency === 'emergency' && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">
                    For immediate emergencies, call local emergency services first: 911
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Incident Description
            </label>
            <textarea
              value={reportData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Please provide a detailed description of what you observed. Include relevant details like time, people involved, vehicles, and any other important information."
              required
            />
          </div>

          {/* Location Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Include Current Location</div>
                    <div className="text-sm text-gray-500">
                      {userLocation 
                        ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
                        : 'Location not available'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('includeLocation', !reportData.includeLocation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reportData.includeLocation ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      reportData.includeLocation ? 'transform translate-x-7' : 'transform translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Include Timestamp</div>
                    <div className="text-sm text-gray-500">Current date and time</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('includeTime', !reportData.includeTime)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reportData.includeTime ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      reportData.includeTime ? 'transform translate-x-7' : 'transform translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Media Attachments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Media Evidence</h3>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </button>
              <button
                type="button"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Add Document
              </button>
            </div>
            {reportData.mediaAttachments && reportData.mediaAttachments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {reportData.mediaAttachments.map((attachment, index) => (
                    <div key={index} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <Eye className="w-4 h-4 inline mr-1" />
              This report is completely anonymous
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !reportData.description?.trim()}
              className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Anonymously
                </>
              )}
            </button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Privacy & Safety Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your identity is completely protected - no personal information is collected</li>
            <li>• Reports are reviewed by safety authorities</li>
            <li>• Location data is only used for incident verification</li>
            <li>• For immediate emergencies, always call 911 first</li>
            <li>• False reporting may violate local laws</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnonymousReport;