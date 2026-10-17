/**
 * Reschool - Main Application Controller
 * Điều hướng tabs, lắng nghe sự kiện, xử lý đăng tin và điều khiển giao diện.
 */
import { api } from './api.js';
import { authManager } from './auth.js';
import { initReschoolMap, renderMapMarkers, resizeMap } from './map.js';
import { renderItemGrid, openItemDetailModal } from './items.js';
import { renderMatchmakingList } from './matchmaking.js';

class ReschoolApp {
  constructor() {
    this.currentTab = "explore";
    this.currentFilters = {
      keyword: "",
      type: "ALL",
      category: "ALL",
      grade: "ALL"
    };
    this.allItems = [];
    this.init();
  }

  async init() {
    // Kiểm tra đăng nhập: Bắt buộc đăng nhập trước khi sử dụng dịch vụ Reschool
    if (!authManager.isLoggedIn()) {
      window.location.replace("login.html");
      return;
    }

    this.cacheDom();
    this.bindEvents();
    await this.loadData();
    this.setupAuthObserver();
  }

  cacheDom() {
    // Tabs & views
    this.navTabs = document.querySelectorAll(".nav-tab-btn");
    this.viewSections = document.querySelectorAll(".view-section");
    
    // Feed & Matchmaking containers
    this.itemsGrid = document.getElementById("items-grid");
    this.matchmakingContainer = document.getElementById("matchmaking-list");
    this.itemsCountLabel = document.getElementById("items-found-count");
    
    // Filters & Search
    this.searchInput = document.getElementById("global-search-input");
    this.categoryChips = document.querySelectorAll(".category-chip");
    this.typeSelect = document.getElementById("type-filter-select");
    this.gradeSelect = document.getElementById("grade-filter-select");

    // Modals
    this.itemDetailModal = document.getElementById("item-detail-modal");
    this.createPostModal = document.getElementById("create-post-modal");
    this.profileModal = document.getElementById("profile-onboarding-modal");
    this.authModal = document.getElementById("auth-modal");
    
    // Buttons
    this.openPostBtn = document.getElementById("btn-open-create-post");
    this.mobilePostBtn = document.getElementById("btn-mobile-create-post");
    this.heroExploreBtn = document.getElementById("btn-hero-explore");
    this.heroCreateBtn = document.getElementById("btn-hero-create-post");
    this.loginBtn = document.getElementById("btn-auth-trigger");
  }

