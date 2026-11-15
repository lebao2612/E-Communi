import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import images from "../../assets/images/index";
import api, { setAccessToken } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components/GoogleAuth/GoogleLoginButton';
import GoogleCompleteModal from '../../components/GoogleAuth/GoogleCompleteModal';
import '../LoginPage/login.scss';

type RegisterStep = 'FORM' | 'VERIFY_OTP';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markLoggedIn } = useAuth();

  // State bước đăng ký
  const [step, setStep] = useState<RegisterStep>('FORM');

  // Form inputs
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification OTP state
  const [targetEmail, setTargetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State cho quy trình Hoàn tất thông tin Google (TH2)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [googleSetupData, setGoogleSetupData] = useState<{
    googleSetupToken: string;
    defaultInfo: any;
  } | null>(null);

  // Hỗ trợ nhận redirect từ Login nếu tài khoản chưa kích hoạt
  useEffect(() => {
    if (location.state?.step === 'VERIFY_OTP' && location.state?.email) {
      setStep('VERIFY_OTP');
      setTargetEmail(location.state.email);
      setCountdown(60);
      setSuccessMessage('Vui lòng nhập mã OTP để kích hoạt tài khoản của bạn.');
    }
  }, [location.state]);

  // Bộ đếm ngược 60s cho nút gửi lại OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // BƯỚC 1: XỬ LÝ SUBMIT FORM ĐĂNG KÝ
  const handleRegister = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

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
      const cleanEmail = email.trim().toLowerCase();
      const res = await api.post('/api/users/register', {
        username: username.trim(),
        fullname: fullname.trim(),
        email: cleanEmail,
        password,
        confirmPassword,
      });

      // Nếu yêu cầu xác thực email (Task 1.4)
      if (res.data.requireEmailVerification) {
        setTargetEmail(res.data.email || cleanEmail);
        setStep('VERIFY_OTP');
        setCountdown(60);
        setSuccessMessage('Mã xác thực OTP đã được gửi đến email của bạn.');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: XÁC THỰC MÃ OTP ĐỂ KÍCH HOẠT VÀ VÀO THẲNG BCHAT
  const handleVerifyEmailOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/users/verify-email', {
        email: targetEmail,
        otp: otp.trim(),
      });

      // Kích hoạt thành công -> Lưu accessToken và đăng nhập trực tiếp
      localStorage.removeItem('refreshToken');
      setAccessToken(res.data.accessToken);
      markLoggedIn();

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // GỬI LẠI MÃ OTP KÍCH HOẠT
  const handleResendVerificationOtp = async () => {
    if (countdown > 0 || resendLoading) return;
    setError(null);
    setResendLoading(true);

    try {
      await api.post('/api/users/resend-verification-otp', {
        email: targetEmail,
      });
      setCountdown(60);
      setSuccessMessage('Mã xác thực mới đã được gửi lại vào email của bạn.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể gửi lại mã lúc này. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
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
              Gia nhập cộng đồng,<br />
              <span className='highlightText'>kết nối không giới hạn.</span>
            </h1>
            <p className='heroSubtitle'>
              Tạo tài khoản ngay hôm nay để trải nghiệm mạng xã hội trò chuyện thời gian thực, gọi video HD và chia sẻ bài viết cùng bạn bè.
            </p>

            <div className='featureCards'>
              <div className='featureItem'>
                <div className='featureIcon'>🚀</div>
                <div>
                  <h4>Đăng ký siêu tốc</h4>
                  <p>Khởi tạo tài khoản chỉ trong 30 giây</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>🌐</div>
                <div>
                  <h4>Kết nối bạn bè</h4>
                  <p>Dễ dàng tìm kiếm và theo dõi những người bạn quan tâm</p>
                </div>
              </div>
              <div className='featureItem'>
                <div className='featureIcon'>🛡️</div>
                <div>
                  <h4>Bảo mật kép</h4>
                  <p>Mã hóa dữ liệu an toàn & Xác thực OTP qua Email</p>
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

              {step === 'FORM' ? (
                <>
                  <h2 className='welcomeTitle'>Tạo tài khoản mới</h2>
                  <p className='welcomeSubtitle'>Điền thông tin bên dưới để bắt đầu hành trình của bạn</p>
                </>
              ) : (
                <>
                  <h2 className='welcomeTitle'>Kích hoạt tài khoản</h2>
                  <p className='welcomeSubtitle'>
                    Nhập mã OTP 6 số đã được gửi đến:<br />
                    <span className="targetEmailHighlight">{targetEmail}</span>
                  </p>
                </>
              )}
            </div>

            {/* BƯỚC 1: FORM ĐIỀN THÔNG TIN ĐĂNG KÝ */}
            {step === 'FORM' && (
              <>
                <form onSubmit={handleRegister} className='authForm'>
                  <div className='inputGroup'>
                    <label htmlFor='fullname'>Họ và tên</label>
                    <div className='inputWrapper'>
                      <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
                        type="text"
                        id="fullname"
                        value={fullname}
                        onChange={e => setFullname(e.target.value)}
                        placeholder="Nhập họ và tên của bạn"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className='inputGroup'>
                    <label htmlFor='username'>Tên đăng nhập (Username)</label>
                    <div className='inputWrapper'>
                      <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="4"></circle>
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                      </svg>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="ví dụ: lebao2612"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className='inputGroup'>
                    <label htmlFor='email'>Địa chỉ Email</label>
                    <div className='inputWrapper'>
                      <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email"
                        autoComplete="email"
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
                        placeholder="Tối thiểu 6 ký tự"
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
                    <label htmlFor='confirmPassword'>Xác nhận mật khẩu</label>
                    <div className='inputWrapper'>
                      <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
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

                <div className="authDivider">
                  <span>hoặc</span>
                </div>

                {/* Đăng ký nhanh qua Google */}
                <GoogleLoginButton
                  buttonText="Đăng ký với Google"
                  onNewUser={(data) => {
                    setGoogleSetupData(data);
                    setIsCompleteModalOpen(true);
                  }}
                  onError={(err) => setError(err)}
                />
              </>
            )}

            {/* BƯỚC 2: FORM NHẬP MÃ OTP KÍCH HOẠT */}
            {step === 'VERIFY_OTP' && (
              <form onSubmit={handleVerifyEmailOtp} className='authForm'>
                <div className='inputGroup'>
                  <label htmlFor='reg-otp'>Mã xác thực OTP</label>
                  <div className='inputWrapper otpInputWrapper'>
                    <input
                      type="text"
                      id="reg-otp"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      autoFocus
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="resendBox">
                    <span>Không nhận được mã?</span>
                    <button
                      type="button"
                      className="resendBtn"
                      disabled={countdown > 0 || resendLoading}
                      onClick={handleResendVerificationOtp}
                    >
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã ngay'}
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

                {successMessage && (
                  <div className="errorMessage" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#4ade80' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className='submitButton'
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <span className="loadingSpinner"></span>
                  ) : (
                    'Kích hoạt & Vào BChat'
                  )}
                </button>

                <button
                  type="button"
                  className="secondaryActionBtn"
                  onClick={() => {
                    setStep('FORM');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  ← Đổi thông tin hoặc email khác
                </button>
              </form>
            )}

            <div className="switchPrompt">
              Đã có tài khoản?{' '}
              <span className="switchLink" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Hoàn tất thông tin cho người dùng mới qua Google (TH2) */}
      {googleSetupData && (
        <GoogleCompleteModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          googleSetupToken={googleSetupData.googleSetupToken}
          defaultInfo={googleSetupData.defaultInfo}
        />
      )}
    </div>
  );
};

export default Register;
