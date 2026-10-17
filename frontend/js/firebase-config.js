/**
 * Reschool - Cấu hình Firebase Client SDK
 * Tích hợp trực tiếp API Key và dự án Firebase của bạn.
 */

// Cấu hình dự án Firebase chính thức cho Reschool Web App (tmhp369@gmail.com)
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA3kbguBYRzEAeWrEIHCpVD5qWpCchzHPs",
  authDomain: "reschool-reused-vn.firebaseapp.com",
  projectId: "reschool-reused-vn",
  storageBucket: "reschool-reused-vn.firebasestorage.app",
  messagingSenderId: "738548997838",
  appId: "1:738548997838:web:6331842cedacaa9daeba9f"
};

// Đọc cấu hình tùy biến từ LocalStorage nếu người dùng chỉnh sửa trong giao diện
export function getActiveFirebaseConfig() {
  try {
    const saved = localStorage.getItem("reschool_firebase_config");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Không thể đọc cấu hình Firebase từ localStorage:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Lưu cấu hình Firebase mới vào LocalStorage
export function saveFirebaseConfig(newConfig) {
  try {
    localStorage.setItem("reschool_firebase_config", JSON.stringify(newConfig));
    return true;
  } catch (e) {
    console.error("Lỗi khi lưu cấu hình Firebase:", e);
    return false;
  }
}

// Kiểm tra xem API Key đã sẵn sàng và hợp lệ hay chưa
export function isRealFirebaseConfigured() {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config.apiKey &&
    !config.apiKey.includes("YOUR_RESCHOOL_API_KEY") &&
    config.apiKey.startsWith("AIzaSy")
  );
}
