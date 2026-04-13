import { useRef, useEffect, ChangeEvent, useMemo, useCallback, UIEvent } from 'react';
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { User } from '../types/user';
import { Message } from '../types/message';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMessageStore } from '../stores/messageStore';
import { useRealtimeStore } from '../stores/realtimeStore';

const PAGE_SIZE = 20;

export const useMessageLogic = () => {
    const navigate = useNavigate();


    const { userId: friendId } = useParams(); // sửa tên key cho đồng bộ
    const { user: currentUser } = useAuth(); // Retrieve global current user
    const socket = useRealtimeStore((state) => state.socket);

    const allUsers = useMessageStore((state) => state.allUsers);
    const selectedFriendId = useMessageStore((state) => state.selectedFriendId);
    const messagesByFriendId = useMessageStore((state) => state.messagesByFriendId);
    const hasMoreByFriendId = useMessageStore((state) => state.hasMoreByFriendId);
    const loadingOlderByFriendId = useMessageStore((state) => state.loadingOlderByFriendId);
    const inputText = useMessageStore((state) => state.inputText);
    const friendSearch = useMessageStore((state) => state.friendSearch);
    const setAllUsers = useMessageStore((state) => state.setAllUsers);
    const setSelectedFriendId = useMessageStore((state) => state.setSelectedFriendId);
    const setInputText = useMessageStore((state) => state.setInputText);
    const setFriendSearch = useMessageStore((state) => state.setFriendSearch);
    const setConversation = useMessageStore((state) => state.setConversation);
    const appendMessage = useMessageStore((state) => state.appendMessage);
    const prependOlderMessages = useMessageStore((state) => state.prependOlderMessages);
    const setLoadingOlder = useMessageStore((state) => state.setLoadingOlder);

    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const isFetchingMessagesRef = useRef(false);
    const activeFriendIdRef = useRef<string | null>(null);
    const shouldAutoScrollRef = useRef(false);
    const scrollBehaviorRef = useRef<'auto' | 'smooth'>('smooth');

    const userChoosen = useMemo(
        () => allUsers.find((user) => user._id === selectedFriendId),
        [allUsers, selectedFriendId]
    );
    const messages = useMemo(
        () => (selectedFriendId ? (messagesByFriendId[selectedFriendId] || []) : []),
        [selectedFriendId, messagesByFriendId]
    );
    const isLoadingOlderMessages = selectedFriendId ? Boolean(loadingOlderByFriendId[selectedFriendId]) : false;
    const hasMoreMessages = selectedFriendId ? (hasMoreByFriendId[selectedFriendId] ?? true) : true;

    const scrollToBottom = useCallback((smooth = true) => {
        const container = chatContainerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, []);


    const fetchMessages = useCallback(async (friendId: string, force = false) => {
        if (!currentUser) return;

        const cachedMessages = useMessageStore.getState().messagesByFriendId[friendId] || [];
        if (!force && cachedMessages.length > 0) {
            return;
        }

        try {
            isFetchingMessagesRef.current = true;
            setLoadingOlder(friendId, false);

            const res = await api.get(`/api/messages/${currentUser._id}/${friendId}?limit=${PAGE_SIZE}`);
            const initialMessages: Message[] = res.data.data || [];
            const nextCursor = res.data?.pagination?.nextCursor || null;
            const hasMore = Boolean(res.data?.pagination?.hasMore);

            setConversation(friendId, initialMessages, nextCursor, hasMore);
            shouldAutoScrollRef.current = true;
            scrollBehaviorRef.current = 'auto';
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            isFetchingMessagesRef.current = false;
        }
    }, [currentUser, setConversation, setLoadingOlder]);

    const loadOlderMessages = useCallback(async () => {
        const activeFriendId = activeFriendIdRef.current;
        if (!currentUser || !activeFriendId) return;

        const nextCursor = useMessageStore.getState().nextCursorByFriendId[activeFriendId];
        const canLoadMore = useMessageStore.getState().hasMoreByFriendId[activeFriendId] ?? true;

        if (!nextCursor || isFetchingMessagesRef.current || !canLoadMore) return;

        const container = chatContainerRef.current;
        if (!container) return;

        try {
            isFetchingMessagesRef.current = true;
            setLoadingOlder(activeFriendId, true);

            const previousScrollHeight = container.scrollHeight;
            const previousScrollTop = container.scrollTop;

            const res = await api.get(
                `/api/messages/${currentUser._id}/${activeFriendId}?limit=${PAGE_SIZE}&before=${nextCursor}`
            );

            const olderMessages: Message[] = res.data.data || [];
            const nextCursorValue = res.data?.pagination?.nextCursor || null;
            const hasMoreValue = Boolean(res.data?.pagination?.hasMore);

            if (olderMessages.length > 0) {
                prependOlderMessages(activeFriendId, olderMessages, nextCursorValue, hasMoreValue && olderMessages.length > 0);

                requestAnimationFrame(() => {
                    if (!chatContainerRef.current) return;
                    const newScrollHeight = chatContainerRef.current.scrollHeight;
                    chatContainerRef.current.scrollTop = (newScrollHeight - previousScrollHeight) + previousScrollTop;
                });
            } else {
                prependOlderMessages(activeFriendId, [], nextCursorValue, false);
            }
        } catch (err) {
            console.error("Error loading older messages:", err);
        } finally {
            setLoadingOlder(activeFriendId, false);
            isFetchingMessagesRef.current = false;
        }
    }, [currentUser, prependOlderMessages, setLoadingOlder]);

    const handleChatScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollTop <= 20) {
            loadOlderMessages();
        }
    }, [loadOlderMessages]);


    useEffect(() => {
        if (!currentUser || !socket) return;

        const handleReceiveMessage = (message: Message) => {
            const activeFriendId = activeFriendIdRef.current;
            const inCurrentConversation = Boolean(
                activeFriendId &&
                ((message.user1 === currentUser._id && message.user2 === activeFriendId) ||
                    (message.user2 === currentUser._id && message.user1 === activeFriendId))
            );

            const conversationFriendId = message.user1 === currentUser._id ? message.user2 : message.user1;
            appendMessage(conversationFriendId, message);

            if (inCurrentConversation) {
                shouldAutoScrollRef.current = true;
                scrollBehaviorRef.current = 'smooth';
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [currentUser, socket, appendMessage]);

    // 📥 Fetch all users
    useEffect(() => {
        if (!currentUser) return;

        api.get('/api/users/getAllUsers')
            .then(response => {
                const users: User[] = response.data;
                setAllUsers(users.filter(u => u._id !== currentUser._id));
            })
            .catch(console.error);
    }, [currentUser, setAllUsers]);

    // ✅ Auto chọn friend từ URL
    useEffect(() => {
        if (!friendId || !currentUser || allUsers.length === 0) return;

        const found = allUsers.find(user => user._id === friendId);
        if (found) {
            setSelectedFriendId(found._id);
            fetchMessages(found._id);
        }
    }, [friendId, allUsers, currentUser, fetchMessages, setSelectedFriendId]);


    const handleChooseFriend = (friend: User) => {
        window.history.pushState({}, "", `/message/${friend._id}`);
        setSelectedFriendId(friend._id);
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
                appendMessage(userChoosen._id, savedMessage);

                // Gửi socket tới người nhận
                if (socket) {
                    socket.emit("sendMessage", {
                        ...savedMessage,
                        receiverId: userChoosen._id,
                    });
                }

                setInputText('');
                shouldAutoScrollRef.current = true;
                scrollBehaviorRef.current = 'smooth';
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

    useEffect(() => {
        if (!shouldAutoScrollRef.current) return;

        requestAnimationFrame(() => {
            scrollToBottom(scrollBehaviorRef.current === 'smooth');
            shouldAutoScrollRef.current = false;
        });
    }, [messages, scrollToBottom]);

    useEffect(() => {
        activeFriendIdRef.current = selectedFriendId;
    }, [selectedFriendId]);

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
