# Document Chức Năng 03: Comment System (Bình Luận & Phản Hồi Bài Viết)

> **Tác giả**: Senior Fullstack Developer / Solutions Architect  
> **Dự án**: E-Community (BChat)  
> **Cập nhật gần nhất**: 2026-11-16  

---

## 1. Tổng Quan Chức Năng & Kiến Trúc (Overview & Architecture)

Hệ thống Bình luận (Comment System) cho phép người dùng thảo luận bên dưới mỗi bài viết, gửi ý kiến cá nhân và tạo sự tương tác hai chiều trong cộng đồng. Tích hợp cập nhật thời gian thực qua WebSocket để mọi người đang xem bài viết đều thấy comment mới xuất hiện ngay lập tức.

```mermaid
graph TD
    Client[User Frontend Client] -->|POST /api/comments/post/:postId| CommentController[Comment Controller]
    CommentController -->|Save to DB| DB[(MongoDB - Comment Collection)]
    CommentController -->|Update Post Document| PostDB[(MongoDB - Post Collection)]
    CommentController -->|Trigger Realtime Event| SocketService[Socket.io Realtime Service]
    SocketService -->|Emit new_comment to post room| AllClients[Clients Viewing Post]
```

---

## 2. Chi Tiết Kỹ Thuật Đã Triển Khai (Implemented Features & Tech Specs)

### 2.1 Backend Services & Data Schema

* **Model Schema (`backend/models/Comment.js`)**:
  * `post` (ObjectId `Post`, Required, Index): Bài viết chứa bình luận.
  * `author` (ObjectId `User`, Required): Người gửi bình luận.
  * `content` (String, Required): Nội dung bình luận.
  * `parentId` (ObjectId `Comment`, Optional, Index): ID của bình luận cha (để hỗ trợ nested replies).
  * `replyTo` (ObjectId `User`, Optional): ID của người được trả lời (cho notification).
  * `likes` (Array of ObjectId `User`): Danh sách người thích bình luận này.
  * `createdAt`, `updatedAt` (Timestamps).

* **Compound Index**: `{ postId: 1, parentId: 1, createdAt: 1 }` để tối ưu truy vấn cây bình luận.

* **API Endpoints (`backend/routes/commentRoutes.js`)**:
  | Method | Endpoint | Auth Required | Mô Tả |
  | :--- | :--- | :---: | :--- |
  | `GET` | `/api/comments/post/:postId` | Yes | Lấy danh sách bình luận của một bài viết (trả về cây nested). |
  | `POST` | `/api/comments/post/:postId` | Yes | Thêm bình luận mới (hỗ trợ `parentId` cho reply). |
  | `DELETE` | `/api/comments/:id` | Yes | Xóa bình luận (cascading delete: xóa cả các reply con). Chỉ tác giả comment hoặc tác giả bài viết có quyền xóa. |
  | `POST` | `/api/comments/:id/like` | Yes | Thả tim / Bỏ thả tim bình luận. |

* **API Request Body (POST /api/comments/post/:postId)**:
  ```json
  {
    "content": "string",
    "parentId": "string (optional) - ID của comment cha để reply"
  }
  ```

* **API Response (GET /api/comments/post/:postId)**:
  Trả về mảng các root comments, mỗi comment có trường `replies[]` chứa các nested replies (đệ quy, tối đa 3 cấp).

### 2.2 Frontend Integration

* **Post Detail Page & Post Modal**:
  * Cho phép gõ bình luận và gửi bằng phím `Enter`.
  * Hiển thị danh sách bình luận với avatar, họ tên tác giả và thời gian tương đối.
  * Nút xóa comment hiển thị đúng phân quyền (tác giả comment hoặc tác giả bài viết).

* **Nested Comments (Reply Feature)**:
  * Component `CommentThread` đệ quy hiển thị cây bình luận đa cấp (tối đa 3 cấp).
  * Nút "Reply" trên mỗi comment để mở ô nhập reply inline.
  * Hiển thị nhãn "Replying to @username" khi đang reply.
  * Component `ReplyInput` với nút Cancel và Submit.

* **Realtime Updates**:
  * Sự kiện `new_comment` từ Socket.io cập nhật cây bình luận realtime.

---

## 3. Hạn Chế, Lỗ Hổng & Thiếu Sót Hiện Tại (Limitations & Tech Debt)

> [!WARNING]
> Những điểm thiếu sót về tính năng và trải nghiệm người dùng trong hệ thống bình luận.

1. ~~**Thiếu Bình Luận Phân Cấp (Nested / Threaded Comments - Reply to Comment)**~~: ✅ **ĐÃ HOÀN THIỆN**
   * Đã thêm `parentId`, `replyTo` vào model Comment.
   * UI hỗ trợ reply inline với component `CommentThread` đệ quy (max 3 cấp).
   * Cascading delete khi xóa comment cha.
   * Notification cho người được reply (type: `reply_comment`).

2. **Chưa Hỗ Trợ Đính Kèm Hình Ảnh / Sticker / Emoji Picker**:
   * Bình luận mới chỉ chấp nhận chuỗi văn bản thuần (plain text).
   * Chưa có bộ chọn Emoji chuẩn (Emoji Picker) hoặc tải ảnh/GIF đính kèm bình luận.

3. **Chưa Có Mention người dùng (@username)**:
   * Khi nhắc đến tên người khác trong bình luận, hệ thống chưa tự động gợi ý danh sách người dùng và chưa gửi thông báo đẩy cho người được mention.

4. **Vấn Đề Phân Trang Bình Luận (Comment Pagination)**:
   * Khi bài viết có hàng ngàn comment, việc query toàn bộ comment một lần gây nặng dung lượng mạng và làm đơ giao diện.
   * Cần phân trang bình luận (vd: 10 comment / lần bấm "Xem thêm bình luận").

---

## 4. Kế Hoạch Cải Tiến & Roadmap (Senior Dev Recommendations)

- [x] **Task 1**: Thêm trường `parentId`, `replyTo` vào Schema và nâng cấp UI để hỗ trợ luồng Reply Comment (Nested Replies) - **HOÀN THIỆN 2026-11-16**.
- [ ] **Task 2**: Tích hợp Emoji Picker (`emoji-mart` hoặc thư viện tương đương) vào ô nhập comment.
- [ ] **Task 3**: Xây dựng tính năng Mention `@username` tự động gửi Notification đến người được gắn thẻ.
- [ ] **Task 4**: Phân trang danh sách bình luận theo Lazy Loading / Infinite Scroll.
