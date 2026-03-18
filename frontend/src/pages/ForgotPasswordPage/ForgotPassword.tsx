import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import '../LoginPage/login.scss';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        setError(null);
        setSuccess(null);

        if (!username) {
            setError('Vui lòng nhập định danh của bạn');
            return;
        }

        setLoading(true);

        try {
            // Implement API call depending on backend
            // await api.post('/api/users/forgot-password', { username: username.trim() });

            // Temporary success state for demo purposes until API is connected
            setTimeout(() => {
                setSuccess('Nếu tài khoản tồn tại, một email khôi phục sẽ được gửi.');
                setLoading(false);
            }, 1000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Yêu cầu thất bại, vui lòng thử lại.');
            setLoading(false);
        }
    };

    return (
        <div className='loginPage'>
            <div className='loginForm'>

                <div className='logoName'>
                    <img src={images.logo} alt="Logo" className="home-logo" />
                    <h2 className='nameApp'>BChat</h2>
                </div>

                <h2 className='comeback'>QUÊN MẬT KHẨU</h2>

                <div className='inputElement'>
                    {success ? (
                        <p style={{ color: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.3)', padding: '10px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>{success}</p>
                    ) : (
                        <>
                            <label>Username / Email</label>
                            <input
                                type="text"
                                className='inputUsername'
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Nhập username hoặc email của bạn"
                            />
                        </>
                    )}

                    {error && <p className="errorMessage">{error}</p>}
                </div>

                {!success && (
                    <button
                        className='submitButton'
                        onClick={handleForgotPassword}
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
                    </button>
                )}

                <div className="registerPrompt">
                    Nhớ mật khẩu rồi? <span className="registerLink" onClick={() => navigate('/login')}>Đăng nhập ngay</span>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
