import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';

const SOSButton: React.FC = () => {
  const { isEmergencyActive, triggerSOS, cancelEmergency } = useEmergency();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSOSClick = () => {
    if (isEmergencyActive) {
      cancelEmergency();
      setShowConfirmation(false);
    } else {
      setShowConfirmation(true);
    }
  };

  const confirmSOS = () => {
    triggerSOS();
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 m-4 max-w-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Emergency</h3>
          <p className="text-gray-700 mb-6">
            This will immediately contact your emergency contacts and local emergency services. 
            Are you sure you want to proceed?
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmSOS}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              YES, SEND SOS
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-bold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOSClick}
      className={`relative p-3 rounded-full font-bold text-white transition-all transform hover:scale-105 ${
        isEmergencyActive
          ? 'bg-gray-600 hover:bg-gray-700 animate-pulse'
          : 'bg-red-600 hover:bg-red-700 shadow-lg'
      }`}
      aria-label={isEmergencyActive ? 'Cancel Emergency' : 'Emergency SOS'}
    >
      {isEmergencyActive ? (
        <X size={24} />
      ) : (
        <Phone size={24} />
      )}
      
      {!isEmergencyActive && (
        <span className="absolute -top-1 -right-1 bg-red-800 text-xs px-1 rounded">
          SOS
        </span>
      )}
    </button>
  );
};

export default SOSButton;