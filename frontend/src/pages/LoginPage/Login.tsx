import { useState } from 'react';
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
  // State để lưu tên người dùng
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const { markLoggedIn } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async () => {
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

      // 🔐 LƯU TOKEN
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      markLoggedIn();

      navigate('/');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
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
        <h2 className='comeback'>WELCOME BACK</h2>
        <div className='inputElement'>
          <label htmlFor='username'>Username:</label><br/>
          <input
            type="text"
            className='inputUsername'
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <label htmlFor='password'>Password:</label><br/>
          <input
            type="password"
            className='inputUsername'
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        <button
          className='submitButton' 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
};

export default Login;
