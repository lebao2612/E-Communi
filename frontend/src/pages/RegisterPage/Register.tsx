import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import images from "../../assets/images/index";
import api from '../../api/axios';
import '../LoginPage/login.scss';

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!username || !fullname || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/users/register', {
        username: username.trim(),
        fullname: fullname.trim(),
        password,
        confirmPassword
      });

      // Đăng ký thành công → chuyển sang login
      navigate('/login');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Register failed');
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

        <h2 className='comeback'>CREATE ACCOUNT</h2>

        <div className='inputElement'>
          <label>Username:</label><br />
          <input
            type="text"
            className='inputUsername'
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
          />

          <label>Full name:</label><br />
          <input
            type="text"
            className='inputUsername'
            value={fullname}
            onChange={e => setFullname(e.target.value)}
            placeholder="Enter full name"
          />

          <label>Password:</label><br />
          <input
            type="password"
            className='inputUsername'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <label>Confirm password:</label><br />
          <input
            type="password"
            className='inputUsername'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        <button
          className='submitButton'
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <p
          style={{ marginTop: 10, cursor: 'pointer', color: '#4da6ff' }}
          onClick={() => navigate('/login')}
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
};

export default Register;
