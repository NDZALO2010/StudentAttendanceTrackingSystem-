const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
// Support either a single DATABASE_URL (preferred for Supabase) or individual DB_* vars.
// If DB_SSL is set to 'true' (or '1') we enable SSL / rejectUnauthorized: false for hosted DBs.
const dialectOptions = {};
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'sats_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectOptions,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  );
}

module.exports = sequelize;
