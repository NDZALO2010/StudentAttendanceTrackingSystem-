import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  Schedule,
  PlayArrow,
  Close,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { Class } from '../../types';

const ClassManagement: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    semester: 'Fall',
    academicYear: '2024',
    department: '',
    credits: 3,
    maxStudents: 50,
    color: '#2563EB',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.getClasses();
      setClasses(response.data.classes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load classes');
      enqueueSnackbar('Failed to load classes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (classData?: Class) => {
    if (classData) {
      setEditingClass(classData);
      setFormData({
        courseCode: classData.courseCode,
        courseName: classData.courseName,
        description: classData.description || '',
        semester: classData.semester,
        academicYear: classData.academicYear,
        department: classData.department || '',
        credits: classData.credits || 3,
        maxStudents: classData.maxStudents || 50,
        color: classData.color || '#2563EB',
      });
    } else {
      setEditingClass(null);
      setFormData({
        courseCode: '',
        courseName: '',
        description: '',
        semester: 'Fall',
        academicYear: '2024',
        department: '',
        credits: 3,
        maxStudents: 50,
        color: '#2563EB',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingClass) {
        await api.updateClass(editingClass.id, formData);
        enqueueSnackbar('Class updated successfully', { variant: 'success' });
      } else {
        await api.createClass(formData);
        enqueueSnackbar('Class created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchClasses();
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to save class',
        { variant: 'error' }
      );
    }
  };

  const handleDelete = async (classId: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      await api.deleteClass(classId);
      enqueueSnackbar('Class deleted successfully', { variant: 'success' });
      fetchClasses();
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to delete class',
        { variant: 'error' }
      );
    }
  };

  const handleStartSession = async (classData: Class) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const response = await api.createSession({
        classId: classData.id,
        sessionDate: today,
        startTime,
        location: 'TBD',
        topic: 'Class Session',
      });

      enqueueSnackbar('Session started successfully', { variant: 'success' });
      navigate(`/lecturer/session/${response.data.session.id}`);
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to start session',
        { variant: 'error' }
      );
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Class Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your classes and start attendance sessions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Create Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {classes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No classes yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first class to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create Class
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classData) => (
            <Grid item xs={12} md={6} lg={4} key={classData.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: 4,
                  borderColor: classData.color || 'primary.main',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {classData.courseCode}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {classData.courseName}
                      </Typography>
                    </Box>
                    <Chip
                      label={classData.isActive ? 'Active' : 'Inactive'}
                      color={classData.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {classData.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {classData.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                      icon={<People />}
                      label={`${classData.studentCount || 0} Students`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Schedule />}
                      label={`${classData.semester} ${classData.academicYear}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {classData.schedule && classData.schedule.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        Schedule:
                      </Typography>
                      <List dense>
                        {classData.schedule.map((sched: any, idx: number) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2">
                                  {sched.day}: {sched.startTime} - {sched.endTime}
                                </Typography>
                              }
                              secondary={sched.location}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<PlayArrow />}
                    variant="contained"
                    onClick={() => handleStartSession(classData)}
                    fullWidth
                  >
                    Start Session
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(classData)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(classData.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Code"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Name"
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({ ...formData, credits: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Max Students"
                type="number"
                value={formData.maxStudents}
                onChange={(e) =>
                  setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement;
