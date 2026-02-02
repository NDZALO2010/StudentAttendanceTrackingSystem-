const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'class_id',
    references: {
      model: 'classes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  sessionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'session_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'end_time'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_students'
  },
  presentCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'present_count'
  },
  lateCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'late_count'
  },
  absentCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'absent_count'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether attendance is currently being taken'
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['class_id']
    },
    {
      fields: ['session_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['class_id', 'session_date']
    }
  ]
});

module.exports = Session;
