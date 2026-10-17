/**
 * Reschool Interactive Map Module
 * Hiển thị vị trí các điểm trường học và vật phẩm luân chuyển trên nền bản đồ OpenStreetMap & Leaflet.
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

  // Tọa độ trung tâm Hà Nội (Khu vực có các trường THPT Chu Văn An, Phan Đình Phùng, Kim Liên...)
  const defaultCoords = [21.0300, 105.8250];

  mapInstance = L.map(containerId, {
    center: defaultCoords,
    zoom: 13,
    zoomControl: true,
    attributionControl: false
  });

  // Nền bản đồ CartoDB Voyager sáng sủa, thanh lịch, học đường
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
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
    const iconSymbol = isGive ? "🎁" : "🔍";

    // Custom HTML Marker Icon
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="pin-wrapper ${pinColorClass}">
          <span class="pin-icon">${iconSymbol}</span>
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
          ${isGive ? 'Cho tặng' : 'Cần xin'}
        </div>
        <img class="map-popup-img" src="${item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'}" alt="${item.title}" />
        <h4 class="map-popup-title">${item.title}</h4>
        <div class="map-popup-meta">
          <span>🏫 ${item.location.school_name}</span>
          <span class="map-popup-condition">✨ ${item.condition}</span>
        </div>
        <button class="map-popup-btn" data-id="${item.id}">Xem bài đăng</button>
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
    }, 200);
  }
}
