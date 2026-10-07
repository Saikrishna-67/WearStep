const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wearstep';
  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[WearStep DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
      console.error(`[WearStep DB Error] ${error.message}`);
      console.log('[WearStep DB] Retrying connection in 5 seconds...');
      setTimeout(tryConnect, 5000);
    }
  };
  await tryConnect();
};

module.exports = connectDB;
