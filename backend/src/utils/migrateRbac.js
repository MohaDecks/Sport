require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { seedDefaultRoles } = require('./seedRoles');

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Seeding default roles...');

  const roles = await seedDefaultRoles();
  Object.keys(roles).forEach((name) => console.log(`  ✓ ${name}`));

  const admin = await User.findOne({ email: 'admin@dsms.com' });
  if (admin) {
    admin.isSuperAdmin = true;
    admin.adminRole = roles['Super Admin']._id;
    await admin.save();
    console.log('Updated admin@dsms.com → Super Admin');
  }

  console.log('\nDefault roles ready. Assign them in Admin Users page.');
  process.exit(0);
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
