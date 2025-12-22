import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { io, Socket } from "socket.io-client";

interface User {
    _id: string;
    username: string;
    fullname: string;
    avatar: string | null;
    background: string | null;
}

interface Message {
    _id?: string;
    user1: string;
    user2: string;
    content: string;
    sendAt?: string;
}

let socket: Socket;

export const useMessageLogic = () => {
    const { userId: friendId } = useParams(); // sửa tên key cho đồng bộ
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const rawUser = localStorage.getItem('user');
    const currentUser: User | null = rawUser ? JSON.parse(rawUser) : null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [userChoosen, setUserChoosen] = useState<User>();
    const [friendSearch, setFriendSearch] = useState('');

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();

    // 🔌 Kết nối socket
    useEffect(() => {
        if (!currentUser) return;

        socket = io(process.env.BE_URL || "http://localhost:5000");

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
    }, [currentUser]);

    // 📥 Fetch all users
    useEffect(() => {
        axios.get(`${process.env.BE_URL}/api/users`)
            .then(response => {
                const users: User[] = response.data;
                const filtered = currentUser
                    ? users.filter(u => u._id !== currentUser._id)
                    : users;
                setAllUsers(filtered);
            })
            .catch(error => console.error("Error: ", error));
    }, []);

    // ✅ Auto chọn friend từ URL
    useEffect(() => {
        if (friendId && allUsers.length > 0) {
            const found = allUsers.find(user => user._id === friendId);
            if (found) {
                setUserChoosen(found);
                fetchMessages(found._id);
            }
        }
    }, [friendId, allUsers]);

    const fetchMessages = (friendId: string) => {
        if (!currentUser) return;
        axios.get(`${process.env.BE_URL}/api/messages/${currentUser._id}/${friendId}`)
            .then(res => {
                setMessages(res.data.data);
                scrollToBottom();
            })
            .catch(err => console.error("Error fetching messages:", err));
    };

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
        axios.post(`${process.env.BE_URL}/api/messages/send`, newMessage)
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

    const handleAvaClick = (user: User) =>{
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
