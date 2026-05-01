const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['1.1.1.1', '8.8.8.8']);

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
