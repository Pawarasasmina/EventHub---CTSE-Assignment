require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Auth service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start auth service', error);
    process.exit(1);
  }
};

start();
