const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiService = {
  // User management
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Emergency features
  async triggerSOS(emergencyData: any) {
    const response = await fetch(`${API_BASE_URL}/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emergencyData),
    });
    return response.json();
  },

  async getNearbyIncidents(lat: number, lng: number, radius: number = 5) {
    const response = await fetch(
      `${API_BASE_URL}/incidents/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response.json();
  },

  async reportIncident(incidentData: any) {
    const response = await fetch(`${API_BASE_URL}/incidents/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData),
    });
    return response.json();
  },

  // Guardian mode
  async addGuardian(guardianData: any) {
    const response = await fetch(`${API_BASE_URL}/guardians/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guardianData),
    });
    return response.json();
  },

  async getGuardianStatus(guardianId: string) {
    const response = await fetch(`${API_BASE_URL}/guardians/${guardianId}/status`);
    return response.json();
  },
};