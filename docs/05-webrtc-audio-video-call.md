# Document Chức Năng 05: WebRTC Audio & Video Call System (Cuộc Gọi Thoại & Video)

> **Tác giả**: Senior Fullstack Developer / Solutions Architect  
> **Dự án**: E-Community (BChat)  
> **Cập nhật gần nhất**: 2026-10-08  

---

## 1. Tổng Quan Chức Năng & Kiến Trúc (Overview & Architecture)

Hệ thống Cuộc gọi WebRTC cung cấp tính năng gọi thoại (Audio Call) và gọi video (Video Call) thời gian thực giữa 2 người dùng (Peer-to-Peer). Sử dụng kết hợp **PeerJS Server** (được tích hợp ngay trong Express App dưới đường dẫn `/peerjs`) để trao đổi Peer ID, **Socket.io** làm kênh truyền tín hiệu (Signaling Channel) cho luồng yêu cầu/chấp nhận/từ chối cuộc gọi, và **Twilio Network Traversal Service** để cấp phát thông tin TURN/STUN Server giúp vượt qua NAT/Firewall khắt khe.

```mermaid
graph TD
    Caller[Caller Client] -->|1. Get ICE Credentials| TwilioAPI[Twilio TURN/STUN Service]
    Caller -->|2. Register Peer| PeerJS[Express PeerJS Server (/peerjs)]
    Caller -->|3. Socket request_call| SocketServer[Socket.io Signaling]
    SocketServer -->|4. Emit incoming_call| Receiver[Receiver Client]
    Receiver -->|5. Socket accept_call| SocketServer
    SocketServer -->|6. Emit call_accepted| Caller
    Caller <==>|7. Peer-to-Peer Media Stream (P2P)| Receiver
```

---

## 2. Chi Tiết Kỹ Thuật Đã Triển Khai (Implemented Features & Tech Specs)

### 2.1 Backend Services & Signaling Endpoints

* **Express PeerJS Mounting (`backend/services/realtimeService.js`)**:
  * Tích hợp `ExpressPeerServer` dưới endpoint `/peerjs`.
  * Cho phép client đăng ký Peer ID ngẫu nhiên hoặc theo format quy định.

* **Twilio ICE Server Service (`backend/services/webrtcService.js`)**:
  * API Endpoint: `GET /api/webrtc/turn-credentials`
  * Tự động tạo temporary TURN/STUN credentials qua Twilio SDK (`twilio.tokens.create()`).
  * Giúp kết nối WebRTC duy trì ổn định ngay cả khi cả 2 client đều đứng sau Symmetric NAT / Router mạng di động 4G/5G.

* **Socket Signaling Events**:
  | Event Name | Direction | Payload | Mô Tả |
  | :--- | :--- | :--- | :--- |
  | `request_call` | Client -> Server -> Target | `{ receiverId, type, callerPeerId, callerName, callerAvatar }` | Gửi lời mời cuộc gọi thoại / video. |
  | `incoming_call` | Server -> Receiver | Full call payload | Hiển thị Modal cuộc gọi đến trên màn hình người nhận. |
  | `accept_call` | Receiver -> Server -> Caller | `{ callerId, receiverPeerId }` | Người nhận đồng ý nghe cuộc gọi. |
  | `call_accepted` | Server -> Caller | Receiver details + Peer ID | Người gọi khởi tạo kết nối P2P Media Stream. |
  | `reject_call` | Receiver -> Server -> Caller | `{ callerId }` | Người nhận bấm từ chối cuộc gọi. |
  | `end_call` | Either -> Server -> Target | `{ toUserId }` | Dừng cuộc gọi và giải phóng camera/micro. |

### 2.2 Frontend Integration

* **WebRTC Store (`frontend/src/stores/webrtcStore.ts`)**:
  * Quản lý trạng thái cuộc gọi: `idle`, `calling`, `incoming`, `connected`, `ended`.
  * Quản lý trạng thái Bật/Tắt Micro (Mute/Unmute) và Bật/Tắt Camera.
* **UI Component (`frontend/src/components/IncomingCallModal`)**:
  * Modal nổi lên với chuông báo hiệu khi có cuộc gọi đến.
  * Nút "Chấp nhận" (Xanh) và "Từ chối" (Đỏ) thiết kế nổi bật.

---

## 3. Hạn Chế, Lỗ Hổng & Thiếu Sót Hiện Tại (Limitations & Tech Debt)

> [!WARNING]
> Những điểm giới hạn cần khắc phục đối với tính năng WebRTC Call.

1. **Chưa Hỗ Trợ Cuộc Gọi Nhóm (Group Call / Mesh / SFU Limits)**:
   * **Hiện trạng**: Kiến trúc hiện tại chỉ là Peer-to-Peer 1-1 (Mesh P2P).
   * **Hạn chế**: Nếu mở rộng cuộc gọi nhóm trên 3-4 người, băng thông của từng client sẽ bị quá tải (mỗi client phải gửi video cho N-1 người còn lại).
   * **Giải pháp Senior**: Cần tích hợp Media Server dạng SFU (Selective Forwarding Unit) như **Mediasoup**, **Janus**, hoặc **LiveKit** nếu muốn làm cuộc gọi nhóm.

2. **Chưa Có Xử Lý Timeout Cuộc Gọi (Missed Call / Cuộc gọi nhỡ)**:
   * Nếu người gọi bấm gọi nhưng người nhận không có ở đó và không bấm "Từ chối", cuộc gọi sẽ bị treo vô thời hạn ở trạng thái `calling`.
   * Cần đặt timer tự động hủy sau 30-45 giây không có phản hồi và tạo bản ghi "Cuộc gọi nhỡ" trong danh sách thông báo.

3. **Chưa Có Tính Năng Chia Sẻ Màn Hình (Screen Sharing)**:
   * Chưa có nút Screen Share cho phép người dùng chia sẻ màn hình máy tính trong lúc gọi video.

4. **Quản Lý Băng Thông & Tự Động Điều Chỉnh Chất Lượng (Adaptive Bitrate)**:
   * Khi đường truyền mạng yếu, cuộc gọi dễ bị giật giật hoặc mất kết nối mà chưa có cơ chế giảm resolution video hoặc chuyển tự động sang Audio-only mode.

---

## 4. Kế Hoạch Cải Tiến & Roadmap (Senior Dev Recommendations)

- [ ] **Task 1**: Thêm Timer Timeout 40 giây cho `request_call`. Tự động phát sinh Notification "Cuộc gọi nhỡ".
- [ ] **Task 2**: Thêm tính năng Chia sẻ màn hình (Screen Sharing) sử dụng `navigator.mediaDevices.getDisplayMedia()`.
- [ ] **Task 3**: Thêm tính năng Chuyển đổi linh hoạt giữa Audio Call và Video Call trong lúc đang gọi.
- [ ] **Task 4**: Nghiên cứu tích hợp SFU Server (LiveKit / Mediasoup) hỗ trợ gọi video nhóm đa điểm.
