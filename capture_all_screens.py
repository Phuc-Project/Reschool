import os
import sys
import time
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import functools
import shutil

# Fix Windows console UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Tắt log console của http.server

def start_server(port, root_dir):
    handler = functools.partial(QuietHandler, directory=root_dir)
    server = HTTPServer(('127.0.0.1', port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

def capture_screenshots():
    from playwright.sync_api import sync_playwright

    port = 8899
    base_dir = r"d:\Reschool -Ngân hàng đồ cũ tái sử dụng"
    frontend_dir = os.path.join(base_dir, "frontend")
    output_dir = os.path.join(base_dir, "screenshots")
    artifact_dir = r"C:\Users\Admin\.gemini\antigravity\brain\b405c429-a5e2-47ab-9755-85c08c1a2bc4\screenshots"

    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(artifact_dir, exist_ok=True)

    print(f"Đang khởi động HTTP Server nội bộ tại http://127.0.0.1:{port}...")
    server = start_server(port, frontend_dir)
    time.sleep(1)

    print("Đang khởi động Playwright Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-web-security"])
        
        # =========================================================================
        # 1. Desktop Context (1440x900 @ 2x Retina)
        # =========================================================================
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2
        )

        # Cài đặt sẵn tài khoản đã đăng nhập học sinh THCS Ái Quốc vào LocalStorage
        context.add_init_script("""
            localStorage.setItem('reschool_auth_user', JSON.stringify({
                uid: 'demo-student-aiquoc',
                displayName: 'Nguyễn Minh Châu',
                email: 'minhchau.thcsaiquoc@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
                school: 'Trường THCS Ái Quốc',
                district: 'Hải Phòng',
                city: 'Hải Phòng',
                studentClass: '8A2',
                grade: 8,
                phone: '0912 345 678',
                zalo: '0912 345 678',
                profileCompleted: true
            }));
            localStorage.setItem('reschool_student_profile_demo-student-aiquoc', JSON.stringify({
                authorName: 'Nguyễn Minh Châu',
                schoolName: 'Trường THCS Ái Quốc',
                district: 'Hải Phòng',
                city: 'Hải Phòng',
                studentClass: '8A2',
                grade: 8,
                phone: '0912 345 678',
                zalo: '0912 345 678',
                address: 'Cổng Thư viện THCS Ái Quốc'
            }));
        """)

        page = context.new_page()

        # -------------------------------------------------------------
        # 01. Trang chủ Khám phá đồ dùng (Feed)
        # -------------------------------------------------------------
        print("1. Đang chụp: Trang chủ Khám phá đồ dùng (Feed)...")
        page.goto(f"http://127.0.0.1:{port}/index.html", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        try:
            page.wait_for_selector("#items-grid .item-card", timeout=5000)
        except Exception as e:
            print(f"  [Notice] wait_for_selector: {e}")
        file_01 = os.path.join(output_dir, "01_trang_chu_kham_pha_feed.png")
        page.screenshot(path=file_01)
        print("  -> Đã lưu 01_trang_chu_kham_pha_feed.png")

        # -------------------------------------------------------------
        # 02. Bản đồ vị trí trường học (GIS Map)
        # -------------------------------------------------------------
        print("2. Đang chụp: Bản đồ vị trí trường học (GIS Map)...")
        page.evaluate("""
            if (window.reschoolApp) {
                window.reschoolApp.switchTab('map');
            } else {
                document.querySelector('.nav-tab-btn[data-tab="map"]').click();
            }
        """)
        page.wait_for_timeout(2000)
        # Mở popup ghim vị trí trường THCS Ái Quốc
        page.evaluate("""
            const chip = document.querySelector('.school-chip[data-id="item-hp-aq-01"]');
            if (chip) chip.click();
        """)
        page.wait_for_timeout(1500)
        file_02 = os.path.join(output_dir, "02_ban_do_so_gis_truong_hoc.png")
        page.screenshot(path=file_02)
        print("  -> Đã lưu 02_ban_do_so_gis_truong_hoc.png")

        # -------------------------------------------------------------
        # 03. Thuật toán ghép nối thông minh (Matchmaking)
        # -------------------------------------------------------------
        print("3. Đang chụp: Thuật toán ghép nối thông minh (Matchmaking)...")
        page.evaluate("""
            if (window.reschoolApp) {
                window.reschoolApp.switchTab('matchmaking');
            } else {
                document.querySelector('.nav-tab-btn[data-tab="matchmaking"]').click();
            }
        """)
        page.wait_for_timeout(1500)
        file_03 = os.path.join(output_dir, "03_thuat_toan_ghep_noi_matchmaking.png")
        page.screenshot(path=file_03)
        print("  -> Đã lưu 03_thuat_toan_ghep_noi_matchmaking.png")

        # -------------------------------------------------------------
        # 04. Về dự án & Thống kê Tác động Môi trường - Xã hội
        # -------------------------------------------------------------
        print("4. Đang chụp: Về dự án & Thống kê Tác động Môi trường...")
        page.evaluate("""
            if (window.reschoolApp) {
                window.reschoolApp.switchTab('about');
            } else {
                document.querySelector('.nav-tab-btn[data-tab="about"]').click();
            }
        """)
        page.wait_for_timeout(1500)
        file_04 = os.path.join(output_dir, "04_ve_du_an_va_tac_dong_moi_truong.png")
        page.screenshot(path=file_04)
        print("  -> Đã lưu 04_ve_du_an_va_tac_dong_moi_truong.png")

        # -------------------------------------------------------------
        # 05. Modal Chi tiết vật phẩm (Item Detail)
        # -------------------------------------------------------------
        print("5. Đang chụp: Modal Chi tiết vật phẩm (Item Detail)...")
        page.evaluate("""
            if (window.reschoolApp) {
                window.reschoolApp.switchTab('explore');
            } else {
                document.querySelector('.nav-tab-btn[data-tab="explore"]').click();
            }
        """)
        page.wait_for_timeout(1000)
        page.evaluate("""
            const card = document.querySelector('.item-card[data-id="item-hp-aq-01"]') || document.querySelector('.item-card');
            if (card) card.click();
        """)
        page.wait_for_timeout(1500)
        file_05 = os.path.join(output_dir, "05_chi_tiet_vat_pham_item_detail.png")
        page.screenshot(path=file_05)
        print("  -> Đã lưu 05_chi_tiet_vat_pham_item_detail.png")

        # Đóng modal chi tiết
        page.evaluate("""
            const closeBtn = document.querySelector('#item-detail-modal .modal-close-btn');
            if (closeBtn) closeBtn.click();
            const modal = document.getElementById('item-detail-modal');
            if (modal) modal.classList.remove('active');
        """)
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # 06. Modal Đăng tin Cho / Nhận đồ dùng
        # -------------------------------------------------------------
        print("6. Đang chụp: Modal Đăng tin Cho / Nhận đồ dùng...")
        page.evaluate("""
            const btn = document.getElementById('btn-open-create-post');
            if (btn) btn.click();
            const modal = document.getElementById('create-post-modal');
            if (modal) modal.classList.add('active');
        """)
        page.wait_for_timeout(1200)
        file_06 = os.path.join(output_dir, "06_modal_dang_tin_cho_tang.png")
        page.screenshot(path=file_06)
        print("  -> Đã lưu 06_modal_dang_tin_cho_tang.png")

        # Đóng modal đăng tin
        page.evaluate("""
            const modal = document.getElementById('create-post-modal');
            if (modal) modal.classList.remove('active');
        """)
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # 07. Modal Phiếu Luân Chuyển Học Đường (Trạm Thư viện 4.0)
        # -------------------------------------------------------------
        print("7. Đang chụp: Modal Phiếu Luân Chuyển Học Đường (Trạm Thư viện 4.0)...")
        page.evaluate("""
            document.getElementById('ticket-item-title').textContent = 'Trọn bộ SGK Lớp 7 Kết Nối Tri Thức (12 cuốn, còn mới 95%)';
            document.getElementById('display-transit-code').textContent = 'MÃ SGK-01';
            document.getElementById('ticket-station-name').textContent = 'Thư viện / Phòng Đoàn Đội - Trường THCS Ái Quốc';
            document.getElementById('transit-ticket-modal').classList.add('active');
        """)
        page.wait_for_timeout(1200)
        file_07 = os.path.join(output_dir, "07_phieu_luan_chuyen_tram_thu_vien.png")
        page.screenshot(path=file_07)
        print("  -> Đã lưu 07_phieu_luan_chuyen_tram_thu_vien.png")

        # Đóng modal phiếu luân chuyển
        page.evaluate("""
            document.getElementById('transit-ticket-modal').classList.remove('active');
        """)
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # 08. Modal Hồ sơ học sinh (Onboarding & Bảo mật)
        # -------------------------------------------------------------
        print("8. Đang chụp: Modal Hồ sơ học sinh (Onboarding & Bảo mật)...")
        page.evaluate("""
            document.getElementById('profile-school-name').value = 'Trường THCS Ái Quốc';
            document.getElementById('profile-district').value = 'Hải Phòng';
            document.getElementById('profile-address').value = 'Cổng Thư viện THCS Ái Quốc';
            document.getElementById('profile-student-name').value = 'Nguyễn Minh Châu';
            document.getElementById('profile-student-class').value = '8A2';
            document.getElementById('profile-phone').value = '0912 345 678';
            document.getElementById('profile-station').value = 'Thư viện / Phòng Đoàn Đội - Trường THCS Ái Quốc';
            document.getElementById('profile-onboarding-modal').classList.add('active');
        """)
        page.wait_for_timeout(1200)
        file_08 = os.path.join(output_dir, "08_ho_so_hoc_sinh_onboarding.png")
        page.screenshot(path=file_08)
        print("  -> Đã lưu 08_ho_so_hoc_sinh_onboarding.png")

        # Đóng modal hồ sơ
        page.evaluate("""
            document.getElementById('profile-onboarding-modal').classList.remove('active');
        """)
        page.wait_for_timeout(500)

        context.close()

        # =========================================================================
        # 2. Trang Đăng nhập (Clean context)
        # =========================================================================
        print("9. Đang chụp: Trang Đăng nhập Xác thực Học sinh (login.html)...")
        login_context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2
        )
        login_page = login_context.new_page()
        login_page.goto(f"http://127.0.0.1:{port}/login.html", wait_until="domcontentloaded")
        login_page.wait_for_timeout(1500)
        file_09 = os.path.join(output_dir, "09_trang_dang_nhap_he_thong_login.png")
        login_page.screenshot(path=file_09)
        print("  -> Đã lưu 09_trang_dang_nhap_he_thong_login.png")
        login_context.close()

        # =========================================================================
        # 3. Giao diện Điện thoại Mobile App (iPhone Viewport 390x844)
        # =========================================================================
        print("10. Đang chụp: Giao diện Ứng dụng Di động Mobile Responsive (390x844)...")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        mobile_context.add_init_script("""
            localStorage.setItem('reschool_auth_user', JSON.stringify({
                uid: 'demo-student-aiquoc',
                displayName: 'Nguyễn Minh Châu',
                email: 'minhchau.thcsaiquoc@gmail.com',
                school: 'Trường THCS Ái Quốc',
                district: 'Hải Phòng',
                studentClass: '8A2',
                grade: 8,
                phone: '0912 345 678',
                profileCompleted: true
            }));
        """)
        mobile_page = mobile_context.new_page()
        mobile_page.goto(f"http://127.0.0.1:{port}/index.html", wait_until="domcontentloaded")
        mobile_page.wait_for_timeout(2500)
        file_10 = os.path.join(output_dir, "10_giao_dien_mobile_app_responsive.png")
        mobile_page.screenshot(path=file_10)
        print("  -> Đã lưu 10_giao_dien_mobile_app_responsive.png")
        mobile_context.close()

        browser.close()

    server.shutdown()
    print("Đã tắt server HTTP nội bộ.")

    # Sao chép vào thư mục artifact
    print(f"Đang đồng bộ ảnh vào Artifact directory: {artifact_dir}...")
    for f in os.listdir(output_dir):
        if f.endswith(".png"):
            shutil.copy2(os.path.join(output_dir, f), os.path.join(artifact_dir, f))
            print(f"  + Đã sao chép: {f}")

    print("\nHOÀN THÀNH: Đã chụp toàn bộ 10 trang giao diện chức năng của hệ thống Reschool!")

if __name__ == "__main__":
    capture_screenshots()
