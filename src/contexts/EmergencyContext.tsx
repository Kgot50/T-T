import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

interface EmergencyContextType {
  isEmergencyActive: boolean;
  triggerSOS: () => void;
  cancelEmergency: () => void;
  sendGuardianAlert: (message: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const triggerSOS = async () => {
    if (!user || !currentLocation) return;

    setIsEmergencyActive(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/sos/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: currentLocation,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.id) {
          setCurrentAlertId(result.data.id);
        }
      }

      user.emergencyContacts.forEach(contact => {
        console.log(`Emergency alert sent to ${contact.name} (${contact.phone})`);
      });

      console.log('Emergency services contacted:', {
        location: currentLocation,
        user: user.name,
        phone: user.phone,
        timestamp: new Date()
      });

      if (user.guardianMode) {
        sendGuardianAlert('Emergency situation detected in your area');
      }

      setTimeout(async () => {
        if (currentAlertId) {
          const token = localStorage.getItem('authToken');
          if (token) {
            await fetch(`http://localhost:3000/api/sos/${currentAlertId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'resolved' }),
            });
          }
        }
        setIsEmergencyActive(false);
        setCurrentAlertId(null);
      }, 300000);
    } catch (error) {
      console.error('Error triggering SOS:', error);
    }
  };

  const cancelEmergency = async () => {
    if (currentAlertId) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          await fetch(`http://localhost:3000/api/sos/${currentAlertId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'cancelled' }),
          });
        }
      } catch (error) {
        console.error('Error cancelling emergency:', error);
      }
    }

    setIsEmergencyActive(false);
    setCurrentAlertId(null);
    console.log('Emergency cancelled by user');
  };

  const sendGuardianAlert = (message: string) => {
    if (currentLocation) {
      console.log('Guardian alert sent to nearby users:', {
        message,
        location: currentLocation,
        timestamp: new Date()
      });
    }
  };

  return (
    <EmergencyContext.Provider value={{
      isEmergencyActive,
      triggerSOS,
      cancelEmergency,
      sendGuardianAlert
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};
