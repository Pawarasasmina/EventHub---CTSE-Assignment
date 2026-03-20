require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5003;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Booking service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start booking service', error);
    process.exit(1);
  }
};

start();
