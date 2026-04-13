import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Post from "../../components/Post/Post";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchStore } from "../../stores/searchStore";
import "./Search.scss";

const Search = () => {
    const { user: currentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const searchTerm = useSearchStore((state) => state.query);
    const activeTab = useSearchStore((state) => state.activeTab);
    const users = useSearchStore((state) => state.users);
    const posts = useSearchStore((state) => state.posts);
    const loading = useSearchStore((state) => state.loading);
    const setQuery = useSearchStore((state) => state.setQuery);
    const setActiveTab = useSearchStore((state) => state.setActiveTab);
    const fetchAllResults = useSearchStore((state) => state.fetchAllResults);
    const clearResults = useSearchStore((state) => state.clearResults);
    const addRecentSearch = useSearchStore((state) => state.addRecentSearch);

    useEffect(() => {
        const query = searchParams.get("q");
        if (query !== null && query !== searchTerm) {
            setQuery(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        if (initialQuery && initialQuery !== searchTerm) {
            setQuery(initialQuery);
        }
    }, [initialQuery, searchTerm, setQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!debouncedSearchTerm.trim()) {
            clearResults();
            return;
        }

        addRecentSearch(debouncedSearchTerm);
        void fetchAllResults(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchAllResults, clearResults, addRecentSearch]);

    return (
        <div className="search-page-container">
            <div className="search-header">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search E-Community..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoFocus
                />
            </div>

            <div className="search-tabs">
                <button
                    className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                >
                    Posts
                </button>
            </div>

            <div className="search-results">
                {loading && <div className="loading-spinner">Searching...</div>}

                {!loading && debouncedSearchTerm && (
                    <>
                        {activeTab === "users" && (
                            <div className="users-list">
                                {users.length === 0 ? (
                                    <p className="no-results">No users found for "{debouncedSearchTerm}"</p>
                                ) : (
                                    users.map((user) => (
                                        <div key={user._id} className="user-card">
                                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                                            <div className="user-info">
                                                <Link to={`/${user.username}`} className="user-name">
                                                    {user.fullname}
                                                </Link>
                                                <p className="user-username">@{user.username}</p>
                                                <p className="user-bio">{user.bio}</p>
                                            </div>
                                            <button className="follow-btn">View Profile</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "posts" && (
                            <div className="posts-list">
                                {posts.length === 0 ? (
                                    <p className="no-results">No posts found for "{debouncedSearchTerm}"</p>
                                ) : (
                                    posts.map((post) => (
                                        <Post
                                            key={post._id}
                                            post={post}
                                            currentUserAvatar={currentUser?.avatar}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {!loading && !debouncedSearchTerm && (
                    <div className="search-empty-state">
                        <p>Type to start searching for users and posts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
