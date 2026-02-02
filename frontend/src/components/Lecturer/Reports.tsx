import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
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
} from '@mui/material';
import {
  Download,
  Assessment,
  CalendarMonth,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Reports: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('class');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      enqueueSnackbar('Please select date range', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      enqueueSnackbar('Report generated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    enqueueSnackbar('Exporting to CSV...', { variant: 'info' });
  };

  const handleExportPDF = () => {
    enqueueSnackbar('Exporting to PDF...', { variant: 'info' });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Reports & Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Generate and export attendance reports
      </Typography>

      {/* Report Configuration */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Generate Report
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="class">By Class</MenuItem>
              <MenuItem value="student">By Student</MenuItem>
              <MenuItem value="date">By Date Range</MenuItem>
              <MenuItem value="summary">Summary Report</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="CS101">CS101 - Introduction to Programming</MenuItem>
              <MenuItem value="CS201">CS201 - Data Structures</MenuItem>
              <MenuItem value="MATH201">MATH201 - Calculus II</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Assessment />}
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Sample Report Preview */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Report Preview
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total Sessions
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  24
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Average Attendance
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  87.5%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  45
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell align="center">Present</TableCell>
                <TableCell align="center">Late</TableCell>
                <TableCell align="center">Absent</TableCell>
                <TableCell align="center">Attendance Rate</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Alice Williams', id: 'STU001', present: 22, late: 1, absent: 1, rate: 95.8 },
                { name: 'Bob Davis', id: 'STU002', present: 20, late: 2, absent: 2, rate: 91.7 },
                { name: 'Charlie Miller', id: 'STU003', present: 21, late: 1, absent: 2, rate: 91.7 },
                { name: 'Diana Wilson', id: 'STU004', present: 18, late: 3, absent: 3, rate: 87.5 },
                { name: 'Emma Moore', id: 'STU005', present: 23, late: 0, absent: 1, rate: 95.8 },
              ].map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.id}</TableCell>
                  <TableCell align="center">{student.present}</TableCell>
                  <TableCell align="center">{student.late}</TableCell>
                  <TableCell align="center">{student.absent}</TableCell>
                  <TableCell align="center">{student.rate}%</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={student.rate >= 90 ? 'Excellent' : student.rate >= 75 ? 'Good' : 'Warning'}
                      color={student.rate >= 90 ? 'success' : student.rate >= 75 ? 'primary' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports;
