import { subscribe, filterReports, STATUS } from './data.js';

let map, verifiedLayer, heatLayer;

export function initMainMap(){
  map = L.map('map').setView([14.5995,120.9842], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  verifiedLayer = L.layerGroup().addTo(map);

  // Re-render when data changes
  subscribe(()=>refreshMap());

  // Toggle layers event
  window.addEventListener('smp:toggleLayers', ()=>{
    if(map.hasLayer(verifiedLayer)){ map.removeLayer(verifiedLayer); }
    else { verifiedLayer.addTo(map); }
    if(heatLayer){
      if(map.hasLayer(heatLayer)) map.removeLayer(heatLayer);
      else heatLayer.addTo(map);
    }
  });
}

export function bindMapControls(){
  document.getElementById('applyFilters')?.addEventListener('click', refreshMap);
  document.getElementById('resetFilters')?.addEventListener('click', ()=>{
    document.getElementById('filterType').value='';
    document.getElementById('filterStatus').value='';
    document.getElementById('dateFrom').value='';
    document.getElementById('dateTo').value='';
    refreshMap();
  });
}

export function refreshMap(){
  const fType = document.getElementById('filterType')?.value || '';
  const fStatus = document.getElementById('filterStatus')?.value || '';
  const df = document.getElementById('dateFrom')?.value || '';
  const dt = document.getElementById('dateTo')?.value || '';

  const rows = filterReports({type:fType, status:fStatus, dateFrom:df, dateTo:dt});

  // Clear
  verifiedLayer.clearLayers();
  if(heatLayer){ map.removeLayer(heatLayer); heatLayer=null; }

  // Heat for approved unverified - Keep heat for density, but user asked for pins too
  const heatPoints = rows.filter(r=>r.status===STATUS.UNVERIFIED_APPROVED).map(r=>[r.lat, r.lng, 0.5]);
  if(heatPoints.length){
    heatLayer = L.heatLayer(heatPoints, {radius:24, blur:16, maxZoom:17, gradient:{0.2:'#0ea5e9',0.5:'#f59e0b',0.8:'#ef4444'}}).addTo(map);
  }

  // Pins for both Approved and Verified reports
  rows.filter(r=>r.status===STATUS.UNVERIFIED_APPROVED || r.status===STATUS.VERIFIED).forEach(r=>{
    const isVerified = r.status === STATUS.VERIFIED;
    const m = L.marker([r.lat, r.lng], {
      title: r.type,
      opacity: isVerified ? 1.0 : 0.8 // Slightly faded for unverified
    });
    
    m.bindPopup(`
      <div class="p-1">
        <h6 class="mb-1">${r.type}</h6>
        <div class="mb-1">
          <span class="badge ${isVerified ? 'bg-primary' : 'bg-warning text-dark'}">
            ${isVerified ? 'Verified PNP' : 'Community Approved'}
          </span>
        </div>
        <p class="small text-muted mb-0">${r.date}</p>
        <p class="small mb-0">${r.desc || ''}</p>
      </div>
    `);
    verifiedLayer.addLayer(m);
  });
}