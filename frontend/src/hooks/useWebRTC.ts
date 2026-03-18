import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer, { MediaConnection } from 'peerjs';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

export interface CallData {
    callerId: string;
    callerName: string;
    callerAvatar: string;
    receiverId: string;
    type: 'audio' | 'video';
}

export const useWebRTC = () => {
    const { user: currentUser } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [peer, setPeer] = useState<Peer | null>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const [receivingCall, setReceivingCall] = useState(false);
    const [callerEnv, setCallerEnv] = useState<CallData | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);

    // Lưu lại thông tin đối tác đang gọi điện để dễ dàng gửi event kết thúc
    const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Thử trích xuất port và host từ API_URL
    const urlObj = new URL(API_URL);
    const peerHost = urlObj.hostname;
    const peerPort = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80);

    const currentCall = useRef<MediaConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // Initialize Socket and Peer
    useEffect(() => {
        if (!currentUser) return;

        const newSocket = io(API_URL);
        setSocket(newSocket);

        // Join room
        newSocket.emit('join', currentUser._id);

        const newPeer = new Peer(currentUser._id, {
            host: peerHost,
            port: peerPort,
            path: '/peerjs',
        });
        setPeer(newPeer);

        // --- SOCKET EVENTS ---
        newSocket.on('incoming_call', (data: CallData) => {
            setReceivingCall(true);
            setCallerEnv(data);
            setCurrentPartnerId(data.callerId);
        });

        newSocket.on('call_rejected', () => {
            endCallLocally();
        });

        newSocket.on('call_ended', () => {
            endCallLocally();
        });

        // --- PEER EVENTS ---
        newPeer.on('call', (call) => {
            currentCall.current = call;

            // Nếu đã bấm accept_call (có local stream), thì tự động answer
            if (localStreamRef.current) {
                call.answer(localStreamRef.current);
            } else {
                // Nếu chưa có local stream (user chưa kip bấm answer) ta buộc phải tạm thời gọi answer(undefined) và set thủ công sau?
                // Tuy nhiên theo flow thiết kế, 'accept_call' được bấm -> lấy stream -> mới báo Caller gọi -> call.answer là LUÔN có stream.
            }

            call.on('stream', (userVideoStream) => {
                setRemoteStream(userVideoStream);
            });
            call.on('close', () => {
                endCallLocally();
            });
        });

        return () => {
            newSocket.disconnect();
            newPeer.destroy();
        };
    }, [currentUser, API_URL, peerHost, peerPort]);

    const getMedia = useCallback(async (video: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream; // Cập nhật ref để dùng ngay trong event callback
            return stream;
        } catch (err) {
            console.error("Failed to get media", err);
            return null;
        }
    }, []);

    const callUser = async (receiver: User, type: 'audio' | 'video') => {
        if (!currentUser || !socket || !peer) return;

        const stream = await getMedia(type === 'video');
        if (!stream) return;

        setCurrentPartnerId(receiver._id);

        socket.emit('request_call', {
            callerId: currentUser._id,
            callerName: currentUser.fullname,
            callerAvatar: currentUser.avatar || '',
            receiverId: receiver._id,
            type
        });

        socket.on('call_accepted', () => {
            setCallAccepted(true);
            const call = peer.call(receiver._id, stream);
            currentCall.current = call;

            call.on('stream', (userVideoStream) => {
                setRemoteStream(userVideoStream);
            });

            call.on('close', () => {
                endCallLocally();
            });

            // Cleanup event listener to prevent duplicate triggers
            socket.off('call_accepted');
        });
    };

    const answerCall = async () => {
        if (!callerEnv || !socket) return;

        const stream = await getMedia(callerEnv.type === 'video');
        if (!stream) return;

        setCallAccepted(true);

        socket.emit('accept_call', {
            callerId: callerEnv.callerId,
            receiverId: currentUser?._id
        });
    };

    const rejectCall = () => {
        if (!callerEnv || !socket || !currentUser) return;
        socket.emit('reject_call', {
            callerId: callerEnv.callerId,
            receiverId: currentUser._id
        });
        endCallLocally();
    };

    const leaveCall = () => {
        if (!socket || !currentPartnerId) return;

        socket.emit('end_call', {
            toUserId: currentPartnerId
        });
        endCallLocally();
    };

    const endCallLocally = () => {
        setReceivingCall(false);
        setCallAccepted(false);
        setCallerEnv(null);
        setCurrentPartnerId(null);

        if (currentCall.current) {
            currentCall.current.close();
            currentCall.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            // trigger re-render để cập nhật UI nếu muốn (vì object stream mutate)
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
    };

    return {
        localStream,
        remoteStream,
        receivingCall,
        callerEnv,
        callAccepted,
        callUser,
        answerCall,
        rejectCall,
        leaveCall,
        toggleAudio,
        toggleVideo
    };
};
