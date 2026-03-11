import React, { useState } from 'react';
import { Shield, Map, MessageSquare, Settings, Home, AlertTriangle, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import SOSButton from '../components/SOSButton';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { isEmergencyActive } = useEmergency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Live Map' },
    { id: 'chat', icon: MessageSquare, label: 'Community' },
    { id: 'guardian', icon: Heart, label: 'Guardian Mode' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const handleNavigation = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const accessibilityClass = user?.accessibilitySettings.highContrast
    ? 'bg-black text-white'
    : 'bg-white text-gray-900';

  const colorBlindFilter = user?.accessibilitySettings.colorBlindMode !== 'none'
    ? `filter-${user?.accessibilitySettings.colorBlindMode}`
    : '';

  return (
    <div className={`min-h-screen flex flex-col ${accessibilityClass} ${colorBlindFilter}`}>
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
              <span className="text-sm hidden sm:inline">Welcome, {user?.name}</span>
              <SOSButton />
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl border z-50 ${
                    user?.accessibilitySettings.highContrast
                      ? 'bg-gray-900 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                              isActive
                                ? 'bg-red-50 text-red-600 border-l-4 border-l-red-600'
                                : user?.accessibilitySettings.highContrast
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                  : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          user?.accessibilitySettings.highContrast
                            ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <X size={20} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
