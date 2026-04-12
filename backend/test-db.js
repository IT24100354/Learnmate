require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ DB Test Failed! Error: MONGO_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ DB Test Successful! Connected to MongoDB.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ DB Test Failed! Error: ${error.message}`);
    process.exit(1);
  });
