import "./header.scss";
import images from "../../assets/images/index";
import { Link } from "react-router-dom";

interface User{
    _id: string;
    fullname?: string;
    username: string;
    email?: string;
    createdAt?: string;
    avatar ?: string;
}

function Header(){

    const rawUser = localStorage.getItem('user');
    const user: User | null = rawUser ? JSON.parse(rawUser) : null;

    return (
        <div className="header">
            <div className="logo-container">
                <img src={images.logo} alt="Logo" className="home-logo" />
                <input type="text" placeholder="#Explore" className="search-input"/>
            </div>
            <div className="nav-list">
                {/* <a href="/" className="fa-solid fa-house is-choosen"></a>
                <a href={`/profile/${user?.username}`} className="fa-solid fa-user"></a>
                <a href="/message" className="fa-solid fa-message"></a>
                <a href="/setting" className="fa-solid fa-gear"></a> */}
                <Link to="/" className="fa-solid fa-house is-choosen"></Link>
                <Link to={`/${user?.username}`} className="fa-solid fa-user"></Link>
                <Link to="/message" className="fa-solid fa-message"></Link>
                <Link to="/setting" className="fa-solid fa-gear"></Link>
            </div>
            <img src={images.avatar} alt="logofill"/>
        </div>
    )
}

export default Header;