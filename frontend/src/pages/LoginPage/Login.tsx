import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import { useAuth } from '../../contexts/AuthContext';
import './login.scss';

interface LoginResponse {
  message: string;
  user: {
    _id: string;
    fullname?: string;
    username: string;
    email?: string;
    createdAt?: string;
  };
}

const Login = () => {
  // State để lưu tên người dùng
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    // Reset trạng thái
    setError(null);
    setLoading(true);

    try {
      // Gửi POST request đến backend
      const response = await axios.post<LoginResponse>('http://localhost:5000/api/users/login', {
        username: username.trim()
      });

      const user = response.data.user;
      if (user) {
        console.log("User login: ", user);
        login(user);         // ✅ Gọi hàm login của AuthContext
        navigate('/');       // ✅ Chuyển về trang chính
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Unknown error occurred');
      }
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
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        <button
          className='submitButton' 
          onClick={handleLogin}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
};

export default Login;
