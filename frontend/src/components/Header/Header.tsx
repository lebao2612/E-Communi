import React, { useState, useEffect, useRef } from "react";
import "./header.scss";
import images from "../../assets/images/index";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

function Header() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch search results
    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedSearchTerm.trim()) {
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                // Focus primarily on Users for the Header dropdown like Facebook
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/search?q=${debouncedSearchTerm}&type=users`
                );

                if (response.data.success) {
                    setUsers(response.data.data.users || []);
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
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
            setIsSearchOpen(false);
            setSearchTerm("");
        }
    };

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
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                            <img src={u.avatar} alt={u.username} className="result-avatar" />
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
                    className={({ isActive }) => `fa-solid fa-message${isActive ? " active" : ""}`}
                ></NavLink>
                <NavLink
                    to="/setting"
                    className={({ isActive }) => `fa-solid fa-gear${isActive ? " active" : ""}`}
                ></NavLink>
            </div>

            <img src={images.avatar} alt="logofill" className="header-avatar" />
        </div>
    )
}

export default Header;