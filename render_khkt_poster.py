import sys
import os
import shutil
from pathlib import Path

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def render_khkt_poster():
    current_dir = Path(__file__).parent.resolve()
    html_path = current_dir / "generate_khkt_poster.html"
    png_path = current_dir / "reschool_khkt_poster.png"
    pdf_path = current_dir / "reschool_khkt_poster.pdf"
    
    artifact_dir = Path(r"C:\Users\Admin\.gemini\antigravity\brain\b405c429-a5e2-47ab-9755-85c08c1a2bc4")
    
    print("Đang khởi động Playwright Chromium để render Poster KHKT...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Viewport: 1200 x 1700, device scale factor 2.0 -> 2400 x 3400 px Ultra HD 300 DPI
        page = browser.new_page(
            viewport={"width": 1200, "height": 1700},
            device_scale_factor=2.0
        )
        
        # Load local HTML file
        page.goto(html_path.as_uri(), wait_until="networkidle")
        
        # Wait for Google Fonts to be fully active
        page.wait_for_timeout(3000)
        
        # 1. Take High-Resolution Screenshot (PNG)
        print("Đang xuất ảnh PNG Poster KHKT chất lượng cao (2400 x 3400 px)...")
        element = page.locator(".poster-canvas")
        element.screenshot(path=str(png_path))
        print(f"Ảnh PNG đã tạo: {png_path.name} ({os.path.getsize(png_path):,} bytes)")
        
        # 2. Render PDF (Print Ready khổ in A0/A1)
        print("Đang xuất tệp PDF Vector in ấn KHKT...")
        page.pdf(
            path=str(pdf_path),
            width="1200px",
            height="1700px",
            print_background=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"}
        )
        print(f"Tệp PDF đã tạo: {pdf_path.name} ({os.path.getsize(pdf_path):,} bytes)")
        
        browser.close()
        
    # Copy to artifact folder if exists
    if artifact_dir.exists():
        shutil.copy2(png_path, artifact_dir / "reschool_khkt_poster.png")
        shutil.copy2(pdf_path, artifact_dir / "reschool_khkt_poster.pdf")
        shutil.copy2(html_path, artifact_dir / "reschool_khkt_poster.html")
        print("Đã sao chép toàn bộ tệp kết quả vào thư mục artifact!")

if __name__ == "__main__":
    render_khkt_poster()
