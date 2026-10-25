import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import api from '../../api/axios';
import '../LoginPage/login.scss';

type Step = 'REQUEST_OTP' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'COMPLETED';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step state
    const [step, setStep] = useState<Step>('REQUEST_OTP');

    // Form inputs
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Toggle password visibility
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Feedback states
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Resend countdown timer (60s)
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // BƯỚC 1: Gửi yêu cầu OTP
    const handleRequestOtp = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!identifier.trim()) {
            setError('Vui lòng nhập tên đăng nhập hoặc email của bạn');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/api/users/forgot-password', {
                identifier: identifier.trim(),
            });

            setEmail(res.data.email);
            setMaskedEmail(res.data.maskedEmail || res.data.email);
            setStep('VERIFY_OTP');
            setCountdown(60); // Bắt đầu đếm ngược 60 giây
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại mã OTP
    const handleResendOtp = async () => {
        if (countdown > 0 || loading) return;
        setError(null);
        setLoading(true);

        try {
            await api.post('/api/users/forgot-password', {
                identifier: email || identifier.trim(),
            });
            setCountdown(60);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gửi lại mã thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 2: Xác thực mã OTP 6 số
    const handleVerifyOtp = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!otp.trim() || otp.trim().length !== 6) {
            setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/api/users/verify-otp', {
                email,
                otp: otp.trim(),
            });

            setResetToken(res.data.resetToken);
            setStep('RESET_PASSWORD');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 3: Đặt lại mật khẩu mới
    const handleResetPassword = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu mới');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải chứa ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/users/reset-password', {
                email,
                resetToken,
                newPassword,
                confirmPassword,
            });

            setStep('COMPLETED');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
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
                            Khôi phục tài khoản,<br />
                            <span className='highlightText'>an tâm kết nối.</span>
                        </h1>
                        <p className='heroSubtitle'>
                            Quy trình bảo mật gửi mã OTP trực tiếp qua email giúp bạn lấy lại quyền truy cập nhanh chóng.
                        </p>

                        <div className='featureCards'>
                            <div className='featureItem'>
                                <div className='featureIcon'>✉️</div>
                                <div>
                                    <h4>Xác thực OTP Email</h4>
                                    <p>Mã bảo mật gửi thẳng về hộp thư cá nhân của bạn</p>
                                </div>
                            </div>
                            <div className='featureItem'>
                                <div className='featureIcon'>🛡️</div>
                                <div>
                                    <h4>Bảo mật 100%</h4>
                                    <p>Mã hóa mật khẩu mới và hủy các phiên đăng nhập cũ</p>
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

                            {step === 'REQUEST_OTP' && (
                                <>
                                    <div className="stepperBadge">Bước 1 / 3</div>
                                    <h2 className='welcomeTitle'>Quên mật khẩu?</h2>
                                    <p className='welcomeSubtitle'>Nhập email hoặc tên đăng nhập để nhận mã xác nhận OTP</p>
                                </>
                            )}

                            {step === 'VERIFY_OTP' && (
                                <>
                                    <div className="stepperBadge">Bước 2 / 3</div>
                                    <h2 className='welcomeTitle'>Nhập mã OTP</h2>
                                    <p className='welcomeSubtitle'>
                                        Mã 6 chữ số đã được gửi đến: <strong style={{ color: '#eab308' }}>{maskedEmail}</strong>
                                    </p>
                                </>
                            )}

                            {step === 'RESET_PASSWORD' && (
                                <>
                                    <div className="stepperBadge">Bước 3 / 3</div>
                                    <h2 className='welcomeTitle'>Tạo mật khẩu mới</h2>
                                    <p className='welcomeSubtitle'>Thiết lập mật khẩu mới an toàn cho tài khoản của bạn</p>
                                </>
                            )}
                        </div>

                        {/* BƯỚC 1: FORM NHẬP EMAIL/USERNAME */}
                        {step === 'REQUEST_OTP' && (
                            <form onSubmit={handleRequestOtp} className='authForm'>
                                <div className='inputGroup'>
                                    <label htmlFor='fp-identifier'>Tên đăng nhập hoặc Email</label>
                                    <div className='inputWrapper'>
                                        <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <input
                                            type="text"
                                            id="fp-identifier"
                                            value={identifier}
                                            onChange={e => setIdentifier(e.target.value)}
                                            placeholder="Ví dụ: baole@gmail.com hoặc lebao2612"
                                            autoFocus
                                        />
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

                                <button type="submit" className='submitButton' disabled={loading}>
                                    {loading ? <span className="loadingSpinner"></span> : 'Gửi mã xác nhận OTP'}
                                </button>
                            </form>
                        )}

                        {/* BƯỚC 2: FORM NHẬP MÃ OTP */}
                        {step === 'VERIFY_OTP' && (
                            <form onSubmit={handleVerifyOtp} className='authForm'>
                                <div className='inputGroup'>
                                    <label htmlFor='fp-otp'>Mã xác minh (OTP)</label>
                                    <div className='inputWrapper otpInputWrapper'>
                                        <input
                                            type="text"
                                            id="fp-otp"
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
                                            disabled={countdown > 0 || loading}
                                            onClick={handleResendOtp}
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

                                <button type="submit" className='submitButton' disabled={loading || otp.length !== 6}>
                                    {loading ? <span className="loadingSpinner"></span> : 'Xác nhận mã OTP'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep('REQUEST_OTP'); setError(null); }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        marginTop: '12px',
                                        fontSize: '13px',
                                        textAlign: 'center',
                                        width: '100%'
                                    }}
                                >
                                    ← Nhập tài khoản hoặc email khác
                                </button>
                            </form>
                        )}

                        {/* BƯỚC 3: FORM ĐẶT MẬT KHẨU MỚI */}
                        {step === 'RESET_PASSWORD' && (
                            <form onSubmit={handleResetPassword} className='authForm'>
                                <div className='inputGroup'>
                                    <label htmlFor='new-password'>Mật khẩu mới</label>
                                    <div className='inputWrapper'>
                                        <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            id="new-password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="togglePasswordBtn"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            tabIndex={-1}
                                            aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showNewPassword ? (
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
                                    <label htmlFor='confirm-password'>Xác nhận mật khẩu mới</label>
                                    <div className='inputWrapper'>
                                        <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirm-password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="togglePasswordBtn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

                                <button type="submit" className='submitButton' disabled={loading}>
                                    {loading ? <span className="loadingSpinner"></span> : 'Lưu mật khẩu mới'}
                                </button>
                            </form>
                        )}

                        {/* BƯỚC 4: HOÀN TẤT THÀNH CÔNG */}
                        {step === 'COMPLETED' && (
                            <div className="successCard">
                                <div className="successIcon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h3>Đặt lại mật khẩu thành công!</h3>
                                <p>Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập ngay bây giờ.</p>
                                <button
                                    type="button"
                                    className="submitButton"
                                    onClick={() => navigate('/login')}
                                    style={{ marginTop: '24px' }}
                                >
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}

                        {step !== 'COMPLETED' && (
                            <div className="switchPrompt">
                                Đã nhớ mật khẩu?{' '}
                                <span className="switchLink" onClick={() => navigate('/login')}>
                                    Quay lại Đăng nhập
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
