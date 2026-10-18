/**
 * Reschool Dedicated Login Module
 * Xử lý logic đăng nhập Google và hoàn thiện hồ sơ học sinh trên trang riêng biệt.
 */
import { authManager } from './auth.js';

class ReschoolLoginPage {
  constructor() {
    this.stepAuth = document.getElementById("login-step-auth");
    this.stepProfile = document.getElementById("login-step-profile");
    this.btnGoogleLogin = document.getElementById("btn-google-login-action");
    this.profileForm = document.getElementById("login-profile-form");
    this.btnSwitchAccount = document.getElementById("btn-switch-account");

    this.init();
  }

  init() {
    // Nếu học sinh đã đăng nhập và hoàn tất hồ sơ, chuyển ngay vào hệ thống chính
    if (authManager.isLoggedIn()) {
      const user = authManager.getUser();
      if (user && user.profileCompleted) {
        window.location.replace("index.html");
        return;
      } else if (user) {
        this.showProfileStep(user);
      }
    }

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnGoogleLogin) {
      this.btnGoogleLogin.addEventListener("click", () => this.handleGoogleLogin());
    }

    if (this.profileForm) {
      this.profileForm.addEventListener("submit", (e) => this.handleProfileSubmit(e));
    }

    if (this.btnSwitchAccount) {
      this.btnSwitchAccount.addEventListener("click", () => {
        authManager.logout();
        this.stepProfile.classList.remove("active");
        this.stepAuth.classList.add("active");
      });
    }
  }

  async handleGoogleLogin() {
    const btn = this.btnGoogleLogin;
    const originalText = btn.innerHTML;
    
    try {
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="icon icon-sm spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Đang kết nối Google...</span>
      `;

      const user = await authManager.loginWithGoogle();
      
      if (user && user.profileCompleted) {
        this.showToast(`Đăng nhập thành công! Chào bạn ${user.displayName}.`);
        setTimeout(() => {
          window.location.replace("index.html");
        }, 500);
      } else if (user) {
        this.showToast(`Xin chào ${user.displayName}! Vui lòng cập nhật thông tin học sinh.`);
        this.showProfileStep(user);
      }
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      this.showToast("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  showProfileStep(user) {
    if (!this.stepAuth || !this.stepProfile) return;

    this.stepAuth.classList.remove("active");
    this.stepProfile.classList.add("active");

    // Điền thông tin đã có từ Google
    const avatarEl = document.getElementById("quick-preview-avatar");
    const nameEl = document.getElementById("quick-preview-name");
    const emailEl = document.getElementById("quick-preview-email");
    const studentNameInput = document.getElementById("onboard-student-name");

    if (avatarEl) avatarEl.src = user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
    if (nameEl) nameEl.textContent = user.displayName || "Học sinh";
    if (emailEl) emailEl.textContent = user.email || "";
    if (studentNameInput && !studentNameInput.value) {
      studentNameInput.value = user.displayName || "";
    }
  }

  handleProfileSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById("btn-submit-profile-form");

    const schoolName = form["onboard-school-name"].value.trim();
    const studentClass = form["onboard-class"].value.trim();
    const district = form["onboard-district"] ? form["onboard-district"].value.trim() : "";
    const phone = form["onboard-phone"] ? form["onboard-phone"].value.trim() : "";
    const address = form["onboard-address"] ? form["onboard-address"].value.trim() : "";
    const authorName = form["onboard-student-name"].value.trim();

    if (!schoolName || !studentClass) {
      this.showToast("Vui lòng điền đầy đủ Trường học và Khối lớp!");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang lưu hồ sơ...";
    }

    const isHaiPhong = district.includes("Hải Phòng") || schoolName.includes("Ái Quốc") || schoolName.includes("Hàng hải");

    const profileData = {
      authorName: authorName,
      schoolName: schoolName,
      studentClass: studentClass,
      district: district || "Ái Quốc",
      city: isHaiPhong ? "Hải Phòng" : "Hải Phòng",
      phone: phone || "Bảo mật",
      zalo: "",
      address: address || "Thư viện / Phòng Đoàn Đội trường"
    };

    authManager.saveStudentProfile(profileData);
    this.showToast("Hoàn tất thiết lập hồ sơ! Đang vào hệ thống...");

    setTimeout(() => {
      window.location.replace("index.html");
    }, 600);
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "reschool-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ReschoolLoginPage();
});
