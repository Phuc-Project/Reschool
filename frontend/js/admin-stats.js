/**
 * Reschool - Bảng Thống kê Quản trị
 * Tính số liệu THẬT từ dữ liệu hệ thống: tài khoản đăng ký, đồ dùng đăng tải,
 * lượt yêu cầu, giao dịch luân chuyển thành công, tỷ lệ khớp lệnh, vi phạm an toàn.
 */

const CATEGORY_META = {
  TEXTBOOK:   { label: "Sách giáo khoa", color: "#16A34A", price: 250000, kg: 2.5 },
  UNIFORM:    { label: "Đồng phục",      color: "#2563EB", price: 200000, kg: 0.6 },
  STATIONERY: { label: "Dụng cụ học tập", color: "#F59E0B", price: 80000,  kg: 0.3 },
  OTHER:      { label: "Khác",           color: "#8B5CF6", price: 50000,  kg: 0.3 }
};
const CAT_KEYS = Object.keys(CATEGORY_META);
const PHONE_REGEX = /(?:\+?84|0)(?:\s?\.?\-?\d){9}\b/;
const SUCCESS_STATUSES = new Set(["ACCEPTED", "COMPLETED"]);

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const catOf = (c) => (CATEGORY_META[c] ? c : "OTHER");
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key) => {
  const [y, m] = key.split("-");
  return `Tháng ${Number(m)}, ${y}`;
};
const prevMonthKey = (key) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return monthKey(d);
};
const inMonth = (v, key) => {
  const d = toDate(v);
  return d ? monthKey(d) === key : false;
};
const upToMonth = (v, key) => {
  const d = toDate(v);
  return !d || monthKey(d) <= key; // không có ngày => coi như có từ đầu
};

// Gộp tài khoản theo uid / email / tên, lấy ngày tham gia sớm nhất
function buildAccounts({ accounts = [], demoAccounts = [], items = [], requests = [] }) {
  const map = new Map();
  const add = (info, dateValue) => {
    const key = (info.uid || info.email || info.name || "").toString().trim().toLowerCase();
    if (!key) return;
    const d = toDate(dateValue);
    const cur = map.get(key);
    if (!cur) {
      map.set(key, { key, name: info.name || "", date: d });
    } else if (d && (!cur.date || d < cur.date)) {
      cur.date = d;
    }
  };

  accounts.forEach(a => add({ uid: a.uid, email: a.email, name: a.displayName }, a.createdAt || a.created_at));
  demoAccounts.forEach(a => add({ uid: a.uid, email: a.email, name: a.displayName }, null));
  items.forEach(i => {
    const email = i.contact?.email;
    const uid = i.user_id || i.contact?.user_id;
    add({ uid: uid || email, email, name: i.contact?.author_name }, i.created_at);
  });
  requests.forEach(r => {
    add({ uid: r.requester_id, name: r.requester_name }, r.created_at);
    add({ uid: r.giver_id, name: r.giver_name }, r.created_at);
  });

  // Bỏ trùng tên giữa nguồn có uid và nguồn chỉ có tên
  const byName = new Map();
  for (const acc of map.values()) {
    const nameKey = (acc.name || acc.key).toLowerCase();
    const cur = byName.get(nameKey);
    if (!cur) byName.set(nameKey, acc);
    else if (acc.date && (!cur.date || acc.date < cur.date)) cur.date = acc.date;
  }
  return [...byName.values()];
}

