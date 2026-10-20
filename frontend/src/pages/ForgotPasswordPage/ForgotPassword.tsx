import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import '../LoginPage/login.scss';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!username.trim()) {
            setError('Vui lòng nhập tên đăng nhập hoặc email của bạn');
            return;
        }

        setLoading(true);

        try {
            // Temporary demo response until endpoint is connected
            setTimeout(() => {
                setSuccess('Nếu tài khoản tồn tại, hướng dẫn khôi phục mật khẩu sẽ được gửi đến bạn.');
                setLoading(false);
            }, 1000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Yêu cầu thất bại, vui lòng thử lại.');
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
                            Chúng tôi sẽ giúp bạn lấy lại quyền truy cập tài khoản một cách nhanh chóng và an toàn.
                        </p>

                        <div className='featureCards'>
                            <div className='featureItem'>
                                <div className='featureIcon'>🔑</div>
                                <div>
                                    <h4>Khôi phục dễ dàng</h4>
                                    <p>Chỉ cần nhập email hoặc tên đăng nhập của bạn</p>
                                </div>
                            </div>
                            <div className='featureItem'>
                                <div className='featureIcon'>🛡️</div>
                                <div>
                                    <h4>Xác minh an toàn</h4>
                                    <p>Quy trình bảo mật đảm bảo chỉ bạn có quyền khôi phục</p>
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
                            <h2 className='welcomeTitle'>Quên mật khẩu?</h2>
                            <p className='welcomeSubtitle'>Nhập thông tin tài khoản để nhận liên kết đặt lại mật khẩu</p>
                        </div>

                        {success ? (
                            <div className="successCard">
                                <div className="successIcon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h3>Đã gửi yêu cầu</h3>
                                <p>{success}</p>
                                <button
                                    type="button"
                                    className="submitButton"
                                    onClick={() => navigate('/login')}
                                    style={{ marginTop: '20px' }}
                                >
                                    Quay lại Đăng nhập
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className='authForm'>
                                <div className='inputGroup'>
                                    <label htmlFor='fp-username'>Tên đăng nhập / Email</label>
                                    <div className='inputWrapper'>
                                        <svg className='inputIcon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <input
                                            type="text"
                                            id="fp-username"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Nhập tên đăng nhập hoặc email"
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

                                <button
                                    type="submit"
                                    className='submitButton'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loadingSpinner"></span>
                                    ) : (
                                        'Gửi yêu cầu khôi phục'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="switchPrompt">
                            Đã nhớ mật khẩu?{' '}
                            <span className="switchLink" onClick={() => navigate('/login')}>
                                Quay lại Đăng nhập
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

