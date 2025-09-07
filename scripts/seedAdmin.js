/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

dotenv.config();

async function seedAdmin() {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || process.argv[2] || 'Admin';
    const email = process.env.ADMIN_EMAIL || process.argv[3] || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || process.argv[4] || 'ChangeMe123';

    let user = await User.findOne({ email }).select('+password');
    if (user) {
      if (user.role !== 'admin') {
        user.role = 'admin';
        if (process.argv.includes('--reset-password')) {
          user.password = password;
        }
        await user.save();
        console.log(`Updated existing user to admin: ${email}`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
    } else {
      user = await User.create({ name, email, password, role: 'admin' });
      console.log(`Created admin user: ${email}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch (_) {}
  }
}

seedAdmin();


