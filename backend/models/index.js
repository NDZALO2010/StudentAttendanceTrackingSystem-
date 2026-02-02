const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Enrollment = require('./Enrollment');
const Session = require('./Session');
const Attendance = require('./Attendance');
const FaceDescriptor = require('./FaceDescriptor');

// Define associations

// User - Class (Lecturer teaches Classes)
User.hasMany(Class, {
  foreignKey: 'lecturerId',
  as: 'taughtClasses'
});
Class.belongsTo(User, {
  foreignKey: 'lecturerId',
  as: 'lecturer'
});

// User - Enrollment (Students enroll in Classes)
User.hasMany(Enrollment, {
  foreignKey: 'studentId',
  as: 'enrollments'
});
Enrollment.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// Class - Enrollment
Class.hasMany(Enrollment, {
  foreignKey: 'classId',
  as: 'enrollments'
});
Enrollment.belongsTo(Class, {
  foreignKey: 'classId',
  as: 'class'
});

// Class - Session
Class.hasMany(Session, {
  foreignKey: 'classId',
  as: 'sessions'
});
Session.belongsTo(Class, {
  foreignKey: 'classId',
  as: 'class'
});

// Session - Attendance
Session.hasMany(Attendance, {
  foreignKey: 'sessionId',
  as: 'attendanceRecords'
});
Attendance.belongsTo(Session, {
  foreignKey: 'sessionId',
  as: 'session'
});

// User - Attendance (Student attendance records)
User.hasMany(Attendance, {
  foreignKey: 'studentId',
  as: 'attendanceRecords'
});
Attendance.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// User - Attendance (Marked by - for manual entries)
User.hasMany(Attendance, {
  foreignKey: 'markedBy',
  as: 'markedAttendance'
});
Attendance.belongsTo(User, {
  foreignKey: 'markedBy',
  as: 'marker'
});

// User - FaceDescriptor (One-to-One)
User.hasOne(FaceDescriptor, {
  foreignKey: 'studentId',
  as: 'faceDescriptor'
});
FaceDescriptor.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// Many-to-Many: Students and Classes through Enrollment
User.belongsToMany(Class, {
  through: Enrollment,
  foreignKey: 'studentId',
  otherKey: 'classId',
  as: 'enrolledClasses'
});
Class.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'classId',
  otherKey: 'studentId',
  as: 'enrolledStudents'
});

module.exports = {
  sequelize,
  User,
  Class,
  Enrollment,
  Session,
  Attendance,
  FaceDescriptor
};
