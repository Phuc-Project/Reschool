/**
 * Reschool Smart Matchmaking View
 * Hiển thị các cặp đôi người cho & người nhận được thuật toán kết nối tự động.
 */

export function renderMatchmakingList(matches, containerElement, onViewDetail) {
  if (!containerElement) return;

  if (!matches || matches.length === 0) {
    containerElement.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤝</div>
        <h3>Chưa có cặp ghép nào phù hợp</h3>
        <p>Hệ thống đang tiếp tục phân tích các bài đăng mới. Hãy là người đầu tiên đăng tin để mở rộng mạng lưới!</p>
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
            <span class="match-pulse"></span>
            <strong>${match.match_score}% Tương thích</strong>
          </div>
          <div class="match-distance-badge">
            📍 Cách nhau ~${match.distance_km} km
          </div>
        </div>

        <div class="match-reasons-list">
          ${match.match_reasons.map(r => `<span class="reason-chip">✓ ${r}</span>`).join('')}
        </div>

        <div class="match-duo-grid">
          <!-- Cột Người Cho -->
          <div class="duo-side duo-giver">
            <div class="duo-role-badge giver">
              <span>🎁 BÊN CHO TẶNG</span>
            </div>
            <div class="duo-item-preview">
              <img src="${giver.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}" alt="${giver.title}" />
              <div class="duo-info">
                <h4>${giver.title}</h4>
                <p class="duo-school">🏫 ${giver.location.school_name}</p>
                <p class="duo-author">👤 ${giver.contact.author_name} (${giver.contact.student_class || 'Học sinh'})</p>
              </div>
            </div>
          </div>

          <!-- Biểu tượng liên kết -->
          <div class="duo-connector">
            <div class="connector-line"></div>
            <div class="connector-icon">⇄</div>
            <div class="connector-line"></div>
          </div>

          <!-- Cột Người Nhận -->
          <div class="duo-side duo-receiver">
            <div class="duo-role-badge receiver">
              <span>🔍 BÊN CẦN XIN</span>
            </div>
            <div class="duo-item-preview">
              <img src="${receiver.images[0] || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200'}" alt="${receiver.title}" />
              <div class="duo-info">
                <h4>${receiver.title}</h4>
                <p class="duo-school">🏫 ${receiver.location.school_name}</p>
                <p class="duo-author">👤 ${receiver.contact.author_name} (${receiver.contact.student_class || 'Học sinh'})</p>
              </div>
            </div>
          </div>
        </div>

        <div class="match-card-actions">
          <a href="https://zalo.me/${giver.contact.zalo || giver.contact.phone}" target="_blank" rel="noopener noreferrer" class="btn btn-zalo">
            💬 Kết nối Zalo với bạn ${giver.contact.author_name}
          </a>
          <button class="btn btn-outline btn-view-duo" data-giver-id="${giver.id}" data-receiver-id="${receiver.id}">
            Xem chi tiết 2 bài đăng
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
