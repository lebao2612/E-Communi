const http = require('http'); // cần module này để tạo HTTP server
const app = require('./app');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

const server = http.createServer(app); // tạo server từ express app

const allowedOrigins = [
  "http://localhost:3000",      // dev
  "https://ecommunity-frontend.s3.amazonaws.com",
  "http://ecommunity-frontend.s3-website-ap-southeast-1.amazonaws.com",   // production
  "https://dsbzempbthi3k.cloudfront.net"
];

// Tích hợp PeerJS Server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});
app.use('/peerjs', peerServer);

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

  // WebRTC Signaling Events
  socket.on('request_call', (data) => {
    // data: { receiverId, callerId, callerName, callerAvatar, type }
    io.to(data.receiverId).emit('incoming_call', data);
    console.log(`📞 Call requested from ${data.callerId} to ${data.receiverId}`);
  });

  socket.on('accept_call', (data) => {
    // data: { callerId, receiverId }
    io.to(data.callerId).emit('call_accepted', data);
    console.log(`✅ Call accepted from ${data.receiverId} by ${data.callerId}`);
  });

  socket.on('reject_call', (data) => {
    // data: { callerId, receiverId }
    io.to(data.callerId).emit('call_rejected', data);
    console.log(`❌ Call rejected from ${data.receiverId} by ${data.callerId}`);
  });

  socket.on('end_call', (data) => {
    // data: { toUserId }
    io.to(data.toUserId).emit('call_ended');
    console.log(`🛑 Call ended for ${data.toUserId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
