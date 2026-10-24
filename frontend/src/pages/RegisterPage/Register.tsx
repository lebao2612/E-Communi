import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import api from '../../api/axios';
import '../LoginPage/login.scss';

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!username.trim() || !fullname.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Định dạng email không hợp lệ');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/users/register', {
        username: username.trim(),
        fullname: fullname.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });

      // Đăng ký thành công → chuyển sang login
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
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
              Tham gia cộng đồng,<br />
              <span className='highlightText'>kết nối vô tận.</span>
            </h1>
            <p className='heroSubtitle'>
              Tạo tài khoản chỉ trong vài giây để bắt đầu trò chuyện và chia sẻ câu chuyện của bạn với mọi người.
            </p>

            <div className='featureCards'>
              <div className='featureItem'>
                <div className='featureIcon'>🚀</div>
                <div>
                  <h4>Đăng ký nhanh chóng</h4>
                  <p>Thiết lập hồ sơ cá nhân chỉ trong tích tắc</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>👥</div>
                <div>
                  <h4>Tìm kiếm bạn bè</h4>
                  <p>Mở rộng kết nối và theo dõi những nội dung hấp dẫn</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>✨</div>
                <div>
                  <h4>Trải nghiệm đỉnh cao</h4>
                  <p>Giao diện hiện đại, tối ưu cho mọi thiết bị</p>
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
              <h2 className='welcomeTitle'>Tạo tài khoản mới</h2>
              <p className='welcomeSubtitle'>Trở thành thành viên của BChat ngay hôm nay</p>
            </div>

            <form onSubmit={handleRegister} className='authForm'>
              <div className='inputGroup'>
                <label htmlFor='reg-username'>Tên đăng nhập</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className='inputGroup'>
                <label htmlFor='fullname'>Họ và tên</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <input
                    type="text"
                    id="fullname"
                    value={fullname}
                    onChange={e => setFullname(e.target.value)}
                    placeholder="Nhập họ và tên hiển thị"
                  />
                </div>
              </div>

              <div className='inputGroup'>
                <label htmlFor='reg-email'>Địa chỉ Email</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    id="reg-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Nhập email để nhận thông báo và khôi phục"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className='inputGroup'>
                <label htmlFor='reg-password'>Mật khẩu</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reg-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className='togglePasswordBtn'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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
              </div>

              <div className='inputGroup'>
                <label htmlFor='confirm-password'>Xác nhận mật khẩu</label>
                <div className='inputWrapper'>
                  <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className='togglePasswordBtn'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
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
                  'Đăng ký tài khoản'
                )}
              </button>
            </form>

            <div className="switchPrompt">
              Đã có tài khoản?{' '}
              <span className="switchLink" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

