import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Shared Components
import Login from './components/Shared/Login';
import Navigation from './components/Shared/Navigation';

// Lecturer Components
import LecturerDashboard from './components/Lecturer/Dashboard';
import ClassManagement from './components/Lecturer/ClassManagement';
import LiveMonitoring from './components/Lecturer/LiveMonitoring';
import Reports from './components/Lecturer/Reports';

// Student Components
import StudentDashboard from './components/Student/Dashboard';
import FaceRegistration from './components/Student/FaceRegistration';
import CheckIn from './components/Student/CheckIn';
import MyAttendance from './components/Student/MyAttendance';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'lecturer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Home redirect based on role
const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'lecturer') {
    return <Navigate to="/lecturer/dashboard" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Home Route */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Lecturer Routes */}
        <Route
          path="/lecturer/*"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <Navigation>
                <Routes>
                  <Route path="dashboard" element={<LecturerDashboard />} />
                  <Route path="classes" element={<ClassManagement />} />
                  <Route path="session/:sessionId" element={<LiveMonitoring />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/lecturer/dashboard" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <Navigation>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="register-face" element={<FaceRegistration />} />
                  <Route path="checkin" element={<CheckIn />} />
                  <Route path="attendance" element={<MyAttendance />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <AppRoutes />
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
