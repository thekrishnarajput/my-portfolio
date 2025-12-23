import dotenv from 'dotenv';
import User from '../models/User';
import { messages } from '../utils/message';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

async function initAdmin() {
  try {

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return; // Don't exit - just return
    }

    // Create admin user
    const admin = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });

    await admin.save();
    console.log(`✅ ${messages.adminUserCreated()}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error(`❌ ${messages.errorInitializingAdmin()}:`, error);
    // Don't exit - just log the error
    throw error;
  }
}

export default initAdmin;
