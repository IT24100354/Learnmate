const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['1.1.1.1', '8.8.8.8']);

const User = require('./models/User');
const SchoolClass = require('./models/SchoolClass');
const Subject = require('./models/Subject');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

const subjects = ['Science', 'Mathematics', 'ICT', 'History', 'Spanish', 'English'];
const classes = [
  { name: 'Grade 6', description: 'Middle School' },
  { name: 'Grade 7', description: 'Middle School' },
  { name: 'Grade 8', description: 'Middle School' },
  { name: 'Grade 9', description: 'High School' },
  { name: 'Grade 10', description: 'High School' },
  { name: 'Grade 11', description: 'High School' }
];

const upsertLookupData = async () => {
  await mongoose.connect(mongoUri);

  for (const subjectName of subjects) {
    await Subject.updateOne(
      { name: subjectName },
      { $setOnInsert: { name: subjectName } },
      { upsert: true }
    );
  }

  for (const schoolClass of classes) {
    await SchoolClass.updateOne(
      { name: schoolClass.name },
      { $setOnInsert: schoolClass },
      { upsert: true }
    );
  }

  const adminExists = await User.exists({ role: 'ADMIN' });
  if (!adminExists) {
    await User.create({
      username: process.env.SEED_ADMIN_USERNAME || 'admin@',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@learnmate.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
      name: process.env.SEED_ADMIN_NAME || 'System Administrator',
      role: 'ADMIN',
      active: true
    });
  }

  const [subjectCount, classCount, adminCount] = await Promise.all([
    Subject.countDocuments(),
    SchoolClass.countDocuments(),
    User.countDocuments({ role: 'ADMIN' })
  ]);

  console.log(`Lookup data ready. Subjects: ${subjectCount}, classes: ${classCount}, admins: ${adminCount}`);
  await mongoose.disconnect();
};

upsertLookupData().catch(async (error) => {
  console.error(`Lookup data setup failed: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
