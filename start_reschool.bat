@echo off
chcp 65001 >nul
echo ========================================================
echo        KHỞI CHẠY HỆ THỐNG RESCHOOL ECOSYSTEM
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Đang khởi động Backend API Server (Port 8001)...
start "Reschool Backend API" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python -m uvicorn app.main:app --port 8001 --reload"

timeout /t 2 >nul

echo [2/3] Đang khởi động Frontend Web Server (Port 5500)...
start "Reschool Frontend Web" cmd /k "cd /d "%~dp0frontend" && python -m http.server 5500"

timeout /t 1 >nul

echo [3/3] Đang mở trình duyệt vào trang đăng nhập Reschool...
start http://localhost:5500/login.html

echo.
echo ========================================================
echo  ĐÃ KHỞI CHẠY THÀNH CÔNG!
echo  - Frontend: http://localhost:5500/login.html
echo  - Backend API: http://localhost:8001/docs
echo ========================================================
pause
