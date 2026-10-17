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
    this.authModal = document.getElementById("auth-modal");
    
    // Buttons
    this.openPostBtn = document.getElementById("btn-open-create-post");
    this.heroExploreBtn = document.getElementById("btn-hero-explore");
    this.heroCreateBtn = document.getElementById("btn-hero-create-post");
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

    await api.createItem(newItemData);
    this.showToast("Đăng bài thành công! Đồ dùng đã sẵn sàng luân chuyển cùng các bạn.");
    
    form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (this.createPostModal) this.createPostModal.classList.remove("active");
    submitBtn.disabled = false;
    submitBtn.textContent = "Hoàn tất đăng bài";

    await this.loadData();
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
    this.showToast(`Chào mừng bạn ${name} đã đăng nhập Reschool!`);
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
            <button id="btn-logout" class="btn-logout" title="Đăng xuất" aria-label="Đăng xuất">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
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
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Đăng nhập học sinh</span>
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
