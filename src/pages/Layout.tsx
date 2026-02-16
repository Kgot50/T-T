import React from 'react';
import { Shield, Map, MessageSquare, Settings, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import SOSButton from '../components/SOSButton';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user } = useAuth();
  const { isEmergencyActive } = useEmergency();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Live Map' },
    { id: 'chat', icon: MessageSquare, label: 'Community' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const accessibilityClass = user?.accessibilitySettings.highContrast 
    ? 'bg-black text-white' 
    : 'bg-white text-gray-900';

  const colorBlindFilter = user?.accessibilitySettings.colorBlindMode !== 'none'
    ? `filter-${user?.accessibilitySettings.colorBlindMode}`
    : '';

  return (
    <div className={`min-h-screen ${accessibilityClass} ${colorBlindFilter}`}>
      {/* Emergency Alert Bar */}
      {isEmergencyActive && (
        <div className="bg-red-600 text-white px-4 py-2 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-bold">EMERGENCY ACTIVE - Help is on the way</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${user?.accessibilitySettings.highContrast ? 'bg-gray-900' : 'bg-gray-50'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-red-600">Traycee</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user?.name}</span>
              <SOSButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`${user?.accessibilitySettings.highContrast ? 'bg-gray-900' : 'bg-white'} border-t`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-red-600 bg-red-50'
                      : user?.accessibilitySettings.highContrast
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;