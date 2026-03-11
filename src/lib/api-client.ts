const API_BASE_URL = 'http://localhost:3000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API error: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export const profileApi = {
  async getProfile(userId: string) {
    return apiCall(`/profiles/get?userId=${userId}`);
  },

  async updateProfile(userId: string, data: any) {
    return apiCall('/profiles/update', 'PUT', { userId, ...data });
  },
};

export const emergencyContactsApi = {
  async list(userId: string) {
    return apiCall(`/emergency-contacts/list?userId=${userId}`);
  },

  async create(userId: string, data: any) {
    return apiCall('/emergency-contacts/create', 'POST', { userId, ...data });
  },

  async update(contactId: string, data: any) {
    return apiCall('/emergency-contacts/update', 'PUT', { contactId, ...data });
  },

  async delete(contactId: string) {
    return apiCall('/emergency-contacts/delete', 'DELETE', { contactId });
  },

  async deleteAll(userId: string) {
    return apiCall('/emergency-contacts/delete-all', 'DELETE', { userId });
  },
};

export const incidentsApi = {
  async list(limit: number = 50) {
    return apiCall(`/incidents/list?limit=${limit}`);
  },

  async create(data: any) {
    return apiCall('/incidents/create', 'POST', data);
  },

  async update(incidentId: string, data: any) {
    return apiCall('/incidents/update', 'PUT', { incidentId, ...data });
  },
};

export const chatApi = {
  async listMessages(channel: string, limit: number = 100) {
    return apiCall(`/chat-messages/list?channel=${channel}&limit=${limit}`);
  },

  async sendMessage(data: any) {
    return apiCall('/chat-messages/create', 'POST', data);
  },
};

export const safetyZonesApi = {
  async list() {
    return apiCall('/safety-zones/list');
  },
};

export const sosAlertsApi = {
  async create(data: any) {
    return apiCall('/sos-alerts/create', 'POST', data);
  },

  async update(alertId: string, data: any) {
    return apiCall('/sos-alerts/update', 'PUT', { alertId, ...data });
  },
};
