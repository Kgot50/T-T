import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveMap from './pages/LiveMap';
import GuardianMode from './pages/GuardianMode';
import CommunityChat from './pages/CommunityChat';
import AnonymousReport from './pages/AnonymousReport';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AccessibilityProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/guardian" element={<GuardianMode />} />
              <Route path="/chat" element={<CommunityChat />} />
              <Route path="/report" element={<AnonymousReport />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </AccessibilityProvider>
  );
}

export default App;