import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  User,
  Class,
  Session,
  Attendance,
  DashboardStats,
  Enrollment,
  CheckInRequest,
  FaceRegistrationRequest,
  FaceDescriptor,
  AttendanceStats
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('token', response.data.token);
              
              // Retry the original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.data.token}`;
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, logout user
              this.logout();
              window.location.href = '/login';
            }
          } else {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.api.put<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Lecturer endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.api.get<ApiResponse<DashboardStats>>('/lecturer/dashboard');
    return response.data;
  }

  async getClasses(): Promise<ApiResponse<{ classes: Class[] }>> {
    const response = await this.api.get<ApiResponse<{ classes: Class[] }>>('/lecturer/classes');
    return response.data;
  }

  async createClass(data: Partial<Class>): Promise<ApiResponse<{ class: Class }>> {
    const response = await this.api.post<ApiResponse<{ class: Class }>>('/lecturer/classes', data);
    return response.data;
  }

  async updateClass(id: string, data: Partial<Class>): Promise<ApiResponse<{ class: Class }>> {
    const response = await this.api.put<ApiResponse<{ class: Class }>>(`/lecturer/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/lecturer/classes/${id}`);
    return response.data;
  }

  async getClassStudents(classId: string): Promise<ApiResponse<{ students: Enrollment[] }>> {
    const response = await this.api.get<ApiResponse<{ students: Enrollment[] }>>(`/lecturer/classes/${classId}/students`);
    return response.data;
  }

  async addStudentToClass(classId: string, studentId: string): Promise<ApiResponse<{ enrollment: Enrollment }>> {
    const response = await this.api.post<ApiResponse<{ enrollment: Enrollment }>>(`/lecturer/classes/${classId}/students`, {
      studentId,
    });
    return response.data;
  }

  async createSession(data: Partial<Session>): Promise<ApiResponse<{ session: Session }>> {
    const response = await this.api.post<ApiResponse<{ session: Session }>>('/lecturer/sessions', data);
    return response.data;
  }

  async getSessionDetails(sessionId: string): Promise<ApiResponse<{ session: Session }>> {
    const response = await this.api.get<ApiResponse<{ session: Session }>>(`/lecturer/sessions/${sessionId}`);
    return response.data;
  }

  async endSession(sessionId: string): Promise<ApiResponse<{ session: Session }>> {
    const response = await this.api.put<ApiResponse<{ session: Session }>>(`/lecturer/sessions/${sessionId}/end`);
    return response.data;
  }

  async markAttendance(attendanceId: string, status: string, notes?: string): Promise<ApiResponse<{ attendance: Attendance }>> {
    const response = await this.api.put<ApiResponse<{ attendance: Attendance }>>(`/lecturer/attendance/${attendanceId}`, {
      status,
      notes,
    });
    return response.data;
  }

  // Student endpoints
  async registerFace(data: FaceRegistrationRequest): Promise<ApiResponse<{ faceDescriptor: FaceDescriptor }>> {
    const response = await this.api.post<ApiResponse<{ faceDescriptor: FaceDescriptor }>>('/student/face/register', data);
    return response.data;
  }

  async getFaceStatus(): Promise<ApiResponse<{ isRegistered: boolean; faceDescriptor?: FaceDescriptor }>> {
    const response = await this.api.get<ApiResponse<{ isRegistered: boolean; faceDescriptor?: FaceDescriptor }>>('/student/face/status');
    return response.data;
  }

  async checkIn(data: CheckInRequest): Promise<ApiResponse<{ attendance: Attendance; session: Partial<Session> }>> {
    const response = await this.api.post<ApiResponse<{ attendance: Attendance; session: Partial<Session> }>>('/student/checkin', data);
    return response.data;
  }

  async getEnrolledClasses(): Promise<ApiResponse<{ enrollments: Enrollment[] }>> {
    const response = await this.api.get<ApiResponse<{ enrollments: Enrollment[] }>>('/student/classes');
    return response.data;
  }

  async getActiveSessions(): Promise<ApiResponse<{ sessions: Session[] }>> {
    const response = await this.api.get<ApiResponse<{ sessions: Session[] }>>('/student/sessions/active');
    return response.data;
  }

  async getAttendanceHistory(params?: {
    classId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ attendance: Attendance[]; statistics: AttendanceStats }>> {
    const response = await this.api.get<ApiResponse<{ attendance: Attendance[]; statistics: AttendanceStats }>>('/student/attendance', {
      params,
    });
    return response.data;
  }

  async getAttendanceStats(): Promise<ApiResponse<{ classStats: any[] }>> {
    const response = await this.api.get<ApiResponse<{ classStats: any[] }>>('/student/attendance/stats');
    return response.data;
  }
}

export default new ApiService();
