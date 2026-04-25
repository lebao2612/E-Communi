const http = require('http'); // cần module này để tạo HTTP server
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { initRealtimeServices } = require('./services/realtimeService');
const { connectDatabase } = require('./config/database');

const server = http.createServer(app); // tạo server từ express app

const allowedOrigins = [
  "http://localhost:3000",      // dev
  "https://ecommunity-frontend.s3.amazonaws.com",
  "http://ecommunity-frontend.s3-website-ap-southeast-1.amazonaws.com",   // production
  "https://dsbzempbthi3k.cloudfront.net",
  "https://d2a111o6b1tvez.cloudfront.net",
  process.env.FE_URL,
].filter(Boolean);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    initRealtimeServices({ app, server, allowedOrigins });

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server bootstrap failed:', error.message);
    process.exit(1);
  }
};

startServer();
