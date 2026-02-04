const sequelize = require('../config/database');
const { execSync } = require('child_process');

(async () => {
  const maxAttempts = 30;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database reachable');
      break;
    } catch (err) {
      console.log(`Waiting for database (${i}/${maxAttempts})...`);
      await new Promise((r) => setTimeout(r, 1000));
      if (i === maxAttempts) {
        console.error('❌ Could not connect to database');
        process.exit(1);
      }
    }
  }

  try {
    console.log('🔄 Running migrations...');
    execSync('node migrations/run-migrations.js', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Migrations command failed (it may have already run):', e.message);
  }

  try {
    console.log('🌱 Running seeders...');
    execSync('node seeders/demo-data.js', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Seeder command failed (it may have already run):', e.message);
  }

  console.log('🚀 Starting backend server...');
  execSync('npm run start', { stdio: 'inherit' });
})();
