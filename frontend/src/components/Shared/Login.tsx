import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Person,
  Email,
  Lock,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useTheme as muiUseTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { mode, toggleTheme } = useAppTheme();
  const muiTheme = muiUseTheme();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'lecturer',
    studentId: '',
    employeeId: '',
    department: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      enqueueSnackbar('Login failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (registerData.role === 'student' && !registerData.studentId) {
      setError('Student ID is required for student accounts');
      return;
    }

    if (registerData.role === 'lecturer' && !registerData.employeeId) {
      setError('Employee ID is required for lecturer accounts');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSubmit } = registerData;
      await register(dataToSubmit);
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      enqueueSnackbar('Registration failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            position: 'relative',
          }}
        >
          {/* Theme toggle */}
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <IconButton onClick={toggleTheme} size="small" aria-label="toggle theme">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              SATS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Student Attendance Tracking System
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLoginSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>

              {/* Demo Credentials */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="caption" display="block" gutterBottom>
                  <strong>Demo Credentials:</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Lecturer: john.lecturer@university.edu / lecturer123
                </Typography>
                <Typography variant="caption" display="block">
                  Student: alice.student@university.edu / student123
                </Typography>
              </Box>
            </form>
          </TabPanel>

          {/* Register Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleRegisterSubmit}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={registerData.firstName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, firstName: e.target.value })
                  }
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={registerData.lastName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, lastName: e.target.value })
                  }
                  required
                  margin="normal"
                />
              </Box>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <Tabs
                value={registerData.role === 'student' ? 0 : 1}
                onChange={(_e, val) =>
                  setRegisterData({
                    ...registerData,
                    role: val === 0 ? 'student' : 'lecturer',
                  })
                }
                variant="fullWidth"
                sx={{ my: 2 }}
              >
                <Tab label="Student" icon={<Person />} iconPosition="start" />
                <Tab label="Lecturer" icon={<School />} iconPosition="start" />
              </Tabs>

              {registerData.role === 'student' ? (
                <TextField
                  fullWidth
                  label="Student ID"
                  value={registerData.studentId}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, studentId: e.target.value })
                  }
                  required
                  margin="normal"
                />
              ) : (
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={registerData.employeeId}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, employeeId: e.target.value })
                  }
                  required
                  margin="normal"
                />
              )}

              <TextField
                fullWidth
                label="Department"
                value={registerData.department}
                onChange={(e) =>
                  setRegisterData({ ...registerData, department: e.target.value })
                }
                margin="normal"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </form>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
