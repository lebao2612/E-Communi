import "./header.scss";
import images from "../../assets/images/index";


function Header(){
    return (
        <div className="header">
            <div className="logo-container">
                <img src={images.logo} alt="Logo" className="home-logo" />
                <input type="text" placeholder="#Explore" className="search-input"/>
            </div>
            <div className="nav-list">
                <a href="/" className="fa-solid fa-house is-choosen"></a>
                <a href="/profile" className="fa-solid fa-user"></a>
                <a href="/message" className="fa-solid fa-message"></a>
                <a href="/setting" className="fa-solid fa-gear"></a>
            </div>
            <img src={images.logo} alt="logofill"/>
        </div>
    )
}

export default Header;