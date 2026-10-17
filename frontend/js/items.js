/**
 * Reschool Items & UI Feed Module
 * Xử lý hiển thị danh sách vật phẩm, lọc danh mục, mở modal chi tiết và đăng tin mới.
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

    return `
      <div class="item-card" data-id="${item.id}">
        <div class="item-card-image-box">
          <img src="${item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}" alt="${item.title}" loading="lazy" />
          <div class="card-badges-top">
            <span class="badge ${typeClass}">${typeLabel}</span>
            <span class="badge badge-category">${categoryName}</span>
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
            <span class="school-name" title="${item.location.school_name}">${item.location.school_name}</span>
          </div>
          <h3 class="item-card-title">${item.title}</h3>
          
          <div class="item-condition-row">
            <span class="condition-dot"></span>
            <span class="condition-text">${item.condition}</span>
          </div>

          <div class="item-card-footer">
            <div class="author-info">
              <div class="author-avatar-circle">
                <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span class="author-name">${item.contact.author_name}</span>
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
export function openItemDetailModal(item, modalElement) {
  if (!modalElement || !item) return;

  const isGive = item.type === "GIVE";
  const typeLabel = isGive ? "Cho tặng miễn phí (0đ)" : "Đang cần hỗ trợ";
  const typeClass = isGive ? "badge-give" : "badge-receive";
  const categoryName = CATEGORY_LABELS[item.category] || item.category;

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
              <img src="${item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}" alt="${item.title}" />
            </div>
            <div class="item-badges-stack">
              <span class="badge ${typeClass}">${typeLabel}</span>
              <span class="badge badge-category">${categoryName}</span>
              ${item.grade ? `<span class="badge badge-neutral">Khối Lớp ${item.grade}</span>` : ''}
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
              <span class="school-pill">${item.location.school_name} &bull; ${item.location.district}, ${item.location.city}</span>
            </div>
            <h2 class="modal-item-title">${item.title}</h2>

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

            <!-- Khung liên hệ học sinh -->
            <div class="contact-box">
              <div class="contact-header">
                <div class="contact-avatar-circle">
                  <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="contact-name-row">
                    <strong>${item.contact.author_name}</strong>
                    <span class="verified-tag">Đã xác minh</span>
                  </div>
                  <span class="class-label">${item.contact.student_class ? 'Lớp ' + item.contact.student_class : 'Học sinh'} • ${item.location.school_name}</span>
                </div>
              </div>

              <div class="contact-actions-grid">
                <a href="tel:${item.contact.phone.replace(/\s+/g, '')}" class="btn btn-outline btn-phone">
                  <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>Gọi điện: ${item.contact.phone}</span>
                </a>
                <a href="https://zalo.me/${(item.contact.zalo || item.contact.phone).replace(/\s+/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-zalo">
                  <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Nhắn tin qua Zalo</span>
                </a>
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
}
