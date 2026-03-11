import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityContextType {
  speak: (text: string) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  largeText: boolean;
  setLargeText: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const speak = (text: string) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      speak,
      speechEnabled,
      setSpeechEnabled,
      highContrast,
      setHighContrast,
      largeText,
      setLargeText
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};