import axios from "axios";
import Cookies from "js-cookie";

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
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
            window.location.href = "/login";
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
      console.error('API Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API Error',
        data: null
      };
    }
  }

  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API Error',
        data: null
      };
    }
  }

  async put(url, data, config) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API Error',
        data: null
      };
    }
  }

   async delete(url, data) {
    try {
      const token = Cookies.get("auth_token");
      const response = await this.client.get(url, {
        params: data,
        headers: {
          method: "DELETE",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API Error',
        data: null
      };
    }
  }

  async patch(url, data, config) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API Error',
        data: null
      };
    }
  }
}

export const apiClient = new ApiClient();
