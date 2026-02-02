const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'course_code'
  },
  courseName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'course_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lecturerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'lecturer_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  semester: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'academic_year'
  },
  schedule: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of schedule objects with day, startTime, endTime, location'
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_students'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#2563EB',
    comment: 'Hex color code for UI display'
  }
}, {
  tableName: 'classes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['lecturer_id']
    },
    {
      fields: ['course_code']
    },
    {
      fields: ['semester', 'academic_year']
    }
  ]
});

module.exports = Class;
