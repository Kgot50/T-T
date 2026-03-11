import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { EmergencyProvider } from './contexts/EmergencyContext';
import LoginForm from './pages/LoginForm';
import Layout from './pages/Layout';
import HomePage from './pages/HomePage';
import LiveMap from './pages/LiveMap';
import CommunityChat from './pages/CommunityChat';
import Settings from './components/Settings';
import GuardianMode from './pages/GuardianMode';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Traycee...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onNavigate={handleNavigate} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'map':
        return <LiveMap onNavigate={handleNavigate} />;
      case 'chat':
        return <CommunityChat onNavigate={handleNavigate} />;
      case 'guardian':
        return <GuardianMode onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;