import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import { setAccessToken } from '../../api/axios';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import './login.scss';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { markLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>(
        '/api/users/login',
        {
          username: username.trim(),
          password
        }
      );

      localStorage.setItem('refreshToken', res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      markLoggedIn();

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='authPage'>
      <div className='authContainer'>
        {/* Left Side: Brand Hero */}
        <div className='authHero'>
          <div className='heroOverlay'></div>
          <div className='heroContent'>
            <div className='brandHeader'>
              <img src={images.logo} alt="BChat Logo" className="brandLogo" />
              <span className='brandName'>BChat</span>
            </div>
            <h1 className='heroTitle'>
              Kết nối cộng đồng,<br />
              <span className='highlightText'>chia sẻ khoảnh khắc.</span>
            </h1>
            <p className='heroSubtitle'>
              Nền tảng trò chuyện và chia sẻ trực tuyến dành riêng cho bạn. Kết nối bạn bè mọi lúc, mọi nơi.
            </p>

            <div className='featureCards'>
              <div className='featureItem'>
                <div className='featureIcon'>💬</div>
                <div>
                  <h4>Trò chuyện thời gian thực</h4>
                  <p>Nhắn tin nhanh chóng, mượt mà với bạn bè & nhóm</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>📹</div>
                <div>
                  <h4>Cuộc gọi Video HD</h4>
                  <p>Trải nghiệm gọi thoại và video sắc nét, ổn định</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>🔒</div>
                <div>
                  <h4>Bảo mật thông tin</h4>
                  <p>Quyền riêng tư của bạn luôn được ưu tiên hàng đầu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className='authFormWrapper'>
          <div className='authCard'>
            <div className='cardHeader'>
              <div className='mobileBrand'>
                <img src={images.logo} alt="BChat Logo" className="mobileLogo" />
                <span className='mobileBrandName'>BChat</span>
              </div>
              <h2 className='welcomeTitle'>Chào mừng trở lại!</h2>
              <p className='welcomeSubtitle'>Đăng nhập vào tài khoản của bạn để tiếp tục</p>
            </div>

            <form onSubmit={handleLogin} className='authForm'>
              <div className='inputGroup'>
                <label htmlFor='username'>Tên đăng nhập</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className='inputGroup'>
                <label htmlFor='password'>Mật khẩu</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className='togglePasswordBtn'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="forgotPasswordRow">
                  <span className="forgotPassword" onClick={() => navigate('/forgot-password')}>
                    Quên mật khẩu?
                  </span>
                </div>
              </div>

              {error && (
                <div className="errorMessage">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className='submitButton'
                disabled={loading}
              >
                {loading ? (
                  <span className="loadingSpinner"></span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="switchPrompt">
              Chưa có tài khoản?{' '}
              <span className="switchLink" onClick={() => navigate('/register')}>
                Tạo tài khoản ngay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

