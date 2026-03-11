import React, { useState } from 'react';
import { Shield, MapPin, Users, AlertCircle, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useEmergency } from '../contexts/EmergencyContext';

interface GuardianModeProps {
  onNavigate: (page: string) => void;
}

const GuardianMode: React.FC<GuardianModeProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { currentLocation, safetyZones } = useLocation();
  const { isEmergencyActive } = useEmergency();
  const [activatedAt] = useState<Date | null>(user?.guardianMode ? new Date() : null);

  const toggleGuardianMode = () => {
    updateUser({
      ...user!,
      guardianMode: !user?.guardianMode
    });
  };

  const getNearestSafetyZone = () => {
    if (!currentLocation || safetyZones.length === 0) return null;

    let nearest = safetyZones[0];
    let minDistance = calculateDistance(currentLocation, nearest.Location);

    for (const zone of safetyZones) {
      const distance = calculateDistance(currentLocation, zone.Location);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = zone;
      }
    }

    return { zone: nearest, distance: minDistance };
  };

  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const nearestSafety = getNearestSafetyZone();

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'police': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'hospital': return 'bg-red-100 text-red-800 border-red-300';
      case 'fire': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'safe_zone': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getZoneTypeIcon = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Guardian Mode</h1>
        </div>
        <p className="text-gray-600">Stay alert and connected with nearby users and emergency services</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl shadow-lg border-2 p-6 mb-6 ${
        user?.guardianMode
          ? 'bg-green-50 border-green-300'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Status: {user?.guardianMode ? 'Active' : 'Inactive'}
            </h2>
            <p className="text-gray-600">
              {user?.guardianMode
                ? 'You are broadcasting your location to nearby users and emergency services'
                : 'Guardian Mode is currently inactive. Activate to share your location and receive alerts'}
            </p>
            {activatedAt && user?.guardianMode && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                <Clock size={16} />
                <span>Active since {activatedAt.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleGuardianMode}
            className={`px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
              user?.guardianMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {user?.guardianMode ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Emergency Alert */}
      {isEmergencyActive && (
        <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Emergency Active</h3>
              <p className="text-red-800">An emergency alert is currently active. Your location is being shared with emergency services and your emergency contacts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Location */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-bold text-gray-900">Your Location</h3>
        </div>
        {currentLocation ? (
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <div className="text-gray-700">
              <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
              <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
              {currentLocation.accuracy && (
                <p>Accuracy: ±{currentLocation.accuracy.toFixed(0)} meters</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Getting location...</div>
        )}
      </div>

      {/* Nearest Safety Zone */}
      {nearestSafety && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Nearest Safety Zone</h3>
          </div>
          <div className={`border-2 rounded-lg p-4 ${getZoneTypeColor(nearestSafety.zone.type)}`}>
            <h4 className="font-bold text-lg mb-2">{nearestSafety.zone.name}</h4>
            <div className="space-y-2 text-sm">
              <div>Type: {getZoneTypeIcon(nearestSafety.zone.type)}</div>
              <div>Distance: {nearestSafety.distance.toFixed(2)} km away</div>
              <div>Coverage Radius: {nearestSafety.zone.radius} meters</div>
              <div>
                Location: {nearestSafety.zone.Location.lat.toFixed(4)}, {nearestSafety.zone.Location.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contacts</h3>
        {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
          <div className="space-y-3">
            {user.emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-gray-900">{contact.phone}</p>
                  <p className="text-xs text-gray-500">Will be contacted in emergency</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No emergency contacts configured. Add them in Settings.</p>
          </div>
        )}
      </div>

      {/* Guardian Mode Features */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Guardian Mode Features</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
            <div>
              <p className="font-medium text-gray-900">Location Sharing</p>
              <p className="text-sm text-gray-600">Your real-time location is shared with nearby users and emergency services</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
            <div>
              <p className="font-medium text-gray-900">Emergency Alerts</p>
              <p className="text-sm text-gray-600">Nearby users and emergency contacts receive instant notifications</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
            <div>
              <p className="font-medium text-gray-900">Safety Zone Alerts</p>
              <p className="text-sm text-gray-600">Get notified when near police, hospitals, or designated safe zones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          <LogOut size={18} />
          Back to Home
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Manage Contacts
        </button>
      </div>
    </div>
  );
};

export default GuardianMode;
