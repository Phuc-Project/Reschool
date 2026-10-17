# Reschool Frontend - Ngân hàng đồ cũ & SGK luân chuyển

Giao diện Web SPA hiện đại, thẩm mỹ chuẩn học đường Việt Nam, được thiết kế tỉ mỉ dựa trên poster sáng kiến: **"Ngân hàng đồ cũ và sách giáo khoa luân chuyển"**.

---

## 1. Cấu trúc thư mục Frontend

```
frontend/
├── index.html              # Trang chủ ứng dụng SPA chính
├── css/
│   ├── main.css            # Typography, CSS Variables, Header, Hero Banner, Tabs, Responsive
│   ├── components.css      # Thẻ đồ dùng, Bộ lọc, Modals, Nút bấm Zalo/Điện thoại, Toasts
│   └── map.css             # Định kiểu bản đồ Leaflet, ghim vị trí trường học & popups
├── js/
│   ├── firebase-config.js  # Cấu hình Firebase Web SDK & API Key switcher
│   ├── mock-data.js        # Dữ liệu hạt giống phong phú (SGK Lớp 10, Áo khoác, Casio 580...)
│   ├── api.js              # Data Adapter (FastAPI Backend + LocalStorage Fallback)
│   ├── auth.js             # Quản lý tài khoản học sinh
│   ├── map.js              # Khởi tạo bản đồ tương tác OpenStreetMap Leaflet
│   ├── matchmaking.js      # Giao diện thuật toán ghép cặp người cho - người nhận
│   ├── items.js            # Render thẻ đồ dùng & Modal chi tiết
│   └── app.js              # Controller trung tâm điều phối sự kiện
└── assets/                 # Thư mục hình ảnh & tài nguyên tĩnh
```

---

## 2. Cách khởi chạy Frontend

### Cách 1: Sử dụng Live Server hoặc bất kỳ Static Web Server nào
Nếu bạn có Node.js hoặc Python đã cài sẵn:
```bash
# Dùng Python HTTP server đơn giản:
cd frontend
python -m http.server 5500

# Hoặc dùng npx serve:
npx serve .
```
Truy cập trình duyệt: `http://localhost:5500`

### Cách 2: Mở trực tiếp bằng VS Code Live Server
Chuột phải vào `frontend/index.html` chọn **Open with Live Server**.

---

## 3. Cấu hình Firebase Project & API Key riêng

Có 2 cách đơn giản để cấu hình Firebase:

### Cách 1: Nhập trực tiếp trên giao diện Web (Không cần sửa code)
1. Bấm vào nút **"Firebase (Demo Mode) • Cấu hình API Key"** ở góc phải thanh thông báo trên cùng của trang web.
2. Dán **API Key** và **Project ID** của dự án Firebase bạn tạo trên [Firebase Console](https://console.firebase.google.com/).
3. Bấm **Lưu cấu hình**. Trạng thái sẽ lập tức chuyển sang chấm xanh `🟢 Firebase: <project-id>`.

### Cách 2: Chỉnh sửa file mã nguồn `frontend/js/firebase-config.js`
Thay đổi thông số trong biến `DEFAULT_FIREBASE_CONFIG`:
```javascript
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "reschool-project.firebaseapp.com",
  projectId: "reschool-project",
  storageBucket: "reschool-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```
*(Nếu chưa có API Key Firebase thật, hệ thống vẫn tự động hoạt động ở chế độ Demo Simulator mượt mà, đầy đủ tất cả tính năng!)*
