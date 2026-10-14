import { Strat } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Une erreur est survenue';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // fallback text
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{
    status: string;
    app: string;
    version: string;
    maps_supported: string[];
  }>('/health'),

  // Strats & Map Pool
  getStrats: (params?: { map_name?: string; buy_phase?: string; side?: string; category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.map_name) q.set('map_name', params.map_name);
    if (params?.buy_phase) q.set('buy_phase', params.buy_phase);
    if (params?.side) q.set('side', params.side);
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<Strat[]>(`/strats${queryString}`);
  },

  getStrat: (id: number) => request<Strat>(`/strats/${id}`),

  createStrat: (data: Partial<Strat>) =>
    request<Strat>('/strats', { method: 'POST', body: JSON.stringify(data) }),

  updateStrat: (id: number, data: Partial<Strat>) =>
    request<Strat>(`/strats/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteStrat: (id: number) =>
    request<void>(`/strats/${id}`, { method: 'DELETE' }),

  getStratsMapSummary: () =>
    request<Record<string, number>>('/strats/maps/summary'),

  getMapStratsSummary: () =>
    request<Record<string, number>>('/strats/maps/summary'),

  exportBackup: () =>
    request<Strat[]>('/strats/backup/export'),

  importBackup: (data: any[]) =>
    request<{ status: string; imported: number }>('/strats/backup/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

