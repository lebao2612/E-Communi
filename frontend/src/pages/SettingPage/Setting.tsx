import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './setting.scss';

const Setting = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="settingPage">
            <div className="settingContainer">
                <div className="settingHeader">
                    <h2>Cài đặt</h2>
                    <p>Quản lý tùy chọn cá nhân và tài khoản của bạn</p>
                </div>

                <div className="settingSection">
                    <h3>Tài khoản</h3>
                    <div className="settingItem" onClick={() => navigate('/changeprofile')}>
                        <div className="itemInfo">
                            <span className="itemTitle">Chỉnh sửa hồ sơ</span>
                            <span className="itemDesc">Thay đổi avatar, tên hiển thị và tiểu sử</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>

                    <div className="settingItem" onClick={() => navigate(`/${user?.username || ''}`)}>
                        <div className="itemInfo">
                            <span className="itemTitle">Trang cá nhân</span>
                            <span className="itemDesc">Xem giao diện trang cá nhân của bạn</span>
                        </div>
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>
                </div>

                <div className="settingSection">
                    <h3>Tùy chọn ứng dụng</h3>
                    <div className="settingItem">
                        <div className="itemInfo">
                            <span className="itemTitle">Giao diện (Chủ đề)</span>
                            <span className="itemDesc">Chế độ tối (Mặc định)</span>
                        </div>
                    </div>
                    <div className="settingItem">
                        <div className="itemInfo">
                            <span className="itemTitle">Thông báo</span>
                            <span className="itemDesc">Tùy chỉnh thông báo và hoạt động</span>
                        </div>
                    </div>
                </div>

                <button
                    className="logoutButton"
                    onClick={logout}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Setting;