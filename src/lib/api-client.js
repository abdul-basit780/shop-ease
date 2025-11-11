import axios from "axios";
import Cookies from "js-cookie";

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token only for protected routes
    this.client.interceptors.request.use(
      (config) => {
        // Only add token for non-public endpoints
        if (!config.url?.includes("/public/")) {
          const token = Cookies.get("auth_token");
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove("auth_token");
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "API Error",
        data: null,
      };
    }
  }

  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "API Error",
        data: null,
      };
    }
  }

  async put(url, data, config) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "API Error",
        data: null,
      };
    }
  }

  async delete(url, data) {
  try {
    const token = Cookies.get("auth_token");
    
    const fetchOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };
    
    // Only add body if data exists (for wishlist)
    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, fetchOptions);
    const result = await response.json();
    
    return result;
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return {
      success: false,
      error: error.message || 'API Error',
      data: null
    };
  }
}

  async patch(url, data, config) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "API Error",
        data: null,
      };
    }
  }
}

export const apiClient = new ApiClient();
