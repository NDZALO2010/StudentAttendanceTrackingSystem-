const { Op } = require('sequelize');
const { Class, Enrollment, Session, Attendance, User, FaceDescriptor } = require('../models');
const sequelize = require('../config/database');

// @desc    Get lecturer dashboard stats
// @route   GET /api/lecturer/dashboard
// @access  Private (Lecturer)
const getDashboardStats = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get total classes
    const totalClasses = await Class.count({
      where: { lecturerId, isActive: true }
    });

    // Get today's sessions
    const todaySessions = await Session.findAll({
      where: {
        sessionDate: today
      },
      include: [{
        model: Class,
        as: 'class',
        where: { lecturerId },
        attributes: ['id', 'courseCode', 'courseName']
      }],
      order: [['startTime', 'ASC']]
    });

    // Get total students across all classes
    const totalStudents = await Enrollment.count({
      distinct: true,
      col: 'studentId',
      include: [{
        model: Class,
        as: 'class',
        where: { lecturerId, isActive: true }
      }]
    });

    // Get recent attendance activity (last 10)
    const recentActivity = await Attendance.findAll({
      limit: 10,
      order: [['checkInTime', 'DESC']],
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'studentId']
        },
        {
          model: Session,
          as: 'session',
          include: [{
            model: Class,
            as: 'class',
            where: { lecturerId },
            attributes: ['courseCode', 'courseName']
          }]
        }
      ]
    });

    // Calculate overall attendance rate
    const attendanceStats = await Attendance.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'late'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absent']
      ],
      include: [{
        model: Session,
        as: 'session',
        include: [{
          model: Class,
          as: 'class',
          where: { lecturerId }
        }]
      }],
      raw: true
    });

    const stats = attendanceStats[0] || { total: 0, present: 0, late: 0, absent: 0 };
    const attendanceRate = stats.total > 0 
      ? ((parseInt(stats.present) + parseInt(stats.late)) / parseInt(stats.total) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalClasses,
        totalStudents,
        todaySessions,
        recentActivity,
        attendanceStats: {
          total: parseInt(stats.total),
          present: parseInt(stats.present),
          late: parseInt(stats.late),
          absent: parseInt(stats.absent),
          attendanceRate: parseFloat(attendanceRate)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all classes for lecturer
// @route   GET /api/lecturer/classes
// @access  Private (Lecturer)
const getClasses = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const classes = await Class.findAll({
      where: { lecturerId },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id'],
          where: { status: 'active' },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add student count to each class
    const classesWithCount = classes.map(cls => ({
      ...cls.toJSON(),
      studentCount: cls.enrollments ? cls.enrollments.length : 0
    }));

    res.status(200).json({
      status: 'success',
      data: { classes: classesWithCount }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

// @desc    Create new class
// @route   POST /api/lecturer/classes
// @access  Private (Lecturer)
const createClass = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const {
      courseCode,
      courseName,
      description,
      semester,
      academicYear,
      schedule,
      maxStudents,
      department,
      credits,
      color
    } = req.body;

    const newClass = await Class.create({
      courseCode,
      courseName,
      description,
      lecturerId,
      semester,
      academicYear,
      schedule,
      maxStudents,
      department,
      credits,
      color
    });

    res.status(201).json({
      status: 'success',
      message: 'Class created successfully',
      data: { class: newClass }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating class',
      error: error.message
    });
  }
};

// @desc    Update class
// @route   PUT /api/lecturer/classes/:id
// @access  Private (Lecturer)
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const classToUpdate = await Class.findOne({
      where: { id, lecturerId }
    });

    if (!classToUpdate) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found or you do not have permission to update it'
      });
    }

    await classToUpdate.update(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Class updated successfully',
      data: { class: classToUpdate }
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating class',
      error: error.message
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/lecturer/classes/:id
// @access  Private (Lecturer)
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const classToDelete = await Class.findOne({
      where: { id, lecturerId }
    });

    if (!classToDelete) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found or you do not have permission to delete it'
      });
    }

    await classToDelete.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting class',
      error: error.message
    });
  }
};

// @desc    Get students enrolled in a class
// @route   GET /api/lecturer/classes/:id/students
// @access  Private (Lecturer)
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    // Verify class belongs to lecturer
    const classExists = await Class.findOne({
      where: { id, lecturerId }
    });

    if (!classExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found or you do not have permission to view it'
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { classId: id },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'studentId', 'profileImage']
      }],
      order: [[{ model: User, as: 'student' }, 'lastName', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { students: enrollments }
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching class students',
      error: error.message
    });
  }
};

