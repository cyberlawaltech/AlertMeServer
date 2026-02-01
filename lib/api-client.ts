// API client service for communicating with the backend server

const API_BASE_URL = process.env.NEXT_PUBLIC_REMOTE_SERVER_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Client Registry API
  async getClients() {
    return this.request<any[]>('/api/clients');
  }

  async getClient(id: string) {
    return this.request<any>(`/api/clients/${id}`);
  }

  async createClient(clientData: any) {
    return this.request<any>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: any) {
    return this.request<any>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string) {
    return this.request<any>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async getClientTransactions(id: string) {
    return this.request<any[]>(`/api/clients/${id}/transactions`);
  }

  // Stats API
  async getStats() {
    return this.request<any>('/api/stats');
  }

  // Health check
  async health() {
    return this.request<any>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
