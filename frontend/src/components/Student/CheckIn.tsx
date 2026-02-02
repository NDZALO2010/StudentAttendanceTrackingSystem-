import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  FaceRetouchingNatural,
  Warning,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import faceRecognitionService from '../../services/faceRecognition';
import api from '../../services/api';
import { Session } from '../../types';

const CheckIn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchActiveSessions();
    initializeCamera();

    // Check if session ID was passed from dashboard
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      setSelectedSession(sessionId);
    }

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (cameraReady) {
      detectFace();
    }
  }, [cameraReady]);

  const fetchActiveSessions = async () => {
    try {
      const response = await api.getActiveSessions();
      setActiveSessions(response.data.sessions);
    } catch (err: any) {
      enqueueSnackbar('Failed to load active sessions', { variant: 'error' });
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.');
      enqueueSnackbar('Camera access denied', { variant: 'error' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !cameraReady || success) return;

    const detection = await faceRecognitionService.detectFace(videoRef.current);
    setFaceDetected(!!detection);

    if (!success) {
      setTimeout(detectFace, 100);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedSession) {
      enqueueSnackbar('Please select a session', { variant: 'warning' });
      return;
    }

    if (!videoRef.current) {
      enqueueSnackbar('Camera not ready', { variant: 'error' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Detect face and get descriptor
      const detection = await faceRecognitionService.detectFace(videoRef.current);

      if (!detection) {
        setError('No face detected. Please ensure your face is visible.');
        enqueueSnackbar('No face detected', { variant: 'error' });
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // Get geolocation (optional)
      let latitude, longitude;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (err) {
        console.log('Geolocation not available');
      }

      // Submit check-in
      const response = await api.checkIn({
        sessionId: selectedSession,
        faceDescriptor: descriptor,
        latitude,
        longitude,
      });

      setSuccess(true);
      enqueueSnackbar(response.data.message, { variant: 'success' });
      
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed');
      enqueueSnackbar(err.response?.data?.message || 'Check-in failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Check-In Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your attendance has been recorded.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Redirecting to dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Check In
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Use facial recognition to check in to your class
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Camera View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Position Your Face
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Look directly at the camera for facial recognition
            </Typography>

            <Box
              sx={{
                position: 'relative',
                mt: 2,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'black',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />

              {/* Face detection overlay */}
              {cameraReady && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    height: 400,
                    border: 3,
                    borderColor: faceDetected ? 'success.main' : 'warning.main',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {faceDetected && (
                <Chip
                  icon={<CheckCircle />}
                  label="Face Detected"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}
            </Box>

            <Box mt={3}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<FaceRetouchingNatural />}
                onClick={handleCheckIn}
                disabled={!faceDetected || !selectedSession || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Check In with Face Recognition'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Sessions
              </Typography>
              {activeSessions.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  No active sessions available
                </Typography>
              ) : (
                <List>
                  {activeSessions.map((session) => (
                    <ListItem
                      key={session.id}
                      button
                      selected={selectedSession === session.id}
                      onClick={() => setSelectedSession(session.id)}
                      sx={{
                        border: 1,
                        borderColor: selectedSession === session.id ? 'primary.main' : 'divider',
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
                            {session.class?.courseCode}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {session.class?.courseName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.startTime}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
                Important
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Face Registration"
                    secondary="Ensure you have registered your face before checking in"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Good Lighting"
                    secondary="Make sure your face is well-lit"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Select Session"
                    secondary="Choose the correct session from the list"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckIn;
