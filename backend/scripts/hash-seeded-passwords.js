const bcrypt = require('bcryptjs');
const { User } = require('../models');

const run = async () => {
  try {
    console.log('🔐 Hashing unhashed passwords...');

    const users = await User.findAll();
    let updated = 0;

    for (const user of users) {
      const pwd = user.password || '';
      // Heuristic: bcrypt hashes typically start with $2a$, $2b$, or $2y$
      if (!pwd.startsWith('$2')) {
        const hash = await bcrypt.hash(pwd, 10);
        await user.update({ password: hash }, { hooks: false });
        updated++;
        console.log(` - Updated ${user.email}`);
      }
    }

    console.log(`✅ Completed. Passwords hashed for ${updated} users.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error hashing passwords:', err);
    process.exit(1);
  }
};

run();
