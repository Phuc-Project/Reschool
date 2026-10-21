# BÁO CÁO NÂNG CẤP HỆ THỐNG RESCHOOL THEO PHẢN HỒI KHÁCH HÀNG

> **Khách hàng:** Đặng Hồng Hạnh  
> **Dự án:** Reschool - Nền tảng Ngân hàng đồ cũ & Sách giáo khoa luân chuyển học đường  
> **Thời điểm cập nhật:** 21/10/2026  
> **Trạng thái:** Đã triển khai và kiểm thử thực tế 100% thành công trên cả Desktop & Mobile  

---

## 1. TỔNG HỢP NÂNG CẤP THEO 4 YÊU CẦU CỐT LÕI CỦA KHÁCH

### Yêu cầu 1: Đa dạng hóa phương thức Đăng nhập
- **Ý kiến khách hàng:** *"C thấy toàn đăng nhập với google thôi"*
- **Giải pháp đã triển khai:**
  1. **Google 1-Chạm:** Giữ nguyên sự tiện lợi cho học sinh có tài khoản Google.
  2. **Tài khoản Học sinh:** Bổ sung form đăng nhập bằng **Mã học sinh / Email học đường** và Mật khẩu. Hệ thống tự động tạo hồ sơ khi học sinh đăng nhập lần đầu.
  3. **Chế độ Dùng thử nhanh (3 Vai trò mẫu - 1 chạm vào ngay):**
     - 👨‍🎓 **Em Nguyễn Minh Châu (8A2 THCS Ái Quốc - Người cho):** Đã đăng trọn bộ SGK Lớp 7 & Đồng phục mùa đông.
     - 👩‍🎓 **Em Trần Minh An (7A1 THCS Ái Quốc - Người xin):** Đang cần xin SGK & đồ dùng.
     - 👩‍🏫 **Cô Hoàng Mai Lan (Thủ thư trường):** Phụ trách Trạm luân chuyển và đối soát Mã SGK.
     *(Giúp khách hàng và ban giám khảo kiểm thử toàn bộ luồng mà không cần có sẵn tài khoản thật).*

---

### Yêu cầu 2: Quy trình Phê duyệt Cho - Nhận và Cấp Mã luân chuyển
- **Ý kiến khách hàng:** *"Sau khi có hs xác nhận muốn xin đồ thì có gửi yêu cầu về ng cho đồ k? Thế chỗ kết quả thì sao e"*
- **Giải pháp đã triển khai:**
  - Thay vì tự động sinh mã ngay như trước, khi học sinh bấm **"Gửi yêu cầu nhận đồ qua Trạm"**, một phiếu **Yêu cầu (ItemRequest)** với trạng thái `PENDING` ("Đang chờ") sẽ được gửi đến người đăng đồ.
  - Người cho đồ nhận được thông báo chuông đỏ và vào mục **"Yêu cầu"** để xem thông tin người xin (Họ tên, lớp, trường, lời nhắn).
  - Kết quả xác nhận:
    + **Bấm "Chấp nhận":** Hệ thống sinh **Mã luân chuyển (VD: Mã SGK-01)**, tự động đổi trạng thái vật phẩm sang *Đang luân chuyển qua Trạm*, và gửi thông báo cho học sinh xin sách mang/lấy tại Thư viện trường.
    + **Bấm "Từ chối":** Yêu cầu đóng lại, đồ dùng quay về trạng thái sẵn sàng cho bạn khác.

---

