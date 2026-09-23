const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const isAtlas = conn.connection.host.includes('mongodb.net');
    const targetType = isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB';
    console.log(`📡 [Database] Connected to ${targetType} [Host: ${conn.connection.host}, DB: ${conn.connection.name}]`);
  } catch (error) {
    console.error(`❌ [Database] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;