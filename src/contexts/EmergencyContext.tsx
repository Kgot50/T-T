import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data, error } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          location: currentLocation,
          status: 'active'
        })
        .select()
        .single();

      if (data && !error) {
        setCurrentAlertId(data.id);
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
          await supabase
            .from('sos_alerts')
            .update({ status: 'resolved', resolved_at: new Date().toISOString() })
            .eq('id', currentAlertId);
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
        await supabase
          .from('sos_alerts')
          .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
          .eq('id', currentAlertId);
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
