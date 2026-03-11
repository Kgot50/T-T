import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface Incident {
  id: string;
  location: Location;
  type: 'danger' | 'warning' | 'info';
  description: string;
  reportedBy: string;
  timestamp: Date;
  verified: boolean;
  anonymous: boolean;
}

interface SafetyZone {
  id: string;
  location: Location;
  type: 'police' | 'hospital' | 'fire' | 'safe_zone';
  name: string;
  radius: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  incidents: Incident[];
  safetyZones: SafetyZone[];
  reportIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => Promise<void>;
  getDangerLevel: (location: Location) => 'safe' | 'warning' | 'danger';
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('Location access denied by user. Using default location for demo.');
          } else {
            console.error('Error getting location:', error);
          }
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadIncidents();
      loadSafetyZones();
      const interval = setInterval(() => {
        loadIncidents();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadIncidents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/incidents?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result.success && result.data) {
        setIncidents(result.data.map((incident: any) => ({
          id: incident.id,
          location: incident.location as Location,
          type: incident.type as 'danger' | 'warning' | 'info',
          description: incident.description,
          reportedBy: incident.reported_by_name,
          timestamp: new Date(incident.created_at),
          verified: incident.verified,
          anonymous: incident.anonymous
        })));
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const loadSafetyZones = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/safety-zones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result.success && result.data) {
        setSafetyZones(result.data.map((zone: any) => ({
          id: zone.id,
          location: zone.location as Location,
          type: zone.type as 'police' | 'hospital' | 'fire' | 'safe_zone',
          name: zone.name,
          radius: zone.radius
        })));
      }
    } catch (error) {
      console.error('Error loading safety zones:', error);
    }
  };

  const reportIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: incidentData.location,
          type: incidentData.type,
          description: incidentData.description,
          reportedBy: incidentData.reportedBy,
          anonymous: incidentData.anonymous,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const data = result.data;
          const newIncident: Incident = {
            id: data.id,
            location: data.location as Location,
            type: data.type as 'danger' | 'warning' | 'info',
            description: data.description,
            reportedBy: data.reported_by_name,
            timestamp: new Date(data.created_at),
            verified: data.verified,
            anonymous: data.anonymous
          };
          setIncidents(prev => [newIncident, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
    }
  };

  const getDangerLevel = (location: Location): 'safe' | 'warning' | 'danger' => {
    const nearbyIncidents = incidents.filter(incident => {
      const distance = calculateDistance(location, incident.location);
      return distance < 0.5;
    });

    const dangerIncidents = nearbyIncidents.filter(i => i.type === 'danger');
    const warningIncidents = nearbyIncidents.filter(i => i.type === 'warning');

    if (dangerIncidents.length > 0) return 'danger';
    if (warningIncidents.length > 0) return 'warning';
    return 'safe';
  };

  const calculateDistance = (pos1: Location, pos2: Location): number => {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      incidents,
      safetyZones,
      reportIncident,
      getDangerLevel
    }}>
      {children}
    </LocationContext.Provider>
  );
};
