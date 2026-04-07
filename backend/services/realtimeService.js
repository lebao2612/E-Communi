const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const VALID_CALL_TYPES = new Set(['audio', 'video']);

const isValidObjectId = (value) => {
    if (typeof value !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(value);
};

const emitPayloadError = (socket, event, reason) => {
    socket.emit('payload_error', { event, reason });
    console.warn(`⚠️ Invalid payload for ${event}: ${reason}`);
};

const extractSocketToken = (socket) => {
    const authToken = socket.handshake?.auth?.token;
    if (authToken) {
        return String(authToken).replace(/^Bearer\s+/i, '').trim();
    }

    const authHeader = socket.handshake?.headers?.authorization;
    if (authHeader) {
        return String(authHeader).replace(/^Bearer\s+/i, '').trim();
    }

    return null;
};

const initRealtimeServices = ({ app, server, allowedOrigins }) => {
    // Mount PeerJS server under /peerjs for WebRTC peer signaling.
    const peerServer = ExpressPeerServer(server, {
        debug: true,
        path: '/'
    });
    app.use('/peerjs', peerServer);

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
        }
    });

    io.use((socket, next) => {
        const token = extractSocketToken(socket);

        if (!token) {
            return next(new Error('Authentication error: token missing'));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err || !payload?.userId) {
                return next(new Error('Authentication error: invalid token'));
            }

            socket.userId = String(payload.userId);
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);
        socket.join(socket.userId);
        console.log(`✅ Authenticated user ${socket.userId} joined their room`);

        socket.on('join', () => {
            // Keep backward compatibility with existing FE flow.
            socket.join(socket.userId);
            console.log(`✅ User ${socket.userId} joined their room`);
        });

        socket.on('sendMessage', (message) => {
            const { receiverId } = message;
            if (!isValidObjectId(receiverId)) {
                emitPayloadError(socket, 'sendMessage', 'receiverId is invalid');
                return;
            }

            io.to(receiverId).emit('receiveMessage', message);
            console.log(`📨 Message sent to ${receiverId}`);
        });

        socket.on('request_call', (data) => {
            const receiverId = data?.receiverId;
            const type = data?.type;

            if (!isValidObjectId(receiverId)) {
                emitPayloadError(socket, 'request_call', 'receiverId is invalid');
                return;
            }

            if (receiverId === socket.userId) {
                emitPayloadError(socket, 'request_call', 'cannot call yourself');
                return;
            }

            if (!VALID_CALL_TYPES.has(type)) {
                emitPayloadError(socket, 'request_call', 'type must be audio or video');
                return;
            }

            const payload = {
                ...data,
                receiverId,
                type,
                callerId: socket.userId,
            };
            io.to(payload.receiverId).emit('incoming_call', payload);
            console.log(`📞 Call requested from ${payload.callerId} to ${payload.receiverId}`);
        });

        socket.on('accept_call', (data) => {
            const callerId = data?.callerId;
            if (!isValidObjectId(callerId)) {
                emitPayloadError(socket, 'accept_call', 'callerId is invalid');
                return;
            }

            const payload = {
                ...data,
                callerId,
                receiverId: socket.userId,
            };

            io.to(callerId).emit('call_accepted', payload);
            console.log(`✅ Call accepted from ${payload.receiverId} by ${callerId}`);
        });

        socket.on('reject_call', (data) => {
            const callerId = data?.callerId;
            if (!isValidObjectId(callerId)) {
                emitPayloadError(socket, 'reject_call', 'callerId is invalid');
                return;
            }

            const payload = {
                ...data,
                callerId,
                receiverId: socket.userId,
            };

            io.to(callerId).emit('call_rejected', payload);
            console.log(`❌ Call rejected from ${payload.receiverId} by ${callerId}`);
        });

        socket.on('end_call', (data) => {
            const toUserId = data?.toUserId;
            if (!isValidObjectId(toUserId)) {
                emitPayloadError(socket, 'end_call', 'toUserId is invalid');
                return;
            }

            io.to(toUserId).emit('call_ended', { by: socket.userId });
            console.log(`🛑 Call ended for ${toUserId}`);
        });

        socket.on('disconnect', () => {
            console.log('❌ User disconnected');
        });
    });

    return io;
};

module.exports = {
    initRealtimeServices,
};
