/**
 * Reschool Matchmaking View
 * Hiển thị các cặp bài đăng tương thích giữa bạn học có đồ tặng và bạn học đang cần.
 */

export function renderMatchmakingList(matches, containerElement, onViewDetail) {
  if (!containerElement) return;

  if (!matches || matches.length === 0) {
    containerElement.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-circle">
          <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        </div>
        <h3>Chưa có cặp kết nối nào phù hợp</h3>
        <p>Hệ thống đang tiếp tục ghi nhận các bài đăng mới quanh khu vực của bạn. Hãy là người đầu tiên đăng tin để mở rộng mạng lưới!</p>
      </div>
    `;
    return;
  }

  const html = matches.map((match, index) => {
    const giver = match.giver_item;
    const receiver = match.receiver_item;

    return `
      <div class="match-card" data-index="${index}">
        <div class="match-card-header">
          <div class="match-score-pill">
            <span class="match-score-dot"></span>
            <strong>${match.match_score}% Tương thích</strong>
          </div>
          <div class="match-distance-badge">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Cách nhau ~${match.distance_km} km</span>
          </div>
        </div>

        <div class="match-reasons-list">
          ${match.match_reasons.map(r => `
            <span class="reason-chip">
              <svg class="icon icon-sm text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${r}</span>
            </span>
          `).join('')}
        </div>

        <div class="match-duo-grid">
          <!-- Cột Người Cho -->
          <div class="duo-side duo-giver">
            <div class="duo-role-badge giver">
              <span>Bên cho tặng</span>
            </div>
            <div class="duo-item-preview">
              <img src="${giver.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}" alt="${giver.title}" />
              <div class="duo-info">
                <h4>${giver.title}</h4>
                <p class="duo-school">
                  <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M5 21V7l7-4 7 4v14"></path>
                    <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M10 21V14h4v7"></path>
                  </svg>
                  <span>${giver.location.school_name}</span>
                </p>
                <p class="duo-author">
                  <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>${giver.contact.author_name} (${giver.contact.student_class || 'Học sinh'})</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Biểu tượng liên kết -->
          <div class="duo-connector">
            <div class="connector-line"></div>
            <div class="connector-icon-circle">
              <svg class="icon icon-sm text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
            </div>
            <div class="connector-line"></div>
          </div>

          <!-- Cột Người Nhận -->
          <div class="duo-side duo-receiver">
            <div class="duo-role-badge receiver">
              <span>Bên cần hỗ trợ</span>
            </div>
            <div class="duo-item-preview">
              <img src="${receiver.images[0] || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200'}" alt="${receiver.title}" />
              <div class="duo-info">
                <h4>${receiver.title}</h4>
                <p class="duo-school">
                  <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M5 21V7l7-4 7 4v14"></path>
                    <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M10 21V14h4v7"></path>
                  </svg>
                  <span>${receiver.location.school_name}</span>
                </p>
                <p class="duo-author">
                  <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>${receiver.contact.author_name} (${receiver.contact.student_class || 'Học sinh'})</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="match-card-actions">
          <a href="https://zalo.me/${(giver.contact.zalo || giver.contact.phone).replace(/\s+/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-zalo">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>Liên hệ trao đổi qua Zalo</span>
          </a>
          <button class="btn btn-outline btn-view-duo" data-giver-id="${giver.id}" data-receiver-id="${receiver.id}">
            <span>Xem chi tiết bài đăng</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  containerElement.innerHTML = html;

  // Gắn sự kiện click xem chi tiết
  containerElement.querySelectorAll(".btn-view-duo").forEach(btn => {
    btn.addEventListener("click", () => {
      const gId = btn.getAttribute("data-giver-id");
      if (onViewDetail) onViewDetail(gId);
    });
  });
}
