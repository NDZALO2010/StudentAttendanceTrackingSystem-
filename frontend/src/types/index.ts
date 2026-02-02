// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  studentId?: string;
  employeeId?: string;
  department?: string;
  phoneNumber?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer';
  studentId?: string;
  employeeId?: string;
  department?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// Class Types
export interface Class {
  id: string;
  courseCode: string;
  courseName: string;
  description?: string;
  lecturerId: string;
  semester: string;
  academicYear: string;
  schedule?: ScheduleItem[];
  maxStudents?: number;
  department?: string;
  credits?: number;
  isActive: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  lecturer?: User;
  studentCount?: number;
}

export interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrollmentDate: string;
  status: 'active' | 'dropped' | 'completed';
  grade?: string;
  attendancePercentage: number;
  createdAt: string;
  updatedAt: string;
  student?: User;
  class?: Class;
}

// Session Types
export interface Session {
  id: string;
  classId: string;
  sessionDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  topic?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  attendanceRecords?: Attendance[];
}

// Attendance Types
export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  checkInTime?: string;
  checkInMethod?: 'facial_recognition' | 'manual' | 'qr_code';
  latitude?: number;
  longitude?: number;
  notes?: string;
  markedBy?: string;
  faceMatchConfidence?: number;
  createdAt: string;
  updatedAt: string;
  student?: User;
  session?: Session;
}

// Face Descriptor Types
export interface FaceDescriptor {
  id: string;
  studentId: string;
  descriptor: number[];
  imageUrl?: string;
  registrationDate: string;
  lastUpdated?: string;
  isActive: boolean;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  todaySessions: Session[];
  recentActivity: Attendance[];
  attendanceStats: {
    total: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  };
}

// Attendance Statistics
export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

// Check-in Request
export interface CheckInRequest {
  sessionId: string;
  faceDescriptor?: number[];
  latitude?: number;
  longitude?: number;
}

// Face Registration Request
export interface FaceRegistrationRequest {
  descriptor: number[];
  imageUrl?: string;
  qualityScore?: number;
}

// Report Filter Types
export interface ReportFilter {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'present' | 'late' | 'absent' | 'excused';
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AttendanceTrendData {
  date: string;
  present: number;
  late: number;
  absent: number;
}

// Socket Event Types
export interface SocketEvents {
  'session-started': (data: { sessionId: string; classId: string; totalStudents: number }) => void;
  'session-ended': (data: { sessionId: string }) => void;
  'student-checked-in': (data: { studentId: string; studentName: string; status: string; checkInTime: string }) => void;
  'attendance-updated': (data: { attendanceId: string; status: string }) => void;
}
