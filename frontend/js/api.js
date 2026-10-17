/**
 * Reschool API Client & Data Adapter
 * Tự động kết nối Cloud Firestore & FastAPI Backend nếu khả dụng,
 * đồng thời duy trì độ tin cậy tuyệt đối với LocalStorage & Offline-First Storage.
 */
import { INITIAL_ITEMS_DATA } from './mock-data.js';
import { DEFAULT_FIREBASE_CONFIG } from './firebase-config.js';

const DEFAULT_PROD_API = "https://reschool-backend.onrender.com/api/v1";
const BACKEND_BASE_URL = window.RESCHOOL_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:8000/api/v1" 
    : DEFAULT_PROD_API);

let firestoreInstance = null;
async function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const app = getApps().length > 0 ? getApps()[0] : initializeApp(DEFAULT_FIREBASE_CONFIG);
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (e) {
    console.warn("Cloud Firestore CDN không khả dụng:", e);
    return null;
  }
}

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

  // Lấy toàn bộ items (kết hợp Backend, Cloud Firestore và LocalStorage)
  async getItems(filters = {}) {
    // 1. Thử lấy từ Backend nếu online
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
          if (json.data && json.data.length > 0) return json.data;
        }
      } catch (err) {
        console.warn("Backend không phản hồi, thử tải từ Cloud Firestore:", err);
      }
    }

    // 2. Lấy trực tiếp từ Cloud Firestore Database (Dữ liệu đám mây thời gian thực)
    try {
      const db = await getFirestoreDb();
      if (db) {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const snap = await getDocs(collection(db, "reschool_items"));
        if (!snap.empty) {
          const firestoreItems = [];
          snap.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            // Chuyển đổi timestamp Firestore sang ISO string nếu cần
            if (data.created_at && typeof data.created_at.toDate === 'function') {
              data.created_at = data.created_at.toDate().toISOString();
            }
            if (data.updated_at && typeof data.updated_at.toDate === 'function') {
              data.updated_at = data.updated_at.toDate().toISOString();
            }
            firestoreItems.push(data);
          });

          if (firestoreItems.length > 0) {
            // Sắp xếp bài mới nhất lên đầu
            firestoreItems.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            // Cập nhật bộ nhớ đệm
            try {
              localStorage.setItem(this.storageKey, JSON.stringify(firestoreItems));
            } catch (e) {}

            return this.filterItemsInMemory(firestoreItems, filters);
          }
        }
      }
    } catch (firestoreErr) {
      console.warn("Cloud Firestore offline hoặc lỗi tải, chuyển sang bộ nhớ cục bộ:", firestoreErr);
    }

    // 3. Fallback: LocalStorage + Mock Data (Đảm bảo hiển thị tức thì khi ngoại tuyến)
    return this.getLocalItems(filters);
  }

  // Bộ lọc dữ liệu trong bộ nhớ dùng chung cho Firestore & LocalStorage
  filterItemsInMemory(rawItems, filters = {}) {
    let items = [...rawItems];

    // Lọc theo keyword
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase().trim();
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(kw)) ||
        (i.description && i.description.toLowerCase().includes(kw)) ||
        (i.tags && Array.isArray(i.tags) && i.tags.some(t => t.toLowerCase().includes(kw))) ||
        (i.location && i.location.school_name && i.location.school_name.toLowerCase().includes(kw))
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

  getLocalItems(filters = {}) {
    let items = [...INITIAL_ITEMS_DATA];
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customItems = JSON.parse(stored);
        const customIds = new Set(customItems.map(c => c.id));
        const nonDuplicateMocks = items.filter(m => !customIds.has(m.id));
        items = [...customItems, ...nonDuplicateMocks];
      }
    } catch (e) {
      console.error("Lỗi đọc localStorage:", e);
    }

    return this.filterItemsInMemory(items, filters);
  }

  // Thêm mới một bài đăng và lưu trữ đầy đủ các trường vào Database
  async createItem(itemData) {
    const newItem = {
      id: itemData.id || `item-${Date.now()}`,
      user_id: itemData.user_id || itemData.contact?.user_id || "anonymous",
      title: itemData.title,
      type: itemData.type,
      category: itemData.category,
      grade: itemData.grade ?? null,
      condition: itemData.condition || "Mới 90%",
      description: itemData.description || "",
      images: itemData.images || [],
      tags: itemData.tags || [],
      status: itemData.status || "AVAILABLE", // AVAILABLE | RESERVED | COMPLETED
      created_at: itemData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: itemData.view_count || 0,
      location: {
        school_name: itemData.location?.school_name || "Trường học",
        city: itemData.location?.city || "Hà Nội",
        district: itemData.location?.district || "Tây Hồ",
        address_detail: itemData.location?.address_detail || "",
        latitude: itemData.location?.latitude || (21.0333 + (Math.random() - 0.5) * 0.04),
        longitude: itemData.location?.longitude || (105.8400 + (Math.random() - 0.5) * 0.04)
      },
      contact: {
        user_id: itemData.contact?.user_id || itemData.user_id || "anonymous",
        author_name: itemData.contact?.author_name || "Học sinh Reschool",
        author_avatar: itemData.contact?.author_avatar || "",
        student_class: itemData.contact?.student_class || "",
        phone: itemData.contact?.phone || "",
        zalo: itemData.contact?.zalo || itemData.contact?.phone || "",
        email: itemData.contact?.email || ""
      }
    };

    // 1. Lưu lập tức vào LocalStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      const customItems = stored ? JSON.parse(stored) : [];
      customItems.unshift(newItem);
      localStorage.setItem(this.storageKey, JSON.stringify(customItems));
    } catch (e) {
      console.error("Lỗi ghi localStorage:", e);
    }

    // 2. Lưu đồng bộ lên Cloud Firestore (asynchronous, non-blocking)
    getFirestoreDb().then(async (db) => {
      if (db) {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "reschool_items", newItem.id), newItem, { merge: true });
      }
    }).catch(err => console.warn("Lưu Firestore thất bại, đã lưu an toàn tại LocalStorage:", err));

    // 3. Gửi lên FastAPI Backend nếu đang kết nối
    if (this.backendAvailable) {
      try {
        await fetch(`${BACKEND_BASE_URL}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem)
        });
      } catch (err) {
        console.warn("Backend không phản hồi, đã lưu offline:", err);
      }
    }

    return newItem;
  }

  // Cập nhật trạng thái bài đăng (Sẵn sàng / Đã hoàn thành trao tặng)
  async updateItemStatus(itemId, newStatus) {
    let updatedItem = null;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customItems = JSON.parse(stored);
        const idx = customItems.findIndex(i => i.id === itemId);
        if (idx !== -1) {
          customItems[idx].status = newStatus;
          customItems[idx].updated_at = new Date().toISOString();
          updatedItem = customItems[idx];
          localStorage.setItem(this.storageKey, JSON.stringify(customItems));
        }
      }
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái:", e);
    }

    // Đồng bộ Firestore
    getFirestoreDb().then(async (db) => {
      if (db) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await updateDoc(doc(db, "reschool_items", itemId), {
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    }).catch(() => {});

    // Đồng bộ Backend
    if (this.backendAvailable) {
      try {
        await fetch(`${BACKEND_BASE_URL}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.warn("Backend sync failed:", err);
      }
    }

    return updatedItem;
  }

  // Xóa bài đăng khỏi Database
  async deleteItem(itemId) {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customItems = JSON.parse(stored);
        const filtered = customItems.filter(i => i.id !== itemId);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error("Lỗi xóa bài đăng:", e);
    }

    // Xóa trên Firestore
    getFirestoreDb().then(async (db) => {
      if (db) {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await deleteDoc(doc(db, "reschool_items", itemId));
      }
    }).catch(() => {});

    // Xóa trên Backend
    if (this.backendAvailable) {
      try {
        await fetch(`${BACKEND_BASE_URL}/items/${itemId}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.warn("Backend delete sync failed:", err);
      }
    }

    return true;
  }

  // Tăng lượt xem và lưu lại Database
  incrementViewCount(itemId) {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customItems = JSON.parse(stored);
        const item = customItems.find(i => i.id === itemId);
        if (item) {
          item.view_count = (item.view_count || 0) + 1;
          localStorage.setItem(this.storageKey, JSON.stringify(customItems));
        }
      }
    } catch (e) {
      console.warn("Lỗi cập nhật view_count:", e);
    }
  }

  // Lưu thông tin hồ sơ học sinh bền vững vào Database
  async saveUserProfile(profile) {
    // 1. Lưu LocalStorage
    try {
      localStorage.setItem(`reschool_student_profile_${profile.uid}`, JSON.stringify(profile));
      localStorage.setItem("reschool_auth_user", JSON.stringify(profile));
    } catch (e) {
      console.error("Lỗi lưu hồ sơ vào LocalStorage:", e);
    }

    // 2. Đồng bộ Firestore
    getFirestoreDb().then(async (db) => {
      if (db && profile.uid) {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "student_profiles", profile.uid), profile, { merge: true });
      }
    }).catch(err => console.warn("Lỗi lưu hồ sơ lên Firestore:", err));

    // 3. Đồng bộ Backend nếu có
    if (this.backendAvailable && profile.uid) {
      try {
        await fetch(`${BACKEND_BASE_URL}/users/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile)
        });
      } catch (err) {
        console.warn("Backend save profile sync failed:", err);
      }
    }

    return profile;
  }

  // Lấy thông tin hồ sơ học sinh từ Cloud Firestore hoặc bộ nhớ đệm
  async getUserProfile(uid) {
    if (!uid) return null;
    
    // 1. Thử lấy từ Cloud Firestore
    try {
      const db = await getFirestoreDb();
      if (db) {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const docSnap = await getDoc(doc(db, "student_profiles", uid));
        if (docSnap.exists()) {
          const profile = docSnap.data();
          try {
            localStorage.setItem(`reschool_student_profile_${uid}`, JSON.stringify(profile));
          } catch (e) {}
          return profile;
        }
      }
    } catch (e) {
      console.warn("Lỗi đọc hồ sơ từ Cloud Firestore:", e);
    }

    // 2. Fallback: LocalStorage
    try {
      const stored = localStorage.getItem(`reschool_student_profile_${uid}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return null;
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
    const items = this.getLocalItems().filter(i => i.status !== "COMPLETED");
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
        const giverWords = (giver.title || "").toLowerCase().split(/\s+/);
        const matchKeyword = giverWords.find(w => w.length > 3 && receiver.title && receiver.title.toLowerCase().includes(w));
        if (matchKeyword) {
          score += 20;
          reasons.push(`Trùng khớp môn học / đồ dùng: "${matchKeyword}"`);
        }

        // Khoảng cách xấp xỉ
        const dist = this.calculateDistance(
          giver.location?.latitude || 21.0333, giver.location?.longitude || 105.8400,
          receiver.location?.latitude || 21.0333, receiver.location?.longitude || 105.8400
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
