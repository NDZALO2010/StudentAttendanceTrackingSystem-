const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'enrollment_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'dropped', 'completed'),
    allowNull: false,
    defaultValue: 'active'
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  attendancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    field: 'attendance_percentage'
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'class_id']
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['class_id']
    }
  ]
});

module.exports = Enrollment;
