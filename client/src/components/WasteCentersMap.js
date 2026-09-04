import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './WasteCentersMap.css';
import { Layers, Navigation } from 'lucide-react';

// Category color & icon configurations
const CATEGORY_STYLES = {
  plastic: {
    color: '#f87171',
    bg: '#ef4444',
    label: 'Plastic',
    emoji: '🥤',
    symbol: '♻️'
  },
  electronic: {
    color: '#a78bfa',
    bg: '#8b5cf6',
    label: 'E-Waste',
    emoji: '💻',
    symbol: '⚡'
  },
  metal: {
    color: '#fbbf24',
    bg: '#f59e0b',
    label: 'Metal & Scrap',
    emoji: '🔩',
    symbol: '⚙️'
  },
  paper: {
    color: '#38bdf8',
    bg: '#0ea5e9',
    label: 'Paper',
    emoji: '📦',
    symbol: '📄'
  },
  organic: {
    color: '#34d399',
    bg: '#10b981',
    label: 'Organic',
    emoji: '🌿',
    symbol: '🌱'
  },
  glass: {
    color: '#2dd4bf',
    bg: '#14b8a6',
    label: 'Glass',
    emoji: '🍾',
    symbol: '🍸'
  },
  general: {
    color: '#34d399',
    bg: '#059669',
    label: 'Recycler',
    emoji: '♻️',
    symbol: '♻️'
  }
};

const TILE_PROVIDERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abc',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: 'abc',
    maxZoom: 18
  }
};

const WasteCentersMap = ({
  centers = [],
  userLocation = null,
  selectedCenter = null,
  onSelectCenter = () => {},
  height = '480px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [activeTileType, setActiveTileType] = useState('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = userLocation?.lat || (centers[0]?.lat) || 19.0760;
    const initialLng = userLocation?.lng || (centers[0]?.lng) || 72.8777;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true
    });

    const tileConfig = TILE_PROVIDERS.dark;
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle Tile Type changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_PROVIDERS[activeTileType] || TILE_PROVIDERS.dark;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains,
      maxZoom: config.maxZoom
    }).addTo(mapInstanceRef.current);
  }, [activeTileType]);

  // Handle User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation && userLocation.lat && userLocation.lng) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="user-location-pin">
            <div class="user-location-pulse"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 2000 })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <span>📍</span>
            <span>Your Location</span>
          </div>
          <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">
            ${userLocation.name || 'Current Search Anchor'}
          </p>
        `);
    }
  }, [userLocation]);

  // Handle Center Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds();

    if (userLocation && userLocation.lat && userLocation.lng) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    centers.forEach(center => {
      if (!center.lat || !center.lng) return;

      const style = CATEGORY_STYLES[center.category] || CATEGORY_STYLES.general;
      const isSelected = selectedCenter && selectedCenter._id === center._id;

      const markerHtml = `
        <div class="waste-marker-pin ${isSelected ? 'selected' : ''}" style="background: ${style.bg};">
          <span style="font-size: 16px; line-height: 1;">${style.emoji}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-waste-marker',
        html: markerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20]
      });

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

      const popupHtml = `
        <div style="min-width: 230px; max-width: 280px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #f8fafc; line-height: 1.3;">
              ${center.name}
            </h4>
            ${center.isVerified ? '<span style="color: #34d399; font-size: 14px;" title="Verified Recycler">✓</span>' : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="background: ${style.color}20; border: 1px solid ${style.color}40; color: ${style.color}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 50px;">
              ${style.label}
            </span>
            ${center.distance !== undefined ? `
              <span style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 50px;">
                ${center.distance} km away
              </span>
            ` : ''}
          </div>

          <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8; display: flex; align-items: flex-start; gap: 4px;">
            <span style="flex-shrink: 0;">📍</span>
            <span>${center.address}, ${center.city}</span>
          </p>

          ${center.operatingHours ? `
            <p style="margin: 0 0 6px; font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 4px;">
              <span>🕒</span>
              <span>${center.operatingHours}</span>
            </p>
          ` : ''}

          ${center.scrapRates ? `
            <div style="margin: 8px 0; padding: 6px 8px; background: rgba(255,255,255,0.04); border-radius: 6px; border-left: 2px solid ${style.color};">
              <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Rates / Pricing</span>
              <span style="font-size: 11px; color: #e2e8f0; font-weight: 500;">${center.scrapRates}</span>
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);">
            <a 
              href="${directionsUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="flex: 1; background: #34d399; color: #0a2818; text-decoration: none; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 6px; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              Directions ↗
            </a>
            ${center.phone ? `
              <a 
                href="tel:${center.phone}"
                style="background: rgba(255,255,255,0.08); color: #f1f5f9; text-decoration: none; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 6px; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
              >
                Call
              </a>
            ` : ''}
          </div>
        </div>
      `;

      const marker = L.marker([center.lat, center.lng], { icon: customIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectCenter(center);
      });

      bounds.extend([center.lat, center.lng]);

      // If this center is selected, open popup and fly to it
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 100);
      }
    });

    // Auto-fit bounds if no specific center is selected and multiple points exist
    if (!selectedCenter && bounds.isValid() && centers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [centers, selectedCenter, userLocation]);

  // Smooth Pan when selectedCenter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCenter) return;
    if (selectedCenter.lat && selectedCenter.lng) {
      mapInstanceRef.current.flyTo([selectedCenter.lat, selectedCenter.lng], 15, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }
  }, [selectedCenter]);

  // Quick reset to user view
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation && userLocation.lat && userLocation.lng) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13);
    } else if (centers.length > 0) {
      mapInstanceRef.current.flyTo([centers[0].lat, centers[0].lng], 13);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ height }}>
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="waste-map-container" style={{ height: '100%', minHeight: height }} />

      {/* Map Layer Switcher & Re-center Toolbar Overlay */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={() => setActiveTileType(activeTileType === 'dark' ? 'street' : activeTileType === 'street' ? 'satellite' : 'dark')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition"
          title="Toggle Map Style (Dark / Street / Satellite)"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="capitalize">{activeTileType}</span>
        </button>

        <button
          onClick={handleRecenter}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-emerald-400 transition"
          title="Re-center Map"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend Pill */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Organic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>E-Waste</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span>Plastic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Metal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>Paper</span>
        </div>
      </div>
    </div>
  );
};

export default WasteCentersMap;
