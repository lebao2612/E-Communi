# E-Community (BChat) - Development Rules & Guidelines

> **Mục đích**: Đảm bảo quy trình phát triển nhất quán, an toàn và tuân thủ best practices.

---

## 🔒 **QUY TẮC BẮT BUỘC (MANDATORY RULES)**

### 1. **Git & Version Control**
- ❌ **KHÔNG được tự động `git push`** lên remote (origin) mà **KHÔNG có sự đồng ý rõ ràng** từ developer.
- ✅ Chỉ được `git commit` local sau khi hoàn thành task/test.
- ✅ Push chỉ thực hiện khi developer xác nhận: *"Push lên remote"* hoặc *"Tạo PR"*.
- 🔀 Branch naming: `feature/<task-name>`, `fix/<bug-name>`, `refactor/<scope>`, `chore/<task>`
- 📝 Commit message: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)

### 2. **Code Quality**
- ✅ Mọi code mới phải pass: TypeScript compile (`npm run build`), ESLint (nếu có)
- ✅ Backend: `node -c <file>` validate syntax trước khi commit
- ✅ Không commit file build artifacts (`dist/`, `build/`, `node_modules/`, `.env`)
- ✅ Không commit secrets (API keys, passwords, tokens)

### 3. **Testing & Verification**
- ✅ Build frontend thành công trước khi commit
- ✅ Backend syntax valid trước khi commit
- ✅ Test manual cơ bản (smoke test) tính năng vừa viết

### 4. **Documentation**
- ✅ Cập nhật `docs/` khi thay đổi architecture, API contract, schema DB
- ✅ Comment code phức tạp (business logic, algorithm)
- ✅ Update README nếu thay đổi setup/deploy

---

## 🛠️ **DEVELOPMENT WORKFLOW**

```
1. Tạo branch mới từ main: git checkout -b feature/<task-name>
2. Implement task (code + test)
3. Build & validate: npm run build (FE), node -c (BE)
4. Commit local: git add . && git commit -m "feat: <mô tả>"
5. 🛑 DỪNG - Chờ developer review & approve
6. Sau khi approve: git push origin feature/<task-name>
7. Tạo Pull Request (nếu cần review team)
8. Merge sau khi CI/CD pass
```

---

## 🤖 **AI ASSISTANT RULES (CHO CLINE/CURSOR/COPILOT)**

| Hành động | Quy tắc |
|-----------|---------|
| **Read files** | ✅ Tự do đọc bất kỳ file nào để hiểu context |
| **Search codebase** | ✅ Tự do search regex, grep |
| **Plan/Analyze** | ✅ Tự do phân tích, đề xuất plan |
| **Edit files (Act mode)** | ✅ Chỉ khi developer approve plan |
| **Run commands (build, test, lint)** | ✅ Chỉ read-only commands (build, test, syntax check) |
| **Git commit** | ✅ Cho phép commit local sau khi task done |
| **Git push** | ❌ **TUYỆT ĐỐI KHÔNG** - Phải hỏi developer |
| **Git checkout/switch branch** | ❌ Không tự ý switch branch |
| **Install packages (npm install)** | ❌ Không tự ý install package mới |
| **Modify package.json** | ❌ Không tự ý sửa dependencies |
| **Delete files** | ❌ Không tự ý xóa file (trừ khi developer yêu cầu) |

---

## 📁 **PROJECT STRUCTURE CONVENTIONS**

### Backend (`backend/`)
```
├── controllers/     # Request handlers (thin, delegate to services)
├── services/        # Business logic, DB operations
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── middleware/      # Auth, validation, error handling
├── utils/           # Helpers, error classes, constants
└── config/          # DB, Redis, Cloudinary config
```

### Frontend (`frontend/src/`)
```
├── components/      # Reusable UI components (PascalCase folders)
├── pages/           # Route-level components
├── stores/          # Zustand stores (domain-based)
├── contexts/        # React Context providers
├── hooks/           # Custom hooks
├── types/           # TypeScript interfaces
├── utils/           # Helpers, formatters
├── api/             # Axios instance, API endpoints
└── assets/          # Static assets (images, fonts)
```

---

## 🎨 **CODE STYLE GUIDELINES**

### TypeScript/React
- Functional components + hooks only
- Type interfaces in `types/` folder
- Zustand for global state (domain-separated stores)
- SCSS Modules for styling (BEM-like naming)
- No `any` type - dùng `unknown` hoặc proper types

### Node.js/Express
- Async/await + `asyncHandler` wrapper
- Service layer pattern (controller → service → model)
- Mongoose lean() cho read-heavy queries
- Proper error handling với custom `HttpError` class
- Validation middleware trước controller

### Database (MongoDB)
- Indexes trên các field query thường xuyên
- TTL indexes cho temporary data (OTP, sessions)
- Reference (`ref`) thay vì embed cho collections lớn
- `select('-password -refreshToken')` mặc định

---

## 🚀 **DEPLOYMENT RULES**

| Environment | Branch | Auto-deploy |
|-------------|--------|-------------|
| Development (Local) | `feature/*` | Manual |
| Staging | `develop` | ✅ GitHub Actions |
| Production | `main` | ✅ GitHub Actions (protected) |

- Production deploy yêu cầu: PR approved + CI pass + Manual approve
- Environment variables: Không hardcode, dùng `.env` / Secret Manager

---

## 📋 **TASK TRACKING**

Mọi task đều được track trong `docs/SUMMARY.md` và `docs/XX-feature.md`:
- [ ] Todo
- 🔄 In Progress
- ✅ Done
- ❌ Blocked

### 5. **Documentation Auto-Update (BẮT BUỘC)**
- ✅ **Khi hoàn thành 1 feature/task**: Tự động cập nhật **TẤT CẢ** file tài liệu liên quan:
  - `docs/XX-feature.md` - Cập nhật chi tiết kỹ thuật, API, schema, limitations, roadmap
  - `docs/SUMMARY.md` - Cập nhật progress table, status, checklist, roadmap
  - `README.md` (nếu có) - Cập nhật setup, features list
- ✅ Bao gồm: Schema changes, API endpoints mới/đổi, UI components mới, config mới, limitations đã fix, roadmap tiếp theo
- ✅ Mục đích: **Context đầy đủ cho AI/làm tiếp**, audit trail, knowledge transfer
- 📝 Commit message: `docs: update <feature> documentation` (tách commit hoặc cùng commit feature)

---

## 🔄 **UPDATE RULES**

File này có thể cập nhật khi:
1. Có quy trình mới được team đồng thuận
2. Phát hiện lỗ hổng trong quy trình hiện tại
3. Thay đổi tech stack / tooling

**Cập nhật cần**: Developer approve + Commit message `chore: update development rules`

---

*Last updated: 2026-11-16*  
*Project: E-Community (BChat)*  
*Author: Senior Fullstack Developer / Solutions Architect*