// @desc    Add student to class
// @route   POST /api/lecturer/classes/:id/students
// @access  Private (Lecturer)
const addStudentToClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const lecturerId = req.user.id;

    // Verify class belongs to lecturer
    const classExists = await Class.findOne({
      where: { id, lecturerId }
    });

    if (!classExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found or you do not have permission'
      });
    }

    // Check if student exists
    const student = await User.findOne({
      where: { id: studentId, role: 'student' }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId, classId: id }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Student is already enrolled in this class'
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      classId: id,
      status: 'active'
    });

    res.status(201).json({
      status: 'success',
      message: 'Student added to class successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding student to class',
      error: error.message
    });
  }
};

// @desc    Create attendance session
// @route   POST /api/lecturer/sessions
// @access  Private (Lecturer)
const createSession = async (req, res) => {
  try {
    const {
      classId,
      sessionDate,
      startTime,
      endTime,
      location,
      topic
    } = req.body;
    const lecturerId = req.user.id;

    // Verify class belongs to lecturer
    const classExists = await Class.findOne({
      where: { id: classId, lecturerId }
    });

    if (!classExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found or you do not have permission'
      });
    }

    // Get enrolled students count
    const enrolledCount = await Enrollment.count({
      where: { classId, status: 'active' }
    });

    const session = await Session.create({
      classId,
      sessionDate,
      startTime,
      endTime,
      location,
      topic,
      totalStudents: enrolledCount,
      status: 'ongoing',
      isActive: true
    });

    // Create attendance records for all enrolled students
    const enrollments = await Enrollment.findAll({
      where: { classId, status: 'active' }
    });

    const attendanceRecords = enrollments.map(enrollment => ({
      sessionId: session.id,
      studentId: enrollment.studentId,
      status: 'absent'
    }));

    await Attendance.bulkCreate(attendanceRecords);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`session-${session.id}`).emit('session-started', {
      sessionId: session.id,
      classId,
      totalStudents: enrolledCount
    });

    res.status(201).json({
      status: 'success',
      message: 'Session created successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating session',
      error: error.message
    });
  }
};

// @desc    Get session details with attendance
// @route   GET /api/lecturer/sessions/:id
// @access  Private (Lecturer)
const getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const session = await Session.findOne({
      where: { id },
      include: [
        {
          model: Class,
          as: 'class',
          where: { lecturerId },
          attributes: ['id', 'courseCode', 'courseName']
        },
        {
          model: Attendance,
          as: 'attendanceRecords',
          include: [{
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'studentId', 'profileImage']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found or you do not have permission'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { session }
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching session details',
      error: error.message
    });
  }
};

// @desc    End attendance session
// @route   PUT /api/lecturer/sessions/:id/end
// @access  Private (Lecturer)
const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const session = await Session.findOne({
      where: { id },
      include: [{
        model: Class,
        as: 'class',
        where: { lecturerId }
      }]
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found or you do not have permission'
      });
    }

    // Update session status
    await session.update({
      status: 'completed',
      isActive: false,
      endTime: new Date().toTimeString().split(' ')[0]
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`session-${session.id}`).emit('session-ended', {
      sessionId: session.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Session ended successfully',
      data: { session }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error ending session',
      error: error.message
    });
  }
};

// @desc    Manual attendance marking
// @route   PUT /api/lecturer/attendance/:id
// @access  Private (Lecturer)
const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const lecturerId = req.user.id;

    const attendance = await Attendance.findOne({
      where: { id },
      include: [{
        model: Session,
        as: 'session',
        include: [{
          model: Class,
          as: 'class',
          where: { lecturerId }
        }]
      }]
    });

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found or you do not have permission'
      });
    }

    await attendance.update({
      status,
      notes,
      markedBy: lecturerId,
      checkInTime: status !== 'absent' ? new Date() : null,
      checkInMethod: 'manual'
    });

    // Update session counts
    await updateSessionCounts(attendance.sessionId);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`session-${attendance.sessionId}`).emit('attendance-updated', {
      attendanceId: attendance.id,
      status
    });

    res.status(200).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: { attendance }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error marking attendance',
      error: error.message
    });
  }
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

module.exports = {
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
};
