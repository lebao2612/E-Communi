# E-Community

E-Community là một mạng xã hội nội bộ / cộng đồng số, gồm frontend React và backend Node.js phục vụ các chức năng cốt lõi như đăng ký - đăng nhập, tạo bài viết, like, comment, tìm kiếm người dùng, theo dõi bạn bè, nhắn tin realtime và gọi audio/video qua WebRTC.

Dự án được thiết kế theo mô hình client - server, trong đó frontend chịu trách nhiệm giao diện và trải nghiệm người dùng, còn backend cung cấp REST API, xác thực JWT, realtime messaging và các dịch vụ hỗ trợ như upload media, Socket.IO, PeerJS và ICE servers.

## Mục Tiêu Hệ Thống

- Xây dựng một nền tảng cộng đồng có đầy đủ luồng tương tác xã hội.
- Hỗ trợ đăng nhập bảo mật bằng access token và refresh token.
- Cập nhật dữ liệu realtime cho chat, trạng thái online/offline và cuộc gọi.
- Hỗ trợ đăng bài, comment, follow/unfollow và tìm kiếm nội dung / người dùng.
- Tối ưu trải nghiệm mobile với bố cục responsive và điều hướng phù hợp.

## Tech Stack

### Frontend

- React 19
- TypeScript
- React Router DOM 7
- Zustand cho state management
- Axios cho HTTP client
- SCSS / Sass cho styling
- Socket.IO Client cho realtime
- PeerJS cho WebRTC signaling
- Montserrat font và Font Awesome cho UI

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO
- PeerJS server
- JWT cho xác thực
- bcryptjs cho hash mật khẩu
- Cloudinary cho upload media
- Multer cho xử lý file upload
- Twilio để lấy ICE servers phục vụ WebRTC
- CORS và dotenv

## Kiến Trúc Tổng Quan

### 1. Frontend

Frontend được tổ chức theo từng page và component riêng biệt:

- Public routes: đăng nhập, đăng ký, quên mật khẩu
- Protected routes: home feed, search, message, profile, setting, change profile
- Header được ẩn ở một số màn public để tập trung vào form auth

Luồng UI chính:

- Người dùng đăng nhập và nhận token.
- Token được dùng để gọi API và kết nối Socket.IO.
- Dữ liệu feed, message, search, presence và WebRTC được quản lý bởi các store riêng.

### 2. Backend

Backend cung cấp các nhóm chức năng chính:

- Xác thực và quản lý người dùng
- Bài viết, comment, like và news feed
- Nhắn tin giữa 2 người dùng
- Tìm kiếm người dùng / dữ liệu
- WebRTC support qua ICE servers
- Realtime presence, message delivery và call events

### 3. Realtime Layer

`services/realtimeService.js` khởi tạo:

- Socket.IO server để xử lý presence và message events
- PeerJS server để hỗ trợ signaling cho WebRTC
- Luồng online/offline theo userId
- Sự kiện cuộc gọi như request, accept, reject và end call

## Tính Năng Chính

- Đăng ký, đăng nhập, refresh token
- Quên mật khẩu / reset password
- Cập nhật hồ sơ cá nhân
- Theo dõi / hủy theo dõi người dùng
- Tạo bài viết mới
- Xem news feed
- Like bài viết
- Bình luận bài viết
- Tìm kiếm người dùng / nội dung
- Nhắn tin realtime 1-1
- Đếm và đánh dấu tin nhắn chưa đọc
- Gọi audio / video qua WebRTC
- Hiển thị trạng thái online / offline

## Cấu Trúc Dự Án

```text
E-Community/
├─ backend/
│  ├─ app.js
│  ├─ server.js
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  └─ utils/
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ contexts/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ stores/
│  │  ├─ styles/
│  │  └─ utils/
│  └─ build/
├─ 30_day_ecommunity_roadmap.md
└─ README.md
```

## Các Màn Hình Chính

### Public

- `/login`
- `/register`
- `/forgot-password`

### Protected

- `/` - trang chủ / news feed
- `/search` - tìm kiếm
- `/message` - danh sách chat / hộp thoại nhắn tin
- `/message/:userId` - chat với người dùng cụ thể
- `/:username` - trang profile người dùng
- `/setting` - cài đặt
- `/changeprofile` - cập nhật hồ sơ

## API Backend Chính

### User

- `GET /api/users/me`
- `PUT /api/users/update`
- `GET /api/users/getAllUsers`
- `POST /api/users/login`
- `POST /api/users/register`
- `POST /api/users/refresh-token`
- `POST /api/users/follow/:id`
- `POST /api/users/unfollow/:id`
- `GET /api/users/followers/:id`
- `GET /api/users/following/:id`
- `GET /api/users/:username`

### Post

- `GET /api/posts/getPostById`
- `GET /api/posts/getAllPosts`
- `POST /api/posts/upPost`
- `GET /api/posts/getNewsFeed`
- `PUT /api/posts/:id/like`

### Comment

- `POST /api/comments/post/:id`
- `GET /api/comments/post/:id`
- `DELETE /api/comments/:id`

### Message

- `POST /api/messages/send`
- `GET /api/messages/unread/summary`
- `PATCH /api/messages/read/:friendId`
- `GET /api/messages/:user1/:user2`

### Search

- `GET /api/search`

### WebRTC

- `GET /api/webrtc/ice-servers`

## Dữ Liệu Chính

Hệ thống tập trung quanh các collection chính trong MongoDB:

- Users
- Posts
- Comments
- Messages

Ngoài ra, backend còn sử dụng các trường và quan hệ để phục vụ follow graph, unread message summary, presence và reset password.

## Biến Môi Trường

### Backend

Tạo file `.env` trong thư mục `backend/` và khai báo tối thiểu:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
FRONTEND_URL=http://localhost:3000
FE_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Frontend

Tạo file `.env` trong thư mục `frontend/` nếu cần cấu hình môi trường:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBRTC_ICE_SERVERS=[{"urls":["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]}]
```

Nếu triển khai production, nên cấu hình thêm TURN server để cuộc gọi hoạt động ổn định trong mạng NAT / firewall phức tạp.

## Chạy Dự Án Local

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy ở `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend mặc định chạy ở `http://localhost:3000`.

## Build Production

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm start
```

## Ghi Chú Triển Khai

- Backend hiện cho phép CORS với các origin local và một số origin production đã cấu hình sẵn.
- Realtime và WebRTC yêu cầu token hợp lệ để khởi tạo kết nối.
- Với cuộc gọi audio/video trên môi trường thật, nên dùng HTTPS cho cả frontend và backend.
- Nếu frontend được host trên S3 / CloudFront, cần cập nhật lại `FE_URL` và `FRONTEND_URL` tương ứng.

## Gợi Ý Phát Triển Tiếp

- Chuẩn hóa lại tài liệu API bằng Swagger / OpenAPI
- Bổ sung file `.env.example` cho cả frontend và backend
- Tách rõ hơn các nhóm service realtime, presence và message
- Thêm test cho controller và store quan trọng
- Chuẩn hóa quy ước đặt tên route / controller để dễ bảo trì hơn

## Tóm Tắt

E-Community là một nền tảng social app hoàn chỉnh với kiến trúc tách biệt frontend/backend, có realtime chat, bài viết, follow, search và WebRTC. README này được viết để đóng vai trò tài liệu tổng quan cho toàn bộ hệ thống, giúp dễ triển khai, vận hành và mở rộng về sau.
