import React, { useState, FormEvent } from 'react';
import api, { setAccessToken } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GoogleCompleteModal.scss';

interface GoogleCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleSetupToken: string;
  defaultInfo: {
    email: string;
    fullname: string;
    avatar?: string;
    suggestedUsername: string;
  };
}

const GoogleCompleteModal: React.FC<GoogleCompleteModalProps> = ({
  isOpen,
  onClose,
  googleSetupToken,
  defaultInfo,
}) => {
  const [username, setUsername] = useState(defaultInfo.suggestedUsername || '');
  const [fullname, setFullname] = useState(defaultInfo.fullname || '');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { markLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setError('Vui lòng nhập tên đăng nhập (username)');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError('Tên đăng nhập phải từ 3 đến 30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/users/google-complete', {
        googleSetupToken,
        username: cleanUsername,
        fullname: fullname.trim() || defaultInfo.fullname,
        bio: bio.trim(),
      });

      // Đăng nhập thành công
      localStorage.removeItem('refreshToken');
      setAccessToken(res.data.accessToken);
      markLoggedIn();

      onClose();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hoàn tất thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="googleCompleteOverlay">
      <div className="googleCompleteModal">
        <div className="modalHeader">
          <div className="avatarWrapper">
            <img
              src={defaultInfo.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
              alt="Google Avatar"
              className="userAvatar"
            />
            <span className="googleBadge" title="Xác thực bởi Google">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </span>
          </div>
          <h2 className="modalTitle">Chào mừng bạn đến với BChat!</h2>
          <p className="modalSubtitle">
            Chỉ còn một bước cuối: Hãy thiết lập <strong>tên đăng nhập</strong> để bạn bè dễ dàng tìm kiếm và kết nối với bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="completeForm">
          {/* Email (Readonly) */}
          <div className="formGroup">
            <label>Email tài khoản Google</label>
            <div className="inputField readonly">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input type="text" value={defaultInfo.email} readOnly disabled />
              <span className="verifiedTag">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Đã xác minh
              </span>
            </div>
          </div>

          {/* Fullname */}
          <div className="formGroup">
            <label htmlFor="googleFullname">Họ và tên hiển thị</label>
            <div className="inputField">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                id="googleFullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nhập họ và tên hiển thị"
                required
              />
            </div>
          </div>

          {/* Username (Required) */}
          <div className="formGroup">
            <div className="labelRow">
              <label htmlFor="googleUsername">
                Tên đăng nhập (Username) <span className="requiredStar">*</span>
              </label>
              <span className="hintText">Dùng để tag @username và tạo link trang cá nhân</span>
            </div>
            <div className="inputField usernameField">
              <span className="atSymbol">@</span>
              <input
                type="text"
                id="googleUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="ví dụ: lebao2612"
                maxLength={30}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Bio (Optional) */}
          <div className="formGroup">
            <label htmlFor="googleBio">Tiểu sử ngắn (Tùy chọn)</label>
            <div className="inputField textareaField">
              <textarea
                id="googleBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ đôi điều về bạn..."
                rows={2}
                maxLength={160}
              />
            </div>
          </div>

          {error && (
            <div className="errorMessage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="buttonRow">
            <button
              type="button"
              className="cancelButton"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="completeButton"
              disabled={loading || !username.trim()}
            >
              {loading ? <span className="loadingSpinner"></span> : 'Hoàn tất & Bắt đầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleCompleteModal;

