import 'dotenv/config';
import { createConnection, Connection } from 'mongoose';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function seedSuperAdmin() {
  
  const mongoUri = process.env.MONGO_URI!;
  const connection: Connection = createConnection(mongoUri);

  const UserModel = connection.model('User', UserSchema);

  const superAdmin = await UserModel.findOne({
    $or: [
      { role: 'super-admin' },
      { email: process.env.SUPER_ADMIN_EMAIL },
      { phone: process.env.SUPER_ADMIN_PHONE }
    ]
  });

  if (superAdmin) {
    console.log('Super-Admin or user with this email/phone already exists.');
    await connection.close();
    return;
  }

  const password = process.env.SUPER_ADMIN_PASSWORD!
  const hashedPassword = await bcrypt.hash(password, 10);

  const newSuperAdmin = new UserModel({
    firstName: process.env.SUPER_ADMIN_FIRST_NAME,
    lastName: process.env.SUPER_ADMIN_LAST_NAME,
    email: process.env.SUPER_ADMIN_EMAIL,
    phone: process.env.SUPER_ADMIN_PHONE,
    role: 'super-admin',
    password: hashedPassword,
    is_verified: true,
  });

  await newSuperAdmin.save();
  console.log('Super-Admin created successfully.');
  await connection.close();
}

seedSuperAdmin().catch((err) => {
  console.error('Error seeding Super-Admin:', err);
  process.exit(1);
});