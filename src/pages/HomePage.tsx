import React from 'react';
import { MapPin, Users, Shield, AlertTriangle, Phone, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useEmergency } from '../contexts/EmergencyContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { currentLocation, incidents, getDangerLevel } = useLocation();
  const { sendGuardianAlert } = useEmergency();

  const currentDangerLevel = currentLocation ? getDangerLevel(currentLocation) : 'safe';
  const recentIncidents = incidents.slice(0, 3);

  const dangerLevelConfig = {
    safe: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: Shield,
      message: 'Area is safe'
    },
    warning: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: AlertTriangle,
      message: 'Caution advised'
    },
    danger: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      message: 'High risk area'
    }
  };

  const currentConfig = dangerLevelConfig[currentDangerLevel];
  const DangerIcon = currentConfig.icon;

  const quickActions = [
    {
      id: 'map',
      icon: MapPin,
      title: 'Live Map',
      description: 'View incidents and safety zones',
      color: 'bg-blue-500'
    },
    {
      id: 'chat',
      icon: Users,
      title: 'Community',
      description: 'Chat and report incidents',
      color: 'bg-green-500'
    },
    {
      id: 'guardian',
      icon: Eye,
      title: 'Guardian Mode',
      description: user?.guardianMode ? 'Active' : 'Inactive',
      color: user?.guardianMode ? 'bg-purple-500' : 'bg-gray-400'
    }
  ];

  const handleGuardianToggle = () => {
    if (user) {
      const newGuardianMode = !user.guardianMode;
      // Update user context (this would be implemented in the updateUser function)
      if (newGuardianMode) {
        sendGuardianAlert('Guardian mode activated');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Current Status Card */}
      <div className={`${currentConfig.bgColor} ${currentConfig.borderColor} border rounded-xl p-6 mb-6`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 ${currentConfig.color} bg-white rounded-lg`}>
            <DangerIcon size={32} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${currentConfig.color}`}>
              Current Status: {currentConfig.message}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentLocation
                ? `Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                : 'Getting your location...'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isGuardian = action.id === 'guardian';
            
            return (
              <button
                key={action.id}
                onClick={isGuardian ? handleGuardianToggle : () => onNavigate(action.id)}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`${action.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
          <button
            onClick={() => onNavigate('map')}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    incident.type === 'danger' ? 'bg-red-100 text-red-600' :
                    incident.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{incident.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by {incident.annonymous ? 'Anonymous' : incident.reportedBy} • {' '}
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <Shield size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No recent incidents in your area</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
            <div className="space-y-3">
              {user.emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3">
                  <Phone size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">No emergency contacts set up</p>
              <button
                onClick={() => onNavigate('settings.tsx')}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Add Emergency Contacts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;