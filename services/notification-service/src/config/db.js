const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Notification service connected to MongoDB');
};

module.exports = connectDB;