### Yêu cầu 3 & 4: Menu điều hướng chuẩn & Bộ nút thao tác theo ảnh khách gửi
- **Ý kiến khách hàng:** *"E xem có thêm đc mục Đồ dùng của tôi với mục Yêu cầu. Để Hs còn vào xác nhận cho nhận đc k"* kèm hình ảnh menu và bộ nút.
- **Giải pháp đã triển khai:**
  1. **Menu Sidebar Drawer (Chuẩn 6 mục theo đúng hình ảnh khách chụp):**
     - ➕ **Đăng đồ dùng**
     - 📦 **Đồ dùng của tôi** (kèm số lượng bài đăng)
     - 💬 **Yêu cầu** (kèm badge đỏ số lượng yêu cầu đang chờ)
     - 🔔 **Thông báo** (kèm badge số thông báo mới)
     - 📊 **Thống kê** (báo cáo luân chuyển, tiết kiệm chi phí, giảm rác thải)
     - ⚙️ **Cài đặt** (cập nhật trường lớp, trạm luân chuyển)
  2. **Bộ nút hành động chuẩn giao diện hình ảnh:**
     - 🕒 **Đang chờ** (Badge vàng cam, icon đồng hồ)
     - ✔️ **Chấp nhận** (Nút xanh lá cây với dấu tick)
     - ❌ **Từ chối** (Nút đỏ với dấu X)

---

## 2. HÌNH ẢNH MINH CHỨNG THỰC TẾ TRÊN HỆ THỐNG

````carousel
![Trang đăng nhập đa phương thức: Google, Tài khoản trường, Dùng thử nhanh](/screenshots/test_login_page.png)
<!-- slide -->
![Tab Dùng thử nhanh với 3 vai trò mẫu chuẩn THCS Ái Quốc](/screenshots/test_login_demo_tabs.png)
<!-- slide -->
![Trung tâm Quản lý Yêu cầu với nút Chấp nhận / Từ chối theo đúng ảnh khách gửi](/screenshots/test_requests_view.png)
<!-- slide -->
![Trang Đồ dùng của tôi với thống kê và bộ lọc bài đăng](/screenshots/test_my_items_view.png)
<!-- slide -->
![Menu Sidebar Drawer 6 mục chuẩn theo ảnh thiết kế khách hàng](/screenshots/test_drawer_menu.png)
<!-- slide -->
![Giao diện Mobile: Quản lý Yêu cầu và Bottom Navigation Bar](/screenshots/test_mobile_requests.png)
<!-- slide -->
![Giao diện Mobile: Menu Drawer mở từ đáy màn hình](/screenshots/test_mobile_drawer.png)
````

---

## 3. HƯỚNG DẪN KIỂM THỬ TRỰC TIẾP (TESTING WALKTHROUGH)

Quý khách và ban giám khảo có thể trải nghiệm luồng kiểm thử khép kín theo các bước sau:

1. **Bước 1:** Mở trang [login.html](file:///d:/Reschool%20-Ng%C3%A2n%20h%C3%A0ng%20%C4%91%E1%BB%93%20c%C5%A9%20t%C3%A1i%20s%E1%BB%AD%20d%E1%BB%A5ng/frontend/login.html) -> Bấm tab **"Dùng thử nhanh"** -> Chọn **"Em Trần Minh An (Người xin)"**.
2. **Bước 2:** Vào mục **"Khám phá"**, chọn xem cuốn sách *"Trọn bộ SGK Lớp 7 Kết Nối Tri Thức"* của bạn Nguyễn Minh Châu.
3. **Bước 3:** Bấm **"Gửi yêu cầu nhận đồ qua Trạm"**, nhập lời nhắn và bấm xác nhận gửi. Hệ thống sẽ tự động chuyển sang mục **"Yêu cầu tôi đã gửi"** ở trạng thái `🕒 Đang chờ`.
4. **Bước 4 (Đổi vai trò người cho):** Bấm vào icon **Menu (☰)** trên Header -> Bấm chọn **"👤 Em Châu (Cho)"**.
5. **Bước 5:** Tab **"Yêu cầu"** của bạn Châu sẽ hiện badge đỏ `1`. Vào tab **"Yêu cầu nhận được"**, bạn sẽ thấy thẻ yêu cầu của bạn An với 2 nút:
   - Bấm **"✔️ Chấp nhận"**: Hệ thống sinh ngay **Mã SGK-01** và hiển thị thông báo Trạm Thư viện.
   - Bấm **"❌ Từ chối"**: Hệ thống đóng yêu cầu và mở lại sách cho người khác.
6. **Bước 6:** Bấm sang mục **"Đồ dùng của tôi"** để xem toàn bộ danh sách đồ cá nhân đã đăng, số lượt xem và trạng thái luân chuyển.
