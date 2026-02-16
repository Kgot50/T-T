import React, { useState } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface SOSButtonProps {
  compact?: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ compact = false }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const { user } = useUser();
  const { speak } = useAccessibility();

  const handleSOS = () => {
    setIsEmergency(true);
    speak('Emergency SOS activated! Sending alerts to your contacts.');
    
    // Simulate emergency alert
    setTimeout(() => {
      setIsEmergency(false);
    }, 5000);
  };

  if (compact) {
    return (
      <button
        onClick={handleSOS}
        className={`p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors ${
          isEmergency ? 'emergency-pulse' : ''
        }`}
      >
        <AlertTriangle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSOS}
      className={`w-full p-6 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-3 ${
        isEmergency ? 'emergency-pulse' : ''
      }`}
    >
      <AlertTriangle className="w-8 h-8" />
      <span className="text-xl font-bold">EMERGENCY SOS</span>
    </button>
  );
};

export default SOSButton;