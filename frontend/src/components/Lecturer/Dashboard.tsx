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
} from '@mui/material';
import {
  People,
  Class as ClassIcon,
  TrendingUp,
  Schedule,
  CheckCircle,
  AccessTime,
  Cancel,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { DashboardStats, Session } from '../../types';

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      enqueueSnackbar('Failed to load dashboard', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle />;
      case 'late':
        return <AccessTime />;
      case 'absent':
        return <Cancel />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Welcome back! Here's an overview of your classes and attendance.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Classes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalClasses}
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
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalStudents}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <People />
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
                    Attendance Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.attendanceStats.attendanceRate.toFixed(1)}%
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
                    Today's Sessions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.todaySessions.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Sessions and Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Today's Sessions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Today's Sessions
            </Typography>
            {stats.todaySessions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No sessions scheduled for today
              </Typography>
            ) : (
              <List>
                {stats.todaySessions.map((session: Session) => (
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
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip
                              label={`${session.presentCount || 0} Present`}
                              size="small"
                              color="success"
                            />
                            <Chip
                              label={`${session.lateCount || 0} Late`}
                              size="small"
                              color="warning"
                            />
                            <Chip
                              label={`${session.absentCount || 0} Absent`}
                              size="small"
                              color="error"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    {session.isActive && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/lecturer/session/${session.id}`)}
                      >
                        Monitor
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Activity
            </Typography>
            {stats.recentActivity.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent activity
              </Typography>
            ) : (
              <List>
                {stats.recentActivity.slice(0, 10).map((activity: any) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getStatusColor(activity.status)}.main` }}>
                        {getStatusIcon(activity.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography>
                          {activity.student?.firstName} {activity.student?.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.session?.class?.courseCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.checkInTime).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={activity.status}
                      size="small"
                      color={getStatusColor(activity.status) as any}
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
                startIcon={<ClassIcon />}
                onClick={() => navigate('/lecturer/classes')}
              >
                Manage Classes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => navigate('/lecturer/classes')}
              >
                Start New Session
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/lecturer/reports')}
              >
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LecturerDashboard;
