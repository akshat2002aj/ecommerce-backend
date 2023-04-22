const app = require('./app');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/database');

// Config Dotenv
dotenv.config({ path: './config/.env' });

// Connect Database
connectDB();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.blue.bold);
});

// Handle Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}`.red.bold);
  // Close server
  server.close(() => {
    process.exit(1);
  });
});
