/**
 * Reschool Authentication Module
 * Quản lý trạng thái học sinh đăng nhập qua Firebase Auth hoặc Demo Account.
 */
import { isRealFirebaseConfigured } from './firebase-config.js';

class ReschoolAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    // Đọc thông tin đã đăng nhập trong session/local
    try {
      const savedUser = localStorage.getItem("reschool_auth_user");
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn("Lỗi đọc auth user:", e);
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  // Đăng nhập nhanh chế độ học sinh
  loginStudent(name, school, studentClass = "11A1") {
    const user = {
      uid: `student-${Date.now()}`,
      displayName: name || "Nguyễn Hoàng Nam",
      email: `${(name || "hocsinh").toLowerCase().replace(/\s+/g, '')}@reschool.edu.vn`,
      school: school || "THPT Chu Văn An",
      studentClass: studentClass,
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
    };

    this.currentUser = user;
    localStorage.setItem("reschool_auth_user", JSON.stringify(user));
    this.notify();
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("reschool_auth_user");
    this.notify();
  }

  getUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return Boolean(this.currentUser);
  }
}

export const authManager = new ReschoolAuth();
