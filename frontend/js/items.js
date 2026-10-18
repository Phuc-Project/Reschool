/**
 * Reschool Items & UI Feed Module
 * Xử lý hiển thị danh sách vật phẩm, lọc danh mục, mở modal chi tiết và quản lý trạng thái bài đăng.
 */
import { api } from './api.js';
import { CATEGORY_LABELS } from './mock-data.js';

export function renderItemGrid(items, containerElement, onCardClick) {
  if (!containerElement) return;

  if (!items || items.length === 0) {
    containerElement.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-circle">
          <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <h3>Không tìm thấy đồ dùng phù hợp</h3>
        <p>Hãy thử tìm từ khóa khác hoặc bấm nút "Đăng tin" để chia sẻ đồ dùng bạn có!</p>
      </div>
    `;
    return;
  }

  const html = items.map(item => {
    const isGive = item.type === "GIVE";
    const typeLabel = isGive ? "Cho tặng (0đ)" : "Cần hỗ trợ";
    const typeClass = isGive ? "badge-give" : "badge-receive";
    const categoryName = CATEGORY_LABELS[item.category] || item.category;
    const isCompleted = item.status === "COMPLETED";

    return `
      <div class="item-card ${isCompleted ? 'item-completed' : ''}" data-id="${item.id}">
        <div class="item-card-image-box">
          <img src="${(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}" alt="${item.title}" loading="lazy" />
          <div class="card-badges-top">
            <span class="badge ${typeClass}">${typeLabel}</span>
            <span class="badge badge-category">${categoryName}</span>
            ${isCompleted ? `<span class="badge badge-completed">Đã hoàn tất</span>` : ''}
          </div>
          ${item.grade ? `<span class="badge-grade">Lớp ${item.grade}</span>` : ''}
        </div>

        <div class="item-card-body">
          <div class="item-school-meta">
            <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l7-4 7 4v14"></path>
              <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
              <path d="M10 21V14h4v7"></path>
            </svg>
            <span class="school-name" title="${item.location?.school_name || ''}">${item.location?.school_name || 'Học sinh Hà Nội'}</span>
          </div>
          <h3 class="item-card-title">${item.title}</h3>
          
          <div class="item-condition-row">
            <span class="condition-dot"></span>
            <span class="condition-text">${item.condition}</span>
            <span class="card-view-count">👁️ ${item.view_count || 1}</span>
          </div>

          <div class="item-card-footer">
            <div class="author-info">
              <div class="author-avatar-circle">
                ${item.contact?.author_avatar ? `
                  <img src="${item.contact.author_avatar}" alt="${item.contact.author_name}" class="author-avatar-img" />
                ` : `
                  <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                `}
              </div>
              <span class="author-name">${item.contact?.author_name || 'Ẩn danh'}</span>
            </div>
            <button class="btn btn-sm btn-primary-soft btn-view-item" data-id="${item.id}">
              <span>Chi tiết</span>
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  containerElement.innerHTML = html;

  // Gắn sự kiện click vào từng card
  containerElement.querySelectorAll(".item-card").forEach(card => {
    card.addEventListener("click", () => {
      const itemId = card.getAttribute("data-id");
      const clickedItem = items.find(i => i.id === itemId);
      if (clickedItem && onCardClick) {
        onCardClick(clickedItem);
      }
    });
  });
}

// Hiển thị modal chi tiết vật phẩm
export function openItemDetailModal(item, modalElement, onDataChange) {
  if (!modalElement || !item) return;

  // Kiểm tra quyền đăng nhập bắt buộc trước khi mở chi tiết đồ dùng
  let currentUser = null;
  try {
    const raw = localStorage.getItem("reschool_auth_user");
    if (raw) currentUser = JSON.parse(raw);
  } catch {
    currentUser = null;
  }

  if (!currentUser) {
    const authModal = document.getElementById("auth-modal");
    if (authModal) authModal.classList.add("active");
    return;
  }

  // Tăng lượt xem & cập nhật Database
  api.incrementViewCount(item.id);
  item.view_count = (item.view_count || 0) + 1;

  const isGive = item.type === "GIVE";
  const typeLabel = isGive ? "Cho tặng miễn phí (0đ)" : "Đang cần hỗ trợ";
  const typeClass = isGive ? "badge-give" : "badge-receive";
  const categoryName = CATEGORY_LABELS[item.category] || item.category;
  const isCompleted = item.status === "COMPLETED";

  const isOwner = Boolean(
    currentUser && (
      (item.user_id && item.user_id === currentUser.uid) ||
      (item.contact?.user_id && item.contact.user_id === currentUser.uid) ||
      (currentUser.phone && item.contact?.phone && currentUser.phone === item.contact.phone)
    )
  );

  const formattedDate = item.created_at 
    ? new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : "Vừa xong";

  modalElement.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <button class="modal-close-btn" aria-label="Đóng">
          <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="item-modal-layout">
          <!-- Cột ảnh -->
          <div class="item-modal-gallery">
            <div class="main-image-wrapper">
              <img src="${(item.images && item.images[0]) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}" alt="${item.title}" />
            </div>
            <div class="item-badges-stack">
              <span class="badge ${typeClass}">${typeLabel}</span>
              <span class="badge badge-category">${categoryName}</span>
              ${item.grade ? `<span class="badge badge-neutral">Khối Lớp ${item.grade}</span>` : ''}
              ${isCompleted ? `<span class="badge badge-completed">Đã hoàn thành</span>` : ''}
            </div>
          </div>

          <!-- Cột thông tin chi tiết -->
          <div class="item-modal-details">
            <div class="modal-school-header">
              <svg class="icon icon-sm text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M5 21V7l7-4 7 4v14"></path>
                <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                <path d="M10 21V14h4v7"></path>
              </svg>
              <span class="school-pill">${item.location?.school_name || 'Trường học'} &bull; ${item.location?.district || 'Hà Nội'}${item.location?.city ? ', ' + item.location.city : ''}</span>
            </div>
            <h2 class="modal-item-title">${item.title}</h2>

            <!-- Metadata lưu trữ trong Database: Lượt xem, Ngày đăng -->
            <div class="item-database-meta">
              <span class="meta-tag">
                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>${item.view_count} lượt xem</span>
              </span>
              <span class="meta-dot">&bull;</span>
              <span class="meta-tag">
                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Ngày đăng: ${formattedDate}</span>
              </span>
              ${item.location?.address_detail ? `
                <span class="meta-dot">&bull;</span>
                <span class="meta-tag meta-location">
                  <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>${item.location.address_detail}</span>
                </span>
              ` : ''}
            </div>

            <div class="condition-highlight-card">
              <span class="condition-highlight-label">Tình trạng thực tế:</span>
              <p>${item.condition}</p>
            </div>

            <div class="modal-description-box">
              <h4>Mô tả từ học sinh:</h4>
              <p>${item.description}</p>
            </div>

            ${item.tags && item.tags.length ? `
              <div class="modal-tags-list">
                ${item.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
              </div>
            ` : ''}

            <!-- Khung thao tác cho Người Đăng Bài (Lưu cập nhật vào Database) -->
            ${isOwner ? `
              <div class="owner-actions-box">
                <div class="owner-actions-header">
                  <span class="owner-chip">Bài đăng của bạn</span>
                  <span class="owner-status-text">Trạng thái: <strong>${isCompleted ? 'Đã trao nhận xong' : 'Đang mở (0đ)'}</strong></span>
                </div>
                <div class="owner-actions-buttons">
                  <button type="button" id="btn-toggle-item-status" class="btn btn-sm btn-outline">
                    ${isCompleted ? 'Mở lại bài đăng' : 'Đánh dấu đã hoàn thành'}
                  </button>
                  <button type="button" id="btn-delete-item-post" class="btn btn-sm btn-danger-soft">
                    Xóa bài đăng
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Trạm luân chuyển học đường & Hành động an toàn (Ý kiến khách hàng) -->
            <div class="transit-station-card">
              <div class="transit-station-badge">
                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>MÔ HÌNH TRẠM LUÂN CHUYỂN (BẢO VỆ HỌC SINH THCS)</span>
              </div>

              <div class="transit-station-content">
                <div class="station-icon-box">🏛️</div>
                <div class="station-text-box">
                  <div class="station-title">${item.transit_station || ('Thư viện / Phòng Đoàn Đội - ' + (item.location?.school_name || 'Trường THCS Ái Quốc'))}</div>
                  <div class="station-desc">Tuyệt đối không để lộ SĐT cá nhân. Học sinh hai bên sẽ gửi và nhận đồ an toàn thông qua Trạm luân chuyển tại trường.</div>
                </div>
              </div>

              <div class="transit-author-brief">
                <div class="author-brief-avatar">
                  ${item.contact?.author_avatar ? `
                    <img src="${item.contact.author_avatar}" alt="${item.contact.author_name}" />
                  ` : `
                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  `}
                </div>
                <div class="author-brief-text">
                  <span>Học sinh đăng bài: <strong>${item.contact?.author_name || 'Học sinh'}</strong> (${item.contact?.student_class ? 'Lớp ' + item.contact.student_class : 'Đã xác minh'})</span>
                  <span class="privacy-note">🔒 Tuyệt đối bảo mật thông tin cá nhân & Số điện thoại</span>
                </div>
              </div>

              <!-- Nút hành động duy nhất thay thế SĐT và Zalo theo yêu cầu khách -->
              <div class="transit-action-container">
                ${isCompleted ? `
                  <button type="button" class="btn btn-block btn-secondary" disabled>
                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Vật phẩm này đã hoàn tất luân chuyển</span>
                  </button>
                ` : item.status === 'IN_TRANSIT' ? `
                  <button type="button" id="btn-view-transit-code" class="btn btn-block btn-warning-soft">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Đang luân chuyển qua Trạm • Bấm xem ${item.transit_code || 'Mã SGK-01'}</span>
                  </button>
                ` : isGive ? `
                  <button type="button" id="btn-transit-action" class="btn btn-block btn-primary btn-transit-register">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Đăng kí nhận đồ</span>
                  </button>
                ` : `
                  <button type="button" id="btn-transit-action" class="btn btn-block btn-primary btn-transit-give">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                    <span>Tặng cho bạn</span>
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modalElement.classList.add("active");

  const closeBtn = modalElement.querySelector(".modal-close-btn");
  const backdrop = modalElement.querySelector(".modal-backdrop");
  const closeModal = () => modalElement.classList.remove("active");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  // Gắn sự kiện cho nút Đăng ký nhận đồ / Tặng cho bạn (Mô hình Trạm Luân Chuyển)
  const transitActionBtn = modalElement.querySelector("#btn-transit-action");
  if (transitActionBtn) {
    transitActionBtn.addEventListener("click", async () => {
      // 1. Kiểm tra đăng nhập
      if (!currentUser) {
        closeModal();
        const authModal = document.getElementById("auth-modal");
        if (authModal) authModal.classList.add("active");
        return;
      }

      // 2. Sinh mã luân chuyển chuẩn theo định dạng khách yêu cầu (Ví dụ: Mã SGK-01)
      const prefix = item.category === "TEXTBOOK" ? "Mã SGK" : (item.category === "UNIFORM" ? "Mã DP" : "Mã LC");
      const randomNum = Math.floor(10 + Math.random() * 89);
      const generatedCode = `${prefix}-${randomNum}`;

      // 3. Cập nhật trạng thái vật phẩm
      item.transit_code = generatedCode;
      item.status = "IN_TRANSIT";
      item.transit_receiver = currentUser.displayName || "Học sinh";
      item.transit_at = new Date().toISOString();

      // Lưu vé luân chuyển vào LocalStorage
      try {
        const savedTickets = JSON.parse(localStorage.getItem("reschool_transit_tickets") || "[]");
        savedTickets.unshift({
          code: generatedCode,
          item_id: item.id,
          item_title: item.title,
          category: item.category,
          type: item.type,
          station: item.transit_station || `Thư viện / Phòng Đoàn Đội - ${item.location?.school_name || 'Trường THCS Ái Quốc'}`,
          created_at: item.transit_at,
          user_id: currentUser.uid,
          user_name: currentUser.displayName
        });
        localStorage.setItem("reschool_transit_tickets", JSON.stringify(savedTickets));
      } catch (err) {
        console.warn("Lỗi lưu phiếu luân chuyển:", err);
      }

      // Lưu trạng thái vào Database qua API
      if (api.updateItemStatus) {
        await api.updateItemStatus(item.id, "IN_TRANSIT");
      }

      closeModal();
      if (onDataChange) onDataChange();

      // Mở Phiếu luân chuyển học đường
      openTransitTicketModal(item, generatedCode, isGive ? "RECEIVER" : "GIVER");
    });
  }

  // Nút xem lại mã luân chuyển đang hoạt động
  const viewCodeBtn = modalElement.querySelector("#btn-view-transit-code");
  if (viewCodeBtn) {
    viewCodeBtn.addEventListener("click", () => {
      closeModal();
      openTransitTicketModal(item, item.transit_code || "Mã SGK-01", isGive ? "RECEIVER" : "GIVER");
    });
  }

  // Gắn sự kiện cho Owner Actions
  if (isOwner) {
    const toggleBtn = modalElement.querySelector("#btn-toggle-item-status");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", async () => {
        const nextStatus = isCompleted ? "AVAILABLE" : "COMPLETED";
        await api.updateItemStatus(item.id, nextStatus);
        item.status = nextStatus;
        closeModal();
        if (onDataChange) onDataChange();
      });
    }

    const deleteBtn = modalElement.querySelector("#btn-delete-item-post");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Bạn có chắc chắn muốn xóa bài đăng này khỏi hệ thống?")) {
          await api.deleteItem(item.id);
          closeModal();
          if (onDataChange) onDataChange();
        }
      });
    }
  }
}

