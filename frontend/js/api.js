/**
 * Reschool API Client & Data Adapter
 * Tự động kết nối FastAPI Backend nếu đang chạy,
 * hoặc hoạt động hoàn toàn độc lập với LocalStorage & Mock Data.
 */
import { INITIAL_ITEMS_DATA } from './mock-data.js';

const DEFAULT_PROD_API = "https://reschool-backend.onrender.com/api/v1";
const BACKEND_BASE_URL = window.RESCHOOL_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:8000/api/v1" 
    : DEFAULT_PROD_API);

class ReschoolApi {
  constructor() {
    this.storageKey = "reschool_custom_items";
    this.backendAvailable = false;
    this.checkBackend();
  }

  async checkBackend() {
    const healthUrl = BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, "");
    try {
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.backendAvailable = true;
      }
    } catch {
      this.backendAvailable = false;
    }
  }

  // Lấy toàn bộ items
  async getItems(filters = {}) {
    if (this.backendAvailable) {
      try {
        const queryParams = new URLSearchParams();
        if (filters.keyword) queryParams.set("keyword", filters.keyword);
        if (filters.type) queryParams.set("type", filters.type);
        if (filters.category) queryParams.set("category", filters.category);
        if (filters.grade) queryParams.set("grade", filters.grade);
        
        const res = await fetch(`${BACKEND_BASE_URL}/items?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          return json.data || [];
        }
      } catch (err) {
        console.warn("Backend không phản hồi, dùng Local data:", err);
      }
    }

    // Fallback: LocalStorage + Mock Data
    return this.getLocalItems(filters);
  }

  getLocalItems(filters = {}) {
    let items = [...INITIAL_ITEMS_DATA];
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customItems = JSON.parse(stored);
        items = [...customItems, ...items];
      }
    } catch (e) {
      console.error("Lỗi đọc localStorage:", e);
    }

    // Lọc theo keyword
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase().trim();
      items = items.filter(i => 
        i.title.toLowerCase().includes(kw) ||
        i.description.toLowerCase().includes(kw) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(kw))) ||
        i.location.school_name.toLowerCase().includes(kw)
      );
    }

    // Lọc theo type (GIVE / RECEIVE)
    if (filters.type && filters.type !== "ALL") {
      items = items.filter(i => i.type === filters.type);
    }

    // Lọc theo category
    if (filters.category && filters.category !== "ALL") {
      items = items.filter(i => i.category === filters.category);
    }

    // Lọc theo grade
    if (filters.grade && filters.grade !== "ALL") {
      items = items.filter(i => String(i.grade) === String(filters.grade));
    }

    return items;
  }

  // Thêm mới một bài đăng
  async createItem(itemData) {
    if (this.backendAvailable) {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData)
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn("Không gửi được lên backend, lưu local:", err);
      }
    }

    // Tạo ID mới & lưu vào LocalStorage
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      view_count: 1,
      status: "AVAILABLE"
    };

    try {
      const stored = localStorage.getItem(this.storageKey);
      const customItems = stored ? JSON.parse(stored) : [];
      customItems.unshift(newItem);
      localStorage.setItem(this.storageKey, JSON.stringify(customItems));
    } catch (e) {
      console.error("Lỗi ghi localStorage:", e);
    }

    return newItem;
  }

  // Lấy danh sách gợi ý ghép cặp
  async getMatchSuggestions() {
    if (this.backendAvailable) {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/matchmaking/suggestions`);
        if (res.ok) {
          const json = await res.json();
          return json.data || [];
        }
      } catch (e) {
        console.warn("Lỗi lấy match từ backend:", e);
      }
    }

    // Fallback: Tự tính toán ghép cặp ở client
    return this.calculateLocalMatches();
  }

  calculateLocalMatches() {
    const items = this.getLocalItems();
    const givers = items.filter(i => i.type === "GIVE");
    const receivers = items.filter(i => i.type === "RECEIVE");
    const matches = [];

    for (const giver of givers) {
      for (const receiver of receivers) {
        if (giver.category !== receiver.category) continue;

        let score = 40;
        const reasons = [
          giver.category === "TEXTBOOK" ? "Cùng cần luân chuyển Sách giáo khoa" :
          giver.category === "UNIFORM" ? "Cùng nhu cầu Áo đồng phục học sinh" :
          giver.category === "STATIONERY" ? "Cùng nhu cầu Dụng cụ học tập" : "Cùng danh mục đồ dùng"
        ];

        // Khối lớp
        if (giver.grade && receiver.grade && giver.grade === receiver.grade) {
          score += 25;
          reasons.push(`Cùng khối Lớp ${giver.grade}`);
        }

        // Từ khóa
        const giverWords = giver.title.toLowerCase().split(/\s+/);
        const matchKeyword = giverWords.find(w => w.length > 3 && receiver.title.toLowerCase().includes(w));
        if (matchKeyword) {
          score += 20;
          reasons.push(`Trùng khớp môn học / đồ dùng: "${matchKeyword}"`);
        }

        // Khoảng cách xấp xỉ
        const dist = this.calculateDistance(
          giver.location.latitude, giver.location.longitude,
          receiver.location.latitude, receiver.location.longitude
        );

        if (dist <= 3.0) {
          score += 15;
          reasons.push(`Rất gần nhau (${dist} km - cùng khu vực)`);
        } else {
          reasons.push(`Khoảng cách ${dist} km`);
        }

        matches.push({
          giver_item: giver,
          receiver_item: receiver,
          match_score: Math.min(score, 98),
          distance_km: dist,
          match_reasons: reasons
        });
      }
    }

    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}

export const api = new ReschoolApi();
