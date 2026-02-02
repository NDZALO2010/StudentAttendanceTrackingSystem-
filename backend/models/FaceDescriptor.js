const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FaceDescriptor = sequelize.define('FaceDescriptor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  descriptor: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Face descriptor array from face-api.js (128-dimensional vector)'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url',
    comment: 'URL to the reference face image'
  },
  registrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'registration_date'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_updated'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  qualityScore: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    field: 'quality_score',
    comment: 'Quality score of the face image (0-1)'
  }
}, {
  tableName: 'face_descriptors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = FaceDescriptor;