// Hàm mở Modal Phiếu Luân Chuyển Học Đường
export function openTransitTicketModal(item, code, role = "RECEIVER") {
  const modal = document.getElementById("transit-ticket-modal");
  if (!modal) return;

  const codeEl = modal.querySelector("#display-transit-code");
  const titleEl = modal.querySelector("#ticket-modal-title");
  const itemTitleEl = modal.querySelector("#ticket-item-title");
  const stationNameEl = modal.querySelector("#ticket-station-name");
  const copyBtn = modal.querySelector("#btn-copy-transit-code");
  const closeBtn = modal.querySelector(".btn-close-transit-modal");
  const modalCloseBtn = modal.querySelector(".modal-close-btn");
  const backdrop = modal.querySelector(".modal-backdrop");

  if (codeEl) codeEl.textContent = code;
  if (titleEl) {
    titleEl.textContent = role === "GIVER" 
      ? "Đã cấp Mã luân chuyển cho người tặng!" 
      : "Đăng ký nhận đồ thành công!";
  }
  if (itemTitleEl) itemTitleEl.textContent = item.title;
  if (stationNameEl) {
    stationNameEl.textContent = item.transit_station || `Thư viện / Phòng Đoàn Đội - ${item.location?.school_name || 'Trường THCS Ái Quốc'}`;
  }

  const closeModal = () => modal.classList.remove("active");
  if (closeBtn) closeBtn.onclick = closeModal;
  if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
  if (backdrop) backdrop.onclick = closeModal;

  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.innerHTML = `
          <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Đã sao chép!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Sao chép mã</span>
          `;
        }, 2000);
      });
    };
  }

  modal.classList.add("active");
}
