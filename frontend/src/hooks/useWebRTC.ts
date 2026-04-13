import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { getAccessToken } from '../api/axios';
import { CallData, useWebRTCStore } from '../stores/webrtcStore';
import { useRealtimeStore } from '../stores/realtimeStore';

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

const isValidIceServer = (value: unknown): value is RTCIceServer => {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as RTCIceServer;
    if (!candidate.urls) return false;

    return typeof candidate.urls === 'string' || Array.isArray(candidate.urls);
};

const parseIceServers = (): RTCIceServer[] => {
    const raw = process.env.REACT_APP_WEBRTC_ICE_SERVERS;
    if (!raw) return DEFAULT_ICE_SERVERS;

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_ICE_SERVERS;

        const validIceServers = parsed.filter(isValidIceServer);
        return validIceServers.length > 0 ? validIceServers : DEFAULT_ICE_SERVERS;
    } catch (error) {
        console.warn('Invalid REACT_APP_WEBRTC_ICE_SERVERS format. Falling back to default STUN servers.');
        return DEFAULT_ICE_SERVERS;
    }
};

const getTwilioIceServers = async (apiUrl: string, accessToken: string): Promise<RTCIceServer[] | null> => {
    try {
        const response = await fetch(`${apiUrl}/api/webrtc/ice-servers`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!Array.isArray(data?.iceServers)) {
            return null;
        }

        const validIceServers = data.iceServers.filter(isValidIceServer);
        return validIceServers.length > 0 ? validIceServers : null;
    } catch (error) {
        console.warn('Failed to load Twilio ICE servers. Falling back to local ICE config.');
        return null;
    }
};

export const useWebRTC = () => {
    const { user: currentUser } = useAuth();
    const socket = useRealtimeStore((state) => state.socket);
    const [peer, setPeer] = useState<Peer | null>(null);

    const localStream = useWebRTCStore((state) => state.localStream);
    const remoteStream = useWebRTCStore((state) => state.remoteStream);
    const receivingCall = useWebRTCStore((state) => state.receivingCall);
    const callerEnv = useWebRTCStore((state) => state.callerEnv);
    const callAccepted = useWebRTCStore((state) => state.callAccepted);
    const currentPartnerId = useWebRTCStore((state) => state.currentPartnerId);
    const setLocalStream = useWebRTCStore((state) => state.setLocalStream);
    const setRemoteStream = useWebRTCStore((state) => state.setRemoteStream);
    const setIncomingCall = useWebRTCStore((state) => state.setIncomingCall);
    const setCallAccepted = useWebRTCStore((state) => state.setCallAccepted);
    const setCurrentPartnerId = useWebRTCStore((state) => state.setCurrentPartnerId);
    const resetCallState = useWebRTCStore((state) => state.resetCallState);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Thử trích xuất port và host từ API_URL
    const urlObj = new URL(API_URL);
    const peerHost = urlObj.hostname;
    const peerPort = urlObj.port ? parseInt(urlObj.port, 10) : undefined;
    const isSecureConnection = urlObj.protocol === 'https:';
    const fallbackIceServers = useMemo(() => parseIceServers(), []);

    const currentCall = useRef<MediaConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const endCallLocally = useCallback(() => {
        resetCallState();

        if (currentCall.current) {
            currentCall.current.close();
            currentCall.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    }, [resetCallState]);

    // Initialize Peer
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!currentUser) return;

        const accessToken = getAccessToken();
        if (!accessToken) return;

        let mounted = true;
        let newPeer: Peer | null = null;

        const bootstrapRealtime = async () => {
            const twilioIceServers = await getTwilioIceServers(API_URL, accessToken);
            const activeIceServers = twilioIceServers || fallbackIceServers;

            if (!mounted) return;

            newPeer = new Peer(currentUser._id, {
                host: peerHost,
                ...(peerPort ? { port: peerPort } : {}),
                secure: isSecureConnection,
                path: '/peerjs',
                config: {
                    iceServers: activeIceServers,
                },
            });
            setPeer(newPeer);

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
        };

        bootstrapRealtime();

        return () => {
            mounted = false;
            newPeer?.destroy();
        };
    }, [
        currentUser,
        API_URL,
        peerHost,
        peerPort,
        isSecureConnection,
        fallbackIceServers,
        endCallLocally,
        setRemoteStream,
    ]);

    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (data: CallData) => {
            setIncomingCall(data);
        };

        const handleCallRejected = () => {
            endCallLocally();
        };

        const handleCallEnded = () => {
            endCallLocally();
        };

        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_rejected', handleCallRejected);
        socket.on('call_ended', handleCallEnded);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_rejected', handleCallRejected);
            socket.off('call_ended', handleCallEnded);
        };
    }, [socket, setIncomingCall, endCallLocally]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [setLocalStream]);

    const callUser = async (receiver: User, type: 'audio' | 'video') => {
        if (!currentUser || !socket || !peer) return;

        const stream = await getMedia(type === 'video');
        if (!stream) return;

        setCurrentPartnerId(receiver._id);

        socket.emit('request_call', {
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
        });
    };

    const rejectCall = () => {
        if (!callerEnv || !socket || !currentUser) return;
        socket.emit('reject_call', {
            callerId: callerEnv.callerId,
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
