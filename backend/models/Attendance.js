const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'session_id',
    references: {
      model: 'sessions',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('present', 'late', 'absent', 'excused'),
    allowNull: false,
    defaultValue: 'absent'
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_in_time'
  },
  checkInMethod: {
    type: DataTypes.ENUM('facial_recognition', 'manual', 'qr_code'),
    allowNull: true,
    field: 'check_in_method'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'GPS latitude for location verification'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'GPS longitude for location verification'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  markedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'marked_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User ID who marked the attendance (for manual entries)'
  },
  faceMatchConfidence: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    field: 'face_match_confidence',
    comment: 'Confidence score from facial recognition (0-1)'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['session_id', 'student_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['check_in_time']
    }
  ]
});

module.exports = Attendance;
