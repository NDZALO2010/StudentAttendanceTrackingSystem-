const { Op } = require('sequelize');
const { User, FaceDescriptor, Class, Enrollment, Session, Attendance } = require('../models');
const sequelize = require('../config/database');

// @desc    Register face descriptor
// @route   POST /api/student/face/register
// @access  Private (Student)
const registerFace = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { descriptor, imageUrl, qualityScore } = req.body;

    // Check if face already registered
    const existingDescriptor = await FaceDescriptor.findOne({
      where: { studentId }
    });

    if (existingDescriptor) {
      // Update existing descriptor
      await existingDescriptor.update({
        descriptor,
        imageUrl,
        qualityScore,
        lastUpdated: new Date()
      });

      return res.status(200).json({
        status: 'success',
        message: 'Face descriptor updated successfully',
        data: { faceDescriptor: existingDescriptor }
      });
    }

    // Create new descriptor
    const faceDescriptor = await FaceDescriptor.create({
      studentId,
      descriptor,
      imageUrl,
      qualityScore,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      message: 'Face registered successfully',
      data: { faceDescriptor }
    });
  } catch (error) {
    console.error('Register face error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering face',
      error: error.message
    });
  }
};

// @desc    Get face descriptor status
// @route   GET /api/student/face/status
// @access  Private (Student)
const getFaceStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    const faceDescriptor = await FaceDescriptor.findOne({
      where: { studentId },
      attributes: ['id', 'isActive', 'registrationDate', 'lastUpdated', 'qualityScore']
    });

    res.status(200).json({
      status: 'success',
      data: {
        isRegistered: !!faceDescriptor,
        faceDescriptor
      }
    });
  } catch (error) {
    console.error('Get face status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching face status',
      error: error.message
    });
  }
};

// @desc    Check in with facial recognition
// @route   POST /api/student/checkin
// @access  Private (Student)
const checkIn = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { sessionId, faceDescriptor, latitude, longitude } = req.body;

    // Verify session exists and is active
    const session = await Session.findOne({
      where: { id: sessionId, isActive: true },
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'courseCode', 'courseName']
      }]
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found or is not active'
      });
    }

    // Verify student is enrolled in the class
    const enrollment = await Enrollment.findOne({
      where: {
        studentId,
        classId: session.classId,
        status: 'active'
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not enrolled in this class'
      });
    }

    // Get attendance record
    let attendance = await Attendance.findOne({
      where: { sessionId, studentId }
    });

    if (!attendance) {
      // Create attendance record if it doesn't exist
      attendance = await Attendance.create({
        sessionId,
        studentId,
        status: 'absent'
      });
    }

    // Check if already checked in
    if (attendance.status !== 'absent') {
      return res.status(400).json({
        status: 'error',
        message: 'You have already checked in for this session',
        data: { attendance }
      });
    }

    // Verify face if descriptor provided
    let faceMatchConfidence = null;
    if (faceDescriptor) {
      const storedDescriptor = await FaceDescriptor.findOne({
        where: { studentId, isActive: true }
      });

      if (!storedDescriptor) {
        return res.status(400).json({
          status: 'error',
          message: 'Face not registered. Please register your face first.'
        });
      }

      // Calculate Euclidean distance between descriptors
      faceMatchConfidence = calculateFaceMatch(
        faceDescriptor,
        storedDescriptor.descriptor
      );

      const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.6;
      
      if (faceMatchConfidence < threshold) {
        return res.status(401).json({
          status: 'error',
          message: 'Face verification failed. Please try again.',
          data: { confidence: faceMatchConfidence }
        });
      }
    }

    // Determine if late
    const checkInTime = new Date();
    const sessionStart = new Date(`${session.sessionDate}T${session.startTime}`);
    const isLate = checkInTime > sessionStart;

    // Update attendance
    await attendance.update({
      status: isLate ? 'late' : 'present',
      checkInTime,
      checkInMethod: faceDescriptor ? 'facial_recognition' : 'manual',
      latitude,
      longitude,
      faceMatchConfidence
    });

    // Update session counts
    await updateSessionCounts(sessionId);

    // Update enrollment attendance percentage
    await updateEnrollmentAttendance(studentId, session.classId);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`session-${sessionId}`).emit('student-checked-in', {
      studentId,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      status: attendance.status,
      checkInTime
    });

    res.status(200).json({
      status: 'success',
      message: `Check-in successful! You are marked as ${attendance.status}.`,
      data: {
        attendance,
        session: {
          id: session.id,
          courseCode: session.class.courseCode,
          courseName: session.class.courseName,
          sessionDate: session.sessionDate
        }
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during check-in',
      error: error.message
    });
  }
};

