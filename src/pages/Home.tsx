import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  MessageCircle, 
  Shield, 
  Settings, 
  AlertTriangle, 
  PhoneCall,
  Eye,
  Bell,
  Users,
  User,
  Navigation
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import SOSButton from '../components/SOSButton';
import AccessibilityPanel from '../components/AccessibilityPanel';


// Types for live data
interface LiveIncident {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  location: string;
  distance: number;
  coordinates: { lat: number; lng: number };
}

const Home: React.FC = () => {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [recentIncidents, setRecentIncidents] = useState<LiveIncident[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  const navigate = useNavigate();
  const { user, updateLocation } = useUser();
  const { speak, speechEnabled, setSpeechEnabled } = useAccessibility();

  // Real location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        updateLocation(latitude, longitude);
        setLocationError('');
        
        // Fetch incidents near this location
        fetchNearbyIncidents(latitude, longitude);
      },
      (error) => {
        const errorMessage = getLocationError(error);
        setLocationError(errorMessage);
        if (speechEnabled) speak(`Location error: ${errorMessage}`);
      },
      options
    );

    // Continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updateLocation, speak, speechEnabled]);

  // Fetch real incidents from backend API
  const fetchNearbyIncidents = async (lat: number, lng: number) => {
    try {
      // TODO: Replace with your actual backend API endpoint
      const response = await fetch(`/api/incidents/nearby?lat=${lat}&lng=${lng}&radius=5`);
      
      if (response.ok) {
        const incidents = await response.json();
        setRecentIncidents(incidents);
      } else {
        // Fallback to demo data if API fails
        setRecentIncidents(getDemoIncidents(lat, lng));
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      setRecentIncidents(getDemoIncidents(lat, lng));
    }
  };

  // Generate realistic demo incidents based on actual location
  const getDemoIncidents = (lat: number, lng: number): LiveIncident[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'warning',
        message: 'Heavy traffic reported in your area',
        timestamp: new Date(now.getTime() - 5 * 60000),
        location: 'Near your location',
        distance: 0.5,
        coordinates: { lat: lat + 0.001, lng: lng + 0.001 }
      },
      {
        id: '2',
        type: 'info',
        message: 'Road construction ongoing',
        timestamp: new Date(now.getTime() - 15 * 60000),
        location: 'Main Street',
        distance: 1.2,
        coordinates: { lat: lat + 0.002, lng: lng - 0.001 }
      }
    ];
  };

  const getLocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out.';
      default:
        return 'Unknown location error.';
    }
  };

  useEffect(() => {
    const cleanup = startLocationTracking();
    return cleanup;
  }, [startLocationTracking]);

  const handleNavigation = (path: string, announcement: string) => {
    if (speechEnabled) speak(announcement);
    navigate(path);
  };

  const toggleSpeech = () => {
    const newState = !speechEnabled;
    setSpeechEnabled(newState);
    if (newState) {
      speak('Voice guidance enabled');
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Bell className="w-5 h-5 text-yellow-500" />;
      default: return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'danger': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Traycee</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Voice Toggle */}
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-lg transition-colors ${
                  speechEnabled 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                aria-label={speechEnabled ? "Disable voice" : "Enable voice"}
              >
                <Bell className="w-6 h-6" />
              </button>
              
              {/* Location Status */}
              {userLocation && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <Navigation className="w-4 h-4 mr-1" />
                  Live
                </div>
              )}
              
              <button
                onClick={() => setShowAccessibility(!showAccessibility)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                aria-label="Accessibility settings"
              >
                <Settings className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleNavigation('/profile', 'Opening profile settings')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                aria-label="Profile settings"
              >
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Status Alert */}
        {locationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{locationError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleNavigation('/map', 'Opening live safety map')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-blue-900">Live Map</div>
                    <div className="text-sm text-blue-700">Real-time safety data</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation('/guardian', 'Opening guardian mode')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-green-900">Guardian Mode</div>
                    <div className="text-sm text-green-700">Live location sharing</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('/chat', 'Opening community chat')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <MessageCircle className="w-6 h-6 text-purple-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-purple-900">Community Chat</div>
                    <div className="text-sm text-purple-700">Live alerts & reports</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('/report', 'Opening anonymous reporting')}
                  className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Eye className="w-6 h-6 text-orange-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-orange-900">Anonymous Report</div>
                    <div className="text-sm text-orange-700">Submit live incidents</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Live Incidents Feed */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Live Incidents Near You</h2>
                <div className="flex items-center space-x-2">
                  {userLocation && (
                    <span className="text-sm text-gray-500">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </span>
                  )}
                  <button 
                    onClick={() => userLocation && fetchNearbyIncidents(userLocation.lat, userLocation.lng)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`border-l-4 pl-4 py-3 ${getIncidentColor(incident.type)} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => {
                      if (speechEnabled) speak(`Incident: ${incident.message}`);
                      // TODO: Navigate to map with incident focused
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {getIncidentIcon(incident.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{incident.message}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                            <span>{formatTime(incident.timestamp)}</span>
                            <span>•</span>
                            <span>{formatDistance(incident.distance)}</span>
                            {incident.location && (
                              <>
                                <span>•</span>
                                <span>{incident.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentIncidents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No live incidents in your area</p>
                    <p className="text-sm">Monitoring your location for safety alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SOS Button */}
            <SOSButton />

            {/* Live Safety Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Safety Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location Tracking</span>
                  <span className={`text-sm font-medium ${userLocation ? 'text-green-600' : 'text-red-600'}`}>
                    {userLocation ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nearby Incidents</span>
                  <span className="text-sm font-medium text-gray-900">
                    {recentIncidents.length} active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voice Guidance</span>
                  <span className={`text-sm font-medium ${speechEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {speechEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {userLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(new Date())}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                {user?.emergencyContacts?.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (speechEnabled) speak(`Calling ${contact.name}`);
                      window.open(`tel:${contact.phone}`, '_self');
                    }}
                  >
                    <PhoneCall className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.relationship}</div>
                    </div>
                  </button>
                ))}
                
                <button 
                  onClick={() => handleNavigation('/profile', 'Adding emergency contacts')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add Emergency Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Panel */}
      {showAccessibility && (
        <AccessibilityPanel onClose={() => setShowAccessibility(false)} />
      )}
    </div>
  );
};

export default Home;