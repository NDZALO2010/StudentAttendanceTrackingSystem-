import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  Cancel,
  Search,
  MoreVert,
  Stop,
  Refresh,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import websocket from '../../services/websocket';
import { Session, Attendance } from '../../types';

const LiveMonitoring: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [session, setSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
      
      // Join WebSocket room
      websocket.joinSession(sessionId);

      // Listen for real-time updates
      websocket.onStudentCheckedIn((data) => {
        enqueueSnackbar(
          `${data.studentName} checked in (${data.status})`,
          { variant: 'success' }
        );
        fetchSessionDetails();
      });

      websocket.onAttendanceUpdated(() => {
        fetchSessionDetails();
      });

      return () => {
        websocket.leaveSession(sessionId);
      };
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getSessionDetails(sessionId!);
      setSession(response.data.session);
      setAttendance(response.data.session.attendanceRecords || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load session details');
      enqueueSnackbar('Failed to load session', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this session?')) {
      return;
    }

    try {
      await api.endSession(sessionId!);
      enqueueSnackbar('Session ended successfully', { variant: 'success' });
      navigate('/lecturer/dashboard');
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to end session',
        { variant: 'error' }
      );
    }
  };

  const handleMarkAttendance = async (attendanceId: string, status: string) => {
    try {
      await api.markAttendance(attendanceId, { status });
      enqueueSnackbar('Attendance updated successfully', { variant: 'success' });
      fetchSessionDetails();
      handleCloseMenu(attendanceId);
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to update attendance',
        { variant: 'error' }
      );
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, attendanceId: string) => {
    setAnchorEl({ ...anchorEl, [attendanceId]: event.currentTarget });
  };

  const handleCloseMenu = (attendanceId: string) => {
    setAnchorEl({ ...anchorEl, [attendanceId]: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      case 'excused':
        return 'info';
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
      case 'excused':
        return <Cancel />;
      default:
        return null;
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student?.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const attendanceRate = session
    ? ((session.presentCount + session.lateCount) / session.totalStudents) * 100
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Session not found'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Live Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {session.class?.courseCode} - {session.class?.courseName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session.sessionDate} | {session.startTime}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSessionDetails}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Stop />}
            onClick={handleEndSession}
            disabled={session.status === 'completed'}
          >
            End Session
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Students
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {session.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography color="success.contrastText" variant="body2">
                Present
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.contrastText">
                {session.presentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography color="warning.contrastText" variant="body2">
                Late
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.contrastText">
                {session.lateCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography color="error.contrastText" variant="body2">
                Absent
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.contrastText">
                {session.absentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Rate */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Attendance Rate
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {attendanceRate.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={attendanceRate}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Paper>

      {/* Student List */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Student Attendance
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label="All"
              onClick={() => setFilterStatus('all')}
              color={filterStatus === 'all' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Present"
              onClick={() => setFilterStatus('present')}
              color={filterStatus === 'present' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label="Late"
              onClick={() => setFilterStatus('late')}
              color={filterStatus === 'late' ? 'warning' : 'default'}
              size="small"
            />
            <Chip
              label="Absent"
              onClick={() => setFilterStatus('absent')}
              color={filterStatus === 'absent' ? 'error' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <List>
          {filteredAttendance.map((record) => (
            <ListItem
              key={record.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleOpenMenu(e, record.id)}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl[record.id]}
                    open={Boolean(anchorEl[record.id])}
                    onClose={() => handleCloseMenu(record.id)}
                  >
                    <MenuItem
                      onClick={() => handleMarkAttendance(record.id, 'present')}
                    >
                      Mark Present
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleMarkAttendance(record.id, 'late')}
                    >
                      Mark Late
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleMarkAttendance(record.id, 'absent')}
                    >
                      Mark Absent
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleMarkAttendance(record.id, 'excused')}
                    >
                      Mark Excused
                    </MenuItem>
                  </Menu>
                </>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getStatusColor(record.status)}.main` }}>
                  {getStatusIcon(record.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight="bold">
                    {record.student?.firstName} {record.student?.lastName}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {record.student?.studentId}
                    </Typography>
                    {record.checkInTime && (
                      <Typography variant="caption" color="text.secondary">
                        Checked in: {new Date(record.checkInTime).toLocaleTimeString()}
                      </Typography>
                    )}
                    {record.faceMatchConfidence && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Face match: {(record.faceMatchConfidence * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Chip
                label={record.status}
                size="small"
                color={getStatusColor(record.status) as any}
                sx={{ mr: 2 }}
              />
            </ListItem>
          ))}
        </List>

        {filteredAttendance.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No students found
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default LiveMonitoring;
