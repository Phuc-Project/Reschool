/**
 * Reschool - Main Application Controller
 * Điều hướng tabs, lắng nghe sự kiện, xử lý đăng tin và cấu hình Firebase.
 */
import { api } from './api.js';
import { authManager } from './auth.js';
import { initReschoolMap, renderMapMarkers, resizeMap } from './map.js';
import { renderItemGrid, openItemDetailModal } from './items.js';
import { renderMatchmakingList } from './matchmaking.js';
import { getActiveFirebaseConfig, saveFirebaseConfig, isRealFirebaseConfigured } from './firebase-config.js';

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
    this.cacheDom();
    this.bindEvents();
    this.updateFirebaseBadge();
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
    this.firebaseConfigModal = document.getElementById("firebase-config-modal");
    this.authModal = document.getElementById("auth-modal");
    
    // Buttons
    this.openPostBtn = document.getElementById("btn-open-create-post");
    this.firebaseBadgeBtn = document.getElementById("firebase-status-pill");
    this.loginBtn = document.getElementById("btn-auth-trigger");
  }

  bindEvents() {
    // Navigation tabs
    this.navTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

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

    // Modal Firebase Config
    if (this.firebaseBadgeBtn) {
      this.firebaseBadgeBtn.addEventListener("click", () => this.openFirebaseModal());
    }

    // Form đăng tin
    const postForm = document.getElementById("create-post-form");
    if (postForm) {
      postForm.addEventListener("submit", (e) => this.handleCreatePost(e));
    }

    // Form cấu hình Firebase
    const firebaseForm = document.getElementById("firebase-config-form");
    if (firebaseForm) {
      firebaseForm.addEventListener("submit", (e) => this.handleSaveFirebaseConfig(e));
    }

    // Form Auth Login
    if (this.loginBtn) {
      this.loginBtn.addEventListener("click", () => this.openAuthModal());
    }
    const authForm = document.getElementById("quick-auth-form");
    if (authForm) {
      authForm.addEventListener("submit", (e) => this.handleQuickLogin(e));
    }

    // Image file upload preview
    const imageInput = document.getElementById("post-image-file");
    if (imageInput) {
      imageInput.addEventListener("change", (e) => this.handleImagePreview(e));
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    this.navTabs.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    this.viewSections.forEach(section => {
      section.classList.toggle("active", section.id === `view-${tabId}`);
    });

    if (tabId === "map") {
      initReschoolMap("reschool-map", (item) => {
        openItemDetailModal(item, this.itemDetailModal);
      });
      renderMapMarkers(this.allItems, (item) => {
        openItemDetailModal(item, this.itemDetailModal);
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
        openItemDetailModal(item, this.itemDetailModal);
      });
    }
    if (this.itemsCountLabel) {
      this.itemsCountLabel.textContent = `${filtered.length} món đồ`;
    }
    // Cập nhật marker trên map nếu map đang active
    if (this.currentTab === "map") {
      renderMapMarkers(filtered, (item) => {
        openItemDetailModal(item, this.itemDetailModal);
      });
    }
  }

  async loadMatchmaking() {
    const matches = await api.getMatchSuggestions();
    renderMatchmakingList(matches, this.matchmakingContainer, (itemId) => {
      const item = this.allItems.find(i => i.id === itemId);
      if (item) openItemDetailModal(item, this.itemDetailModal);
    });
  }

  openCreateModal() {
    if (this.createPostModal) {
      this.createPostModal.classList.add("active");
      const closeBtn = this.createPostModal.querySelector(".modal-close-btn");
      const backdrop = this.createPostModal.querySelector(".modal-backdrop");
      const close = () => this.createPostModal.classList.remove("active");
      if (closeBtn) closeBtn.onclick = close;
      if (backdrop) backdrop.onclick = close;

      // Điền sẵn tên nếu đã đăng nhập
      const user = authManager.getUser();
      if (user) {
        const nameInput = document.getElementById("post-author-name");
        const schoolInput = document.getElementById("post-school-name");
        const classInput = document.getElementById("post-student-class");
        if (nameInput) nameInput.value = user.displayName;
        if (schoolInput) schoolInput.value = user.school;
        if (classInput) classInput.value = user.studentClass || "";
      }
    }
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById("post-image-preview");
    if (!file || !previewContainer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-height: 140px; border-radius: 8px;" />`;
      previewContainer.setAttribute("data-img-url", e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async handleCreatePost(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang đăng tin...";

    const previewContainer = document.getElementById("post-image-preview");
    const uploadedImg = previewContainer ? previewContainer.getAttribute("data-img-url") : null;
    const defaultPlaceholder = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600";

    const newItemData = {
      title: form["post-title"].value.trim(),
      type: form["post-type"].value,
      category: form["post-category"].value,
      grade: form["post-grade"].value ? parseInt(form["post-grade"].value) : null,
      condition: form["post-condition"].value,
      description: form["post-description"].value.trim(),
      images: [uploadedImg || defaultPlaceholder],
      tags: form["post-tags"].value ? form["post-tags"].value.split(',').map(t => t.trim()) : [],
      location: {
        school_name: form["post-school-name"].value.trim(),
        city: "Hà Nội",
        district: form["post-district"].value.trim() || "Ba Đình",
        address_detail: form["post-address"].value.trim() || "",
        latitude: 21.0333 + (Math.random() - 0.5) * 0.04,
        longitude: 105.8400 + (Math.random() - 0.5) * 0.04
      },
      contact: {
        author_name: form["post-author-name"].value.trim(),
        student_class: form["post-student-class"].value.trim(),
        phone: form["post-phone"].value.trim(),
        zalo: form["post-zalo"].value.trim() || form["post-phone"].value.trim(),
        email: ""
      }
    };

    const saved = await api.createItem(newItemData);
    this.showToast("🎉 Đăng tin thành công! Bài viết đã sẵn sàng kết nối cùng các bạn.");
    
    form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (this.createPostModal) this.createPostModal.classList.remove("active");
    submitBtn.disabled = false;
    submitBtn.textContent = "Hoàn tất đăng tin";

    await this.loadData();
  }

  openFirebaseModal() {
    if (!this.firebaseConfigModal) return;
    const config = getActiveFirebaseConfig();
    const apiKeyInput = document.getElementById("fb-api-key");
    const projectIdInput = document.getElementById("fb-project-id");
    const authDomainInput = document.getElementById("fb-auth-domain");

    if (apiKeyInput) apiKeyInput.value = config.apiKey || "";
    if (projectIdInput) projectIdInput.value = config.projectId || "";
    if (authDomainInput) authDomainInput.value = config.authDomain || "";

    this.firebaseConfigModal.classList.add("active");
    const closeBtn = this.firebaseConfigModal.querySelector(".modal-close-btn");
    const backdrop = this.firebaseConfigModal.querySelector(".modal-backdrop");
    const close = () => this.firebaseConfigModal.classList.remove("active");
    if (closeBtn) closeBtn.onclick = close;
    if (backdrop) backdrop.onclick = close;
  }

  handleSaveFirebaseConfig(e) {
    e.preventDefault();
    const form = e.target;
    const current = getActiveFirebaseConfig();
    const updated = {
      ...current,
      apiKey: form["fb-api-key"].value.trim(),
      projectId: form["fb-project-id"].value.trim(),
      authDomain: form["fb-auth-domain"].value.trim()
    };

    saveFirebaseConfig(updated);
    this.updateFirebaseBadge();
    this.showToast("✅ Đã lưu cấu hình Firebase! Hệ thống sẵn sàng đồng bộ Cloud Firestore.");
    if (this.firebaseConfigModal) this.firebaseConfigModal.classList.remove("active");
  }

  updateFirebaseBadge() {
    if (!this.firebaseBadgeBtn) return;
    const isReal = isRealFirebaseConfigured();
    const config = getActiveFirebaseConfig();

    if (isReal) {
      this.firebaseBadgeBtn.className = "firebase-pill status-connected";
      this.firebaseBadgeBtn.innerHTML = `
        <span class="pulse-dot green"></span>
        <span>Firebase: <strong>${config.projectId}</strong></span>
      `;
    } else {
      this.firebaseBadgeBtn.className = "firebase-pill status-demo";
      this.firebaseBadgeBtn.innerHTML = `
        <span class="pulse-dot amber"></span>
        <span>Firebase (Demo Mode) • Bấm để cấu hình API Key</span>
      `;
    }
  }

  openAuthModal() {
    if (!this.authModal) return;
    this.authModal.classList.add("active");
    const closeBtn = this.authModal.querySelector(".modal-close-btn");
    const backdrop = this.authModal.querySelector(".modal-backdrop");
    const close = () => this.authModal.classList.remove("active");
    if (closeBtn) closeBtn.onclick = close;
    if (backdrop) backdrop.onclick = close;
  }

  handleQuickLogin(e) {
    e.preventDefault();
    const form = e.target;
    const name = form["student-name"].value.trim();
    const school = form["student-school"].value.trim();
    const sClass = form["student-class"].value.trim();

    authManager.loginStudent(name, school, sClass);
    this.showToast(`👋 Chào mừng bạn ${name} đã đăng nhập Reschool!`);
    if (this.authModal) this.authModal.classList.remove("active");
  }

  setupAuthObserver() {
    authManager.onAuthStateChanged((user) => {
      const authContainer = document.getElementById("header-auth-box");
      if (!authContainer) return;

      if (user) {
        authContainer.innerHTML = `
          <div class="user-profile-badge">
            <img src="${user.photoURL}" alt="${user.displayName}" class="user-avatar-mini" />
            <div class="user-meta-header">
              <span class="user-name">${user.displayName}</span>
              <span class="user-school-tag">${user.school}</span>
            </div>
            <button id="btn-logout" class="btn-logout" title="Đăng xuất">⏻</button>
          </div>
        `;
        const logoutBtn = document.getElementById("btn-logout");
        if (logoutBtn) {
          logoutBtn.onclick = () => {
            authManager.logout();
            this.showToast("Đã đăng xuất tài khoản.");
          };
        }
      } else {
        authContainer.innerHTML = `
          <button id="btn-auth-trigger" class="btn btn-outline btn-sm">
            🧑‍🎓 Đăng nhập học sinh
          </button>
        `;
        const btn = document.getElementById("btn-auth-trigger");
        if (btn) btn.onclick = () => this.openAuthModal();
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
