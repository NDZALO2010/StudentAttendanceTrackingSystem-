const express = require('express');
const router = express.Router();
const {
  registerFace,
  getFaceStatus,
  checkIn,
  getEnrolledClasses,
  getActiveSessions,
  getAttendanceHistory,
  getAttendanceStats
} = require('../controllers/studentController');
const { authenticate, isStudent } = require('../middleware/auth.middleware');
const {
  validateFaceRegistration,
  validateCheckIn,
  validateDateRange
} = require('../middleware/validation.middleware');

// All routes require authentication and student role
router.use(authenticate, isStudent);

// Face registration
router.post('/face/register', validateFaceRegistration, registerFace);
router.get('/face/status', getFaceStatus);

// Check-in
router.post('/checkin', validateCheckIn, checkIn);

// Classes
router.get('/classes', getEnrolledClasses);

// Sessions
router.get('/sessions/active', getActiveSessions);

// Attendance
router.get('/attendance', validateDateRange, getAttendanceHistory);
router.get('/attendance/stats', getAttendanceStats);

module.exports = router;
