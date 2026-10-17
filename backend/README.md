# Reschool Backend - Ngân hàng đồ cũ & SGK luân chuyển

Backend API được xây dựng bằng **Python FastAPI**, tích hợp **Cloud Firestore** & **Firebase Admin SDK**, đi kèm thuật toán **Gợi ý ghép cặp thông minh (Smart Matchmaking)** theo vị trí và nhu cầu.

---

## 1. Cấu trúc thư mục Backend

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       ├── items.py         # CRUD đồ dùng & sách giáo khoa
│   │       ├── matchmaking.py   # Ghép cặp thông minh người cho - người nhận
│   │       └── stats.py         # Thống kê tác động xanh (CO2, giấy, học sinh)
│   ├── core/
│   │   ├── config.py            # Cấu hình Pydantic Settings
│   │   └── firebase.py          # Firebase Admin SDK & Fallback Manager
│   ├── models/
│   │   └── schemas.py           # Pydantic Schemas type-safe chuẩn V2
│   ├── services/
│   │   ├── firestore_service.py # Xử lý dữ liệu Firestore & In-memory
│   │   └── matchmaking_service.py# Thuật toán Haversine & tính độ khớp %
│   └── main.py                  # Entrypoint FastAPI & Middleware
├── .env.example                 # Mẫu file biến môi trường
├── requirements.txt             # Thư viện phụ thuộc
└── README.md
```

---

## 2. Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Tạo môi trường ảo Python
```bash
cd backend
python -m venv venv

# Kích hoạt trên Windows PowerShell:
.\venv\Scripts\Activate.ps1
```

### Bước 2: Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```bash
copy .env.example .env
```

### Bước 4: Khởi chạy API Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Docs tương tác Swagger: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

---

## 3. Tích hợp Firebase Admin (Tùy chọn cho Production)
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Vào **Project Settings** > **Service accounts**.
3. Bấm **Generate new private key** để tải về file `serviceAccountKey.json`.
4. Đặt file này vào thư mục `backend/serviceAccountKey.json`.
5. Khi khởi động, Backend sẽ tự động phát hiện và kết nối với Cloud Firestore của bạn.
*(Lưu ý: Nếu chưa có file key, backend vẫn tự động chạy ở chế độ Local Simulator với đầy đủ chức năng và dữ liệu hạt giống phong phú!)*
