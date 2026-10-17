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
        <div class="empty-icon">📦</div>
        <h3>Không tìm thấy đồ dùng phù hợp</h3>
        <p>Hãy thử tìm từ khóa khác hoặc bấm "Đăng tin" để chia sẻ đồ dùng bạn có!</p>
      </div>
    `;
    return;
  }

  const html = items.map(item => {
    const isGive = item.type === "GIVE";
    const typeLabel = isGive ? "Cho tặng" : "Cần xin";
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
            <span class="school-icon">🏫</span>
            <span class="school-name" title="${item.location.school_name}">${item.location.school_name}</span>
          </div>
          <h3 class="item-card-title">${item.title}</h3>
          
          <div class="item-condition-row">
            <span class="condition-dot"></span>
            <span class="condition-text">${item.condition}</span>
          </div>

          <div class="item-card-footer">
            <div class="author-info">
              <span class="author-avatar">🧑‍🎓</span>
              <span class="author-name">${item.contact.author_name}</span>
            </div>
            <button class="btn btn-sm btn-primary-soft btn-view-item" data-id="${item.id}">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  containerElement.innerHTML = html;

  // Gắn sự kiện click vào từng card
  containerElement.querySelectorAll(".item-card").forEach(card => {
    card.addEventListener("click", (e) => {
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
  const typeLabel = isGive ? "Cho tặng miễn phí 0đ" : "Đang cần xin hỗ trợ";
  const typeClass = isGive ? "badge-give" : "badge-receive";
  const categoryName = CATEGORY_LABELS[item.category] || item.category;

  modalElement.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <button class="modal-close-btn" aria-label="Đóng">&times;</button>
        
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
              <span class="school-pill">🏫 ${item.location.school_name} - ${item.location.district}, ${item.location.city}</span>
            </div>
            <h2 class="modal-item-title">${item.title}</h2>

            <div class="condition-highlight-card">
              <strong>Tình trạng hiện tại:</strong>
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
                <div class="contact-avatar">🧑‍🎓</div>
                <div>
                  <strong>${item.contact.author_name}</strong>
                  <span class="class-label">${item.contact.student_class ? 'Lớp ' + item.contact.student_class : 'Học sinh'} • ${item.location.school_name}</span>
                </div>
              </div>

              <div class="contact-actions-grid">
                <a href="tel:${item.contact.phone.replace(/\s+/g, '')}" class="btn btn-outline btn-phone">
                  📞 Gọi điện: ${item.contact.phone}
                </a>
                <a href="https://zalo.me/${(item.contact.zalo || item.contact.phone).replace(/\s+/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-zalo">
                  💬 Nhắn tin qua Zalo
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
