import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Bell, 
  Shield, 
  AlertTriangle,
  Clock,
  CheckCircle,
  UserPlus,
  Settings
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

const GuardianMode: React.FC = () => {
  const [guardians] = useState([
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      relationship: 'Spouse', 
      status: 'active', 
      lastSeen: '2 min ago',
      location: 'Downtown Office',
      distance: '0.5 km away'
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      relationship: 'Emergency Contact', 
      status: 'offline', 
      lastSeen: '1 hour ago',
      location: 'Home',
      distance: '2.1 km away'
    }
  ]);

  const [watchedUsers] = useState([
    {
      id: 1,
      name: 'Emma Johnson',
      relationship: 'Daughter',
      status: 'safe',
      location: 'School Campus',
      lastUpdate: 'Just now',
      batteryLevel: 85
    },
    {
      id: 2,
      name: 'Robert Johnson',
      relationship: 'Son',
      status: 'caution',
      location: 'Community Center',
      lastUpdate: '5 min ago',
      batteryLevel: 32
    }
  ]);

  const [alerts] = useState([
    {
      id: 1,
      type: 'location',
      user: 'Emma Johnson',
      message: 'Arrived at school safely',
      time: '8:30 AM',
      status: 'info'
    },
    {
      id: 2,
      type: 'battery',
      user: 'Robert Johnson',
      message: 'Device battery low (32%)',
      time: '10:15 AM',
      status: 'warning'
    },
    {
      id: 3,
      type: 'emergency',
      user: 'Sarah Johnson',
      message: 'SOS alert triggered - False alarm',
      time: 'Yesterday',
      status: 'resolved'
    }
  ]);

  const navigate = useNavigate();
  const { user } = useUser();
  const { speak } = useAccessibility();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <div className="w-5 h-5 rounded-full bg-gray-400" />;
      default:
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'caution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'battery':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'emergency':
        return <Bell className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Guardian Mode</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* People You're Watching */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">People You're Watching</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Person
                </button>
              </div>
              <div className="space-y-4">
                {watchedUsers.map((person) => (
                  <div
                    key={person.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{person.name}</h3>
                          <p className="text-sm text-gray-500">{person.relationship}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(person.status)}`}>
                        {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {person.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {person.lastUpdate}
                      </div>
                    </div>
                    {person.batteryLevel < 50 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Low battery: {person.batteryLevel}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Your Guardians */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Guardians</h2>
                <button className="flex items-center text-sm text-green-600 hover:text-green-700">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite Guardian
                </button>
              </div>
              <div className="space-y-3">
                {guardians.map((guardian) => (
                  <div
                    key={guardian.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {guardian.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{guardian.name}</h3>
                        <p className="text-sm text-gray-500">{guardian.relationship}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {getStatusIcon(guardian.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {guardian.status.charAt(0).toUpperCase() + guardian.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{guardian.lastSeen}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <Bell className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Send Check-in Alert</span>
                </button>
                <button className="w-full flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Share Location</span>
                </button>
                <button className="w-full flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <Settings className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Notification Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="mr-3 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.user}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    {alert.status === 'warning' && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guardian Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Guardians</span>
                  <span className="text-lg font-semibold text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">People Watching</span>
                  <span className="text-lg font-semibold text-blue-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Alerts This Week</span>
                  <span className="text-lg font-semibold text-gray-900">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianMode;