import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateLocation: (lat: number, lng: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateLocation = (lat: number, lng: number) => {
    console.log('Location updated:', lat, lng);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateLocation }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};