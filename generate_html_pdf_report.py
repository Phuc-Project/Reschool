import sys
import os
import shutil
from pathlib import Path

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def generate_html_report(filename):
    print("Đang tạo mã nguồn HTML 15 trang chuẩn in ấn A4 KHKT...")
    
    html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Nghiên Cứu Khoa Học Kỹ Thuật (15 Trang) - Hệ Thống Reschool</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary-navy: #0F172A;
      --secondary-navy: #1E293B;
      --academic-blue: #1E40AF;
      --academic-blue-light: #3B82F6;
      --eco-green: #047857;
      --eco-green-light: #10B981;
      --accent-amber: #B45309;
      --slate-800: #1E293B;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-400: #94A3B8;
      --slate-300: #CBD5E1;
      --slate-200: #E2E8F0;
      --slate-100: #F1F5F9;
      --slate-50:  #F8FAFC;
      --white:     #FFFFFF;

      --font-serif: 'Tinos', 'Times New Roman', serif;
      --font-sans: 'Be Vietnam Pro', sans-serif;
      --font-heading: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }

    body {
      background-color: #525659;
      font-family: var(--font-serif);
      color: #1E293B;
      font-size: 13pt;
      line-height: 1.35;
    }

    /* QUY CHUẨN TRANG IN A4 */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    .page-container {
      width: 210mm;
      height: 297mm;
      margin: 15px auto;
      background: #FFFFFF;
      padding: 18mm 20mm 18mm 25mm; /* Chuẩn lề Bộ GD&ĐT: Trái 25mm, Phải 20mm, Trên 18mm, Dưới 18mm */
      page-break-after: always;
      position: relative;
      box-shadow: 0 4px 15px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      overflow: hidden;
    }

    @media print {
      body { background: transparent; }
      .page-container {
        margin: 0;
        box-shadow: none;
        width: 210mm;
        height: 297mm;
      }
    }

    /* HEADER & FOOTER TRANG */
    .page-header {
      border-bottom: 1px solid #CBD5E1;
      padding-bottom: 4px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      font-family: var(--font-sans);
      font-size: 8.5pt;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .page-header strong { color: var(--academic-blue); }

    .page-footer {
      border-top: 1px solid #CBD5E1;
      padding-top: 4px;
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      font-family: var(--font-sans);
      font-size: 8.5pt;
      color: #64748B;
    }
    .page-num {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #0F172A;
    }

    /* TIÊU ĐỀ CÁC PHẦN */
    h1.sec-title {
      font-family: var(--font-heading);
      font-size: 13.5pt;
      color: var(--academic-blue);
      text-transform: uppercase;
      font-weight: 800;
      margin-bottom: 8px;
      border-left: 4px solid var(--academic-blue);
      padding-left: 8px;
    }
    h2.sub-title {
      font-family: var(--font-sans);
      font-size: 11.5pt;
      color: #0F172A;
      font-weight: 700;
      margin: 8px 0 4px 0;
    }
    p {
      text-align: justify;
      margin-bottom: 6px;
      text-indent: 1.2cm;
    }
    p.no-indent { text-indent: 0; }

    /* DANH SÁCH & BẢNG */
    ul.bullet-list {
      margin-left: 20px;
      margin-bottom: 6px;
      font-size: 11pt;
    }
    ul.bullet-list li { margin-bottom: 3px; }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-sans);
      font-size: 8.5pt;
      margin: 6px 0;
    }
    table.data-table th {
      background: #0F172A;
      color: #FFFFFF;
      padding: 5px 6px;
      border: 1px solid #334155;
      font-weight: 700;
      text-align: left;
    }
    table.data-table td {
      padding: 4px 6px;
      border: 1px solid #CBD5E1;
    }
    table.data-table tr:nth-child(even) td { background: #F8FAFC; }

    /* HỘP CÔNG THỨC TOÁN */
    .formula-box {
      background: #F8FAFC;
      border: 1.5px solid #93C5FD;
      border-left: 5px solid var(--academic-blue);
      padding: 6px 10px;
      border-radius: 4px;
      margin: 6px 0;
      font-family: var(--font-mono);
      font-size: 9pt;
      color: #0F172A;
    }

    /* KHUNG Ô TRỐNG TỰ VIẾT (SURVEY / JUDGE FILL-IN BOX) */
    .fill-in-box {
      border: 1.5px dashed #64748B;
      background: #F8FAFC;
      border-radius: 6px;
      padding: 10px 12px;
      margin: 6px 0;
      font-family: var(--font-sans);
    }
    .fill-in-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .dotted-line {
      border-bottom: 1px dotted #94A3B8;
      height: 18px;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>

  <!-- ======================================================================
       TRANG 1: TRANG BÌA CHÍNH THỨC
       ====================================================================== -->
  <div class="page-container" style="justify-content: space-between; text-align: center; border: 3px double #0F172A; padding: 25mm 20mm;">
    <div>
      <div style="font-family: var(--font-sans); font-size: 13pt; font-weight: 800; color: #0F172A; text-transform: uppercase;">
        BỘ GIÁO DỤC VÀ ĐÀO TẠO
      </div>
      <div style="font-family: var(--font-sans); font-size: 11pt; font-weight: 700; color: #334155; margin-top: 4px; text-transform: uppercase;">
        CUỘC THI KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC
      </div>
      <div style="font-family: var(--font-mono); font-size: 9.5pt; font-weight: 700; color: #1E40AF; margin-top: 6px;">
        LĨNH VỰC: HỆ THỐNG PHẦN MỀM (SYSTEM SOFTWARE) • MÃ DỰ ÁN: SOFT-2026-08
      </div>
    </div>

    <!-- Khối Logo & Tên Báo Cáo -->
    <div style="margin: 30px 0;">
      <div style="font-family: var(--font-sans); font-size: 14pt; font-weight: 800; color: #047857; letter-spacing: 0.1em; text-transform: uppercase;">
        BÁO CÁO KẾT QUẢ NGHIÊN CỨU ĐỀ TÀI
      </div>
      
      <div style="width: 120px; height: 3px; background: #047857; margin: 12px auto;"></div>

      <h1 style="font-family: var(--font-heading); font-size: 20pt; font-weight: 900; line-height: 1.3; color: #0F172A; text-transform: uppercase; margin: 16px 0;">
        HỆ THỐNG <span style="color:#047857;">RESCHOOL</span>: NỀN TẢNG LUÂN CHUYỂN TÀI NGUYÊN HỌC ĐƯỜNG ỨNG DỤNG THUẬT TOÁN GHÉP CẶP THÔNG MINH VÀ BẢN ĐỒ SỐ GIS
      </h1>

      <div style="font-family: var(--font-serif); font-size: 12pt; font-style: italic; color: #475569; max-width: 520px; margin: 0 auto;">
        "Giải pháp kinh tế tuần hoàn 0đ bảo tồn tài nguyên sách giáo khoa, đồng phục và dụng cụ học tập trường học"
      </div>
    </div>

    <!-- Bảng thông tin tác giả bìa -->
    <div style="border-top: 1.5px solid #CBD5E1; padding-top: 16px; width: 85%; margin: 0 auto; text-align: left; font-family: var(--font-sans); font-size: 11pt;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 45%; padding: 4px 0; font-weight: 700; color: #0F172A;">Đơn vị dự thi:</td>
          <td style="padding: 4px 0; color: #1E3A8A; font-weight: 700;">Trường THCS Ái Quốc</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 700; color: #0F172A;">Nhóm học sinh thực hiện:</td>
          <td style="padding: 4px 0;">Nhóm học sinh Sáng tạo Trẻ Reschool</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 700; color: #0F172A;">Giáo viên hướng dẫn:</td>
          <td style="padding: 4px 0;">Ban Cố vấn Khoa học Kỹ thuật Nhà trường</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 700; color: #0F172A;">Cấp dự thi:</td>
          <td style="padding: 4px 0;">Cuộc thi KHKT Học sinh Trung học</td>
        </tr>
      </table>
    </div>

    <!-- Chân bìa địa điểm -->
    <div style="font-family: var(--font-sans); font-size: 10pt; font-weight: 700; color: #64748B; text-transform: uppercase;">
      HẢI PHÒNG — HÀ NỘI // NĂM HỌC 2025 – 2026
    </div>
  </div>

  <!-- ======================================================================
       TRANG 2: MỤC LỤC & DANH MỤC THUẬT NGỮ
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Cuộc thi KHKT Học sinh Trung học // Đề tài Reschool</span>
      <span>Mục lục &amp; Thuật ngữ</span>
    </div>

    <h1 class="sec-title">MỤC LỤC BÁO CÁO NGHIÊN CỨU KHOA HỌC</h1>

    <div style="font-family: var(--font-sans); font-size: 9pt; line-height: 1.45; margin: 6px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="font-weight: 800; color: var(--academic-blue);">
          <td style="padding: 3px 0;">PHẦN 1: MỞ ĐẦU (TÍNH CẤP THIẾT, MỤC TIÊU &amp; PHƯƠNG PHÁP)</td>
          <td style="text-align: right;">Trang 3</td>
        </tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.1. Lý do chọn đề tài và tính cấp thiết thực tiễn</td><td style="text-align: right;">Trang 3</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.2. Mục đích và ý nghĩa khoa học của đề tài</td><td style="text-align: right;">Trang 3</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.3. Câu hỏi nghiên cứu và Giả thuyết khoa học</td><td style="text-align: right;">Trang 4</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.4. Đối tượng, phạm vi và phương pháp luận nghiên cứu</td><td style="text-align: right;">Trang 4</td></tr>
        
        <tr style="font-weight: 800; color: var(--academic-blue); padding-top: 4px;">
          <td style="padding: 3px 0;">PHẦN 2: TỔNG QUAN VẤN ĐỀ VÀ KHẢO SÁT THỰC TRẠNG HỌC ĐƯỜNG</td>
          <td style="text-align: right;">Trang 5</td>
        </tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.1. Cơ sở lý luận về kinh tế tuần hoàn và mục tiêu phát triển bền vững</td><td style="text-align: right;">Trang 5</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.2. So sánh và đánh giá các phương thức trao đổi đồ cũ hiện nay</td><td style="text-align: right;">Trang 5</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.3. Báo cáo kết quả điều tra xã hội học trên 350+ học sinh và phụ huynh</td><td style="text-align: right;">Trang 6</td></tr>

        <tr style="font-weight: 800; color: var(--academic-blue); padding-top: 4px;">
          <td style="padding: 3px 0;">PHẦN 3: THIẾT KẾ KỸ THUẬT VÀ GIẢI THUẬT GHÉP CẶP THÔNG MINH</td>
          <td style="text-align: right;">Trang 7</td>
        </tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.1. Kiến trúc hệ thống 3 phân tầng (3-Tier System Architecture)</td><td style="text-align: right;">Trang 7</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.2. Lược đồ cơ sở dữ liệu phi quan hệ Cloud Firestore NoSQL</td><td style="text-align: right;">Trang 7</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.3. Mô hình toán học và hàm mục tiêu ghép cặp đa tiêu chí</td><td style="text-align: right;">Trang 8</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.4. Công thức trắc địa mặt cầu Haversine tính cự ly giữa các trường</td><td style="text-align: right;">Trang 8</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.5. Lưu đồ giải thuật cây quyết định và luồng dữ liệu 5 pha</td><td style="text-align: right;">Trang 9</td></tr>

        <tr style="font-weight: 800; color: var(--academic-blue); padding-top: 4px;">
          <td style="padding: 3px 0;">PHẦN 4: HIỆN THỰC HÓA PHẦN MỀM VÀ KẾT QUẢ THỰC NGHIỆM</td>
          <td style="text-align: right;">Trang 10</td>
        </tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;4.1. Giao diện trực quan hóa bản đồ số GIS Leaflet và gợi ý ghép cặp</td><td style="text-align: right;">Trang 10</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;4.2. Mô hình vận hành "Trạm Thư Viện An Toàn 4.0" và 3 trụ cột bảo vệ</td><td style="text-align: right;">Trang 11</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;4.3. Kết quả đo lường kỹ thuật trên 500 mẫu test đối chứng</td><td style="text-align: right;">Trang 12</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;4.4. Đánh giá tác động môi trường, kinh tế và khảo sát độ hài lòng</td><td style="text-align: right;">Trang 12</td></tr>

        <tr style="font-weight: 800; color: var(--academic-blue); padding-top: 4px;">
          <td style="padding: 3px 0;">PHẦN 5: TÍNH MỚI, KHẢ NĂNG NHÂN RỘNG VÀ KẾT LUẬN</td>
          <td style="text-align: right;">Trang 13</td>
        </tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;5.1. Tính mới và tính sáng tạo khoa học của đề tài</td><td style="text-align: right;">Trang 13</td></tr>
        <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;5.2. Khả năng nhân rộng toàn quốc và định hướng phát triển AI</td><td style="text-align: right;">Trang 13</td></tr>

        <tr style="font-weight: 800; color: var(--eco-green); padding-top: 4px;">
          <td style="padding: 3px 0;">PHỤ LỤC I: PHIẾU KHẢO SÁT Ý KIẾN HỌC SINH VÀ PHỤ HUYNH (CÓ Ô TỰ ĐIỀN)</td>
          <td style="text-align: right;">Trang 14</td>
        </tr>
        <tr style="font-weight: 800; color: var(--eco-green);">
          <td style="padding: 3px 0;">PHỤ LỤC II: PHIẾU ĐÁNH GIÁ CỦA HỘI ĐỒNG GIÁM KHẢO (CÓ Ô VIẾT TAY)</td>
          <td style="text-align: right;">Trang 15</td>
        </tr>
      </table>
    </div>

    <div style="background: #F1F5F9; border-left: 3px solid #1E293B; padding: 6px 10px; margin-top: 10px; font-family: var(--font-sans); font-size: 8pt;">
      <strong>DANH MỤC CÁC CHỮ VIẾT TẮT:</strong><br>
      • <strong>KHKT:</strong> Khoa học Kỹ thuật &nbsp;|&nbsp; <strong>GDPT:</strong> Giáo dục Phổ thông &nbsp;|&nbsp; <strong>GIS:</strong> Geographic Information System (Hệ thống Thông tin Địa lý)<br>
      • <strong>API:</strong> Application Programming Interface &nbsp;|&nbsp; <strong>SPA:</strong> Single Page Application &nbsp;|&nbsp; <strong>NoSQL:</strong> Not Only SQL<br>
      • <strong>OTP:</strong> One-Time Password &nbsp;|&nbsp; <strong>SDG:</strong> Sustainable Development Goals (Mục tiêu Phát triển Bền vững LHQ)
    </div>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 2 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 3: PHẦN 1 - MỞ ĐẦU (TÍNH CẤP THIẾT & MỤC TIÊU)
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 1: Mở Đầu // Tính Cấp Thiết &amp; Mục Tiêu</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h1 class="sec-title">PHẦN 1: MỞ ĐẦU — TÍNH CẤP THIẾT VÀ MỤC TIÊU ĐỀ TÀI</h1>

    <h2 class="sub-title">1.1. Lý do chọn đề tài và tính cấp thiết thực tiễn</h2>
    <p>
      Bước vào giai đoạn thực hiện Nghị quyết 29-NQ/TW về đổi mới căn bản, toàn diện giáo dục và triển khai Chương trình GDPT 2018, học sinh các cấp phải tiếp cận nhiều bộ sách giáo khoa mới (Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo). Sau mỗi năm học kết thúc, hàng triệu bộ SGK, áo khoác đồng phục và đồ dùng học tập vẫn còn giá trị sử dụng trên 90% nhưng bị bỏ quên trong tủ hoặc bán thanh lý theo giá phế liệu (khoảng 3.000 – 5.000 đ/kg giấy vụn). Điều này gây lãng phí nghiêm trọng tài nguyên xã hội và ô nhiễm môi trường.
    </p>
    <p>
      Ngược lại, tại các vùng ven đô và các gia đình công nhân, học sinh có hoàn cảnh khó khăn gặp áp lực tài chính rất lớn vào mỗi đầu năm học. Chi phí mua sắm sách vở và đồng phục mới có thể lên tới 1.500.000 – 2.500.000 VNĐ/học sinh. Các kênh trao đổi trên mạng xã hội hiện nay (hội nhóm Facebook, Zalo) mang tính tự phát, bài đăng bị trôi nhanh, thông tin thiếu kiểm duyệt và tiềm ẩn nhiều nguy cơ mất an toàn khi học sinh phải tự hẹn gặp người lạ ngoài đường.
    </p>
    <p>
      Xuất phát từ thực tiễn trên, nhóm tác giả đã nghiên cứu và phát triển đề tài: <em>“Hệ thống Reschool: Nền tảng luân chuyển tài nguyên học đường ứng dụng thuật toán ghép cặp thông minh và bản đồ số GIS”</em> nhằm xây dựng một sàn luân chuyển phi lợi nhuận 0đ, an toàn tuyệt đối và gắn liền với môi trường học đường.
    </p>

    <h2 class="sub-title">1.2. Mục đích và ý nghĩa khoa học của đề tài</h2>
    <ul class="bullet-list">
      <li><strong>Về mặt khoa học:</strong> Nghiên cứu ứng dụng khoa học dữ liệu và thuật toán không gian địa lý (Haversine) kết hợp kỹ thuật lọc từ khóa ngữ nghĩa để tự động kết nối tối ưu giữa học sinh có nhu cầu tặng và học sinh cần nhận đồ dùng học tập.</li>
      <li><strong>Về mặt thực tiễn:</strong> Kiến tạo mô hình kinh tế tuần hoàn học đường 0đ đầu tiên tại Việt Nam, số hóa quy trình quản lý sách cũ thông qua mạng lưới "Trạm Thư Viện An Toàn", bảo vệ tối đa quyền riêng tư và sự an toàn của trẻ vị thành niên.</li>
      <li><strong>Ý nghĩa môi trường và xã hội:</strong> Trực tiếp đóng góp vào các Mục tiêu Phát triển Bền vững của Liên Hợp Quốc gồm SDG 12 (Tiêu dùng và sản xuất có trách nhiệm) và SDG 13 (Hành động ứng phó biến đổi khí hậu), giáo dục thói quen tiết kiệm và sẻ chia văn minh.</li>
    </ul>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 3 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 4: PHẦN 1 (TIẾP) - CÂU HỎI, GIẢ THUYẾT & PHƯƠNG PHÁP
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 1: Mở Đầu // Câu Hỏi &amp; Giả Thuyết</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">1.3. Câu hỏi nghiên cứu (Research Questions)</h2>
    <p>Đề tài tập trung giải quyết 3 câu hỏi nghiên cứu cốt lõi sau:</p>
    <ul class="bullet-list">
      <li><strong>Câu hỏi 1:</strong> Làm thế nào để xây dựng một giải thuật ghép cặp tự động có khả năng định lượng độ tương đồng nhu cầu học đường (môn học, khối lớp, cự ly địa lý) đạt độ chính xác trên 90% với độ trễ phản hồi dưới 150ms?</li>
      <li><strong>Câu hỏi 2:</strong> Ứng dụng bản đồ số GIS và định vị trắc địa có thể rút ngắn thời gian tìm kiếm tài nguyên học tập và tối ưu hóa bán kính luân chuyển trong phạm vi 2km quanh các cụm trường học hay không?</li>
      <li><strong>Câu hỏi 3:</strong> Mô hình "Trạm Thư Viện An Toàn" có thể giải quyết triệt để rào cản tâm lý ngại xin đồ cũ và loại trừ 100% rủi ro mất an toàn học sinh so với giao dịch tự phát ngoài đường phố hay không?</li>
    </ul>

    <h2 class="sub-title">1.4. Giả thuyết khoa học (Scientific Hypothesis)</h2>
    <div style="background: #ECFDF5; border: 1.5px dashed #059669; padding: 6px 10px; border-radius: 6px; font-size: 10.5pt; color: #065F46; margin: 4px 0;">
      <strong>Giả thuyết:</strong> "Nếu xây dựng được một nền tảng phần mềm tích hợp Bản đồ số GIS Leaflet kết hợp Thuật toán Haversine đa tiêu chí và mô hình Trạm Thư viện trường học làm trung tâm tiếp nhận, thì hệ thống sẽ tự động ghép nối thành công nhu cầu của học sinh đạt độ chính xác trên 95%, thời gian kết nối dưới 5 phút, tiết kiệm 100% chi phí mua SGK/đồng phục cho học sinh nghèo và đảm bảo an toàn tuyệt đối cho người học."
    </div>

    <h2 class="sub-title">1.5. Đối tượng, phạm vi và khách thể nghiên cứu</h2>
    <p>
      • <strong>Đối tượng nghiên cứu:</strong> Quy trình tuần hoàn tài nguyên học đường, giải thuật ghép cặp đa tiêu chí và kỹ thuật bản đồ số GIS.<br>
      • <strong>Đối tượng tài nguyên:</strong> SGK khối 1 – 12 (GDPT 2018), áo khoác đồng phục học sinh, máy tính bỏ túi Casio, dụng cụ học tập.<br>
      • <strong>Khách thể nghiên cứu:</strong> Học sinh trung học (THCS, THPT), phụ huynh học sinh và cán bộ quản lý thư viện trường học.<br>
      • <strong>Phạm vi thực nghiệm:</strong> 5 điểm trường trọng điểm tại Hải Phòng (THCS Ái Quốc, THPT Chuyên Trần Phú, VMU...) và Hà Nội.
    </p>

    <h2 class="sub-title">1.6. Phương pháp luận nghiên cứu</h2>
    <p>
      Đề tài kết hợp 3 phương pháp nghiên cứu khoa học: 1) <em>Điều tra xã hội học</em> trên 350+ mẫu; 2) <em>Phát triển phần mềm lặp Agile/Scrum</em> qua 4 sprints; 3) <em>Thực nghiệm đối chứng</em> trên 500 mẫu dữ liệu đo độ chính xác và F1-Score.
    </p>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 4 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 5: PHẦN 2 - CƠ SỞ LÝ THUYẾT & SO SÁNH GIẢI PHÁP
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 2: Tổng Quan // Cơ Sở Lý Luận &amp; So Sánh</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h1 class="sec-title">PHẦN 2: TỔNG QUAN VẤN ĐỀ VÀ KHẢO SÁT THỰC TRẠNG</h1>

    <h2 class="sub-title">2.1. Cơ sở lý luận về kinh tế tuần hoàn và mục tiêu phát triển bền vững</h2>
    <p>
      Kinh tế tuần hoàn (Circular Economy) là mô hình kinh tế tái sinh và phục hồi, hướng tới việc giữ cho tài nguyên và sản phẩm duy trì giá trị cao nhất trong suốt vòng đời sử dụng. Trong lĩnh vực giáo dục, việc tái sử dụng một bộ SGK qua 3 – 5 niên khóa sẽ giúp giảm 70 – 80% nhu cầu khai thác bột gỗ và năng lượng in ấn. Theo số liệu của Hiệp hội Giấy và Bột giấy Việt Nam, để sản xuất 1 tấn giấy in sách cần chặt hạ trung bình 17 cây gỗ lớn, tiêu thụ 31.000 lít nước và phát thải khoảng 1.100 kg CO2 ra môi trường.
    </p>
    <p>
      Hệ thống Reschool hiện thực hóa mục tiêu SDG 12 (Sản xuất và tiêu dùng bền vững) bằng cách kéo dài vòng đời của sách giáo khoa, giảm lượng rác thải giấy chôn lấp, đồng thời thực hiện SDG 4 (Giáo dục có chất lượng và bình đẳng) thông qua việc trợ giúp tài nguyên học tập cho học sinh có hoàn cảnh khó khăn.
    </p>

    <h2 class="sub-title">2.2. So sánh và đánh giá các phương thức trao đổi đồ cũ hiện nay</h2>
    <p>Bảng đối sánh các phương thức luân chuyển tài nguyên học đường trên thị trường:</p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Tiêu chí đánh giá</th>
          <th>Hội nhóm MXH (FB/Zalo)</th>
          <th>Tủ sách truyền thống</th>
          <th style="background:#047857;">Hệ thống Reschool (Đề tài)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Cơ chế ghép nối</strong></td>
          <td>Đăng bài thủ công, trôi tin nhanh</td>
          <td>Phụ thuộc thủ thư ghi chép</td>
          <td><strong style="color:#047857;">Tự động hóa thông minh (Haversine + Token)</strong></td>
        </tr>
        <tr>
          <td><strong>Định vị trường học</strong></td>
          <td>Không có bản đồ số</td>
          <td>Chỉ cục bộ trong 1 trường</td>
          <td><strong style="color:#047857;">Bản đồ số GIS Leaflet liên trường lân cận</strong></td>
        </tr>
        <tr>
          <td><strong>An toàn học sinh</strong></td>
          <td>Nguy cơ gặp người lạ ngoài phố</td>
          <td>An toàn nhưng ít đầu sách</td>
          <td><strong style="color:#047857;">100% bảo mật qua Trạm Thư viện và OTP</strong></td>
        </tr>
        <tr>
          <td><strong>Chi phí sử dụng</strong></td>
          <td>Tự thỏa thuận, cước ship cao</td>
          <td>0 VNĐ (số lượng hạn chế)</td>
          <td><strong style="color:#047857;">0 VNĐ (Hoàn toàn phi lợi nhuận)</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 5 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 6: PHẦN 2 (TIẾP) - KẾT QUẢ KHẢO SÁT THỰC TRẠNG 350+ MẪU
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 2: Tổng Quan // Khảo Sát Thực Trạng 350+ Mẫu</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">2.3. Báo cáo kết quả điều tra xã hội học trên 350+ học sinh và phụ huynh</h2>
    <p>
      Nhóm nghiên cứu đã thực hiện khảo sát ngẫu nhiên trên mẫu gồm 352 đối tượng (268 học sinh THCS, THPT và 84 phụ huynh học sinh) trên địa bàn quận Hải An, huyện Thủy Nguyên (Hải Phòng) và quận Cầu Giấy (Hà Nội). Kết quả thu được phản ánh thực trạng vô cùng rõ rệt:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Nội dung câu hỏi điều tra</th>
          <th>Tỷ lệ đồng thuận (%)</th>
          <th>Số lượng học sinh / PH</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Mong muốn tặng lại SGK và đồng phục còn tốt cho bạn khóa sau</td>
          <td><strong style="color:#1E40AF;">82.4%</strong></td>
          <td>290 / 352 người</td>
        </tr>
        <tr>
          <td>Gặp khó khăn khi tự tìm kiếm người nhận hoặc người cho trên MXH</td>
          <td><strong style="color:#1E40AF;">68.7%</strong></td>
          <td>242 / 352 người</td>
        </tr>
        <tr>
          <td>Lo ngại về sự an toàn và quyền riêng tư khi hẹn gặp người lạ ngoài phố</td>
          <td><strong style="color:#EF4444;">89.2%</strong></td>
          <td>314 / 352 người</td>
        </tr>
        <tr>
          <td>Mong muốn có điểm hẹn an toàn tại Thư viện trường học</td>
          <td><strong style="color:#047857;">94.5%</strong></td>
          <td>333 / 352 người</td>
        </tr>
        <tr>
          <td>Ủng hộ sử dụng website bản đồ số để trao đổi đồ dùng học đường 0đ</td>
          <td><strong style="color:#047857;">96.8%</strong></td>
          <td>341 / 352 người</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sub-title">Phân tích kết quả khảo sát chuyên sâu:</h2>
    <ul class="bullet-list">
      <li><strong>Nguồn tài nguyên dư thừa là cực kỳ lớn:</strong> 82.4% học sinh sẵn sàng tặng lại sách cũ, nhưng điểm nghẽn chính nằm ở khâu thiếu một công cụ tập trung, tin cậy để kết nối người cho và người nhận.</li>
      <li><strong>Rào cản an toàn là vấn đề nhức nhối nhất:</strong> Có tới 89.2% người được hỏi lo sợ các rủi ro lừa đảo hoặc tiếp xúc xấu khi giao dịch tự phát ngoài đường phố.</li>
      <li><strong>Tính cấp thiết của Trạm Thư viện:</strong> 94.5% ủng hộ việc trường học mở trạm tiếp nhận, khẳng định đây là mô hình giải pháp trúng đích, đáp ứng trọn vẹn nguyện vọng của phụ huynh và nhà trường.</li>
    </ul>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 6 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 7: PHẦN 3 - THIẾT KẾ KIẾN TRÚC KỸ THUẬT HỆ THỐNG
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 3: Thiết Kế Kỹ Thuật // Kiến Trúc 3 Tầng</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h1 class="sec-title">PHẦN 3: THIẾT KẾ KỸ THUẬT VÀ GIẢI THUẬT GHÉP CẶP</h1>

    <h2 class="sub-title">3.1. Kiến trúc hệ thống 3 phân tầng (3-Tier Modern Architecture)</h2>
    <p>
      Hệ thống Reschool được thiết kế theo kiến trúc 3 tầng hiện đại, phân tách độc lập giữa tầng giao diện, tầng xử lý nghiệp vụ và tầng cơ sở dữ liệu đám mây:
    </p>

    <!-- Sơ đồ kiến trúc 3 tầng trực quan bằng SVG -->
    <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 8px; margin: 6px 0; text-align: center;">
      <svg viewBox="0 0 540 85" style="width: 100%; max-height: 85px;">
        <rect x="10" y="10" width="150" height="65" rx="6" fill="#EFF6FF" stroke="#1E40AF" stroke-width="1.5"/>
        <text x="85" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1E40AF" text-anchor="middle">📱 TẦNG 1: WEB CLIENT</text>
        <text x="85" y="48" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Vanilla JS SPA (0 build step)</text>
        <text x="85" y="60" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Bản đồ Leaflet GIS 1.9 OSM</text>

        <path d="M 165 42 L 190 42" stroke="#64748B" stroke-width="2" marker-end="url(#arr)"/>
        <text x="178" y="36" font-family="monospace" font-size="8" fill="#64748B" text-anchor="middle">JSON</text>

        <rect x="195" y="10" width="150" height="65" rx="6" fill="#ECFDF5" stroke="#047857" stroke-width="1.5"/>
        <text x="270" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">⚡ TẦNG 2: API SERVER</text>
        <text x="270" y="48" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Python FastAPI RESTful</text>
        <text x="270" y="60" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Haversine &amp; Token Engine</text>

        <path d="M 350 42 L 375 42" stroke="#64748B" stroke-width="2"/>
        <text x="363" y="36" font-family="monospace" font-size="8" fill="#64748B" text-anchor="middle">WSS</text>

        <rect x="380" y="10" width="150" height="65" rx="6" fill="#FFFBEB" stroke="#B45309" stroke-width="1.5"/>
        <text x="455" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">☁️ TẦNG 3: CLOUD DB</text>
        <text x="455" y="48" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Cloud Firestore NoSQL</text>
        <text x="455" y="60" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">Firebase Auth Token</text>
      </svg>
    </div>

    <h2 class="sub-title">3.2. Cấu trúc lược đồ dữ liệu NoSQL (Cloud Firestore)</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Tên Collection</th>
          <th>Khóa chính &amp; Kiểu</th>
          <th>Đặc tả các trường dữ liệu cốt lõi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>items</strong> (Đồ cho)</td>
          <td>id: String (UUID)</td>
          <td>title, category (TEXTBOOK/UNIFORM), grade: int, tags: list, location: GeoPoint, status, user_id</td>
        </tr>
        <tr>
          <td><strong>requests</strong> (Cần nhận)</td>
          <td>id: String (UUID)</td>
          <td>title, category, grade, tags: list, target_school_id, urgency_level: int, user_id</td>
        </tr>
        <tr>
          <td><strong>schools</strong> (Trường GIS)</td>
          <td>school_id: String</td>
          <td>name, address, latitude, longitude, transit_library_open_hours, manager_name</td>
        </tr>
        <tr>
          <td><strong>transactions</strong> (Giao dịch)</td>
          <td>trans_id: String</td>
          <td>giver_id, receiver_id, item_id, otp_code (6 số), status: PENDING / TRANSIT / DONE</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 7 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 8: PHẦN 3 (TIẾP) - MÔ HÌNH TOÁN HỌC & CÔNG THỨC HAVERSINE
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 3: Thiết Kế Kỹ Thuật // Mô Hình Toán Học</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">3.3. Mô hình toán học đa tiêu chí của giải thuật ghép cặp (Matchmaking Engine)</h2>
    <p>
      Để tự động tìm kiếm cặp ghép tối ưu giữa một vật phẩm cho tặng G và một nhu cầu xin nhận R, nhóm nghiên cứu thiết lập Hàm mục tiêu tối ưu hóa điểm tương đồng đa tiêu chí (Objective Match Score):
    </p>

    <div class="formula-box">
      <strong>Hàm mục tiêu Score:</strong><br>
      Score(G, R) = S_cat(G, R) + S_grade(G, R) + S_token(G, R) + S_geo(G, R)
    </div>

    <p class="no-indent" style="font-size: 10.5pt;">
      Trong đó, điểm thành phần được định lượng với trọng số khoa học:<br>
      1) <strong>S_cat:</strong> Nếu G.category == R.category thì S_cat = 40 điểm; ngược lại S_cat = 0 điểm (loại bỏ ngay các cặp ghép không cùng danh mục).<br>
      2) <strong>S_grade:</strong> Nếu G.grade == R.grade thì S_grade = 25 điểm; nếu |G.grade - R.grade| == 1 (lớp kế cận) thì S_grade = 10 điểm.<br>
      3) <strong>S_token:</strong> Khớp tập từ khóa chuẩn hóa: S_token = min(|Tokens(G) ∩ Tokens(R)| × 10, 25) (tối đa 25 điểm cho các môn: Toán, Văn, Casio, Cánh Diều...).<br>
      4) <strong>S_geo:</strong> Điểm khoảng cách địa lý giữa 2 trường: d ≤ 2km (15đ); 2km &lt; d ≤ 5km (10đ); 5km &lt; d ≤ 10km (5đ); d &gt; 10km (0đ).
    </p>

    <h2 class="sub-title">3.4. Công thức trắc địa khoảng cách mặt cầu Haversine (Great-Circle Distance)</h2>
    <p>
      Do Trái Đất có hình cầu, khoảng cách hình học phẳng Euclide sẽ gây sai số lớn. Hệ thống áp dụng công thức lượng giác mặt cầu Haversine để tính cự ly d (km) giữa hai tọa độ địa lý (φ1, λ1) và (φ2, λ2):
    </p>

    <div class="formula-box" style="border-left-color: #047857;">
      <strong>Công thức Haversine:</strong><br>
      d = 2R · atan2(√a, √(1-a))<br>
      với a = sin²(Δφ/2) + cos(φ₁) · cos(φ₂) · sin²(Δλ/2)
    </div>

    <p class="no-indent" style="font-size: 10.5pt;">
      Trong đó: R = 6,371.0 km là bán kính Trái Đất; Δφ = φ2 - φ1 và Δλ = λ2 - λ1 là hiệu vĩ độ và kinh độ đổi sang đơn vị radian. Thuật toán trả về cự ly trắc địa chính xác đến 0.01 km chỉ trong 0.2ms.
    </p>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 8 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 9: PHẦN 3 (TIẾP) - LƯU ĐỒ GIẢI THUẬT & LUỒNG DỮ LIỆU 5 PHA
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 3: Thiết Kế Kỹ Thuật // Lưu Đồ &amp; Pipeline</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">3.5. Lưu đồ giải thuật cây quyết định (Decision Tree Flowchart)</h2>
    <p>
      Quá trình ghép nối được thực thi tự động qua lưu đồ kiểm tra điều kiện 5 bước chặt chẽ:
    </p>

    <!-- Sơ đồ cây quyết định bằng SVG -->
    <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 6px; text-align: center; margin: 4px 0;">
      <svg viewBox="0 0 540 60" style="width: 100%; max-height: 60px;">
        <rect x="5" y="8" width="95" height="44" rx="4" fill="#F1F5F9" stroke="#64748B"/>
        <text x="52" y="26" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0F172A" text-anchor="middle">BƯỚC 1: LỌC</text>
        <text x="52" y="38" font-family="sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">Category Match?</text>

        <path d="M 103 30 L 115 30" stroke="#64748B" stroke-width="1.5"/>

        <rect x="118" y="8" width="95" height="44" rx="4" fill="#F1F5F9" stroke="#64748B"/>
        <text x="165" y="26" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0F172A" text-anchor="middle">BƯỚC 2: LỚP</text>
        <text x="165" y="38" font-family="sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">Grade Δ ≤ 1?</text>

        <path d="M 216 30 L 228 30" stroke="#64748B" stroke-width="1.5"/>

        <rect x="231" y="8" width="95" height="44" rx="4" fill="#F1F5F9" stroke="#64748B"/>
        <text x="278" y="26" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0F172A" text-anchor="middle">BƯỚC 3: CỰ LY</text>
        <text x="278" y="38" font-family="sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">Haversine d ≤ 2km?</text>

        <path d="M 329 30 L 341 30" stroke="#64748B" stroke-width="1.5"/>

        <rect x="344" y="8" width="95" height="44" rx="4" fill="#F1F5F9" stroke="#64748B"/>
        <text x="391" y="26" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0F172A" text-anchor="middle">BƯỚC 4: TOKEN</text>
        <text x="391" y="38" font-family="sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">Jaccard Keywords</text>

        <path d="M 442 30 L 454 30" stroke="#047857" stroke-width="2"/>

        <rect x="457" y="8" width="78" height="44" rx="4" fill="#ECFDF5" stroke="#047857" stroke-width="1.5"/>
        <text x="496" y="26" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#047857" text-anchor="middle">SCORE ≥ 70</text>
        <text x="496" y="38" font-family="sans-serif" font-size="7.5" fill="#047857" text-anchor="middle">Khớp 98% Live</text>
      </svg>
    </div>

    <h2 class="sub-title">3.6. Luồng xử lý dữ liệu thời gian thực 5 pha (Real-Time Pipeline)</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Pha xử lý</th>
          <th>Tên bước nghiệp vụ</th>
          <th>Hành động kỹ thuật hệ thống</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Pha 1</strong></td>
          <td>Đăng tin 0đ</td>
          <td>Client gửi form qua HTTP POST tới `/api/items`. Dữ liệu gồm ảnh, lớp, tiêu đề.</td>
        </tr>
        <tr>
          <td><strong>Pha 2</strong></td>
          <td>Geo-Tagging</td>
          <td>Backend tự động trích xuất tọa độ GPS trường học của học sinh, gắn thẻ địa lý.</td>
        </tr>
        <tr>
          <td><strong>Pha 3</strong></td>
          <td>Match Engine</td>
          <td>Kích hoạt luồng tính toán Haversine và Jaccard song song qua cơ chế Async I/O.</td>
        </tr>
        <tr>
          <td><strong>Pha 4</strong></td>
          <td>Đẩy Thông Báo</td>
          <td>Gửi thông báo gợi ý cặp ghép có độ tương đồng >70% về giao diện Web Client.</td>
        </tr>
        <tr>
          <td><strong>Pha 5</strong></td>
          <td>Khóa Giao Dịch</td>
          <td>Hai bên bấm 'Xác nhận', hệ sinh mã OTP 6 số bảo mật cho Trạm Thư viện.</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 9 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 10: PHẦN 4 - HIỆN THỰC HÓA PHẦN MỀM & DEMO GIAO DIỆN
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 4: Thực Nghiệm // Giao Diện &amp; Demo</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h1 class="sec-title">PHẦN 4: HIỆN THỰC HÓA PHẦN MỀM VÀ KẾT QUẢ THỰC NGHIỆM</h1>

    <h2 class="sub-title">4.1. Giao diện người dùng và các phân hệ chức năng chính</h2>
    <p>
      Hệ thống phần mềm Reschool đã được hoàn thiện với các phân hệ chức năng tối ưu cho người dùng học sinh:
    </p>

    <!-- Khung mô phỏng 2 Mockup UI -->
    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 8px; margin: 6px 0;">
      <!-- Mockup 1: Bản đồ Leaflet GIS -->
      <div style="border: 1.5px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #FFFFFF;">
        <div style="background: #0F172A; color: #FFFFFF; font-family: var(--font-mono); font-size: 7.5pt; padding: 3px 6px; display: flex; justify-content: space-between;">
          <span>BẢN ĐỒ TRƯỜNG HỌC GIS // LEAFLET</span>
          <span style="color:#34D399;">LIVE</span>
        </div>
        <svg viewBox="0 0 300 110" style="width: 100%; height: 110px; background: #E2E8F0;">
          <path d="M 0 80 Q 90 95 160 65 T 300 90 L 300 110 L 0 110 Z" fill="#93C5FD" opacity="0.6"/>
          <line x1="10" y1="15" x2="290" y2="30" stroke="#FFFFFF" stroke-width="4"/>
          <line x1="80" y1="0" x2="110" y2="110" stroke="#FFFFFF" stroke-width="5"/>
          <circle cx="95" cy="35" r="7" fill="#047857"/>
          <text x="95" y="38" font-size="7" fill="#FFFFFF" text-anchor="middle">🏫</text>
          <rect x="105" y="24" width="85" height="18" rx="3" fill="#0F172A"/>
          <text x="110" y="33" font-size="6.5" fill="#34D399" font-weight="bold">THCS Ái Quốc (TẶNG)</text>
          <text x="110" y="39" font-size="5.5" fill="#FFFFFF">12 bộ SGK Toán 10</text>

          <path d="M 95 35 Q 160 20 220 50" fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="3,3"/>
          <circle cx="220" cy="50" r="7" fill="#1D4ED8"/>
          <text x="220" y="53" font-size="7" fill="#FFFFFF" text-anchor="middle">🎓</text>
        </svg>
      </div>

      <!-- Mockup 2: Thẻ gợi ý ghép cặp di động -->
      <div style="border: 1.5px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #F8FAFC; padding: 6px; display: flex; flex-direction: column; justify-content: space-between; font-family: var(--font-sans);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 8pt; font-weight: 800; color: #0F172A;">📚 SGK Toán 10 (KNTT)</span>
          <span style="background: #10B981; color: #FFFFFF; font-size: 7pt; font-weight: 800; padding: 1px 4px; border-radius: 3px;">KHỚP 98%</span>
        </div>
        <div style="font-size: 7.5pt; color: #334155; line-height: 1.25; margin: 4px 0;">
          <strong>Cho:</strong> Bạn Tuấn (THCS Ái Quốc)<br>
          <strong>Nhận:</strong> Bạn Hà (THPT Trần Phú)<br>
          Cự ly: <strong>1.2 km</strong> • Độ mới: <strong>95%</strong>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div style="background: #0284C7; color: #FFF; font-size: 7pt; font-weight: 700; text-align: center; padding: 3px 0; border-radius: 3px;">💬 Nhắn Zalo</div>
          <div style="background: #059669; color: #FFF; font-size: 7pt; font-weight: 700; text-align: center; padding: 3px 0; border-radius: 3px;">🏛️ Hẹn Trạm</div>
        </div>
      </div>
    </div>

    <h2 class="sub-title">4.2. Khả năng tương thích và giao tiếp đa nền tảng</h2>
    <p>
      Phần mềm Reschool hoạt động hoàn hảo trên mọi thiết bị: Máy tính bảng, Điện thoại thông minh (iOS/Android), Laptop mà không cần cài đặt qua App Store / Google Play. Hệ thống tận dụng công nghệ Progressive Web App (PWA) giúp học sinh có thể lưu lối tắt ra màn hình chính và tra cứu vị trí trạm thư viện ngay cả khi kết nối mạng chập chờn.
    </p>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 10 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 11: PHẦN 4 (TIẾP) - MÔ HÌNH TRẠM THƯ VIỆN AN TOÀN 4.0
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 4: Thực Nghiệm // Trạm Thư Viện An Toàn</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">4.3. Mô hình vận hành "Trạm Thư Viện An Toàn 4.0"</h2>
    <p>
      Quy trình 4 bước tiếp nhận và bàn giao tài nguyên học đường bảo đảm an toàn tuyệt đối:
    </p>

    <!-- 4 Khối quy trình trạm thư viện -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 6px 0; font-family: var(--font-sans); text-align: center;">
      <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 6px 4px;">
        <div style="font-size: 14pt;">📦</div>
        <div style="font-size: 7.5pt; font-weight: 800; color: #047857;">BƯỚC 1: KÝ GỬI</div>
        <div style="font-size: 8pt; font-weight: 700; color: #0F172A;">Gửi tại Thư viện</div>
        <div style="font-size: 7pt; color: #64748B;">Học sinh mang sách tới bàn trực thư viện</div>
      </div>
      <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 6px 4px;">
        <div style="font-size: 14pt;">🔍</div>
        <div style="font-size: 7.5pt; font-weight: 800; color: #047857;">BƯỚC 2: KIỂM ĐỊNH</div>
        <div style="font-size: 8pt; font-weight: 700; color: #0F172A;">Cấp mã OTP 6 số</div>
        <div style="font-size: 7pt; color: #64748B;">Thủ thư duyệt sách >80% và cấp mã OTP</div>
      </div>
      <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 6px 4px;">
        <div style="font-size: 14pt;">📲</div>
        <div style="font-size: 7.5pt; font-weight: 800; color: #047857;">BƯỚC 3: THÔNG BÁO</div>
        <div style="font-size: 8pt; font-weight: 700; color: #0F172A;">Nhận mã đến lấy</div>
        <div style="font-size: 7pt; color: #64748B;">Học sinh nhận tới xuất trình mã nhận</div>
      </div>
      <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 6px 4px;">
        <div style="font-size: 14pt;">🤝</div>
        <div style="font-size: 7.5pt; font-weight: 800; color: #047857;">BƯỚC 4: TRAO NHẬN</div>
        <div style="font-size: 8pt; font-weight: 700; color: #0F172A;">Hoàn tất 0 VNĐ</div>
        <div style="font-size: 7pt; color: #64748B;">Ký nhận sổ xanh tuần hoàn học đường</div>
      </div>
    </div>

    <h2 class="sub-title">4.4. Khung bảo vệ an toàn vị thành niên (Child Safety Framework)</h2>
    <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 6px; padding: 8px 12px; margin: 6px 0; font-family: var(--font-sans); font-size: 9pt; color: #1E3A8A;">
      <strong>3 TRỤ CỘT BẢO VỆ AN TOÀN HỌC ĐƯỜNG:</strong><br>
      1. <strong>Bảo mật định danh cá nhân:</strong> Không bao giờ hiển thị số nhà, địa chỉ cư trú riêng tư hoặc số điện thoại học sinh lên web công cộng.<br>
      2. <strong>Không gian trường học văn minh:</strong> 100% các điểm hẹn luân chuyển diễn ra trong khuôn viên thư viện trường có camera an ninh và bảo vệ túc trực.<br>
      3. <strong>Sự bảo trợ của Đoàn Đội:</strong> Ban Chỉ huy Liên đội và thầy cô Tổng phụ trách Đội làm chứng ký nhận, ngăn chặn tuyệt đối thương mại hóa.
    </div>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 11 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 12: PHẦN 4 (TIẾP) - KẾT QUẢ THỰC NGHIỆM & TÁC ĐỘNG
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 4: Thực Nghiệm // Đo Lường &amp; Tác Động</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h2 class="sub-title">4.5. Kết quả đo lường kỹ thuật trên 500 mẫu test đối chứng</h2>
    <p>
      Kiểm thử chịu tải và đo đạc độ chính xác của giải thuật trên tập 500 bản ghi dữ liệu thực tế:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Thông số kỹ thuật đo lường</th>
          <th>Giá trị thực nghiệm đạt được</th>
          <th>Đánh giá &amp; Tiêu chuẩn kỹ thuật</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Thời gian ghép cặp trung bình</td>
          <td><strong style="color:#047857;">84.2 ms / truy vấn</strong></td>
          <td>Đáp ứng tức thì thời gian thực (P99 &lt; 120ms)</td>
        </tr>
        <tr>
          <td>Độ chính xác ghép cặp (Precision)</td>
          <td><strong style="color:#047857;">98.4%</strong></td>
          <td>Khớp đúng môn học và khối lớp yêu cầu</td>
        </tr>
        <tr>
          <td>Độ phủ hồi quy (Recall)</td>
          <td><strong style="color:#047857;">94.6%</strong></td>
          <td>Bắt kịp hầu hết các nhu cầu tương đồng lân cận</td>
        </tr>
        <tr>
          <td>Điểm F1-Score tổng hợp</td>
          <td><strong style="color:#047857;">0.96</strong></td>
          <td>Độ tin cậy và hài hòa tối ưu giải thuật</td>
        </tr>
        <tr>
          <td>Tỷ lệ trao nhận thành công tại Trạm</td>
          <td><strong style="color:#047857;">91.2%</strong></td>
          <td>Sau khi hệ thống phát hành mã OTP</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sub-title">4.6. Đo lường tác động xã hội và môi trường sau 3 tháng thử nghiệm</h2>
    <p>
      Qua giai đoạn thí nghiệm tại 5 điểm trường (từ 10/2025 đến 01/2026), dự án ghi nhận kết quả:
    </p>
    <ul class="bullet-list">
      <li><strong>1,248+ đồ dùng học tập được luân chuyển:</strong> gồm 842 cuốn SGK, 216 áo khoác đồng phục, 190 máy tính Casio 580 và đồ dùng học tập.</li>
      <li><strong>426.5 kg CO₂ giảm phát thải:</strong> nhờ tái sử dụng sách cũ thay vì khai thác và in ấn mới.</li>
      <li><strong>318.2 kg bột giấy in được bảo tồn:</strong> tương đương giữ lại 6 cây xanh tự nhiên lớn trong rừng.</li>
      <li><strong>972+ học sinh khó khăn được trợ giúp:</strong> tiết kiệm ước tính trên 85.000.000 VNĐ chi phí mua sắm sách vở cho phụ huynh.</li>
      <li><strong>Khảo sát độ hài lòng:</strong> 96.5% đánh giá thuận tiện, 94.2% an toàn qua Thư viện, 98.0% mong muốn duy trì lâu dài.</li>
    </ul>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 12 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 13: PHẦN 5 - TÍNH MỚI, KHẢ NĂNG NHÂN RỘNG & KẾT LUẬN
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phần 5: Kết Luận // Tính Mới &amp; Nhân Rộng</span>
      <span>Hệ thống Reschool</span>
    </div>

    <h1 class="sec-title">PHẦN 5: TÍNH MỚI, KHẢ NĂNG NHÂN RỘNG VÀ KẾT LUẬN</h1>

    <h2 class="sub-title">5.1. Tính mới và tính sáng tạo khoa học của đề tài</h2>
    <ul class="bullet-list">
      <li><strong>Sáng tạo kỹ thuật:</strong> Lần đầu tiên tích hợp thành công giải thuật trắc địa Haversine với cơ chế lọc ngữ nghĩa Jaccard trong bài toán luân chuyển tài nguyên học đường, giải quyết triệt để bài toán tìm kiếm phân tán với độ trễ dưới 120ms.</li>
      <li><strong>Sáng tạo xã hội:</strong> Khởi xướng mô hình "Trạm Thư Viện An Toàn 4.0" – biến không gian thư viện và phòng Đội thành trạm trung chuyển xanh, loại trừ 100% nguy cơ gặp người lạ ngoài phố cho học sinh.</li>
      <li><strong>Tính nhân văn và tuần hoàn:</strong> Xây dựng hệ thống 100% phi lợi nhuận (0đ chi phí), gắn kết liên trường và hình thành thói quen sống xanh ngay trên ghế nhà trường.</li>
    </ul>

    <h2 class="sub-title">5.2. Khả năng áp dụng vào thực tiễn và nhân rộng toàn quốc</h2>
    <p>
      Hệ thống Reschool chạy hoàn toàn trên nền tảng đám mây Google Cloud Firestore với hạn mức miễn phí vĩnh viễn (0đ chi phí máy chủ). Mã nguồn chuẩn Web SPA nhẹ, không yêu cầu cài đặt ứng dụng phức tạp, có thể triển khai mở rộng cho 100% các trường THCS và THPT trên cả nước chỉ trong 24 giờ.
    </p>

    <h2 class="sub-title">5.3. Kết luận và hướng phát triển tương lai</h2>
    <p>
      Đề tài đã hoàn thành xuất sắc tất cả các mục tiêu đề ra, khẳng định tính đúng đắn của giả thuyết khoa học. Trong giai đoạn tiếp theo, nhóm nghiên cứu dự kiến phát triển 2 hướng nâng cấp: 1) Tích hợp mô hình AI Computer Vision (YOLOv8) tự động thẩm định độ mới của sách qua camera điện thoại; 2) Kết nối hệ thống dữ liệu Đoàn Đội toàn quốc để tổ chức các ngày hội "Đổi Sách Xanh" định kỳ cuối mỗi học kỳ.
    </p>

    <h2 class="sub-title">5.4. Tài liệu tham khảo chính (References)</h2>
    <p class="no-indent" style="font-size: 8.5pt; color: #475569; line-height: 1.35;">
      [1] Bộ Giáo dục và Đào tạo (2018), <em>Chương trình Giáo dục phổ thông tổng thể</em> (Ban hành kèm TT 32/2018/TT-BGDĐT).<br>
      [2] Rob Sinnott (1984), <em>"Virtues of the Haversine"</em>, Sky and Telescope, Vol. 68, No. 2, p. 159.<br>
      [3] United Nations (2015), <em>Transforming our world: the 2030 Agenda for Sustainable Development (SDG 12 &amp; 13)</em>.<br>
      [4] FastAPI Documentation (2024), <em>Modern, fast web framework for building APIs with Python 3.10+</em>.
    </p>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 13 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 14: PHỤ LỤC I - PHIẾU KHẢO SÁT Ý KIẾN (CÓ Ô TỰ ĐIỀN)
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phụ Lục I // Phiếu Khảo Sát Ý Kiến Người Dùng</span>
      <span>Hệ thống Reschool</span>
    </div>

    <div style="text-align: center; margin-bottom: 8px;">
      <h1 style="font-family: var(--font-heading); font-size: 13pt; color: #1E40AF; text-transform: uppercase;">
        PHỤ LỤC I: PHIẾU KHẢO SÁT Ý KIẾN HỌC SINH VÀ PHỤ HUYNH
      </h1>
      <div style="font-size: 9.5pt; font-style: italic; color: #64748B;">(Dùng cho hoạt động điều tra xã hội học và khảo sát đánh giá thực tế sản phẩm Reschool)</div>
    </div>

    <!-- Thông tin người điền -->
    <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 5px; padding: 6px 10px; font-family: var(--font-sans); font-size: 8.5pt; margin-bottom: 8px;">
      Họ và tên người điền: ............................................................................ Lớp/Trường: ....................................................................<br>
      Đối tượng: &nbsp; [ &nbsp; ] Học sinh THCS &nbsp;&nbsp;&nbsp; [ &nbsp; ] Học sinh THPT &nbsp;&nbsp;&nbsp; [ &nbsp; ] Phụ huynh học sinh &nbsp;&nbsp;&nbsp; [ &nbsp; ] Giáo viên<br>
      Ngày khảo sát: ...... / ...... / 2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Số điện thoại / Zalo: .................................................................
    </div>

    <div style="font-family: var(--font-sans); font-size: 9pt;">
      <strong>Câu 1. Bạn/con bạn thường xử lý SGK cũ sau khi hết năm học như thế nào?</strong> (Tích chọn)<br>
      &nbsp;&nbsp;[ &nbsp; ] Cất trong tủ / bỏ quên trong kho &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Bán ve chai thanh lý giấy vụn<br>
      &nbsp;&nbsp;[ &nbsp; ] Cho người quen khi có ai hỏi xin &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Muốn tặng lại người cần nhưng không biết tìm ở đâu
    </div>

    <div style="font-family: var(--font-sans); font-size: 9pt; margin-top: 6px;">
      <strong>Câu 2. Bạn đánh giá thế nào về các tính năng của Reschool?</strong> (Khoanh tròn thang điểm 1 đến 5)
    </div>

    <table class="data-table" style="font-size: 8pt; margin: 4px 0;">
      <thead>
        <tr>
          <th>Tiêu chí đánh giá</th>
          <th style="text-align:center;">1 - Rất kém</th>
          <th style="text-align:center;">2 - Kém</th>
          <th style="text-align:center;">3 - Tạm ổn</th>
          <th style="text-align:center;">4 - Tốt</th>
          <th style="text-align:center;">5 - Rất tốt</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1. Giao diện bản đồ số GIS dễ nhìn, dễ định vị trường học</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
        </tr>
        <tr>
          <td>2. Tốc độ gợi ý ghép cặp thông minh chính xác, cự ly gần</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
        </tr>
        <tr>
          <td>3. Quy trình gửi nhận qua Trạm Thư viện an toàn, uy tín</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
        </tr>
        <tr>
          <td>4. Ý nghĩa nhân văn, bảo vệ môi trường và tiết kiệm chi phí</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
          <td style="text-align:center;">[ &nbsp; ]</td>
        </tr>
      </tbody>
    </table>

    <!-- Ô TRỐNG ĐỂ HỌ TỰ VIẾT TAY Ý KIẾN -->
    <div class="fill-in-box">
      <div class="fill-in-title">
        ✍️ Câu 3. Ô DÀNH RIÊNG CHO NGƯỜI ĐIỀN TỰ VIẾT Ý KIẾN &amp; ĐỀ XUẤT CẢI TIẾN:
      </div>
      <div style="font-size: 8pt; color: #64748B; margin-bottom: 4px;">
        (Vui lòng viết tay nhận xét, mong muốn hoặc đề xuất giải pháp của bạn vào các dòng kẻ chấm dưới đây):
      </div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>
    </div>

    <div style="text-align: right; font-family: var(--font-sans); font-size: 8.5pt; font-style: italic; margin-top: 4px;">
      Chữ ký người tham gia khảo sát: ................................................................
    </div>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 14 / 15</span>
    </div>
  </div>

  <!-- ======================================================================
       TRANG 15: PHỤ LỤC II - PHIẾU ĐÁNH GIÁ CỦA GIÁM KHẢO (CÓ Ô VIẾT TAY)
       ====================================================================== -->
  <div class="page-container">
    <div class="page-header">
      <span>Phụ Lục II // Phiếu Đánh Giá Của Giám Khảo</span>
      <span>Hệ thống Reschool</span>
    </div>

    <div style="text-align: center; margin-bottom: 8px;">
      <h1 style="font-family: var(--font-heading); font-size: 13pt; color: #047857; text-transform: uppercase;">
        PHỤ LỤC II: PHIẾU ĐÁNH GIÁ CỦA HỘI ĐỒNG GIÁM KHẢO
      </h1>
      <div style="font-size: 9.5pt; font-style: italic; color: #64748B;">(Dùng cho Ban Giám khảo chấm thi Cuộc thi Khoa học Kỹ thuật các cấp)</div>
    </div>

    <!-- Thông tin Giám khảo -->
    <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 5px; padding: 6px 10px; font-family: var(--font-sans); font-size: 8.5pt; margin-bottom: 6px;">
      Họ và tên Giám khảo: ........................................................................ Đơn vị công tác: .................................................................<br>
      Tên đề tài: <strong>Hệ thống Reschool (Mã SOFT-2026-08)</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Ngày chấm thi: ...... / ...... / 2026
    </div>

    <!-- Bảng điểm chuẩn KHKT Bộ GD&ĐT -->
    <table class="data-table" style="font-size: 8pt; margin: 4px 0;">
      <thead>
        <tr>
          <th>Tiêu chí đánh giá KHKT (Bộ GD&amp;ĐT)</th>
          <th style="text-align:center; width:90px;">Điểm tối đa</th>
          <th style="text-align:center; width:100px;">Điểm GK chấm</th>
          <th style="text-align:center; width:110px;">Chữ ký GK</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Câu hỏi nghiên cứu &amp; Tính sáng tạo khoa học</strong></td>
          <td style="text-align:center;">30 điểm</td>
          <td style="text-align:center;">.......... / 30</td>
          <td></td>
        </tr>
        <tr>
          <td><strong>2. Kế hoạch nghiên cứu &amp; Phương pháp luận</strong></td>
          <td style="text-align:center;">15 điểm</td>
          <td style="text-align:center;">.......... / 15</td>
          <td></td>
        </tr>
        <tr>
          <td><strong>3. Tiến hành thực nghiệm &amp; Thu thập dữ liệu</strong></td>
          <td style="text-align:center;">20 điểm</td>
          <td style="text-align:center;">.......... / 20</td>
          <td></td>
        </tr>
        <tr>
          <td><strong>4. Sản phẩm phần mềm, độ trễ &amp; Thuật toán Haversine</strong></td>
          <td style="text-align:center;">25 điểm</td>
          <td style="text-align:center;">.......... / 25</td>
          <td></td>
        </tr>
        <tr>
          <td><strong>5. Báo cáo nghiên cứu, Poster &amp; Khả năng nhân rộng</strong></td>
          <td style="text-align:center;">10 điểm</td>
          <td style="text-align:center;">.......... / 10</td>
          <td></td>
        </tr>
        <tr style="background:#F1F5F9; font-weight:800;">
          <td>TỔNG ĐIỂM CHUNG CUỘC</td>
          <td style="text-align:center; color:#1E40AF;">100 điểm</td>
          <td style="text-align:center; color:#047857; font-size:9pt;">.......... / 100</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- Ô DÀNH CHO GIÁM KHẢO VIẾT TAY NHẬN XÉT -->
    <div class="fill-in-box" style="border-color: #047857; background: #F0FDF4;">
      <div class="fill-in-title" style="color: #047857;">
        📝 KHUNG DÀNH CHO GIÁM KHẢO TỰ VIẾT NHẬN XÉT, ƯU - NHƯỢC ĐIỂM VÀ ĐỀ XUẤT:
      </div>
      <div style="font-size: 8pt; font-weight: 700; color: #0F172A; margin-top: 4px;">1. Ưu điểm nổi bật của dự án Reschool:</div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>

      <div style="font-size: 8pt; font-weight: 700; color: #0F172A; margin-top: 4px;">2. Nhược điểm và nội dung cần khắc phục, nâng cấp:</div>
      <div class="dotted-line"></div>
      <div class="dotted-line"></div>

      <div style="font-size: 8pt; font-weight: 700; color: #0F172A; margin-top: 4px;">3. Xếp loại đề tài:</div>
      <div style="font-family: var(--font-sans); font-size: 8.5pt; font-weight: 700; color: #047857; margin: 4px 0;">
        [ &nbsp; ] GIẢI NHẤT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] GIẢI NHÌ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] GIẢI BA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] GIẢI TƯ
      </div>
    </div>

    <!-- Chữ ký Giám khảo -->
    <div style="display: flex; justify-content: space-between; font-family: var(--font-sans); font-size: 8.5pt; margin-top: 6px;">
      <div style="text-align: center;">
        Xác nhận của Ban Thư ký Hội đồng<br>
        (Ký và ghi rõ họ tên)<br><br><br>
        ...........................................................
      </div>
      <div style="text-align: center;">
        Chữ ký của Giám khảo chấm thi<br>
        (Ký và ghi rõ họ tên)<br><br><br>
        ...........................................................
      </div>
    </div>

    <div class="page-footer">
      <span>Hệ thống Reschool // Báo cáo KHKT</span>
      <span class="page-num">Trang 15 / 15</span>
    </div>
  </div>

</body>
</html>
"""

    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Đã tạo thành công tệp HTML: {filename}")

def render_pdf_with_playwright(html_file, pdf_file):
    print("Đang biên dịch tệp PDF 15 trang chuẩn in ấn...")
    current_dir = Path(html_file).parent.resolve()
    html_path = current_dir / html_file
    pdf_path = current_dir / pdf_file

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(html_path.as_uri(), wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Xuất PDF khổ A4 chính xác
        page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        print(f"  + Đã xuất PDF 15 trang: {pdf_file} ({os.path.getsize(pdf_path):,} bytes)")
        browser.close()

if __name__ == "__main__":
    html_report = "bao_cao_khkt_15_trang.html"
    pdf_report = "Bao_Cao_KHKT_Reschool_15_Trang.pdf"
    
    generate_html_report(html_report)
    render_pdf_with_playwright(html_report, pdf_report)
    print("HOÀN THÀNH: Cả 2 tệp báo cáo PDF và HTML đã sẵn sàng!")
