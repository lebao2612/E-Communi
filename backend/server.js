const http = require('http'); // cần module này để tạo HTTP server
const app = require('./app');
const { Server } = require('socket.io');

const server = http.createServer(app); // tạo server từ express app

const allowedOrigins = [
  "http://localhost:3000",      // dev
  "https://ecommunity-frontend.s3.amazonaws.com",
  "http://ecommunity-frontend.s3-website-ap-southeast-1.amazonaws.com",   // production
  "https://dsbzempbthi3k.cloudfront.net"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  }
});

// Bắt sự kiện kết nối từ client
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId); // mỗi user join vào 1 room riêng
    console.log(`✅ User ${userId} joined their room`);
  });

  socket.on('sendMessage', (message) => {
    const { receiverId } = message;
    io.to(receiverId).emit('receiveMessage', message); // gửi cho người nhận
    console.log(`📨 Message sent to ${receiverId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
