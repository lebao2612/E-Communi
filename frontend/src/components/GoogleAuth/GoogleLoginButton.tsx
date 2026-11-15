import React, { useEffect, useRef, useState } from 'react';
import api, { setAccessToken } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GoogleLoginButton.scss';

interface GoogleLoginButtonProps {
  onNewUser: (data: { googleSetupToken: string; defaultInfo: any }) => void;
  onError: (errorMsg: string) => void;
  buttonText?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onNewUser,
  onError,
  buttonText = 'Tiếp tục với Google',
}) => {
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { markLoggedIn } = useAuth();
  const navigate = useNavigate();

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      onError('Không nhận được mã xác thực từ Google. Vui lòng thử lại.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/users/google-login', {
        idToken: response.credential,
      });

      // TH1: Đã có tài khoản -> Đăng nhập vào thẳng
      if (!res.data.isNewUser) {
        localStorage.removeItem('refreshToken');
        setAccessToken(res.data.accessToken);
        markLoggedIn();
        navigate('/');
        return;
      }

      // TH2: Tài khoản mới -> Mở form hoàn tất thông tin
      if (res.data.isNewUser) {
        onNewUser({
          googleSetupToken: res.data.googleSetupToken,
          defaultInfo: res.data.defaultInfo,
        });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      onError(
        err.response?.data?.error ||
        err.message ||
        'Đăng nhập với Google thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render nút Google chính thức ẩn/chèn bên trong để đảm bảo hoạt động bảo mật
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        } catch (e) {
          console.warn('Google GSI initialization error:', e);
        }
      }
    };

    // Kiểm tra xem script gsi đã tải xong chưa
    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGsi();
        }
      }, 200);

      const timeout = setTimeout(() => clearInterval(interval), 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [clientId]);

  const handleCustomButtonClick = () => {
    if (!clientId) {
      onError('Chưa cấu hình REACT_APP_GOOGLE_CLIENT_ID trong file .env');
      return;
    }

    if (window.google?.accounts?.id) {
      // Kích hoạt Google One Tap / Prompt popup
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Nếu prompt bị chặn, kích hoạt click vào nút ẩn
          const hiddenBtn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (hiddenBtn) {
            hiddenBtn.click();
          }
        }
      });
    } else {
      onError('Đang tải dịch vụ xác thực của Google, vui lòng thử lại sau giây lát.');
    }
  };

  return (
    <div className="googleAuthWrapper">
      {/* Nút bấm hiển thị chuẩn phong cách BChat Dark Theme */}
      <button
        type="button"
        className="customGoogleBtn"
        onClick={handleCustomButtonClick}
        disabled={loading}
      >
        <span className="googleIconWrapper">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </span>
        <span className="btnText">
          {loading ? 'Đang xác thực...' : buttonText}
        </span>
      </button>

      {/* Container ẩn để GSI mount nút iframe native */}
      <div ref={googleBtnRef} className="hiddenNativeGoogleBtn"></div>
    </div>
  );
};

export default GoogleLoginButton;

