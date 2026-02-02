const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentToClass,
  createSession,
  getSessionDetails,
  endSession,
  markAttendance
} = require('../controllers/lecturerController');
const { authenticate, isLecturer } = require('../middleware/auth.middleware');
const {
  validateCreateClass,
  validateCreateSession,
  validateUUID
} = require('../middleware/validation.middleware');

// All routes require authentication and lecturer role
router.use(authenticate, isLecturer);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Class management
router.get('/classes', getClasses);
router.post('/classes', validateCreateClass, createClass);
router.put('/classes/:id', validateUUID('id'), updateClass);
router.delete('/classes/:id', validateUUID('id'), deleteClass);

// Student management
router.get('/classes/:id/students', validateUUID('id'), getClassStudents);
router.post('/classes/:id/students', validateUUID('id'), addStudentToClass);

// Session management
router.post('/sessions', validateCreateSession, createSession);
router.get('/sessions/:id', validateUUID('id'), getSessionDetails);
router.put('/sessions/:id/end', validateUUID('id'), endSession);

// Attendance management
router.put('/attendance/:id', validateUUID('id'), markAttendance);

module.exports = router;
