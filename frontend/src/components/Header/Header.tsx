import "./header.scss";
import images from "../../assets/images/index";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
    const { user } = useAuth();

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