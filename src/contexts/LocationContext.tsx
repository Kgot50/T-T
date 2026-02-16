import React, { createContext, useContext, useState, useEffect } from 'react';

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
    annonymous: boolean;
}

interface SafetyZone {
    id: string;
    location: Location;
    type: 'police'| 'hospital' | 'safe_zone';
    name: string;
    redius: number;
}

interface LocationContextType {
    currentLocation: Location | null;
    incidents: Incident[];
    safetyZones: SafetyZone[];
    reportIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
    getDangerLevel: (location: Location)  => 'safe' | 'warning' | 'danger';
}

const LocationContext = createContext<LocationContextType | undefined> (undefined);

export const uselocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState<Location | null> (null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [safetyZones] = useState<SafetyZone[]>([
    {
        id: '1',
        location: { lat: 40.7128, lng: -74.0060 },
        type: 'police',
        name: 'Police station',
        redius: 500
    },
    {
        id: '2',
        location: { lat: 40.7589, lng: -73.9851 },
        type: 'hospital',
        name: 'Emergency hospital',
        redius: 300
    }
    ]);

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
            (error) =>{
                if (error.code === error.PERMISSION_DENIED) {
                    console.warn('Location access denied by UserActivation. using default location for Demo');
                } else {
                    console.error('Error getting location:', error);
                }
                //use NYC coordinates if not active
                setCurrentLocation({ lat: 40.7128, lng: -74.0060});
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 2700 });

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    useEffect(() => {
        //load mock incidents
        const mockIncidents: Incident[] = [
            {
                id: '1',
                location: { lat: 40.7128, lng: -74.0050},
                type: 'danger',
                description: 'Armed robbery reported',
                reportedBy: 'Anonymous',
                timestamp: new Date(Date.now() - 3600000),
                verified: true,
                annonymous: false
            }
        ];
        setIncidents(mockIncidents);
    }, []);
    const reportIncident = (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
        const newIncident: Incident = {
            ...incidentData,
            id: Date.now().toString(),
                timestamp: new Date()
        };
        setIncidents(prev => [newIncident, ...prev]);
    };
    const getDangerLevel = (location: Location): 'safe' | 'warning' | 'danger' => {
        const nearbyIncidents = incidents.filter(incident => {
            const distance = calculateDistance(location, incident.location);
            return distance < 0.5; //within 500 meters
        });

        const dangerIncidents = nearbyIncidents.filter(i => i.type === 'danger');
        const warningIncidents = nearbyIncidents.filter(i => i.type === 'warning');

        if (dangerIncidents.length > 0) return 'danger';
        if (warningIncidents.length > 0) return 'warning';
        return 'safe';
    };

    const calculateDistance = (pos1: Location, pos2: Location): number => {
        const R = 6371; //earth's radius km
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
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