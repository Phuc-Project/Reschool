# Reschool - Ngân hàng đồ cũ & Sách giáo khoa luân chuyển

> **Slogan:** "Trao đi những điều cũ - Nhận lại những giá trị mới • Kết nối học sinh - Lan tỏa yêu thương - Vì một ngôi trường xanh"

Dự án công nghệ cộng đồng học đường giúp kết nối học sinh trao tặng và tái sử dụng sách giáo khoa, đồng phục, máy tính bỏ túi và đồ dùng học tập; ứng dụng thuật toán **Ghép cặp thông minh (Smart Matchmaking)** theo vị trí trường học và nhu cầu thực tế.

---

## 1. Cấu trúc phân vùng dự án (2 Folders: Backend & Frontend)

Hệ thống được tách biệt độc lập thành 2 thư mục rõ ràng theo đúng yêu cầu:

```
d:\Reschool -Ngân hàng đồ cũ tái sử dụng\
├── frontend/                     # Phân vùng Web Client SPA (HTML5, CSS3, ES Modules, Leaflet Map)
│   ├── index.html                # Giao diện chính Single Page Application
│   ├── css/
│   │   ├── main.css              # Typography học đường (Be Vietnam Pro), Design tokens, Hero banner
│   │   ├── components.css        # Thẻ đồ dùng, Bộ lọc, Modals, Nút liên hệ Zalo, Thông báo Toast
│   │   └── map.css               # Bản đồ Leaflet OpenStreetMap, Custom Pin vị trí trường học
│   ├── js/
│   │   ├── firebase-config.js    # Cấu hình Firebase Web Client & API Key switcher
│   │   ├── mock-data.js          # Dữ liệu mẫu SGK (Kết Nối Tri Thức, Cánh Diều), Đồng phục, Casio 580...
│   │   ├── api.js                # Data Client Adapter (FastAPI + Local Fallback)
│   │   ├── auth.js               # Xác thực tài khoản học sinh
│   │   ├── map.js                # Quản lý bản đồ vị trí Leaflet & Marker popups
│   │   ├── matchmaking.js        # Giao diện hiển thị các cặp ghép cho - nhận
│   │   ├── items.js              # Quản lý danh sách đồ dùng & Modal chi tiết
│   │   └── app.js                # Điều phối trung tâm của ứng dụng Web
│   └── README.md                 # Hướng dẫn chạy & tùy biến Frontend
│
├── backend/                      # Phân vùng API Server (Python FastAPI + Cloud Firestore)
│   ├── app/
│   │   ├── main.py               # Entrypoint FastAPI, CORS Middleware, Lifespan
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic Settings đọc từ .env
│   │   │   └── firebase.py       # Quản lý kết nối Firebase Admin SDK & Fallback Manager
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic Schemas type-safe (Item, Matchmaking, Stats)
│   │   ├── services/
│   │   │   ├── firestore_service.py # Xử lý lưu trữ Cloud Firestore & In-memory
│   │   │   └── matchmaking_service.py # Thuật toán Haversine & tính độ tương thích %
│   │   └── api/
│   │       └── endpoints/
│   │           ├── items.py      # RESTful CRUD /api/v1/items
│   │           ├── matchmaking.py# Endpoint /api/v1/matchmaking/suggestions
│   │           └── stats.py      # Thống kê tác động xanh /api/v1/stats
│   ├── requirements.txt          # Thư viện phụ thuộc Python
│   ├── .env.example              # Mẫu biến môi trường
│   └── README.md                 # Hướng dẫn chạy Backend
│
├── .gitignore                    # Bảo vệ an toàn mã nguồn, ngăn rò rỉ API Keys / Secrets
└── README.md                     # Tài liệu tổng quan toàn bộ dự án
```

---

## 2. 4 Tính năng cốt lõi (Bám sát Poster sáng kiến)

1. **Đăng tin cho / nhận**:
   - Cho phép học sinh đăng sách giáo khoa, đồng phục, máy tính fx-580... cần cho hoặc muốn xin lại.
   - Hỗ trợ tải ảnh xem trước, chọn khối lớp (1-12), tình trạng (Mới 95%, Tốt 90%...), vị trí trường học và số Zalo/điện thoại liên hệ.
2. **Tìm kiếm thông minh**:
   - Tìm kiếm từ khóa theo thời gian thực (realtime).
   - Lọc theo danh mục: Sách giáo khoa, Đồng phục học sinh, Dụng cụ học tập, Đồ dùng khác.
   - Lọc theo loại tin (Cho tặng miễn phí 0đ / Cần xin) và lọc theo khối lớp.
3. **Bản đồ vị trí (Interactive Map)**:
   - Sử dụng Leaflet & OpenStreetMap hiển thị các điểm trường học (THPT Chu Văn An, Phan Đình Phùng, Kim Liên, Marie Curie, Chuyên Amsterdam...).
   - Ghim vị trí trực quan màu xanh lá (Đồ cho tặng) và xanh dương (Đang cần nhận).
4. **Gợi ý ghép cặp (Smart Matchmaking)**:
   - Thuật toán tự động ghép người cho và người nhận có cùng nhu cầu (vd: Bạn Nam tặng sách Toán 10 và bạn Mai Anh cần xin sách Toán 10).
   - Tính toán điểm tương đồng (vd: 98% Khớp) và khoảng cách địa lý (~1.2 km).
   - Tích hợp nút kết nối trực tiếp qua Zalo.

---

## 3. Hướng dẫn thiết lập Firebase riêng bằng API Key

### Bước 1: Tạo dự án Firebase
1. Truy cập [Google Firebase Console](https://console.firebase.google.com/).
2. Nhấn **Add project** và đặt tên cho dự án (ví dụ: `reschool-vietnam`).
3. Chọn kích hoạt **Cloud Firestore** (chọn chế độ *Test mode* hoặc *Production mode*).

### Bước 2: Lấy Web API Key cho Frontend
1. Vào mục **Project Settings** > cuộn xuống phần **Your apps** > chọn biểu tượng Web `</>`.
2. Đặt tên App (ví dụ: `Reschool Web App`) và nhấn **Register app**.
3. Bạn sẽ nhận được đoạn mã chứa `apiKey`, `authDomain`, `projectId`.

### Bước 3: Điền API Key vào Reschool
- **Cách nhanh nhất**: Mở trang web `frontend/index.html`, bấm vào nút màu vàng **"Firebase (Demo Mode) • Cấu hình API Key"** trên thanh tiêu đề và dán API Key vào.
- **Hoặc**: Mở file `frontend/js/firebase-config.js` và thay thế thông số trong `DEFAULT_FIREBASE_CONFIG`.

---

## 4. Cách khởi chạy dự án

### Khởi chạy Frontend:
```bash
cd frontend
# Chạy HTTP server đơn giản:
python -m http.server 5500
# Mở trình duyệt: http://localhost:5500
```

### Khởi chạy Backend (Tùy chọn):
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
