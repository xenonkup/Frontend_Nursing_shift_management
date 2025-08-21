import axios, { AxiosResponse } from "axios";
import { config } from "../api/port/config";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Authentication
  signin: (email: string, password: string) =>
    apiClient.post("/auth/signin", { email, password }),

  register: (
    name: string,
    email: string,
    password: string,
    role: string = "NURSE"
  ) => apiClient.post("/auth/register", { name, email, password, role }),

  getUserInfo: () => apiClient.get("/auth/info"),

  // Shifts
  getMyShifts: () => apiClient.get("/shifts/my-shifts"),

  getAllShifts: () => apiClient.get("/shifts/all"),

  createShift: (shiftData: object) => apiClient.post("/shifts", shiftData),

  assignShift: (assignmentData: object) =>
    apiClient.post("/shift-assignments", assignmentData),

  requestLeave: (shiftId: string) =>
    apiClient.post(`/shifts/${shiftId}/request-leave`),

  // Nurses
  getNurses: () => apiClient.get("/nurses"),

  // Leave Requests
  createLeaveRequest: (leaveData: object) =>
    apiClient.post("/leave-requests", leaveData),

  getLeaveRequests: () => apiClient.get("/leave-requests"),

  approveLeaveRequest: (id: string) =>
    apiClient.patch(`/leave-requests/${id}/approve`),

  rejectLeaveRequest: (id: string) =>
    apiClient.patch(`/leave-requests/${id}/reject`),

  approveShiftLeave: (id: string) =>
    apiClient.patch(`/shift-leave/${id}/approve`),

  rejectShiftLeave: (id: string) =>
    apiClient.patch(`/shift-leave/${id}/reject`),

  // Debug endpoints
  debugUser: () => apiClient.get("/debug/user"),

  debugNurses: () => apiClient.get("/debug/nurses"),
};

export default apiClient;
