import axios from 'axios';

// Replace with your actual backend URL
export const API_BASE_URL = 'https://your-api-url.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
}

export interface Order {
  _id: string;
  userId: string;
  items: {
    foodId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  userLocation: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
};

// Food API
export const foodAPI = {
  getAll: async (): Promise<Food[]> => {
    const response = await api.get('/food');
    return response.data;
  },
  
  create: async (food: Omit<Food, '_id'>): Promise<Food> => {
    const response = await api.post('/food', food);
    return response.data;
  },
  
  update: async (id: string, food: Partial<Food>): Promise<Food> => {
    const response = await api.put(`/food/${id}`, food);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/food/${id}`);
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: {
    items: { foodId: string; quantity: number; price: number }[];
    userLocation: { lat: number; lng: number };
  }): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/user');
    return response.data;
  },
};

// Location utilities
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};