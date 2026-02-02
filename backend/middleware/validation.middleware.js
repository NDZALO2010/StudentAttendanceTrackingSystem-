const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// User validation rules
const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'lecturer']).withMessage('Role must be either student or lecturer'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Student ID must not exceed 50 characters'),
  
  body('employeeId')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Employee ID must not exceed 50 characters'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Class validation rules
const validateCreateClass = [
  body('courseCode')
    .trim()
    .notEmpty().withMessage('Course code is required')
    .isLength({ max: 20 }).withMessage('Course code must not exceed 20 characters'),
  
  body('courseName')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ max: 200 }).withMessage('Course name must not exceed 200 characters'),
  
  body('semester')
    .trim()
    .notEmpty().withMessage('Semester is required'),
  
  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}(-\d{4})?$/).withMessage('Academic year must be in format YYYY or YYYY-YYYY'),
  
  body('schedule')
    .optional()
    .isArray().withMessage('Schedule must be an array'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 1 }).withMessage('Max students must be a positive integer'),
  
  handleValidationErrors
];

// Session validation rules
const validateCreateSession = [
  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isUUID().withMessage('Class ID must be a valid UUID'),
  
  body('sessionDate')
    .notEmpty().withMessage('Session date is required')
    .isDate().withMessage('Session date must be a valid date'),
  
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location must not exceed 100 characters'),
  
  handleValidationErrors
];

// Attendance validation rules
const validateCheckIn = [
  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isUUID().withMessage('Session ID must be a valid UUID'),
  
  body('faceDescriptor')
    .optional()
    .isArray().withMessage('Face descriptor must be an array'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  handleValidationErrors
];

// Face descriptor validation
const validateFaceRegistration = [
  body('descriptor')
    .notEmpty().withMessage('Face descriptor is required')
    .isArray().withMessage('Face descriptor must be an array')
    .custom((value) => {
      if (value.length !== 128) {
        throw new Error('Face descriptor must have exactly 128 dimensions');
      }
      return true;
    }),
  
  body('qualityScore')
    .optional()
    .isFloat({ min: 0, max: 1 }).withMessage('Quality score must be between 0 and 1'),
  
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID().withMessage(`${paramName} must be a valid UUID`),
  
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isDate().withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isDate().withMessage('End date must be a valid date'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateClass,
  validateCreateSession,
  validateCheckIn,
  validateFaceRegistration,
  validateUUID,
  validateDateRange,
  handleValidationErrors
};
