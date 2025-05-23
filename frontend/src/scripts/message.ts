// src/components/Message/scripts/useMessageLogic.ts

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import images from '../assets/images';
import { Friend } from '../types/friend';
import axios from 'axios';

interface User{
    id: number;
    username: string;
    name: string;
    avatar: string | null;
    background: string | null;
}

export const useMessageLogic = () => {

    const [allUsers, getAllUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3001/users")
             .then(response => {
                getAllUsers(response.data);
             })
             .catch(error => {
                console.log("Error: ", error);
             })

    }, [])

    // const friendList: Friend[] = [
    //     { id: 1, name: 'Lee Hyeri', image: images.avaFriend },
    //     { id: 2, name: 'Seul Gi', image: images.avaFriend },
    //     { id: 3, name: 'Jae Ji', image: images.avaFriend },
    // ];

    const [messages, setMessages] = useState([
        { id: 1, content: 'Dm cuoc doi', idSender: 1, idReceiver: 2, time: 1 },
        { id: 2, content: 'Fuck', idSender: 2, idReceiver: 1, time: 2 },
        { id: 3, content: 'Toi rat ghet ban', idSender: 1, idReceiver: 2, time: 3 },
        { id: 4, content: 'Con toi thi van luon thich ban', idSender: 2, idReceiver: 1, time: 4 },
        { id: 5, content: 'Neu co the quay lai', idSender: 1, idReceiver: 2, time: 5 },
        { id: 6, content: 'Toi van thich ban', idSender: 2, idReceiver: 1, time: 6 },
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
            idSender: 1,
            idReceiver: 2,
            time: Date.now()
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    const handleSearchFriend = (e: ChangeEvent<HTMLInputElement>) => {
        setFriendSearch(e.target.value);
    };

    const filterFriends = allUsers.filter((friend) =>
        friend.name.toLowerCase().includes(friendSearch.toLowerCase())
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