function computeStats({ items, requests, accounts, period }) {
  const isAll = period === "all";
  const pick = (v) => (isAll ? true : inMonth(v, period));

  const giveItemsAll = items.filter(i => i.type !== "RECEIVE");
  const giveItems = giveItemsAll.filter(i => pick(i.created_at));
  const needPosts = items.filter(i => i.type === "RECEIVE" && pick(i.created_at));
  const reqs = requests.filter(r => pick(r.created_at));

  const successReqs = reqs.filter(r => SUCCESS_STATUSES.has(r.status));
  const successReqItemIds = new Set(successReqs.map(r => r.item_id));
  const completedWithoutReq = giveItems.filter(i => i.status === "COMPLETED" && !successReqItemIds.has(i.id));
  const successCount = successReqs.length + completedWithoutReq.length;
  const pendingCount = reqs.filter(r => r.status === "PENDING").length;
  const rejectedCount = reqs.filter(r => r.status === "REJECTED").length;

  // Vi phạm an toàn: lộ SĐT trong bài đăng/lời nhắn, hoặc hẹn ngoài Trạm luân chuyển
  const phoneLeaks = giveItems.filter(i => PHONE_REGEX.test(`${i.title || ""} ${i.description || ""}`)).length
    + reqs.filter(r => PHONE_REGEX.test(r.requester_note || "")).length;
  const offStation = reqs.filter(r => !r.transit_station).length;
  const violations = phoneLeaks + offStation;

  const accountsTotal = isAll ? accounts.length : accounts.filter(a => upToMonth(a.date, period)).length;
  const newAccounts = isAll ? accounts.length : accounts.filter(a => a.date && monthKey(a.date) === period).length;

  // Phân loại
  const postedByCat = Object.fromEntries(CAT_KEYS.map(k => [k, 0]));
  giveItems.forEach(i => { postedByCat[catOf(i.category)] += 1; });

  const reusedByCat = Object.fromEntries(CAT_KEYS.map(k => [k, 0]));
  successReqs.forEach(r => {
    const item = items.find(i => i.id === r.item_id);
    reusedByCat[catOf(r.item_category || item?.category)] += 1;
  });
  completedWithoutReq.forEach(i => { reusedByCat[catOf(i.category)] += 1; });

  const moneySaved = CAT_KEYS.reduce((s, k) => s + reusedByCat[k] * CATEGORY_META[k].price, 0);
  const wasteSaved = CAT_KEYS.reduce((s, k) => s + reusedByCat[k] * CATEGORY_META[k].kg, 0);

  const textbookCount = postedByCat.TEXTBOOK;
  const uniformCount = postedByCat.UNIFORM;

  return {
    accountsTotal, newAccounts,
    posted: giveItems.length, needPosts: needPosts.length,
    requests: reqs.length, successCount, pendingCount, rejectedCount,
    matchRate: giveItems.length ? (successCount / giveItems.length) * 100 : 0,
    violations, phoneLeaks, offStation,
    postedByCat, reusedByCat, moneySaved, wasteSaved,
    textbookCount, uniformCount
  };
}

function buildActivity(items, requests, period) {
  const isAll = period === "all";
  const events = [];
  items.forEach(i => {
    if (!isAll && !inMonth(i.created_at, period)) return;
    events.push({
      date: toDate(i.created_at),
      icon: "📦",
      text: `${esc(i.contact?.author_name || "Học sinh")} đăng "${esc(i.title)}"`
    });
  });
  requests.forEach(r => {
    if (!isAll && !inMonth(r.updated_at || r.created_at, period)) return;
    const base = `"${esc(r.item_title)}"`;
    if (SUCCESS_STATUSES.has(r.status)) {
      events.push({ date: toDate(r.updated_at || r.created_at), icon: "♻️", text: `${base} luân chuyển thành công • Mã ${esc(r.transit_code || "")}` });
    } else if (r.status === "REJECTED") {
      events.push({ date: toDate(r.updated_at || r.created_at), icon: "❌", text: `Yêu cầu ${base} bị từ chối` });
    } else {
      events.push({ date: toDate(r.created_at), icon: "💬", text: `${esc(r.requester_name || "Học sinh")} gửi yêu cầu xin ${base}` });
    }
  });
  return events.filter(e => e.date).sort((a, b) => b.date - a.date).slice(0, 6);
}

