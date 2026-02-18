import "./header.scss";
import images from "../../assets/images/index";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

interface User {
    _id: string;
    fullname?: string;
    username: string;
    email?: string;
    createdAt?: string;
    avatar?: string;
}

function Header() {

    const [user, setUser] = useState<User | null>(null);
    const { isLoggedIn, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading || !isLoggedIn) return;

        api.get('/api/users/me')
            .then(res => setUser(res.data))
            .catch(err => {
                console.error('Error fetching user in Header:', err.response?.data);
                setUser(null);
            })
    }, [authLoading, isLoggedIn]);

    return (
        <div className="header">
            <div className="logo-container">
                <img src={images.logo} alt="Logo" className="home-logo" />
                {/* <input type="text" placeholder="#Explore" className="search-input" /> */}
            </div>
            <div className="nav-list">
                <Link to="/" className="fa-solid fa-house is-choosen"></Link>
                <Link to={`/${user?.username}`} className="fa-solid fa-user"></Link>
                <Link to="/message" className="fa-solid fa-message"></Link>
                <Link to="/setting" className="fa-solid fa-gear"></Link>
            </div>
            <img src={images.avatar} alt="logofill" />
        </div>
    )
}

export default Header;