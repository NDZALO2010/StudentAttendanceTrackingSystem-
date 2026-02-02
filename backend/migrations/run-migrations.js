const sequelize = require('../config/database');
const {
  User,
  Class,
  Enrollment,
  Session,
  Attendance,
  FaceDescriptor
} = require('../models');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models in order (respecting foreign key constraints)
    await User.sync({ force: false });
    console.log('✅ Users table created/verified');

    await Class.sync({ force: false });
    console.log('✅ Classes table created/verified');

    await Enrollment.sync({ force: false });
    console.log('✅ Enrollments table created/verified');

    await Session.sync({ force: false });
    console.log('✅ Sessions table created/verified');

    await Attendance.sync({ force: false });
    console.log('✅ Attendance table created/verified');

    await FaceDescriptor.sync({ force: false });
    console.log('✅ Face Descriptors table created/verified');

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
