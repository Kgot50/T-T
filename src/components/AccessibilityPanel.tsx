import React from 'react';
import { 
  Type, 
  Contrast, 
  Eye, 
  Palette, 
  X 
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface AccessibilityPanelProps {
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ onClose }) => {
  const { 
    highContrast, 
    setHighContrast, 
    largeText, 
    setLargeText 
  } = useAccessibility();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Accessibility Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Contrast className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">High Contrast</div>
                <div className="text-sm text-gray-500">Improved visibility</div>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  highContrast ? 'transform translate-x-7' : 'transform translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Type className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Large Text</div>
                <div className="text-sm text-gray-500">Increase text size</div>
              </div>
            </div>
            <button
              onClick={() => setLargeText(!largeText)}
              className={`w-12 h-6 rounded-full transition-colors ${
                largeText ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  largeText ? 'transform translate-x-7' : 'transform translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;