const nodemailer = require('nodemailer');

const buildOtpEmailHtml = (otpCode, fullname = 'bạn') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #e0e0e0; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background-color: #1e1e1e; border-radius: 12px; border: 1px solid #333; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #2d240e, #1a1a1a); padding: 25px; text-align: center; border-bottom: 2px solid #eab308; }
    .brand { font-size: 28px; font-weight: 800; color: #eab308; letter-spacing: 1px; }
    .content { padding: 30px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
    .otp-box { background-color: #121212; border: 2px dashed #eab308; border-radius: 8px; padding: 18px; text-align: center; margin: 25px 0; }
    .otp-code { font-size: 36px; font-weight: 800; color: #eab308; letter-spacing: 8px; font-family: monospace; }
    .warning { font-size: 13px; color: #888; margin-top: 20px; border-top: 1px solid #2a2a2a; padding-top: 15px; }
    .footer { padding: 15px; text-align: center; font-size: 12px; color: #666; background-color: #161616; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">BChat</div>
    </div>
    <div class="content">
      <div class="greeting">Xin chào ${fullname || 'bạn'},</div>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên nền tảng <strong>BChat (E-Community)</strong>.</p>
      <p>Mã xác minh (OTP) dùng một lần của bạn là:</p>
      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
      </div>
      <p>Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Vì lý do an toàn, tuyệt đối <strong>không chia sẻ mã này</strong> cho bất kỳ ai.</p>
      <div class="warning">
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu của bạn sẽ không bị thay đổi.
      </div>
    </div>
    <div class="footer">
      © 2026 BChat (E-Community). Mọi quyền được bảo lưu.
    </div>
  </div>
</body>
</html>
`;

// Phương án 1: Gửi qua Resend HTTP API (Port 443 - Không bao giờ bị Render chặn)
const sendViaResend = async (toEmail, otpCode, fullname) => {
    const apiKey = process.env.RESEND_API_KEY.trim();
    const fromSender = process.env.EMAIL_FROM?.trim() || 'BChat Security <onboarding@resend.dev>';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromSender,
                to: [toEmail],
                subject: `[BChat] Mã xác nhận khôi phục mật khẩu: ${otpCode}`,
                html: buildOtpEmailHtml(otpCode, fullname),
            }),
            signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Resend API error status: ${response.status}`);
        }
        return data;
    } finally {
        clearTimeout(timeoutId);
    }
};

// Phương án 2: Gửi qua Brevo HTTP API (Port 443 - Miễn phí 300 mail/ngày, gửi được mọi email)
const sendViaBrevo = async (toEmail, otpCode, fullname) => {
    const apiKey = process.env.BREVO_API_KEY.trim();
    const senderEmail = process.env.EMAIL_USER?.trim() || 'btaldforever@gmail.com';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: 'BChat Security',
                    email: senderEmail,
                },
                to: [
                    { email: toEmail, name: fullname || 'User' }
                ],
                subject: `[BChat] Mã xác nhận khôi phục mật khẩu: ${otpCode}`,
                htmlContent: buildOtpEmailHtml(otpCode, fullname),
            }),
            signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Brevo API error status: ${response.status}`);
        }
        return data;
    } finally {
        clearTimeout(timeoutId);
    }
};

// Phương án 3: Gửi qua Nodemailer (Gmail SMTP có timeout chống treo vô tận)
const sendViaNodemailer = async (toEmail, otpCode, fullname) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error('Chưa cấu hình tài khoản gửi email (cần RESEND_API_KEY hoặc BREVO_API_KEY hoặc EMAIL_USER/EMAIL_PASS)');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user.trim(),
            pass: pass.trim().replace(/\s+/g, ''),
        },
        connectionTimeout: 8000, // 8 giây timeout - chống kẹt vĩnh viễn trên Render
        greetingTimeout: 8000,
        socketTimeout: 8000,
    });

    const mailOptions = {
        from: `"BChat Security" <${user.trim()}>`,
        to: toEmail,
        subject: `[BChat] Mã xác nhận khôi phục mật khẩu: ${otpCode}`,
        html: buildOtpEmailHtml(otpCode, fullname),
    };

    return await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (toEmail, otpCode, fullname = 'bạn') => {
    // 1. Ưu tiên Resend HTTP API (nếu có key)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
        return await sendViaResend(toEmail, otpCode, fullname);
    }

    // 2. Ưu tiên Brevo HTTP API (nếu có key)
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim()) {
        return await sendViaBrevo(toEmail, otpCode, fullname);
    }

    // 3. Fallback dùng Nodemailer (chạy local hoặc host mở port SMTP)
    return await sendViaNodemailer(toEmail, otpCode, fullname);
};

module.exports = {
    sendOtpEmail,
};
