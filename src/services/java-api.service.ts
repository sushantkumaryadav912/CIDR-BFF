import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { logger } from "../utils/logger";

const JAVA_BACKEND_BASE_URL = process.env.JAVA_BACKEND_BASE_URL || "https://javabackend.zeyo.xyz";
const REQUEST_TIMEOUT = 5000;

/**
 * Centralized Axios client for Java backend communication
 */
class JavaApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: JAVA_BACKEND_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug("Java API Request", {
          method: config.method,
          url: config.url,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        logger.error("Java API Request Error", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Normalize Java backend errors
   */
  private normalizeError(error: AxiosError): any {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return {
        status: 504,
        code: "GATEWAY_TIMEOUT",
        message: "Java backend request timeout",
        details: [],
      };
    }

    if (error.response) {
      // Java backend returned an error response
      const data = error.response.data as any;
      return {
        status: error.response.status,
        code: data?.error?.code || data?.code || "JAVA_BACKEND_ERROR",
        message: data?.error?.message || data?.message || "Error from Java backend",
        details: data?.error?.details || data?.details || [],
      };
    }

    if (error.request) {
      // Request was made but no response received
      return {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        message: "Java backend is unavailable",
        details: [],
      };
    }

    // Something else happened
    return {
      status: 500,
      code: "INTERNAL_ERROR",
      message: error.message || "Unknown error",
      details: [],
    };
  }

  /**
   * Make authenticated request to Java backend
   */
  async request<T>(config: AxiosRequestConfig & {
    token?: string;
    orgId?: string;
    correlationId?: string;
  }): Promise<T> {
    const { token, orgId, correlationId, ...axiosConfig } = config;

    const headers: any = { ...axiosConfig.headers };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (orgId) {
      headers["X-Org-ID"] = orgId;
    }

    if (correlationId) {
      headers["X-Correlation-ID"] = correlationId;
    }

    try {
      const response = await this.client.request<T>({
        ...axiosConfig,
        headers,
      });
      return response.data;
    } catch (error) {
      logger.error("Java API Service Error", error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig & {
    token?: string;
    orgId?: string;
    correlationId?: string;
  }): Promise<T> {
    return this.request<T>({
      method: "GET",
      url,
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig & {
    token?: string;
    orgId?: string;
    correlationId?: string;
  }): Promise<T> {
    return this.request<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig & {
    token?: string;
    orgId?: string;
    correlationId?: string;
  }): Promise<T> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig & {
    token?: string;
    orgId?: string;
    correlationId?: string;
  }): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      url,
      ...config,
    });
  }
}

export const javaApiService = new JavaApiService();
