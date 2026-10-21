/**
 * Reschool - Main Application Controller
 * Điều hướng tabs, lắng nghe sự kiện, xử lý đăng tin và điều khiển giao diện.
 */
import { api } from './api.js';
import { authManager } from './auth.js';
import { initReschoolMap, renderMapMarkers, resizeMap, focusLocation } from './map.js';
import { renderItemGrid, openItemDetailModal, openTransitTicketModal } from './items.js';
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

    // Quick School Selector for Hai Phong
    const mapSchoolChips = document.querySelectorAll(".school-chip");
    mapSchoolChips.forEach(chip => {
      chip.addEventListener("click", () => {
        mapSchoolChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const lat = parseFloat(chip.getAttribute("data-lat"));
        const lng = parseFloat(chip.getAttribute("data-lng"));
        const zoom = parseInt(chip.getAttribute("data-zoom") || "15", 10);
        if (!isNaN(lat) && !isNaN(lng)) {
          focusLocation(lat, lng, zoom);
        }
      });
    });
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
    } else if (tabId === "my-items") {
      this.renderMyItems();
    } else if (tabId === "requests") {
      this.renderRequests();
    }
  }

  async loadData() {
    this.allItems = await api.getItems();
    this.applyFilters();
    this.updateBadges();
    this.setupDrawer();
    if (this.currentTab === "my-items") this.renderMyItems();
    if (this.currentTab === "requests") this.renderRequests();
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
      transit_station: specificAddress || `Thư viện / Phòng Đoàn Đội - ${user.school || 'Trường THCS Ái Quốc'}`,
      contact: {
        user_id: user.uid || "anonymous",
        author_name: user.displayName,
        author_avatar: user.photoURL || "",
        student_class: user.studentClass || "",
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
      district: form["profile-district"].value.trim() || "Ái Quốc",
      city: "Hải Phòng",
      address: form["profile-address"].value.trim(),
      authorName: form["profile-student-name"].value.trim(),
      studentClass: studentClassStr,
      grade: parsedGrade,
      phone: form["profile-phone"] ? form["profile-phone"].value.trim() : "Bảo mật",
      zalo: "",
      transitStation: form["profile-station"] ? form["profile-station"].value.trim() : "Thư viện / Phòng Đoàn Đội trường"
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

  // =========================================================================
  // ĐỒ DÙNG CỦA TÔI (THEO YÊU CẦU CỦA KHÁCH HÀNG)
  // =========================================================================
  async renderMyItems(filterType = "ALL") {
    const user = authManager.getUser();
    if (!user) return;

    const myItems = await api.getUserItems(user);
    const allReqs = api.getItemRequests();

    // Cập nhật thống kê
    const totalCount = myItems.length;
    const availableCount = myItems.filter(i => i.status === "AVAILABLE").length;
    const transitCount = myItems.filter(i => i.status === "IN_TRANSIT").length;
    
    // Đếm các yêu cầu đang chờ duyệt đối với đồ dùng của tôi
    const myItemIds = new Set(myItems.map(i => i.id));
    const pendingReqsCount = allReqs.filter(r => 
      (r.giver_id === user.uid || myItemIds.has(r.item_id) || (user.uid === 'user-giver-minhchau' && r.item_id === 'item-hp-aq-01')) &&
      r.status === "PENDING"
    ).length;

    const elTotal = document.getElementById("my-items-total-count");
    const elAvail = document.getElementById("my-items-available-count");
    const elPending = document.getElementById("my-items-pending-requests-count");
    const elTransit = document.getElementById("my-items-transit-count");

    if (elTotal) elTotal.textContent = totalCount;
    if (elAvail) elAvail.textContent = availableCount;
    if (elPending) elPending.textContent = pendingReqsCount;
    if (elTransit) elTransit.textContent = transitCount;

    // Lọc danh sách đồ dùng
    let filtered = [...myItems];
    if (filterType === "GIVE") filtered = filtered.filter(i => i.type === "GIVE");
    if (filterType === "RECEIVE") filtered = filtered.filter(i => i.type === "RECEIVE");
    if (filterType === "IN_TRANSIT") filtered = filtered.filter(i => i.status === "IN_TRANSIT");

    const grid = document.getElementById("my-items-grid");
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 8px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">📦</div>
          <h4 style="font-size: 1.1rem; color: #1E293B; margin-bottom: 6px;">Chưa có đồ dùng nào trong mục này</h4>
          <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 18px;">Bạn có thể đăng tặng sách giáo khoa cũ, đồng phục hoặc đồ dùng học tập để san sẻ cùng các bạn học sinh trong trường.</p>
          <button type="button" class="btn btn-primary" onclick="window.reschoolApp?.openCreateModal()">
            Đăng tặng đồ ngay
          </button>
        </div>
      `;
      return;
    }

    renderItemGrid(filtered, grid, (item) => {
      openItemDetailModal(item, this.itemDetailModal, () => this.loadData());
    });
  }

  // =========================================================================
  // QUẢN LÝ YÊU CẦU CHO / NHẬN ĐỒ (THEO ĐÚNG MOCKUP & BUTTONS KHÁCH HÀNG GỬI)
  // =========================================================================
  renderRequests() {
    const user = authManager.getUser();
    if (!user) return;

    const allReqs = api.getItemRequests();

    // Yêu cầu nhận được: Các bạn khác xin đồ của mình (mình là người cho)
    const received = allReqs.filter(r => 
      r.giver_id === user.uid || 
      (user.uid === 'user-giver-minhchau' && (r.giver_name === 'Nguyễn Minh Châu' || r.item_id === 'item-hp-aq-01')) ||
      (user.role === 'GIVER')
    );

    // Yêu cầu đã gửi: Mình đi xin đồ của bạn khác
    const sent = allReqs.filter(r => 
      r.requester_id === user.uid || 
      (user.uid === 'user-receiver-an' && (r.requester_name === 'Trần Minh An' || r.requester_id === 'user-receiver-an')) ||
      (user.role === 'RECEIVER')
    );

    // Render danh sách Yêu cầu nhận được
    const receivedContainer = document.getElementById("received-requests-list");
    if (receivedContainer) {
      if (received.length === 0) {
        receivedContainer.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 40px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 8px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">💬</div>
            <h4 style="font-size: 1rem; color: #1E293B; margin-bottom: 4px;">Hiện chưa có yêu cầu nào gửi tới bạn</h4>
            <p style="font-size: 0.82rem; color: #64748B;">Khi có bạn học sinh bấm xin nhận đồ dùng bạn đã đăng, yêu cầu sẽ xuất hiện tại đây để bạn xác nhận Chấp nhận hoặc Từ chối.</p>
          </div>
        `;
      } else {
        receivedContainer.innerHTML = received.map(req => {
          const isPending = req.status === "PENDING";
          const isAccepted = req.status === "ACCEPTED";
          const isRejected = req.status === "REJECTED";

          return `
            <div class="request-card" id="card-${req.id}">
              <img src="${req.item_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}" alt="${req.item_title}" class="request-thumb" />
              
              <div class="request-info">
                <div class="request-item-title">${req.item_title}</div>
                <div class="request-meta-row">
                  <div class="requester-profile">
                    <img src="${req.requester_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}" alt="${req.requester_name}" class="requester-avatar" />
                    <span>Học sinh xin: <strong>${req.requester_name}</strong> (${req.requester_class || 'Lớp 7A1'} · ${req.requester_school || 'THCS Ái Quốc'})</span>
                  </div>
                  <span>&bull;</span>
                  <span class="request-time">${new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                
                ${req.requester_note ? `
                  <div class="request-note-box">
                    "${req.requester_note}"
                  </div>
                ` : ''}

                <div class="request-station-tag">
                  🏛️ Trạm bàn giao: ${req.transit_station || 'Thư viện / Phòng Đoàn Đội trường'}
                </div>
              </div>

              <!-- CỘT TRẠNG THÁI & 2 NÚT HÀNH ĐỘNG (CHUẨN THEO ẢNH KHÁCH HÀNG GỬI) -->
              <div class="request-actions-col">
                ${isPending ? `
                  <span class="badge-status-pending">
                    <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Đang chờ</span>
                  </span>
                  <div class="request-dual-buttons">
                    <button type="button" class="btn-action-accept" data-accept-id="${req.id}">
                      <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Chấp nhận</span>
                    </button>
                    <button type="button" class="btn-action-reject" data-reject-id="${req.id}">
                      <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span>Từ chối</span>
                    </button>
                  </div>
                ` : isAccepted ? `
                  <span class="badge-status-accepted">
                    <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Đã chấp nhận</span>
                  </span>
                  <span class="request-transit-code-pill">Mã luân chuyển: <strong>${req.transit_code || 'SGK-01'}</strong></span>
                  <button type="button" class="btn btn-sm btn-outline btn-view-request-ticket" data-req-id="${req.id}">
                    Xem phiếu Trạm
                  </button>
                ` : `
                  <span class="badge-status-rejected">
                    <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span>Đã từ chối</span>
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('');

        // Gắn sự kiện cho nút Chấp nhận
        receivedContainer.querySelectorAll("[data-accept-id]").forEach(btn => {
          btn.onclick = async () => {
            const reqId = btn.getAttribute("data-accept-id");
            btn.disabled = true;
            btn.textContent = "Đang duyệt...";
            await api.updateRequestStatus(reqId, "ACCEPTED");
            this.showToast("Đã chấp nhận yêu cầu! Đã cấp Mã luân chuyển qua Thư viện trường.");
            await this.loadData();
          };
        });

        // Gắn sự kiện cho nút Từ chối
        receivedContainer.querySelectorAll("[data-reject-id]").forEach(btn => {
          btn.onclick = async () => {
            const reqId = btn.getAttribute("data-reject-id");
            if (confirm("Bạn có chắc chắn muốn từ chối yêu cầu xin món đồ này?")) {
              btn.disabled = true;
              btn.textContent = "Đang xử lý...";
              await api.updateRequestStatus(reqId, "REJECTED");
              this.showToast("Đã từ chối yêu cầu. Món đồ đã mở lại cho các bạn học sinh khác.");
              await this.loadData();
            }
          };
        });

        // Gắn sự kiện cho nút Xem phiếu Trạm
        receivedContainer.querySelectorAll(".btn-view-request-ticket").forEach(btn => {
          btn.onclick = () => {
            const reqId = btn.getAttribute("data-req-id");
            const req = received.find(r => r.id === reqId);
            if (req) {
              const item = this.allItems.find(i => i.id === req.item_id) || {
                title: req.item_title,
                transit_station: req.transit_station
              };
              openTransitTicketModal(item, req.transit_code || "SGK-01", "GIVER");
            }
          };
        });
      }
    }

    // Render danh sách Yêu cầu đã gửi
    const sentContainer = document.getElementById("sent-requests-list");
    if (sentContainer) {
      if (sent.length === 0) {
        sentContainer.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 40px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 8px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">📤</div>
            <h4 style="font-size: 1rem; color: #1E293B; margin-bottom: 4px;">Bạn chưa gửi yêu cầu xin đồ nào</h4>
            <p style="font-size: 0.82rem; color: #64748B;">Hãy vào mục "Khám phá" để tìm SGK, đồng phục hoặc đồ dùng bạn cần và bấm "Gửi yêu cầu nhận đồ qua Trạm".</p>
            <button type="button" class="btn btn-primary" style="margin-top: 12px;" onclick="window.reschoolApp?.switchTab('explore')">
              Khám phá đồ dùng ngay
            </button>
          </div>
        `;
      } else {
        sentContainer.innerHTML = sent.map(req => {
          const isPending = req.status === "PENDING";
          const isAccepted = req.status === "ACCEPTED";

          return `
            <div class="request-card">
              <img src="${req.item_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}" alt="${req.item_title}" class="request-thumb" />
              
              <div class="request-info">
                <div class="request-item-title">${req.item_title}</div>
                <div class="request-meta-row">
                  <span>Người cho: <strong>${req.giver_name || 'Bạn học sinh'}</strong> (${req.giver_class ? 'Lớp ' + req.giver_class : 'THCS Ái Quốc'})</span>
                  <span>&bull;</span>
                  <span>Ngày gửi: ${new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="request-station-tag">
                  🏛️ Trạm nhận đồ: ${req.transit_station || 'Thư viện / Phòng Đoàn Đội trường'}
                </div>
              </div>

              <div class="request-actions-col">
                ${isPending ? `
                  <span class="badge-status-pending">
                    <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Đang chờ duyệt</span>
                  </span>
                  <span style="font-size: 0.76rem; color: #64748B; text-align: right;">Đang đợi bạn ${req.giver_name} xác nhận</span>
                ` : isAccepted ? `
                  <span class="badge-status-accepted">
                    <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Đã được chấp nhận</span>
                  </span>
                  <span class="request-transit-code-pill">Mã nhận: <strong>${req.transit_code || 'SGK-01'}</strong></span>
                  <button type="button" class="btn btn-sm btn-primary btn-view-my-sent-ticket" data-sent-id="${req.id}">
                    Xem phiếu nhận đồ
                  </button>
                ` : `
                  <span class="badge-status-rejected">❌ Đã bị từ chối</span>
                `}
              </div>
            </div>
          `;
        }).join('');

        sentContainer.querySelectorAll(".btn-view-my-sent-ticket").forEach(btn => {
          btn.onclick = () => {
            const reqId = btn.getAttribute("data-sent-id");
            const req = sent.find(r => r.id === reqId);
            if (req) {
              const item = this.allItems.find(i => i.id === req.item_id) || {
                title: req.item_title,
                transit_station: req.transit_station
              };
              openTransitTicketModal(item, req.transit_code || "SGK-01", "RECEIVER");
            }
          };
        });
      }
    }
  }

  // =========================================================================
  // CẬP NHẬT BADGES & THÔNG BÁO TỔNG THỂ
  // =========================================================================
  updateBadges() {
    const user = authManager.getUser();
    if (!user) return;

    const allReqs = api.getItemRequests();
    const myItems = api.getLocalItems();
    const myItemIds = new Set(myItems.filter(i => 
      (i.user_id && i.user_id === user.uid) ||
      (i.contact && (i.contact.user_id === user.uid || i.contact.author_name === user.displayName)) ||
      (user.uid === 'user-giver-minhchau' && i.id === 'item-hp-aq-01')
    ).map(i => i.id));

    // Đếm yêu cầu nhận được đang ở trạng thái PENDING
    const pendingReceived = allReqs.filter(r => 
      (r.giver_id === user.uid || myItemIds.has(r.item_id) || (user.uid === 'user-giver-minhchau' && (r.giver_name === 'Nguyễn Minh Châu' || r.item_id === 'item-hp-aq-01'))) &&
      r.status === "PENDING"
    ).length;

    const mySentCount = allReqs.filter(r => 
      r.requester_id === user.uid || 
      (user.uid === 'user-receiver-an' && r.requester_name === 'Trần Minh An')
    ).length;

    // Cập nhật số badge trên Header & Mobile
    const headerReqBadge = document.getElementById("header-requests-badge");
    const mobileReqBadge = document.getElementById("mobile-requests-badge");
    const drawerReqBadge = document.getElementById("drawer-requests-count");
    const subtabRecBadge = document.getElementById("badge-received-requests-count");
    const subtabSentBadge = document.getElementById("badge-sent-requests-count");
    const drawerItemsBadge = document.getElementById("drawer-my-items-count");

    if (headerReqBadge) {
      headerReqBadge.textContent = pendingReceived;
      headerReqBadge.style.display = pendingReceived > 0 ? "inline-block" : "none";
    }
    if (mobileReqBadge) {
      mobileReqBadge.textContent = pendingReceived;
      mobileReqBadge.style.display = pendingReceived > 0 ? "inline-block" : "none";
    }
    if (drawerReqBadge) {
      drawerReqBadge.textContent = pendingReceived;
    }
    if (subtabRecBadge) subtabRecBadge.textContent = pendingReceived;
    if (subtabSentBadge) subtabSentBadge.textContent = mySentCount;
    if (drawerItemsBadge) drawerItemsBadge.textContent = myItemIds.size;
  }

  // =========================================================================
  // SETUP SIDEBAR DRAWER MENU (CHUẨN THEO ẢNH KHÁCH HÀNG GỬI)
  // =========================================================================
  setupDrawer() {
    const user = authManager.getUser();
    if (!user) return;

    const drawer = document.getElementById("reschool-sidebar-drawer");
    if (!drawer) return;

    // Cập nhật thông tin profile trong drawer
    const avatarEl = document.getElementById("drawer-user-avatar");
    const nameEl = document.getElementById("drawer-user-name");
    const schoolEl = document.getElementById("drawer-user-school");
    const roleEl = document.getElementById("drawer-user-role");

    if (avatarEl) avatarEl.src = user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
    if (nameEl) nameEl.textContent = user.displayName || "Học sinh";
    if (schoolEl) schoolEl.textContent = `${user.school || 'Trường THCS Ái Quốc'} · ${user.studentClass || 'Học sinh'}`;
    if (roleEl) roleEl.textContent = user.role === "GIVER" ? "Người cho" : (user.role === "RECEIVER" ? "Người xin" : "Học sinh");

    // Đóng drawer
    const closeBtn = document.getElementById("btn-close-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    const closeDrawer = () => drawer.classList.remove("active");

    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (backdrop) backdrop.onclick = closeDrawer;

    // Mở drawer từ Header icon hoặc Mobile Menu
    const openBtn = document.getElementById("btn-open-drawer");
    const openMobileBtn = document.getElementById("btn-mobile-open-menu");
    const openDrawer = () => drawer.classList.add("active");

    if (openBtn) openBtn.onclick = openDrawer;
    if (openMobileBtn) openMobileBtn.onclick = openDrawer;

    // Đổi vai trò test nhanh trong drawer (1-Click switch)
    drawer.querySelectorAll("[data-switch-role]").forEach(btn => {
      btn.onclick = async () => {
        const role = btn.getAttribute("data-switch-role");
        const newUser = authManager.loginWithDemoRole(role);
        if (newUser) {
          closeDrawer();
          this.showToast(`Đã chuyển sang vai trò: ${newUser.displayName} (${newUser.roleTitle || newUser.studentClass})`);
          await this.loadData();
          if (role === "giver") this.switchTab("requests");
          if (role === "receiver") this.switchTab("explore");
        }
      };
    });

    // Các mục menu trong Drawer
    const menuPost = document.getElementById("drawer-menu-post");
    if (menuPost) {
      menuPost.onclick = () => {
        closeDrawer();
        this.openCreateModal();
      };
    }

    const menuMyItems = document.getElementById("drawer-menu-my-items");
    if (menuMyItems) {
      menuMyItems.onclick = () => {
        closeDrawer();
        this.switchTab("my-items");
      };
    }

    const menuRequests = document.getElementById("drawer-menu-requests");
    if (menuRequests) {
      menuRequests.onclick = () => {
        closeDrawer();
        this.switchTab("requests");
      };
    }

    const menuNotifs = document.getElementById("drawer-menu-notifications");
    if (menuNotifs) {
      menuNotifs.onclick = () => {
        closeDrawer();
        this.openNotificationsModal();
      };
    }

    const menuStats = document.getElementById("drawer-menu-stats");
    if (menuStats) {
      menuStats.onclick = () => {
        closeDrawer();
        this.switchTab("stats");
      };
    }

    const menuSettings = document.getElementById("drawer-menu-settings");
    if (menuSettings) {
      menuSettings.onclick = () => {
        closeDrawer();
        this.openProfileModal();
      };
    }

    const btnLogout = document.getElementById("btn-drawer-logout");
    if (btnLogout) {
      btnLogout.onclick = () => {
        authManager.logout();
        window.location.replace("login.html");
      };
    }

    // Nút chuông thông báo trên Header
    const headerNotifsBtn = document.getElementById("btn-header-notifs");
    if (headerNotifsBtn) {
      headerNotifsBtn.onclick = () => this.openNotificationsModal();
    }

    // Nút đăng thêm đồ dùng trong trang Đồ dùng của tôi
    const myItemsCreateBtn = document.getElementById("btn-my-items-create");
    if (myItemsCreateBtn) {
      myItemsCreateBtn.onclick = () => this.openCreateModal();
    }

    // Bộ lọc Đồ dùng của tôi
    document.querySelectorAll(".my-items-filter-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".my-items-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.getAttribute("data-my-filter");
        this.renderMyItems(filter);
      };
    });

    // Subtabs Yêu cầu: Yêu cầu nhận được vs Yêu cầu đã gửi
    document.querySelectorAll(".requests-nav-tab").forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll(".requests-nav-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".requests-subtab-content").forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        const subtab = tab.getAttribute("data-requests-subtab");
        const targetContent = document.getElementById(`subtab-${subtab}-container`);
        if (targetContent) targetContent.classList.add("active");
      };
    });
  }

  // =========================================================================
  // MODAL THÔNG BÁO HỌC ĐƯỜNG
  // =========================================================================
  openNotificationsModal() {
    const modal = document.getElementById("notifications-modal");
    if (!modal) return;

    const user = authManager.getUser();
    const notifs = api.getNotifications(user ? user.uid : null);
    const container = document.getElementById("notifications-list-container");

    if (container) {
      if (notifs.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748B; padding: 20px;">Không có thông báo mới.</p>`;
      } else {
        container.innerHTML = notifs.map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}" onclick="window.reschoolApp?.handleNotificationClick('${n.id}', '${n.target}')">
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${new Date(n.created_at).toLocaleString('vi-VN')}</div>
          </div>
        `).join('');
      }
    }

    modal.classList.add("active");
    const closeBtn = modal.querySelector(".modal-close-btn");
    const backdrop = modal.querySelector(".modal-backdrop");
    const closeModal = () => modal.classList.remove("active");
    if (closeBtn) closeBtn.onclick = closeModal;
    if (backdrop) backdrop.onclick = closeModal;
  }

  handleNotificationClick(notifId, target) {
    api.markNotificationAsRead(notifId);
    const modal = document.getElementById("notifications-modal");
    if (modal) modal.classList.remove("active");
    if (target) this.switchTab(target);
  }
}

// Khởi chạy khi DOM load xong
document.addEventListener("DOMContentLoaded", () => {
  window.reschoolApp = new ReschoolApp();
});
