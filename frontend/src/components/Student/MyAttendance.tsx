import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  Cancel,
  TrendingUp,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { Attendance, Class } from '../../types';

const MyAttendance: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [classes, setClasses] = useState<Class[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedClass, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch attendance history
      const params: any = {};
      if (selectedClass !== 'all') params.classId = selectedClass;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const attendanceResponse = await api.getAttendanceHistory(params);
      setAttendance(attendanceResponse.data.attendance);

      // Fetch stats
      const statsResponse = await api.getAttendanceStats();
      setStats(statsResponse.data);

      // Extract unique classes
      const uniqueClasses = attendanceResponse.data.attendance
        .map((a: any) => a.session?.class)
        .filter((c: any, index: number, self: any[]) =>
          c && self.findIndex((t: any) => t?.id === c?.id) === index
        );
      setClasses(uniqueClasses);
    } catch (err: any) {
      enqueueSnackbar('Failed to load attendance data', { variant: 'error' });
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
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle fontSize="small" />;
      case 'late':
        return <AccessTime fontSize="small" />;
      case 'absent':
      case 'excused':
        return <Cancel fontSize="small" />;
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        View your attendance history and statistics
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.courseCode} - {cls.courseName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {stats?.classStats?.map((classStat: any) => (
          <Grid item xs={12} md={6} lg={4} key={classStat.class.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {classStat.class.courseCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {classStat.class.courseName}
                </Typography>

                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Attendance Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {classStat.statistics.attendanceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(classStat.statistics.attendanceRate)}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      parseFloat(classStat.statistics.attendanceRate) >= 75
                        ? 'success'
                        : 'warning'
                    }
                  />
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {classStat.statistics.present}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Present
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main">
                        {classStat.statistics.late}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Late
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {classStat.statistics.absent}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Absent
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Attendance History Table */}
      <Paper sx={{ mt: 3 }}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Attendance History
          </Typography>
        </Box>

        {attendance.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography color="text.secondary">
              No attendance records found
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.session?.sessionDate || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {record.session?.class?.courseCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.session?.class?.courseName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {record.session?.startTime} - {record.session?.endTime}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(record.status)}
                        label={record.status}
                        size="small"
                        color={getStatusColor(record.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.checkInMethod || 'N/A'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default MyAttendance;
