import React, { useState, useEffect, useRef } from "react";
import "./header.scss";
import images from "../../assets/images/index";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import { useSearchStore } from "../../stores/searchStore";
import { useMessageStore } from "../../stores/messageStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { formatTimeAgo } from "../../utils/dateUtils";
import { AppNotification } from "../../types/notification";

function Header() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const searchTerm = useSearchStore((state) => state.query);
    const users = useSearchStore((state) => state.users);
    const loading = useSearchStore((state) => state.loading);
    const setQuery = useSearchStore((state) => state.setQuery);
    const fetchUsersOnly = useSearchStore((state) => state.fetchUsersOnly);
    const addRecentSearch = useSearchStore((state) => state.addRecentSearch);
    
    const unreadCountByFriendId = useMessageStore((state) => state.unreadCountByFriendId);
    
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadNotifCount = useNotificationStore((state) => state.unreadCount);
    const isNotifLoading = useNotificationStore((state) => state.isLoading);
    const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch search results
    useEffect(() => {
        void fetchUsersOnly(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchUsersOnly]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}`);
            addRecentSearch(searchTerm);
            setIsSearchOpen(false);
            setQuery("");
        }
    };

    const handleToggleNotif = () => {
        if (!isNotifOpen) {
            void fetchNotifications();
        }
        setIsNotifOpen(!isNotifOpen);
    };

    const handleNotificationClick = (notif: AppNotification) => {
        if (!notif.read) {
            void markAsRead(notif._id);
        }
        setIsNotifOpen(false);

        if (notif.type === 'follow') {
            navigate(`/${notif.sender.username}`);
        } else if (notif.post) {
            const targetPostId = typeof notif.post === 'object' ? notif.post._id : notif.post;
            navigate(`/post/${targetPostId}`);
        }
    };

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <i className="fa-solid fa-heart icon-like"></i>;
            case 'comment':
                return <i className="fa-solid fa-comment icon-comment"></i>;
            case 'follow':
                return <i className="fa-solid fa-user-plus icon-follow"></i>;
            default:
                return <i className="fa-solid fa-bell icon-default"></i>;
        }
    };

    const getNotifText = (notif: AppNotification) => {
        const senderName = notif.sender?.fullname || notif.sender?.username || 'Một người dùng';
        switch (notif.type) {
            case 'like':
                return <><strong>{senderName}</strong> đã thích bài viết của bạn.</>;
            case 'comment':
                return <><strong>{senderName}</strong> đã bình luận về bài viết của bạn.</>;
            case 'follow':
                return <><strong>{senderName}</strong> đã bắt đầu theo dõi bạn.</>;
            default:
                return <><strong>{senderName}</strong> đã tương tác với bạn.</>;
        }
    };

    const hasUnreadMessages = Object.values(unreadCountByFriendId).some((count) => count > 0);

    return (
        <div className="header">
            <div className="header-left">
                <Link to="/" className="logo-container">
                    <img src={images.logo} alt="Logo" className="home-logo" />
                </Link>

                <div className="search-container" ref={searchRef}>
                    <div className="search-input-wrapper">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search E-Community"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsSearchOpen(true)}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>

                    {isSearchOpen && (searchTerm.trim().length > 0) && (
                        <div className="search-dropdown">
                            {loading && <div className="search-loading">Searching...</div>}

                            {!loading && users.length === 0 && (
                                <div className="search-no-results">No recent searches</div>
                            )}

                            {!loading && users.length > 0 && (
                                <div className="search-results-list">
                                    {users.map((u) => (
                                        <Link
                                            to={`/${u.username}`}
                                            key={u._id}
                                            className="search-result-item"
                                            onClick={() => setIsSearchOpen(false)}
                                        >
                                            <img src={u.avatar || images.avatar} alt={u.username} className="result-avatar" />
                                            <div className="result-info">
                                                <span className="result-name">{u.fullname}</span>
                                                <span className="result-username">@{u.username}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div
                                className="search-footer-link"
                                onClick={() => {
                                    if (searchTerm.trim()) {
                                        navigate(`/search?q=${searchTerm}`);
                                        addRecentSearch(searchTerm);
                                        setIsSearchOpen(false);
                                    }
                                }}
                            >
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Search for "{searchTerm}"</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="nav-list">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `fa-solid fa-house${isActive ? " active" : ""}`}
                ></NavLink>
                <NavLink
                    to={`/${user?.username}`}
                    className={({ isActive }) => `fa-solid fa-user${isActive ? " active" : ""}`}
                ></NavLink>
                <NavLink
                    to="/message"
                    className={({ isActive }) => `nav-icon message-icon${isActive ? " active" : ""}`}
                >
                    <i className="fa-solid fa-message"></i>
                    {hasUnreadMessages && <span className="message-badge"></span>}
                </NavLink>

                {/* Notifications Bell Dropdown */}
                <div className="notification-container" ref={notifRef}>
                    <button
                        className={`nav-icon notification-btn${isNotifOpen ? " active" : ""}`}
                        onClick={handleToggleNotif}
                        title="Thông báo"
                    >
                        <i className="fa-solid fa-bell"></i>
                        {unreadNotifCount > 0 && (
                            <span className="notification-badge">
                                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="notification-dropdown">
                            <div className="notif-header">
                                <h3>Thông báo</h3>
                                {unreadNotifCount > 0 && (
                                    <button className="mark-all-btn" onClick={() => void markAllAsRead()}>
                                        Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                            </div>

                            <div className="notif-list">
                                {isNotifLoading && <div className="notif-loading">Đang tải thông báo...</div>}

                                {!isNotifLoading && notifications.length === 0 && (
                                    <div className="notif-empty">
                                        <i className="fa-regular fa-bell-slash"></i>
                                        <p>Bạn chưa có thông báo nào</p>
                                    </div>
                                )}

                                {!isNotifLoading && notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        className={`notif-item${!n.read ? " unread" : ""}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="notif-avatar-wrapper">
                                            <img
                                                src={n.sender?.avatar || images.avatar}
                                                alt="avatar"
                                                className="notif-avatar"
                                            />
                                            <span className="notif-type-badge">
                                                {getNotifIcon(n.type)}
                                            </span>
                                        </div>

                                        <div className="notif-content">
                                            <p className="notif-text">{getNotifText(n)}</p>
                                            <span className="notif-time">{formatTimeAgo(n.createdAt)}</span>
                                        </div>

                                        {!n.read && <span className="notif-unread-dot"></span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <NavLink
                    to="/setting"
                    className={({ isActive }) => `fa-solid fa-gear${isActive ? " active" : ""}`}
                ></NavLink>
            </div>

            <img
                src={user?.avatar || images.avatar}
                alt="avatar"
                className="header-avatar"
                onClick={() => navigate(`/${user?.username}`)}
                style={{ cursor: "pointer" }}
            />
        </div>
    );
}

export default Header;