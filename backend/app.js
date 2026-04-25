const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ecommunity-frontend.s3.amazonaws.com",
  "http://ecommunity-frontend.s3-website-ap-southeast-1.amazonaws.com",
  "https://dsbzempbthi3k.cloudfront.net",
  "https://d2a111o6b1tvez.cloudfront.net",
  process.env.FE_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


app.use(express.json());

// Sử dụng route
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const webrtcRoutes = require('./routes/webrtcRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/webrtc', webrtcRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);

module.exports = app;
