import { Apartment } from '../types';

const API_BASE = '/api';

export const apartmentService = {
  async getAll(admin = false): Promise<Apartment[]> {
    const res = await fetch(`${API_BASE}/apartments${admin ? '?admin=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch apartments');
    return res.json();
  },

  async getById(id: string): Promise<Apartment> {
    const res = await fetch(`${API_BASE}/apartments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch apartment');
    return res.json();
  },

  async create(apt: Partial<Apartment>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/apartments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apt),
    });
    if (!res.ok) throw new Error('Failed to create apartment');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/apartments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete apartment');
  },
  async updateStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/apartments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
  }
};

export const bookingService = {
  async create(booking: { userId: string; apartmentId: string; startDate: string; endDate: string; totalPrice: number }) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error('Failed to create booking');
    return res.json();
  },

  async getByUserId(userId: string) {
    const res = await fetch(`${API_BASE}/bookings/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async getAllForAdmin(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/bookings`);
    if (!res.ok) throw new Error('Failed to fetch admin bookings');
    return res.json();
  },

  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  }
};

export const favoriteService = {
  async toggle(userId: string, apartmentId: string) {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, apartmentId }),
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  },

  async getByUserId(userId: string): Promise<Apartment[]> {
    const res = await fetch(`${API_BASE}/favorites/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return res.json();
  },

  async check(userId: string, apartmentId: string): Promise<{ isFavorite: boolean }> {
    const res = await fetch(`${API_BASE}/favorites/check?userId=${userId}&apartmentId=${apartmentId}`);
    if (!res.ok) throw new Error('Failed to check favorite status');
    return res.json();
  }
};

export const authService = {
  async updateProfile(userData: { id: string; name: string; email: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }
};
