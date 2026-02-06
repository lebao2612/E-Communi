import { useState, useRef, useEffect, ChangeEvent, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import api from "../api/axios";
import { User } from '../types/user';
import { Message } from '../types/message';

let socket: Socket;

export const useMessageLogic = () => {

    const API_URL = useMemo(
        () => process.env.REACT_APP_API_URL || "http://localhost:5000",
        []
    );


    const { userId: friendId } = useParams(); // sửa tên key cho đồng bộ
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [userChoosen, setUserChoosen] = useState<User>();
    const [friendSearch, setFriendSearch] = useState('');

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();

    const fetchMessages = useCallback((friendId: string) => {
        if (!currentUser) return;

        api.get(`/api/messages/${currentUser._id}/${friendId}`)
            .then(res => {
                setMessages(res.data.data);
                scrollToBottom();
            })
            .catch(err => console.error("Error fetching messages:", err));
    }, [currentUser]);


    useEffect(() => {
        api.get('/api/users/me')
            .then(res => setCurrentUser(res.data))
            .catch(() => navigate('/login'));
    }, [navigate]);

    // 🔌 Kết nối socket
    useEffect(() => {
        if (!currentUser) return;

        socket = io(API_URL);

        socket.emit("join", currentUser._id);

        socket.on("receiveMessage", (message: Message) => {
            if (
                message.user1 === currentUser._id ||
                message.user2 === currentUser._id
            ) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser, API_URL]);

    // 📥 Fetch all users
    useEffect(() => {
        if (!currentUser) return;

        api.get('/api/users')
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
            fetchMessages(found._id);
        }
    }, [friendId, allUsers, currentUser, fetchMessages]);


    const handleChooseFriend = (friend: User) => {
        window.history.pushState({}, "", `/message/${friend._id}`);
        setUserChoosen(friend);
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
                scrollToBottom();
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

    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return {
        currentUser,
        allUsers,
        messages,
        inputText,
        setInputText,
        userChoosen,
        friendSearch,
        handleChooseFriend,
        handleSendMessage,
        handleSearchFriend,
        handleAvaClick,
        filterFriends,
        chatEndRef
    };
};
