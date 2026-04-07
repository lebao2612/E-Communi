import { useState, useRef, useEffect, ChangeEvent, useMemo, useCallback, UIEvent } from 'react';
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import api from "../api/axios";
import { User } from '../types/user';
import { Message } from '../types/message';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

let socket: Socket;
const PAGE_SIZE = 20;

export const useMessageLogic = () => {

    const API_URL = useMemo(
        () => process.env.REACT_APP_API_URL || "http://localhost:5000",
        []
    );

    const navigate = useNavigate();


    const { userId: friendId } = useParams(); // sửa tên key cho đồng bộ
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const { user: currentUser } = useAuth(); // Retrieve global current user

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [userChoosen, setUserChoosen] = useState<User>();
    const [friendSearch, setFriendSearch] = useState('');
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const isFetchingMessagesRef = useRef(false);
    const nextCursorRef = useRef<string | null>(null);
    const activeFriendIdRef = useRef<string | null>(null);


    const fetchMessages = useCallback(async (friendId: string) => {
        if (!currentUser) return;

        try {
            isFetchingMessagesRef.current = true;
            setIsLoadingOlderMessages(false);
            setHasMoreMessages(true);

            const res = await api.get(`/api/messages/${currentUser._id}/${friendId}?limit=${PAGE_SIZE}`);
            const initialMessages: Message[] = res.data.data || [];
            const nextCursor = res.data?.pagination?.nextCursor || null;
            const hasMore = Boolean(res.data?.pagination?.hasMore);

            setMessages(initialMessages);
            nextCursorRef.current = nextCursor;
            setHasMoreMessages(hasMore);

            requestAnimationFrame(() => {
                scrollToBottom(false);
            });
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            isFetchingMessagesRef.current = false;
        }
    }, [currentUser]);

    const loadOlderMessages = useCallback(async () => {
        if (!currentUser || !activeFriendIdRef.current || !nextCursorRef.current) return;
        if (isFetchingMessagesRef.current || !hasMoreMessages) return;

        const container = chatContainerRef.current;
        if (!container) return;

        try {
            isFetchingMessagesRef.current = true;
            setIsLoadingOlderMessages(true);

            const previousScrollHeight = container.scrollHeight;
            const previousScrollTop = container.scrollTop;

            const res = await api.get(
                `/api/messages/${currentUser._id}/${activeFriendIdRef.current}?limit=${PAGE_SIZE}&before=${nextCursorRef.current}`
            );

            const olderMessages: Message[] = res.data.data || [];
            const nextCursor = res.data?.pagination?.nextCursor || null;
            const hasMore = Boolean(res.data?.pagination?.hasMore);

            if (olderMessages.length > 0) {
                setMessages(prev => [...olderMessages, ...prev]);

                requestAnimationFrame(() => {
                    if (!chatContainerRef.current) return;
                    const newScrollHeight = chatContainerRef.current.scrollHeight;
                    chatContainerRef.current.scrollTop = (newScrollHeight - previousScrollHeight) + previousScrollTop;
                });
            }

            nextCursorRef.current = nextCursor;
            setHasMoreMessages(hasMore && olderMessages.length > 0);
        } catch (err) {
            console.error("Error loading older messages:", err);
        } finally {
            setIsLoadingOlderMessages(false);
            isFetchingMessagesRef.current = false;
        }
    }, [currentUser, hasMoreMessages]);

    const handleChatScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollTop <= 20) {
            loadOlderMessages();
        }
    }, [loadOlderMessages]);


    // 🔌 Kết nối socket
    useEffect(() => {
        if (!currentUser) return;

        socket = io(API_URL);

        socket.emit("join", currentUser._id);

        socket.on("receiveMessage", (message: Message) => {
            const activeFriendId = activeFriendIdRef.current;
            const inCurrentConversation = Boolean(
                activeFriendId &&
                ((message.user1 === currentUser._id && message.user2 === activeFriendId) ||
                    (message.user2 === currentUser._id && message.user1 === activeFriendId))
            );

            if (inCurrentConversation) {
                setMessages(prev => [...prev, message]);
                requestAnimationFrame(() => {
                    scrollToBottom();
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser, API_URL]);

    // 📥 Fetch all users
    useEffect(() => {
        if (!currentUser) return;

        api.get('/api/users/getAllUsers')
            .then(response => {
                const users: User[] = response.data;
                setAllUsers(users.filter(u => u._id !== currentUser._id));
            })
            .catch(console.error);
    }, [currentUser]);

    // ✅ Auto chọn friend từ URL
    useEffect(() => {
        if (!friendId || !currentUser || allUsers.length === 0) return;

        const found = allUsers.find(user => user._id === friendId);
        if (found) {
            setUserChoosen(found);
            activeFriendIdRef.current = found._id;
            fetchMessages(found._id);
        }
    }, [friendId, allUsers, currentUser, fetchMessages]);


    const handleChooseFriend = (friend: User) => {
        window.history.pushState({}, "", `/message/${friend._id}`);
        setUserChoosen(friend);
        activeFriendIdRef.current = friend._id;
        fetchMessages(friend._id);
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !userChoosen || !currentUser) return;

        const newMessage: Message = {
            user1: currentUser._id,
            user2: userChoosen._id,
            content: inputText.trim(),
        };

        // Gửi lên server
        api.post('/api/messages/send', newMessage)
            .then(res => {
                const savedMessage = res.data.data;
                setMessages(prev => [...prev, savedMessage]);

                // Gửi socket tới người nhận
                socket.emit("sendMessage", {
                    ...savedMessage,
                    receiverId: userChoosen._id,
                });

                setInputText('');
                requestAnimationFrame(() => {
                    scrollToBottom();
                });
            });
    };

    const handleSearchFriend = (e: ChangeEvent<HTMLInputElement>) => {
        setFriendSearch(e.target.value);
    };

    const handleAvaClick = (user: User) => {
        navigate(`/${user.username}`);
    }

    const filterFriends = allUsers.filter(friend =>
        friend.fullname.toLowerCase().includes(friendSearch.toLowerCase())
    );

    const scrollToBottom = (smooth = true) => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        }
    };

    useEffect(() => {
        activeFriendIdRef.current = userChoosen?._id || null;
    }, [userChoosen]);

    return {
        currentUser,
        allUsers,
        messages,
        inputText,
        setInputText,
        userChoosen,
        friendSearch,
        isLoadingOlderMessages,
        hasMoreMessages,
        handleChooseFriend,
        handleSendMessage,
        handleSearchFriend,
        handleAvaClick,
        handleChatScroll,
        filterFriends,
        chatContainerRef,
        chatEndRef
    };
};
