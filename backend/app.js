const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

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

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is missing')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err.message)
    process.exit(1)
  })

// Sử dụng route
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const webrtcRoutes = require('./routes/webrtcRoutes');
const uploadTestRoutes = require('./routes/uploadTest');

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/webrtc', webrtcRoutes);

app.use('/api/test', uploadTestRoutes);

module.exports = app;