  bindEvents() {
    // Navigation tabs (both desktop & mobile bottom bar)
    this.navTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    if (this.openPostBtn) {
      this.openPostBtn.addEventListener("click", () => this.openCreateModal());
    }

    if (this.mobilePostBtn) {
      this.mobilePostBtn.addEventListener("click", () => this.openCreateModal());
    }

    // Hero buttons
    if (this.heroExploreBtn) {
      this.heroExploreBtn.addEventListener("click", () => {
        this.switchTab("explore");
        const toolbar = document.querySelector(".filters-toolbar");
        if (toolbar) {
          toolbar.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    if (this.heroCreateBtn) {
      this.heroCreateBtn.addEventListener("click", () => this.openCreateModal());
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.currentFilters.keyword = e.target.value;
        this.applyFilters();
      });
    }

    // Category chips
    this.categoryChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.categoryChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.currentFilters.category = chip.getAttribute("data-category");
        this.applyFilters();
      });
    });

    // Type select
    if (this.typeSelect) {
      this.typeSelect.addEventListener("change", (e) => {
        this.currentFilters.type = e.target.value;
        this.applyFilters();
      });
    }

    // Grade select
    if (this.gradeSelect) {
      this.gradeSelect.addEventListener("change", (e) => {
        this.currentFilters.grade = e.target.value;
        this.applyFilters();
      });
    }

    // Modal Đăng tin
    if (this.openPostBtn) {
      this.openPostBtn.addEventListener("click", () => this.openCreateModal());
    }

    // Form đăng tin
    const postForm = document.getElementById("create-post-form");
    if (postForm) {
      postForm.addEventListener("submit", (e) => this.handleCreatePost(e));
    }

    // Nút chỉnh sửa hồ sơ trong modal đăng tin
    const editProfileBtn = document.getElementById("btn-edit-profile-from-post");
    if (editProfileBtn) {
      editProfileBtn.addEventListener("click", () => {
        if (this.createPostModal) this.createPostModal.classList.remove("active");
        this.openProfileModal();
      });
    }

    // Modal & Nút Đăng nhập Google
    if (this.loginBtn) {
      this.loginBtn.addEventListener("click", () => this.openAuthModal());
    }
    const googleLoginBtn = document.getElementById("btn-google-login");
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener("click", () => this.handleGoogleLogin());
    }
    const gateAuthBtn = document.getElementById("btn-gate-auth-action");
    if (gateAuthBtn) {
      gateAuthBtn.addEventListener("click", () => this.openAuthModal());
    }

    // Form Lưu hồ sơ học sinh (Onboarding Database)
    const profileForm = document.getElementById("profile-onboarding-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => this.handleSaveProfile(e));
    }

    // Image file upload preview
    const imageInput = document.getElementById("post-image-file");
    if (imageInput) {
      imageInput.addEventListener("change", (e) => this.handleImagePreview(e));
    }
  }

  switchTab(tabId) {
    // Bắt buộc đăng nhập để sử dụng các dịch vụ Bản đồ và Ghép nối
    if ((tabId === "map" || tabId === "matchmaking") && !authManager.isLoggedIn()) {
      const serviceName = tabId === "map" ? "Bản đồ trường học" : "Gợi ý ghép nối";
      this.showToast(`Vui lòng đăng nhập với Google để sử dụng tính năng ${serviceName}!`);
      this.openAuthModal();
      return;
    }

    this.currentTab = tabId;
    this.navTabs.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    this.viewSections.forEach(section => {
      section.classList.toggle("active", section.id === `view-${tabId}`);
    });

    if (tabId === "map") {
      initReschoolMap("reschool-map", (item) => {
        openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
      });
      renderMapMarkers(this.allItems, (item) => {
        openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
      });
      resizeMap();
    } else if (tabId === "matchmaking") {
      this.loadMatchmaking();
    }
  }

  async loadData() {
    this.allItems = await api.getItems();
    this.applyFilters();
  }

  applyFilters() {
    const filtered = api.getLocalItems(this.currentFilters);
    if (this.itemsGrid) {
      renderItemGrid(filtered, this.itemsGrid, (item) => {
        if (!authManager.isLoggedIn()) {
          this.showToast("Vui lòng đăng nhập với Google để xem thông tin chi tiết và liên hệ bạn học!");
          this.openAuthModal();
          return;
        }
        openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
      });
    }
    if (this.itemsCountLabel) {
      this.itemsCountLabel.textContent = `${filtered.length} món đồ`;
    }
    // Cập nhật marker trên map nếu map đang active
    if (this.currentTab === "map") {
      renderMapMarkers(filtered, (item) => {
        openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
      });
    }
  }

  async loadMatchmaking() {
    const matches = await api.getMatchSuggestions();
    renderMatchmakingList(matches, this.matchmakingContainer, (itemId) => {
      const item = this.allItems.find(i => i.id === itemId);
      if (item) openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
    });
  }

  openCreateModal() {
    if (!authManager.isLoggedIn()) {
      this.showToast("Vui lòng đăng nhập bằng Google trước khi đăng tin.");
      this.openAuthModal();
      return;
    }

    if (!authManager.isProfileCompleted()) {
      this.showToast("Vui lòng hoàn thiện hồ sơ học sinh một lần duy nhất.");
      this.openProfileModal();
      return;
    }

    if (this.createPostModal) {
      const user = authManager.getUser();

      // Cập nhật banner thông tin người đăng đã lưu sẵn
      const avatarEl = document.getElementById("preset-user-avatar");
      const nameEl = document.getElementById("preset-user-name");
      const schoolEl = document.getElementById("preset-user-school");
      const addrInput = document.getElementById("post-address");

      if (avatarEl && user.photoURL) avatarEl.src = user.photoURL;
      if (nameEl) nameEl.textContent = `${user.displayName}${user.studentClass ? ' • Lớp ' + user.studentClass : ''}`;
      if (schoolEl) schoolEl.textContent = `${user.school} (${user.district || 'Hà Nội'})`;
      if (addrInput && !addrInput.value && user.defaultAddress) {
        addrInput.value = user.defaultAddress;
      }

      this.createPostModal.classList.add("active");
      const closeBtn = this.createPostModal.querySelector(".modal-close-btn");
      const backdrop = this.createPostModal.querySelector(".modal-backdrop");
      const close = () => this.createPostModal.classList.remove("active");
      if (closeBtn) closeBtn.onclick = close;
      if (backdrop) backdrop.onclick = close;
    }
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById("post-image-preview");
    if (!file || !previewContainer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Ảnh xem trước" class="preview-img-tag" />`;
      previewContainer.setAttribute("data-img-url", e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async handleCreatePost(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang đăng bài...";

    const user = authManager.getUser() || {
      displayName: "Học sinh Reschool",
      school: "THPT Chu Văn An",
      district: "Tây Hồ",
      city: "Hà Nội",
      studentClass: "11A",
      phone: "0912345678",
      zalo: "0912345678",
      email: ""
    };

    const previewContainer = document.getElementById("post-image-preview");
    const uploadedImg = previewContainer ? previewContainer.getAttribute("data-img-url") : null;
    const defaultPlaceholder = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600";

    const postType = form["post-type"].value;
    const postCategory = form["post-category"].value;
    const postTitle = form["post-title"].value.trim();
    const postGrade = form["post-grade"].value ? parseInt(form["post-grade"].value) : null;
    const postCondition = form["post-condition"].value.trim();
    const postDescription = form["post-description"].value.trim();
    const specificAddress = form["post-address"].value.trim();
    const postTags = form["post-tags"].value ? form["post-tags"].value.split(',').map(t => t.trim()) : [];

    const newItemData = {
      title: postTitle,
      type: postType,
      category: postCategory,
      grade: postGrade,
      condition: postCondition,
      description: postDescription,
      images: [uploadedImg || defaultPlaceholder],
      tags: postTags,
      user_id: user.uid || "anonymous",
      status: "AVAILABLE",
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location: {
        school_name: user.school || "Trường THPT",
        city: user.city || "Hà Nội",
        district: user.district || "Tây Hồ",
        address_detail: specificAddress || user.defaultAddress || "",
        latitude: 21.0333 + (Math.random() - 0.5) * 0.04,
        longitude: 105.8400 + (Math.random() - 0.5) * 0.04
      },
      contact: {
        user_id: user.uid || "anonymous",
        author_name: user.displayName,
        author_avatar: user.photoURL || "",
        student_class: user.studentClass || "",
        phone: user.phone || "",
        zalo: user.zalo || user.phone || "",
        email: user.email || ""
      }
    };

    await api.createItem(newItemData);
    this.showToast(postType === "RECEIVE" 
      ? "Đã đăng tin tìm đồ! Hệ thống sẽ thông báo khi có đồ tương ứng." 
      : "Đăng bài thành công! Đồ dùng đã sẵn sàng luân chuyển cùng các bạn.");
    
    form.reset();
    if (previewContainer) {
      previewContainer.innerHTML = "";
      previewContainer.removeAttribute("data-img-url");
    }
    if (this.createPostModal) this.createPostModal.classList.remove("active");
    submitBtn.disabled = false;
    submitBtn.textContent = "Hoàn tất đăng bài";

    await this.loadData();
  }

  openAuthModal() {
    window.location.href = "login.html";
  }

  async handleGoogleLogin() {
    const googleBtn = document.getElementById("btn-google-login");
    if (googleBtn) {
      googleBtn.disabled = true;
      googleBtn.classList.add("loading");
    }

    try {
      const user = await authManager.loginWithGoogle();
      if (this.authModal) this.authModal.classList.remove("active");

      if (!user.profileCompleted) {
        this.showToast(`Chào mừng ${user.displayName}! Hãy cập nhật trường lớp một lần duy nhất nhé.`);
        this.openProfileModal();
      } else {
        this.showToast(`Chào mừng bạn ${user.displayName} đã đăng nhập!`);
      }
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      this.showToast("Không thể đăng nhập. Vui lòng thử lại!");
    } finally {
      if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.classList.remove("loading");
      }
    }
  }

  openProfileModal() {
    if (!this.profileModal) return;
    const user = authManager.getUser();
    if (user) {
      const sName = document.getElementById("profile-school-name");
      const dist = document.getElementById("profile-district");
      const addr = document.getElementById("profile-address");
      const stdName = document.getElementById("profile-student-name");
      const stdClass = document.getElementById("profile-student-class");
      const phone = document.getElementById("profile-phone");
      const zalo = document.getElementById("profile-zalo");

      if (sName && user.school) sName.value = user.school;
      if (dist && user.district) dist.value = user.district;
      if (addr && user.defaultAddress) addr.value = user.defaultAddress;
      if (stdName) stdName.value = user.displayName || "";
      if (stdClass && user.studentClass) stdClass.value = user.studentClass;
      if (phone && user.phone) phone.value = user.phone;
      if (zalo && user.zalo) zalo.value = user.zalo;
    }

    this.profileModal.classList.add("active");
    const closeBtn = this.profileModal.querySelector(".modal-close-btn");
    const backdrop = this.profileModal.querySelector(".modal-backdrop");
    const close = () => this.profileModal.classList.remove("active");
    if (closeBtn) closeBtn.onclick = close;
    if (backdrop) backdrop.onclick = close;
  }

  handleSaveProfile(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang lưu vào cơ sở dữ liệu...";
    }

    const studentClassStr = form["profile-student-class"].value.trim();
    const gradeMatch = studentClassStr.match(/\b(1[0-2]|[1-9])\b/);
    const parsedGrade = gradeMatch ? parseInt(gradeMatch[1]) : null;

    const profileData = {
      schoolName: form["profile-school-name"].value.trim(),
      district: form["profile-district"].value.trim(),
      city: "Hà Nội",
      address: form["profile-address"].value.trim(),
      authorName: form["profile-student-name"].value.trim(),
      studentClass: studentClassStr,
      grade: parsedGrade,
      phone: form["profile-phone"].value.trim(),
      zalo: form["profile-zalo"].value.trim()
    };

    authManager.saveStudentProfile(profileData);
    this.showToast("Đã lưu thông tin học sinh vào cơ sở dữ liệu!");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Lưu thông tin hồ sơ";
    }

    if (this.profileModal) this.profileModal.classList.remove("active");
  }

  setupAuthObserver() {
    authManager.onAuthStateChanged((user) => {
      const authContainer = document.getElementById("header-auth-box");

      if (user) {
        document.body.classList.add("user-authenticated");

        if (authContainer) {
          authContainer.innerHTML = `
            <div class="user-profile-badge">
              <img src="${user.photoURL}" alt="${user.displayName}" class="user-avatar-mini" />
              <div class="user-meta-header" id="btn-header-edit-profile" style="cursor: pointer;" title="Xem & sửa thông tin hồ sơ">
                <span class="user-name">${user.displayName}</span>
                <span class="user-school-tag">${user.school || "Cập nhật hồ sơ"}</span>
              </div>
              <button id="btn-logout" class="btn-logout" title="Đăng xuất" aria-label="Đăng xuất">
                <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          `;
          const editHeaderBtn = document.getElementById("btn-header-edit-profile");
          if (editHeaderBtn) {
            editHeaderBtn.onclick = () => this.openProfileModal();
          }
          const logoutBtn = document.getElementById("btn-logout");
          if (logoutBtn) {
            logoutBtn.onclick = () => {
              authManager.logout();
              window.location.replace("login.html");
            };
          }
        }
      } else {
        document.body.classList.remove("user-authenticated");
        window.location.replace("login.html");
      }
    });
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

// Khởi chạy khi DOM load xong
document.addEventListener("DOMContentLoaded", () => {
  window.reschoolApp = new ReschoolApp();
});
