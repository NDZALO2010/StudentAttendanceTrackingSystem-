import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  CameraAlt,
  CheckCircle,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import faceRecognitionService from '../../services/faceRecognition';
import api from '../../services/api';

const steps = ['Position Your Face', 'Capture Image', 'Verify & Register'];

const FaceRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (cameraReady && activeStep === 0) {
      detectFace();
    }
  }, [cameraReady, activeStep]);

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
    if (!videoRef.current || !cameraReady) return;

    const detection = await faceRecognitionService.detectFace(videoRef.current);
    setFaceDetected(!!detection);

    if (activeStep === 0) {
      setTimeout(detectFace, 100);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    try {
      // Draw video frame to canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Get image data
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);

      // Detect and extract face descriptor
      const detection = await faceRecognitionService.detectFace(video);
      
      if (!detection) {
        setError('No face detected. Please try again.');
        enqueueSnackbar('No face detected', { variant: 'error' });
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      setFaceDescriptor(descriptor);

      // Calculate quality score (based on detection confidence)
      const quality = detection.detection.score;
      setQualityScore(quality);

      if (quality < 0.7) {
        setError('Image quality is low. Please ensure good lighting and face the camera directly.');
        enqueueSnackbar('Low image quality', { variant: 'warning' });
      }

      setActiveStep(1);
    } catch (err) {
      setError('Failed to capture face. Please try again.');
      enqueueSnackbar('Capture failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!faceDescriptor || !capturedImage) return;

    setLoading(true);
    try {
      await api.registerFace({
        descriptor: faceDescriptor,
        imageUrl: capturedImage,
        qualityScore,
      });

      enqueueSnackbar('Face registered successfully!', { variant: 'success' });
      setActiveStep(2);
      
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register face');
      enqueueSnackbar('Registration failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFaceDescriptor(null);
    setQualityScore(0);
    setError('');
    setActiveStep(0);
    detectFace();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Face Registration
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Register your face for quick and secure attendance check-in
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Position Your Face
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Look directly at the camera and ensure your face is well-lit
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

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CameraAlt />}
                    onClick={handleCapture}
                    disabled={!faceDetected || loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Capture Photo'}
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 1 && capturedImage && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Verify Your Photo
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Review the captured image and quality score
                </Typography>

                <Box
                  component="img"
                  src={capturedImage}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    mt: 2,
                  }}
                />

                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRetake}
                    fullWidth
                  >
                    Retake
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={handleRegister}
                    disabled={loading || qualityScore < 0.7}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box textAlign="center" py={6}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Registration Successful!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your face has been registered. You can now use facial recognition for check-in.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tips for Best Results
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Good Lighting"
                    secondary="Ensure your face is well-lit from the front"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Face the Camera"
                    secondary="Look directly at the camera"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Remove Accessories"
                    secondary="Take off glasses or hats if possible"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Neutral Expression"
                    secondary="Keep a neutral facial expression"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {qualityScore > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Quality
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={qualityScore * 100}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    color={qualityScore >= 0.8 ? 'success' : qualityScore >= 0.7 ? 'warning' : 'error'}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {(qualityScore * 100).toFixed(0)}%
                  </Typography>
                </Box>
                {qualityScore < 0.7 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Quality is below recommended threshold. Consider retaking for better results.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FaceRegistration;
