import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    emergencyContacts: EmergencyContact[];
    guardianMode: boolean;
    accessibilitySettings: AccessibilitySettings;
}

interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
}

interface AccessibilitySettings {
    highContrast: boolean;
    textToSpeech: boolean;
    speechToText: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'tritanopia';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('traycee_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {

        const mockUser: User = {
            id: '1',
            name: 'Kgotso',
            email,
            phone: '+27655716918',
            emergencyContacts: [
                {id: '1', name: 'kgotso', phone: '+27655716918', relationship: 'admin'},
                {id: '2', name: 'Emergency Services', phone: '10111', relationship: 'Emergecy'}
            ],
            guardianMode: true,
            accessibilitySettings: {
                highContrast: false,
                textToSpeech: false,
                speechToText: false,
                colorBlindMode: 'none'
            }
        };

        setUser(mockUser);
        localStorage.setItem('traycee_user', JSON.stringify(mockUser));
        return true;
    };

    const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
        const newUser: User = {
            id: Date.now().toString(),
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            emergencyContacts: userData.emergencyContacts || [],
            guardianMode: false,
            accessibilitySettings:{
                highContrast: false,
                textToSpeech: false,
                speechToText: false,
                colorBlindMode: 'none'
            }
        };

            setUser(newUser);
            localStorage.setItem('traycee_user', JSON.stringify(newUser));
            return true;
        };

        const logout = () => {
            setUser(null);
            localStorage.removeItem('traycee_user');
        };

        const updateUser = (userData: Partial<User>) => {
            if (user) {
                const updatedUser = { ...user, ...userData };
                setUser(updatedUser);
                localStorage.setItem('traycee_user', JSON.stringify(updatedUser));
            }
        };

        return (
            <AuthContext.Provider value={{user, login, register, logout, updateUser }}>
                {children}
            </AuthContext.Provider>
    );
};