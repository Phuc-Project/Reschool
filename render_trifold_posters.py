import sys
import os
import shutil
from pathlib import Path

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def render_all_panels():
    current_dir = Path(__file__).parent.resolve()
    artifact_dir = Path(r"C:\Users\Admin\.gemini\antigravity\brain\b405c429-a5e2-47ab-9755-85c08c1a2bc4")
    
    # Files definition: (html_filename, png_filename, pdf_filename, width, height)
    tasks = [
        # 1. Toàn cảnh 3 cánh trifold (190cm x 170cm)
        ("generate_trifold_poster.html", "reschool_khkt_toan_canh_trifold.png", "reschool_khkt_toan_canh_trifold.pdf", 1900, 1700),
        # 2. Cánh Trái độc lập (50cm x 120cm)
        ("khkt_canh_trai.html", "reschool_khkt_canh_trai.png", "reschool_khkt_canh_trai.pdf", 500, 1200),
        # 3. Cánh Giữa độc lập (90cm x 170cm)
        ("khkt_canh_giua.html", "reschool_khkt_canh_giua.png", "reschool_khkt_canh_giua.pdf", 900, 1700),
        # 4. Cánh Phải độc lập (50cm x 120cm)
        ("khkt_canh_phai.html", "reschool_khkt_canh_phai.png", "reschool_khkt_canh_phai.pdf", 500, 1200),
    ]
    
    print("Bắt đầu render toàn bộ bộ Poster KHKT 3 cánh theo quy chuẩn...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        for html_name, png_name, pdf_name, w, h in tasks:
            html_file = current_dir / html_name
            png_file = current_dir / png_name
            pdf_file = current_dir / pdf_name
            
            print(f"Đang xử lý: {html_name} -> {w}x{h} px...")
            page = browser.new_page(
                viewport={"width": w, "height": h},
                device_scale_factor=2.0
            )
            page.goto(html_file.as_uri(), wait_until="networkidle")
            page.wait_for_timeout(2000)
            
            # Xuất PNG
            page.screenshot(path=str(png_file))
            print(f"  + Đã xuất PNG: {png_name} ({os.path.getsize(png_file):,} bytes)")
            
            # Xuất PDF
            page.pdf(
                path=str(pdf_file),
                width=f"{w}px",
                height=f"{h}px",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            print(f"  + Đã xuất PDF: {pdf_name} ({os.path.getsize(pdf_file):,} bytes)")
            page.close()
            
            # Copy vào artifact
            if artifact_dir.exists():
                shutil.copy2(png_file, artifact_dir / png_name)
                shutil.copy2(pdf_file, artifact_dir / pdf_name)
                shutil.copy2(html_file, artifact_dir / html_name)
                
        browser.close()
        
    print("HOÀN THÀNH: Tất cả các tệp in ấn và trình chiếu đã sẵn sàng!")

if __name__ == "__main__":
    render_all_panels()