// @desc    Get student's enrolled classes
// @route   GET /api/student/classes
// @access  Private (Student)
const getEnrolledClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { studentId, status: 'active' },
      include: [{
        model: Class,
        as: 'class',
        include: [{
          model: User,
          as: 'lecturer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      }],
      order: [[{ model: Class, as: 'class' }, 'courseName', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { enrollments }
    });
  } catch (error) {
    console.error('Get enrolled classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching enrolled classes',
      error: error.message
    });
  }
};

// @desc    Get active sessions for student
// @route   GET /api/student/sessions/active
// @access  Private (Student)
const getActiveSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get student's enrolled classes
    const enrollments = await Enrollment.findAll({
      where: { studentId, status: 'active' },
      attributes: ['classId']
    });

    const classIds = enrollments.map(e => e.classId);

    // Get active sessions for today
    const sessions = await Session.findAll({
      where: {
        classId: { [Op.in]: classIds },
        sessionDate: today,
        isActive: true,
        status: { [Op.in]: ['scheduled', 'ongoing'] }
      },
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'courseCode', 'courseName', 'color']
        },
        {
          model: Attendance,
          as: 'attendanceRecords',
          where: { studentId },
          required: false,
          attributes: ['id', 'status', 'checkInTime']
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { sessions }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching active sessions',
      error: error.message
    });
  }
};

// @desc    Get student's attendance history
// @route   GET /api/student/attendance
// @access  Private (Student)
const getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId, startDate, endDate } = req.query;

    const whereClause = { studentId };
    const sessionWhere = {};

    if (startDate || endDate) {
      sessionWhere.sessionDate = {};
      if (startDate) sessionWhere.sessionDate[Op.gte] = startDate;
      if (endDate) sessionWhere.sessionDate[Op.lte] = endDate;
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Session,
          as: 'session',
          where: sessionWhere,
          include: [{
            model: Class,
            as: 'class',
            where: classId ? { id: classId } : {},
            attributes: ['id', 'courseCode', 'courseName', 'color']
          }]
        }
      ],
      order: [[{ model: Session, as: 'session' }, 'sessionDate', 'DESC']]
    });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    stats.attendanceRate = stats.total > 0
      ? (((stats.present + stats.late) / stats.total) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching attendance history',
      error: error.message
    });
  }
};

// @desc    Get attendance statistics by class
// @route   GET /api/student/attendance/stats
// @access  Private (Student)
const getAttendanceStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { studentId, status: 'active' },
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'courseCode', 'courseName', 'color']
      }]
    });

    const statsPromises = enrollments.map(async (enrollment) => {
      const attendance = await Attendance.findAll({
        where: { studentId },
        include: [{
          model: Session,
          as: 'session',
          where: { classId: enrollment.classId },
          attributes: ['id']
        }]
      });

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const absent = attendance.filter(a => a.status === 'absent').length;

      return {
        class: enrollment.class,
        statistics: {
          total,
          present,
          late,
          absent,
          attendanceRate: total > 0 ? (((present + late) / total) * 100).toFixed(2) : 0
        }
      };
    });

    const classStats = await Promise.all(statsPromises);

    res.status(200).json({
      status: 'success',
      data: { classStats }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching attendance statistics',
      error: error.message
    });
  }
};

// Helper function to calculate face match confidence
const calculateFaceMatch = (descriptor1, descriptor2) => {
  // Calculate Euclidean distance
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  const distance = Math.sqrt(sum);
  
  // Convert distance to confidence score (0-1)
  // Lower distance = higher confidence
  const confidence = Math.max(0, 1 - distance);
  
  return parseFloat(confidence.toFixed(4));
};

// Helper function to update session counts
const updateSessionCounts = async (sessionId) => {
  const counts = await Attendance.findAll({
    where: { sessionId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'late'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absent']
    ],
    raw: true
  });

  const stats = counts[0];
  await Session.update({
    presentCount: parseInt(stats.present) || 0,
    lateCount: parseInt(stats.late) || 0,
    absentCount: parseInt(stats.absent) || 0
  }, {
    where: { id: sessionId }
  });
};

// Helper function to update enrollment attendance percentage
const updateEnrollmentAttendance = async (studentId, classId) => {
  const attendance = await Attendance.findAll({
    where: { studentId },
    include: [{
      model: Session,
      as: 'session',
      where: { classId },
      attributes: ['id']
    }]
  });

  const total = attendance.length;
  if (total === 0) return;

  const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const percentage = ((present / total) * 100).toFixed(2);

  await Enrollment.update(
    { attendancePercentage: percentage },
    { where: { studentId, classId } }
  );
};

module.exports = {
  registerFace,
  getFaceStatus,
  checkIn,
  getEnrolledClasses,
  getActiveSessions,
  getAttendanceHistory,
  getAttendanceStats
};
