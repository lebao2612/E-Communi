// src/components/Message/scripts/useMessageLogic.ts

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import images from '../assets/images';
import { Friend } from '../types/friend';
import axios from 'axios';

interface User{
    _id: number;
    username: string;
    fullname: string;
    avatar: string | null;
    background: string | null;
}

export const useMessageLogic = () => {

    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/users")
            .then(response => {
                //console.log("response.data =", response.data);
                setAllUsers(response.data); // ✅ chính xác
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }, []);

    // const friendList: Friend[] = [
    //     { id: 1, name: 'Lee Hyeri', image: images.avaFriend },
    //     { id: 2, name: 'Seul Gi', image: images.avaFriend },
    //     { id: 3, name: 'Jae Ji', image: images.avaFriend },
    // ];

    const [messages, setMessages] = useState([
        { id: 1, content: 'Dm cuoc doi', idSender: '6877781dac46d7eef1c206d7', idReceiver: '68777cdeac46d7eef1c206dc', time: 1 },
        { id: 2, content: 'Fuck', idSender: '68777cdeac46d7eef1c206dc', idReceiver: '6877781dac46d7eef1c206d7', time: 2 },
        { id: 3, content: 'Toi rat ghet ban', idSender: '6877781dac46d7eef1c206d7', idReceiver: 2, time: 3 },
        { id: 4, content: 'Con toi thi van luon thich ban', idSender: '68777cdeac46d7eef1c206dc', idReceiver: '6877781dac46d7eef1c206d7', time: 4 },
        { id: 5, content: 'Neu co the quay lai', idSender: '6877781dac46d7eef1c206d7', idReceiver: '68777cdeac46d7eef1c206dc', time: 5 },
        { id: 6, content: 'Toi van thich ban', idSender: '68777cdeac46d7eef1c206dc', idReceiver: '6877781dac46d7eef1c206d7', time: 6 },
    ]);

    const [inputText, setInputText] = useState('');
    const [userChoosen, setUserChoosen] = useState<User>();
    const [friendSearch, setFriendSearch] = useState('');

    const handleChooseFriend = (user: User) => {
        setUserChoosen(user);
        console.log("Click");
    };

    const handleSendMessage = () => {
        if (inputText.trim() === '') return;

        const newMessage = {
            id: messages.length + 1,
            content: inputText,
            idSender: '6877781dac46d7eef1c206d7',
            idReceiver: '68777cdeac46d7eef1c206dc',
            time: Date.now()
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    const handleSearchFriend = (e: ChangeEvent<HTMLInputElement>) => {
        setFriendSearch(e.target.value);
    };

    const filterFriends = allUsers.filter((friend) =>
        friend.fullname.toLowerCase().includes(friendSearch.toLowerCase())
    );

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return {
        allUsers,
        messages,
        inputText,
        setInputText,
        userChoosen,
        friendSearch,
        //friendList,
        handleChooseFriend,
        handleSendMessage,
        handleSearchFriend,
        filterFriends,
        chatEndRef
    };
};
