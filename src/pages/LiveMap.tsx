import React, { useState } from 'react';
import { MapPin, AlertTriangle, Shield, Plus, Eye, EyeOff } from 'lucide-react';
import { uselocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';


interface LiveMapProps {
  onNavigate: (page: string) => void;
}

const LiveMap: React.FC<LiveMapProps> = ({ onNavigate }) => {
  const { currentLocation, incidents, safetyZones, reportIncident } = uselocation();
  const { user } = useAuth();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'info' as 'danger' | 'warning' | 'info',
    description: '',
    anonymous: false
  });
  const [mapView, setMapView] = useState<'incidents' | 'safety'>('incidents');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLocation && user) {
      reportIncident({
        location: currentLocation,
        type: reportData.type,
        description: reportData.description,
        reportedBy: reportData.anonymous ? 'Anonymous' : user.name,
        verified: false,
        annonymous: reportData.anonymous
      });
      setReportData({ type: 'info', description: '', anonymous: false });
      setShowReportForm(false);
    }
  };

  const incidentTypeConfig = {
    danger: { color: 'bg-red-500', textColor: 'text-red-700', label: 'Danger' },
    warning: { color: 'bg-yellow-500', textColor: 'text-yellow-700', label: 'Warning' },
    info: { color: 'bg-blue-500', textColor: 'text-blue-700', label: 'Info' }
  };

  const safetyZoneConfig = {
    police: { color: 'bg-blue-500', icon: Shield, label: 'Police Station' },
    hospital: { color: 'bg-green-500', icon: Plus, label: 'Hospital' },
    fire: { color: 'bg-red-500', icon: AlertTriangle, label: 'Fire Station' },
    safe_zone: { color: 'bg-purple-500', icon: Shield, label: 'Safe Zone' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Safety Map</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMapView('incidents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === 'incidents'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Incidents
          </button>
          <button
            onClick={() => setMapView('safety')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === 'safety'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Safety Zones
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Report
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 relative">
          {/* Mock Map Interface */}
          <div className="absolute inset-0 p-4">
            <div className="text-center text-gray-600 mb-4">
              <MapPin size={24} className="mx-auto mb-2" />
              <p className="text-sm">Interactive Map View</p>
              {currentLocation && (
                <p className="text-xs">
                  Current: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="text-xs text-blue-600 font-medium mt-1 text-center">You</div>
              </div>
            )}

            {/* Incident Markers */}
            {mapView === 'incidents' && incidents.slice(0, 5).map((incident, index) => {
              const config = incidentTypeConfig[incident.type];
              return (
                <div
                  key={incident.id}
                  className={`absolute w-3 h-3 ${config.color} rounded-full border border-white shadow-lg`}
                  style={{
                    top: `${30 + index * 15}%`,
                    left: `${20 + index * 20}%`
                  }}
                  title={incident.description}
                />
              );
            })}

            {/* Safety Zone Markers */}
            {mapView === 'safety' && safetyZones.map((zone, index) => {
              const config = safetyZoneConfig[zone.type];
              const Icon = config.icon;
              return (
                <div
                  key={zone.id}
                  className={`absolute w-8 h-8 ${config.color} rounded-lg border border-white shadow-lg flex items-center justify-center`}
                  style={{
                    top: `${25 + index * 30}%`,
                    left: `${15 + index * 25}%`
                  }}
                  title={zone.name}
                >
                  <Icon size={16} className="text-white" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {mapView === 'incidents' ? 'Incident Types' : 'Safety Zones'}
          </h4>
          <div className="flex flex-wrap gap-4">
            {mapView === 'incidents' ? (
              Object.entries(incidentTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
                  <span className="text-xs text-gray-600">{config.label}</span>
                </div>
              ))
            ) : (
              Object.entries(safetyZoneConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${config.color} rounded flex items-center justify-center`}>
                      <Icon size={10} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-600">{config.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
        </div>
        <div className="p-4">
          {incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.slice(0, 6).map((incident) => {
                const config = incidentTypeConfig[incident.type];
                return (
                  <div
                    key={incident.id}
                    className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 ${config.color} rounded-lg`}>
                      <AlertTriangle size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium ${config.textColor} bg-${config.color.split('-')[1]}-100 rounded`}>
                          {config.label}
                        </span>
                        {incident.verified && (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium">{incident.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>By {incident.annonymous ? 'Anonymous' : incident.reportedBy}</span>
                        <span>{new Date(incident.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No incidents reported yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Incident Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Report Incident</h3>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(incidentTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReportData(prev => ({ ...prev, type: type as any }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        reportData.type === type
                          ? `${config.color} text-white`
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Describe the incident..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reportData.anonymous}
                    onChange={(e) => setReportData(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    Report anonymously
                    {reportData.anonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;