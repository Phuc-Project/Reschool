import { GOOGLE_MAPS_API_KEY } from "./firebase-config.js";

/**
 * Reschool Interactive Map Module
 * Hiển thị vị trí các điểm trường học và vật phẩm luân chuyển trên nền bản đồ Google Maps & Leaflet.
 */

let mapInstance = null;
let markersLayer = null;

export function initReschoolMap(containerId = "reschool-map", onMarkerClick = null) {
  if (mapInstance) {
    mapInstance.invalidateSize();
    return mapInstance;
  }

  const container = document.getElementById(containerId);
  if (!container) return null;

  // Tọa độ trung tâm TP Hải Phòng (Khu vực ĐH Hàng hải, THPT Chuyên Trần Phú, ĐH Y Dược HP)
  const haiPhongCoords = [20.8449, 106.6881];

  mapInstance = L.map(containerId, {
    center: haiPhongCoords,
    zoom: 13,
    zoomControl: true,
    attributionControl: false
  });

  // Lớp bản đồ Google Maps sắc nét tích hợp trực tiếp qua API Key
  const googleTileUrl = GOOGLE_MAPS_API_KEY
    ? `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`
    : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`;

  L.tileLayer(googleTileUrl, {
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  return mapInstance;
}

export function renderMapMarkers(items, onSelectCallback) {
  if (!mapInstance || !markersLayer) return;

  markersLayer.clearLayers();

  items.forEach(item => {
    if (!item.location || !item.location.latitude || !item.location.longitude) return;

    const isGive = item.type === "GIVE";
    const pinColorClass = isGive ? "marker-give" : "marker-receive";
    
    // Clean SVG icon for markers
    const svgIcon = isGive
      ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`
      : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

    // Custom HTML Marker Icon
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="pin-wrapper ${pinColorClass}">
          <span class="pin-icon">${svgIcon}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -32]
    });

    const marker = L.marker([item.location.latitude, item.location.longitude], {
      icon: customIcon,
      title: item.title
    });

    const popupHtml = `
      <div class="map-popup-card">
        <div class="map-popup-badge ${isGive ? 'badge-give' : 'badge-receive'}">
          ${isGive ? 'Cho tặng (0đ)' : 'Cần hỗ trợ'}
        </div>
        <img class="map-popup-img" src="${item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'}" alt="${item.title}" />
        <h4 class="map-popup-title">${item.title}</h4>
          <div class="map-popup-meta">
          <span class="map-school-row">
            <svg class="icon icon-sm text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l7-4 7 4v14"></path>
              <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
              <path d="M10 21V14h4v7"></path>
            </svg>
            <span>${item.location.school_name}</span>
          </span>
          <span class="map-popup-station">
            🏛️ ${item.transit_station || 'Trạm Thư viện / Đoàn Đội'}
          </span>
        </div>
        <button class="map-popup-btn" data-id="${item.id}">
          ${isGive ? 'Đăng kí nhận đồ' : 'Tặng cho bạn'}
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);

    marker.on("popupopen", (e) => {
      const btn = e.popup._container.querySelector(".map-popup-btn");
      if (btn && onSelectCallback) {
        btn.addEventListener("click", () => {
          onSelectCallback(item);
        });
      }
    });

    markersLayer.addLayer(marker);
  });
}

export function resizeMap() {
  if (mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 250);
  }
}

export function focusLocation(lat, lng, zoom = 15) {
  if (mapInstance) {
    mapInstance.flyTo([lat, lng], zoom, {
      duration: 1.2
    });
  }
}
