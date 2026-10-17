/**
 * Reschool - Cấu hình Firebase Client SDK
 * Tích hợp trực tiếp API Key và dự án Firebase của bạn.
 */

// Cấu hình dự án Firebase chính thức cho Reschool Web App
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSIZeq1heEofbXQ582g5H2aLjE8Puc2Yo",
  authDomain: "reschool-reused-app.firebaseapp.com",
  projectId: "reschool-reused-app",
  storageBucket: "reschool-reused-app.firebasestorage.app",
  messagingSenderId: "406277815676",
  appId: "1:406277815676:web:9c44ccb7481126cc4578f9"
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
