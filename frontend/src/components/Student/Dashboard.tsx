import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  TrendingUp,
  FaceRetouchingNatural,
  Class as ClassIcon,
  CalendarMonth,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { Session, Enrollment } from '../../types';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch face status
      const faceResponse = await api.getFaceStatus();
      setFaceRegistered(faceResponse.data.isRegistered);

      // Fetch active sessions
      const sessionsResponse = await api.getActiveSessions();
      setActiveSessions(sessionsResponse.data.sessions);

      // Fetch enrollments
      const enrollmentsResponse = await api.getEnrolledClasses();
      setEnrollments(enrollmentsResponse.data.enrollments);

      // Fetch attendance stats
      const statsResponse = await api.getAttendanceStats();
      setStats(statsResponse.data);
    } catch (err: any) {
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (sessionId: string) => {
    navigate('/student/checkin', { state: { sessionId } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Student Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Welcome back! Manage your attendance and view your progress.
      </Typography>

      {/* Face Registration Alert */}
      {!faceRegistered && (
        <Alert
          severity="warning"
          sx={{ mt: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/student/register-face')}
            >
              Register Now
            </Button>
          }
        >
          Please register your face to enable quick check-in
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Enrolled Classes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {enrollments.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <ClassIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Sessions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {activeSessions.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Overall Attendance
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.classStats?.[0]?.statistics?.attendanceRate || 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Face Registered
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {faceRegistered ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: faceRegistered ? 'success.main' : 'warning.main',
                    width: 56,
                    height: 56,
                  }}
                >
                  <FaceRetouchingNatural />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Sessions and Enrolled Classes */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Active Sessions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Active Sessions Today
            </Typography>
            {activeSessions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No active sessions today
              </Typography>
            ) : (
              <List>
                {activeSessions.map((session) => (
                  <ListItem
                    key={session.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Schedule />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">
                          {session.class?.courseCode} - {session.class?.courseName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {session.startTime} - {session.endTime || 'Ongoing'}
                          </Typography>
                          {session.attendanceRecords?.[0] && (
                            <Chip
                              label={session.attendanceRecords[0].status}
                              size="small"
                              color={
                                session.attendanceRecords[0].status === 'present'
                                  ? 'success'
                                  : session.attendanceRecords[0].status === 'late'
                                  ? 'warning'
                                  : 'default'
                              }
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    {!session.attendanceRecords?.[0] ||
                    session.attendanceRecords[0].status === 'absent' ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCheckIn(session.id)}
                      >
                        Check In
                      </Button>
                    ) : (
                      <Chip label="Checked In" color="success" size="small" />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Enrolled Classes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              My Classes
            </Typography>
            {enrollments.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No enrolled classes
              </Typography>
            ) : (
              <List>
                {enrollments.map((enrollment) => (
                  <ListItem
                    key={enrollment.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: enrollment.class?.color || 'primary.main',
                        }}
                      >
                        <ClassIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">
                          {enrollment.class?.courseCode} - {enrollment.class?.courseName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {enrollment.class?.lecturer?.firstName}{' '}
                            {enrollment.class?.lecturer?.lastName}
                          </Typography>
                          <Box mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Attendance: {enrollment.attendancePercentage}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={parseFloat(enrollment.attendancePercentage || '0')}
                              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                              color={
                                parseFloat(enrollment.attendancePercentage || '0') >= 75
                                  ? 'success'
                                  : 'warning'
                              }
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => navigate('/student/checkin')}
              >
                Check In
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                onClick={() => navigate('/student/attendance')}
              >
                View Attendance
              </Button>
              {!faceRegistered && (
                <Button
                  variant="outlined"
                  startIcon={<FaceRetouchingNatural />}
                  onClick={() => navigate('/student/register-face')}
                  color="warning"
                >
                  Register Face
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
