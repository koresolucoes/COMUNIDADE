import { Injectable, signal, computed } from '@angular/core';

const N8N_CREDS_KEY = 'kore-n8n-creds';

interface N8nCredentials {
  url: string;
  apiKey: string;
}

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
  settings: any;
  tags: string[];
}

export interface Execution {
  id: string;
  status: 'started' | 'waiting' | 'succeeded' | 'failed';
  workflowId: string;
  startedAt: string;
  finishedAt: string;
  error?: {
    message: string;
    stack: string;
  };
}


@Injectable({
  providedIn: 'root'
})
export class N8nApiService {
  private credentials = signal<N8nCredentials | null>(this.getCredentials());
  public isConnected = computed(() => this.credentials() !== null);

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === N8N_CREDS_KEY) {
        this.credentials.set(this.getCredentials());
      }
    });
  }

  saveCredentials(url: string, apiKey: string): void {
    const cleanedUrl = url.trim().replace(/\/$/, '');
    const creds = { url: cleanedUrl, apiKey: apiKey.trim() };
    try {
      localStorage.setItem(N8N_CREDS_KEY, JSON.stringify(creds));
      this.credentials.set(creds);
    } catch (e) {
      console.error("Failed to save credentials to localStorage", e);
    }
  }

  getCredentials(): N8nCredentials | null {
    try {
      const stored = localStorage.getItem(N8N_CREDS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to retrieve credentials from localStorage", e);
      return null;
    }
  }

  clearCredentials(): void {
    try {
      localStorage.removeItem(N8N_CREDS_KEY);
      this.credentials.set(null);
    } catch (e) {
      console.error("Failed to clear credentials from localStorage", e);
    }
  }

  private async _request(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
    const creds = this.credentials();
    if (!creds) {
      throw new Error('Não conectado à instância n8n.');
    }

    const response = await fetch('/api/n8n-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        n8nUrl: creds.url,
        apiKey: creds.apiKey,
        endpoint,
        method,
        body
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Erro na comunicação com a API do n8n.');
    }

    return responseData;
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this._request(`/workflows/${id}`, 'GET');
  }

  async getWorkflows(): Promise<Workflow[]> {
    const response = await this._request('/workflows', 'GET');
    return response.data;
  }

  async createWorkflow(name: string): Promise<Workflow> {
    const body = {
      name,
      nodes: [],
      connections: {},
      active: false,
      settings: {},
      tags: [],
    };
    return this._request('/workflows', 'POST', body);
  }

  async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<Workflow> {
    return this._request(`/workflows/${id}`, 'PUT', workflowData);
  }

  async deleteWorkflow(id: string): Promise<{ message: string }> {
    return this._request(`/workflows/${id}`, 'DELETE');
  }

  async getExecutions(workflowId: string, limit = 20): Promise<Execution[]> {
    const response = await this._request(`/executions?workflowId=${workflowId}&limit=${limit}&includeData=false`, 'GET');
    return response.data;
  }

  async activateWorkflow(id: string): Promise<{ message: string }> {
    return this._request(`/workflows/${id}/activate`, 'POST');
  }

  async deactivateWorkflow(id: string): Promise<{ message: string }> {
    return this._request(`/workflows/${id}/deactivate`, 'POST');
  }
}
