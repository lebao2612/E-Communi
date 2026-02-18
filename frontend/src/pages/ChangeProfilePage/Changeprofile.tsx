import './changeprofile.scss'
import { useProfileLogic } from '../../scripts/profile';
import { useHomeLogic } from '../../scripts/home';
import { useState, useEffect, useRef } from 'react';


const ChangeProfile = () => {
    const {
        handleAvatarUpload,
        handleSaveProfile,
        updateUserAvatar,
    } = useProfileLogic();

    const {
        user,
        setUser,
    } = useHomeLogic();

    const [newFullName, setNewFullName] = useState(user?.fullname || '');
    const [newUserName, setNewUserName] = useState(user?.username || '');
    const [newUserBio, setNewUserBio] = useState(user?.bio || '');

    useEffect(() => {
        if (user) {
            setNewFullName(user.fullname || '');
            setNewUserName(user.username || '');
            setNewUserBio(user.bio || '');
        }
    }, [user]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const imageUrl = await handleAvatarUpload(event);
        if (imageUrl) {
            // Update Backend
            await updateUserAvatar(imageUrl);

            // Update Local State
            if (user) {
                // @ts-ignore
                setUser({ ...user, avatar: imageUrl });
            }
        }
    };

    return (
        <div className="change-profile">
            <div className="change-profile-header">
                <p className="change-profile-title">Chỉnh sửa profile</p>
                <p className="change-profile-subtitle">Cập nhật thông tin cá nhân của bạn</p>
            </div>
            <form className="change-profile-container" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(newFullName, newUserName, newUserBio); }}>
                <div className="change-profile-content">
                    <div className='change-profile-avatar'>
                        <img className='change-profile-avatar-img' src={user?.avatar} alt="Avatar" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                        <button type='button' className="change-profile-avatar-button" onClick={handleButtonClick}>Thay đổi ảnh</button>
                    </div>
                    <div className="change-profile-info">
                        <div className="change-profile-info-item">
                            <label htmlFor="fullname" className="change-profile-info-item-title">Họ tên</label>
                            <input id="fullname" type="text" className="change-profile-info-item-input" value={newFullName} onChange={e => setNewFullName(e.target.value)} />
                        </div>
                        <div className="change-profile-info-item">
                            <label htmlFor="username" className="change-profile-info-item-title">Username</label>
                            <input id="username" type="text" className="change-profile-info-item-input" value={newUserName} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Username cannot be changed" />
                        </div>
                        <div className="change-profile-info-item">
                            <label className="change-profile-info-item-title">Bio</label>
                            <textarea
                                rows={3}
                                onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                className="change-profile-info-item-textarea"
                                value={newUserBio}
                                onChange={e => setNewUserBio(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button type='submit' className="change-profile-footer-button">Lưu thay đổi</button>

            </form>
        </div>
    )
}

export default ChangeProfile