const timeAgo = (d) => {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

function deltaText(cur, prev) {
  const diff = cur - prev;
  if (diff === 0) return `<span class="as-delta">= tháng trước</span>`;
  return `<span class="as-delta ${diff > 0 ? "up" : "down"}">${diff > 0 ? "+" : ""}${fmt(diff)} so với tháng trước</span>`;
}

function summaryRows(s) {
  const rate = s.matchRate.toFixed(1).replace(".", ",");
  return [
    ["Tổng số tài khoản học sinh đăng ký tham gia", `${fmt(s.accountsTotal)} tài khoản`, "Số tài khoản đã tạo trên hệ thống (Google, Mã học sinh/Email)."],
    ["Tổng số món đồ được đăng tải (Cho/Tặng)", `${fmt(s.posted)} món`, `Gồm ${fmt(s.textbookCount)} SGK, ${fmt(s.uniformCount)} đồng phục và các đồ dùng khác.`],
    ["Tổng số lượt yêu cầu xin nhận đồ", `${fmt(s.requests)} lượt`, `${fmt(s.pendingCount)} đang chờ duyệt, ${fmt(s.rejectedCount)} bị từ chối.`],
    ["Số giao dịch luân chuyển hoàn tất thành công", `${fmt(s.successCount)} giao dịch`, `Tỷ lệ khớp lệnh thành công ${rate}% (${fmt(s.successCount)}/${fmt(s.posted)}).`],
    ["Số ca vi phạm an toàn thông tin (lộ SĐT, hẹn sai địa điểm)", `${fmt(s.violations)} ca`, s.violations === 0 ? "Mô hình Trạm Thư viện an toàn hoạt động hiệu quả." : `${fmt(s.phoneLeaks)} ca lộ SĐT, ${fmt(s.offStation)} ca hẹn ngoài Trạm.`]
  ];
}

function exportCsv(s, periodText) {
  const rows = [["Tiêu chí đo lường", "Số lượng", "Ghi chú"], ...summaryRows(s)];
  const csv = "﻿" + `Báo cáo thống kê Reschool - ${periodText}\n` +
    rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reschool-thong-ke-${periodText.replace(/[^\w]+/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderAdminStats(container, { items = [], requests = [], accounts = [], demoAccounts = [] }, state = {}) {
  if (!container) return;

  const allAccounts = buildAccounts({ accounts, demoAccounts, items, requests });

  const months = new Set();
  [...items.map(i => i.created_at), ...requests.map(r => r.created_at)].forEach(v => {
    const d = toDate(v);
    if (d) months.add(monthKey(d));
  });
  const monthList = [...months].sort().reverse();
  const period = state.period && (state.period === "all" || months.has(state.period)) ? state.period : "all";
  const periodText = period === "all" ? "Toàn thời gian" : monthLabel(period);

  const s = computeStats({ items, requests, accounts: allAccounts, period });
  const prev = period === "all" ? null : computeStats({ items, requests, accounts: allAccounts, period: prevMonthKey(period) });
  const sub = (cur, prevVal, fallback) => (prev ? deltaText(cur, prevVal) : `<span class="as-delta">${fallback}</span>`);

  // Donut theo loại
  const postedTotal = Math.max(1, s.posted);
  let acc = 0;
  const stops = CAT_KEYS.map(k => {
    const start = (acc / postedTotal) * 100;
    acc += s.postedByCat[k];
    const end = (acc / postedTotal) * 100;
    return `${CATEGORY_META[k].color} ${start}% ${end}%`;
  }).join(", ");
  const donutBg = s.posted ? `conic-gradient(${stops})` : "#E2E8F0";

  const reuseRate = s.posted ? Math.round((s.successCount / s.posted) * 100) : 0;
  const barMax = Math.max(1, s.posted, s.successCount, s.pendingCount);
  const reusedMax = Math.max(1, ...CAT_KEYS.map(k => s.reusedByCat[k]));
  const activity = buildActivity(items, requests, period);

  container.innerHTML = `
    <div class="as-toolbar">
      <div class="as-period">
        <label for="as-period-select">Kỳ thống kê</label>
        <select id="as-period-select">
          <option value="all" ${period === "all" ? "selected" : ""}>Toàn thời gian</option>
          ${monthList.map(m => `<option value="${m}" ${m === period ? "selected" : ""}>${monthLabel(m)}</option>`).join("")}
        </select>
      </div>
      <button type="button" class="btn btn-sm btn-outline" id="as-export-csv">⬇ Xuất CSV báo cáo</button>
    </div>

    <div class="as-kpi-grid">
      <div class="as-kpi" style="--kpi:#8B5CF6"><div class="as-kpi-icon">👥</div><div class="as-kpi-val">${fmt(s.accountsTotal)}</div><div class="as-kpi-label">Tài khoản đã đăng ký</div>${prev ? `<span class="as-delta up">+${fmt(s.newAccounts)} tài khoản mới trong tháng</span>` : `<span class="as-delta">Lũy kế toàn hệ thống</span>`}</div>
      <div class="as-kpi" style="--kpi:#16A34A"><div class="as-kpi-icon">📦</div><div class="as-kpi-val">${fmt(s.posted)}</div><div class="as-kpi-label">Đồ dùng đã đăng (Cho/Tặng)</div>${sub(s.posted, prev?.posted, `+${fmt(s.needPosts)} bài cần xin`)}</div>
      <div class="as-kpi" style="--kpi:#EF4444"><div class="as-kpi-icon">💬</div><div class="as-kpi-val">${fmt(s.requests)}</div><div class="as-kpi-label">Lượt yêu cầu xin đồ</div>${sub(s.requests, prev?.requests, `${fmt(s.pendingCount)} đang chờ duyệt`)}</div>
      <div class="as-kpi" style="--kpi:#2563EB"><div class="as-kpi-icon">♻️</div><div class="as-kpi-val">${fmt(s.successCount)}</div><div class="as-kpi-label">Giao dịch luân chuyển thành công</div>${sub(s.successCount, prev?.successCount, "Đã cấp mã & bàn giao qua Trạm")}</div>
      <div class="as-kpi" style="--kpi:#0EA5E9"><div class="as-kpi-icon">🎯</div><div class="as-kpi-val">${s.matchRate.toFixed(1).replace(".", ",")}%</div><div class="as-kpi-label">Tỷ lệ khớp lệnh thành công</div><span class="as-delta">${fmt(s.successCount)}/${fmt(s.posted)} món đã có người nhận</span></div>
      <div class="as-kpi" style="--kpi:${s.violations ? "#DC2626" : "#16A34A"}"><div class="as-kpi-icon">🛡️</div><div class="as-kpi-val">${fmt(s.violations)}</div><div class="as-kpi-label">Ca vi phạm an toàn</div><span class="as-delta">Lộ SĐT / hẹn ngoài Trạm</span></div>
    </div>

    <div class="as-row">
      <div class="as-card">
        <h4>Đồ dùng đã đăng theo loại</h4>
        <div class="as-donut-wrap">
          <div class="as-donut" style="background:${donutBg}">
            <div class="as-donut-hole"><strong>${fmt(s.posted)}</strong><span>đồ dùng</span></div>
          </div>
          <ul class="as-legend">
            ${CAT_KEYS.map(k => `<li><i style="background:${CATEGORY_META[k].color}"></i><span>${CATEGORY_META[k].label}</span><strong>${fmt(s.postedByCat[k])}</strong></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="as-card">
        <h4>Tình trạng tái sử dụng</h4>
        <div class="as-status-wrap">
          <div class="as-vbars">
            ${[["Đã đăng", s.posted, "#16A34A"], ["Đã tái sử dụng", s.successCount, "#2563EB"], ["Đang chờ", s.pendingCount, "#94A3B8"]].map(([l, v, c]) => `
              <div class="as-vbar"><span class="as-vbar-val">${fmt(v)}</span><div class="as-vbar-fill" style="height:${Math.max(4, (v / barMax) * 100)}%;background:${c}"></div><span class="as-vbar-label">${l}</span></div>
            `).join("")}
          </div>
          <div class="as-rate-box">
            <span>🌱 Tỷ lệ tái sử dụng</span>
            <strong>${reuseRate}%</strong>
            <div class="as-progress"><div style="width:${Math.min(100, reuseRate)}%"></div></div>
            <small>${fmt(s.successCount)}/${fmt(s.posted)} đồ dùng đã được tái sử dụng</small>
          </div>
        </div>
      </div>
    </div>

    <div class="as-row">
      <div class="as-card">
        <h4>Đồ dùng được tái sử dụng theo loại</h4>
        <div class="as-hbars">
          ${CAT_KEYS.map(k => `
            <div class="as-hbar"><span>${CATEGORY_META[k].label}</span><div class="as-hbar-track"><div style="width:${(s.reusedByCat[k] / reusedMax) * 100}%;background:${CATEGORY_META[k].color}"></div></div><strong>${fmt(s.reusedByCat[k])}</strong></div>
          `).join("")}
        </div>
      </div>
      <div class="as-card">
        <h4>Hoạt động gần đây</h4>
        ${activity.length ? `<ul class="as-activity">
          ${activity.map(e => `<li><span class="as-act-icon">${e.icon}</span><span class="as-act-text">${e.text}</span><span class="as-act-time">${timeAgo(e.date)}</span></li>`).join("")}
        </ul>` : `<p class="as-empty">Chưa có hoạt động trong kỳ này.</p>`}
      </div>
    </div>

    <div class="as-card">
      <h4>Bảng tổng hợp kết quả vận hành (${esc(periodText)})</h4>
      <div class="as-table-wrap">
        <table class="as-table">
          <thead><tr><th>Tiêu chí đo lường</th><th>Số lượng</th><th>Ý nghĩa / Đánh giá</th></tr></thead>
          <tbody>${summaryRows(s).map(r => `<tr><td>${esc(r[0])}</td><td><strong>${esc(r[1])}</strong></td><td>${esc(r[2])}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>

    <div class="as-impact-row">
      <div class="as-impact"><strong>${fmt(s.moneySaved)} đ</strong><span>Chi phí ước tính tiết kiệm cho phụ huynh</span></div>
      <div class="as-impact"><strong>${s.wasteSaved.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} kg</strong><span>Rác thải giấy &amp; vải ước tính giảm thiểu</span></div>
      <div class="as-impact"><strong>100%</strong><span>Giao dịch bàn giao qua Trạm Thư viện / Phòng Đoàn Đội, không lộ SĐT</span></div>
    </div>
  `;

  const select = container.querySelector("#as-period-select");
  if (select) {
    select.onchange = () => {
      if (typeof state.onPeriodChange === "function") state.onPeriodChange(select.value);
      renderAdminStats(container, { items, requests, accounts, demoAccounts }, { ...state, period: select.value });
    };
  }
  const exportBtn = container.querySelector("#as-export-csv");
  if (exportBtn) exportBtn.onclick = () => exportCsv(s, periodText);
}
