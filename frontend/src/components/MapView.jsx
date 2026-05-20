import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/api-base"
import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map"
import { Hospital, Siren, Flame, Ambulance, AlertTriangle } from "lucide-react"
import ZoomControls from "./ZoomControls"

const EMERGENCY_LOCATIONS = {
  features: [
    {
      properties: {
        name: "Gensan Medical Center",
        type: "hospital",
        contact: "887-9898",
        lat: 6.082848378647546,
        lng: 125.14814878609288,
      },
    },
    {
      properties: {
        name: "St. Elizabeth Hospital",
        type: "hospital",
        contact: "552-3162 / 0919-071-9004",
        lat: 6.1186906805198,
        lng: 125.17990092527259,
      },
    },
    {
      properties: {
        name: "Mindanao Medical Center",
        type: "hospital",
        contact: "553-8207 / 554-9640",
        lat: 6.128140973066608,
        lng: 125.16013162335923,
      },
    },
    {
      properties: {
        name: "Dadiangas Medical Center",
        type: "hospital",
        contact: "0917-190-2561",
        lat: 6.125146051208208,
        lng: 125.17780208294442,
      },
    },
    {
      properties: {
        name: "Sarangani Bay Specialists Medical Center",
        type: "hospital",
        contact: "887-8888 / 0919-067-8395",
        lat: 6.119403451074248,
        lng: 125.14686598109384,
      },
    },
    {
      properties: {
        name: "Gensan Doctors Hospital",
        type: "hospital",
        contact: "250-2777 / 0933-821-7257",
        lat: 6.1205193798244775,
        lng: 125.17829398294444,
      },
    },
    {
      properties: {
        name: "Dr. Jorge P. Royeca City Hospital",
        type: "hospital",
        contact: "552-2811 / 0912-376-2331",
        lat: 6.1260614210312925,
        lng: 125.18573462712328,
      },
    },
    {
      properties: {
        name: "GSC Police Office",
        type: "police",
        contact: "552-5573 / 0998-598-7207",
        lat: 6.110370865940478,
        lng: 125.16682861271755,
      },
    },
    {
      properties: {
        name: "Police Station 1 (Dad. East)",
        type: "police",
        contact: "0998-598-7208",
        lat: 6.11432864656382,
        lng: 125.17065885410874,
      },
    },
    {
      properties: {
        name: "Police Station 2 (Makar Wharf)",
        type: "police",
        contact: "0918-921-3580",
        lat: 6.094686794224281,
        lng: 125.1546590847949,
      },
    },
    {
      properties: {
        name: "Police Station 3 (Lagao)",
        type: "police",
        contact: "0998-598-7212",
        lat: 6.128284606756957,
        lng: 125.19698807712341,
      },
    },
    {
      properties: {
        name: "Police Station 4 (San Isidro)",
        type: "police",
        contact: "0998-598-7214",
        lat: 6.138473907635937,
        lng: 125.16834834246667,
      },
    },
    {
      properties: {
        name: "Police Station 5",
        type: "police",
        contact: "0907-313-4517",
        lat: 6.07269034380546,
        lng: 125.14324851953891,
      },
    },
    {
      properties: {
        name: "Police Station 6 (Bula)",
        type: "police",
        contact: "0998-598-7218",
        lat: 6.10762945266241,
        lng: 125.1892411829445,
      },
    },
    {
      properties: {
        name: "Police Station 7 (Fatima)",
        type: "police",
        contact: "0998-598-7220",
        lat: 6.076678872414175,
        lng: 125.12008103658187,
      },
    },
    {
      properties: {
        name: "Police Station 8 (Tinagacan)",
        type: "police",
        contact: "0998-598-7223",
        lat: 6.211474069388708,
        lng: 125.23810430568996,
      },
    },
    {
      properties: {
        name: "Police Station 9 (Mabuhay)",
        type: "police",
        contact: "0948-874-1661",
        lat: 6.16148313283533,
        lng: 125.15958797130241,
      },
    },
    {
      properties: {
        name: "Police Station 10 (Calumpang)",
        type: "police",
        contact: "0999-548-9244",
        lat: 6.080748468803172,
        lng: 125.13148385780974,
      },
    },
    {
      properties: {
        name: "Bureau of Fire Protection (BFP)",
        type: "fire",
        contact: "552-1160 / 0943-341-5561 / 160",
        lat: 6.115633495787534,
        lng: 125.1731673237921,
      },
    },
    {
      properties: {
        name: "CDRRMO Gensan",
        type: "rescue",
        contact: "552-3939 / 0943-461-4548",
        lat: 6.113659178971407,
        lng: 125.17178537870461,
      },
    },
  ],
}

// ── Service config — teardrop pin ────────────────────────────────────────────
const SERVICE_CONFIG = {
  hospital: {
    color: "#0EA5E9",
    glow: "rgba(14,165,233,0.55)",
    Icon: Hospital,
    label: "Hospital",
  },
  // backend alias for hospital
  medical: {
    color: "#0EA5E9",
    glow: "rgba(14,165,233,0.55)",
    Icon: Hospital,
    label: "Medical",
  },
  police: {
    color: "#6366F1",
    glow: "rgba(99,102,241,0.55)",
    Icon: Siren,
    label: "Police",
  },
  // backend alias for police
  pnp: {
    color: "#6366F1",
    glow: "rgba(99,102,241,0.55)",
    Icon: Siren,
    label: "PNP",
  },
  wcpd: {
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.55)",
    Icon: Siren,
    label: "WCPD",
  },
  vawc: {
    color: "#EC4899",
    glow: "rgba(236,72,153,0.55)",
    Icon: AlertTriangle,
    label: "VAWC",
  },
  dswd: {
    color: "#14B8A6",
    glow: "rgba(20,184,166,0.55)",
    Icon: Ambulance,
    label: "DSWD",
  },
  fire: {
    color: "#F97316",
    glow: "rgba(249,115,22,0.55)",
    Icon: Flame,
    label: "Fire",
  },
  rescue: {
    color: "#10B981",
    glow: "rgba(16,185,129,0.55)",
    Icon: Ambulance,
    label: "Rescue",
  },
  emergency: {
    color: "#EF4444",
    glow: "rgba(239,68,68,0.55)",
    Icon: AlertTriangle,
    label: "Emergency",
  },
  disaster: {
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.55)",
    Icon: AlertTriangle,
    label: "Disaster",
  },
  // fallback for unknown types
  other: {
    color: "#64748B",
    glow: "rgba(100,116,139,0.55)",
    Icon: AlertTriangle,
    label: "Other",
  },
}

// ── Severity config — neon aura circles ──────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: {
    color: "#FF2D55",
    glow: "rgba(255,45,85,0.7)",
    aura: "rgba(255,45,85,0.25)",
    label: "Critical",
  },
  high: {
    color: "#FF9F0A",
    glow: "rgba(255,159,10,0.65)",
    aura: "rgba(255,159,10,0.22)",
    label: "High",
  },
  medium: {
    color: "#FFD60A",
    glow: "rgba(255,214,10,0.65)",
    aura: "rgba(255,214,10,0.22)",
    label: "Medium",
  },
  low: {
    color: "#30D158",
    glow: "rgba(48,209,88,0.65)",
    aura: "rgba(48,209,88,0.22)",
    label: "Low",
  },
  unassigned: {
    color: "#9CA3AF",
    glow: "rgba(156,163,175,0.5)",
    aura: "rgba(156,163,175,0.2)",
    label: "Unassigned",
  },
}

// ── Pin components ───────────────────────────────────────────────────────────

function ServicePin({ type }) {
  const cfg = SERVICE_CONFIG[type] || SERVICE_CONFIG.hospital
  const { Icon } = cfg
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: `drop-shadow(0 4px 8px ${cfg.glow})`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: cfg.color,
          border: "2.5px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 12px ${cfg.glow}, 0 2px 6px rgba(0,0,0,0.2)`,
        }}
      >
        <Icon size={18} color="white" strokeWidth={2.5} />
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `8px solid ${cfg.color}`,
          marginTop: -1,
        }}
      />
    </div>
  )
}

function IncidentPin({ severity, status }) {
  const isResolved = status === "verified" || status === "verified_pnp"
  const cfg = isResolved ? SEVERITY_CONFIG.low : SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: cfg.aura,
          boxShadow: `0 0 16px 6px ${cfg.aura}`,
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${cfg.color}`,
          boxShadow: `0 0 10px ${cfg.glow}, inset 0 0 6px ${cfg.aura}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: cfg.color,
          boxShadow: `0 0 8px ${cfg.glow}, 0 0 16px ${cfg.glow}`,
        }}
      />
    </div>
  )
}

function PopupCard({ title, subtitle, badge, badgeBg, status, extra }) {
  const statusColors = {
    pending_review: "bg-yellow-500",
    in_progress: "bg-green-500",
    verified: "bg-green-600",
    verified_pnp: "bg-green-600",
    dismissed: "bg-gray-500",
    false_report: "bg-red-600",
    spam: "bg-orange-600",
  }

  const statusLabels = {
    pending_review: "Pending",
    in_progress: "In Progress",
    verified: "Resolved",
    verified_pnp: "Verified",
    dismissed: "Dismissed",
    false_report: "False Report",
    spam: "Spam",
  }

  return (
    <div className="min-w-45 p-1">
      <p className="font-bold text-[#1f295b] text-sm leading-tight mb-1">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mb-1.5">{subtitle}</p>}
      <div className="flex flex-wrap gap-1 mb-1">
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${badgeBg}`}>{badge}</span>
        )}
        {status && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${statusColors[status] || "bg-gray-500"}`}
          >
            {statusLabels[status] || status}
          </span>
        )}
      </div>
      {extra && <p className="text-gray-400 text-[10px]">{extra}</p>}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

function MapView({ activeFilter }) {
  const [reports, setReports] = useState([])
  const [emergencyLocations, setEmergencyLocations] = useState(EMERGENCY_LOCATIONS.features)

  useEffect(() => {
    fetch(`${API_BASE}/reports/public`)
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setReports(d.reports || []))
      .catch(() => {
        /* ignore */
      })
  }, [])

  useEffect(() => {
    // Fetch emergency contacts from API and merge with defaults
    fetch(`${API_BASE}/help/contacts`)
      .then((r) => (r.ok ? r.json() : { contacts: [] }))
      .then((d) => {
        const contacts = d.contacts || []
        const apiLocations = contacts
          .filter((c) => c.location?.latitude && c.location?.longitude)
          .map((c) => ({
            properties: {
              id: c.id,
              name: c.name,
              type: c.category || "other",
              contact: c.phone || c.phone_alt || "No contact",
              lat: c.location.latitude,
              lng: c.location.longitude,
            },
          }))

        // Merge API locations with defaults (API takes precedence by id matching)
        const merged = [...EMERGENCY_LOCATIONS.features]
        apiLocations.forEach((apiLoc) => {
          const existingIndex = merged.findIndex((f) => f.properties.name === apiLoc.properties.name)
          if (existingIndex >= 0) {
            merged[existingIndex] = apiLoc
          } else {
            merged.push(apiLoc)
          }
        })

        setEmergencyLocations(merged)
      })
      .catch(() => {
        /* use defaults */
      })
  }, [])

  const SERVICE_TYPES = Object.keys(SERVICE_CONFIG)
  const SEVERITY_TYPES = ["critical", "high", "medium", "low"]

  const isServiceFilter = SERVICE_TYPES.includes(activeFilter)
  const isSeverityFilter = SEVERITY_TYPES.includes(activeFilter)
  // Anything that's not a service or severity filter is treated as a category (abuse type) filter
  const isCategoryFilter = activeFilter && !isServiceFilter && !isSeverityFilter

  const filteredLocations = emergencyLocations.filter((f) => {
    if (!activeFilter) return true
    if (isSeverityFilter || isCategoryFilter) return false
    // match exact type OR the canonical group (e.g. filter "hospital" shows "medical" too)
    const type = f.properties.type
    if (type === activeFilter) return true
    // group aliases
    const HOSPITAL_TYPES = ["hospital", "medical"]
    const POLICE_TYPES = ["police", "pnp", "wcpd"]
    const FIRE_TYPES = ["fire"]
    const RESCUE_TYPES = ["rescue", "dswd", "disaster", "emergency", "vawc"]
    if (HOSPITAL_TYPES.includes(activeFilter)) return HOSPITAL_TYPES.includes(type)
    if (POLICE_TYPES.includes(activeFilter)) return POLICE_TYPES.includes(type)
    if (FIRE_TYPES.includes(activeFilter)) return FIRE_TYPES.includes(type)
    if (RESCUE_TYPES.includes(activeFilter)) return RESCUE_TYPES.includes(type)
    return false
  })

  const filteredReports = reports.filter((r) => {
    if (!activeFilter) return true
    if (isServiceFilter) return false
    if (isCategoryFilter) return r.category === activeFilter
    return r.severity === activeFilter
  })

  return (
    <Map
      center={[125.1667, 6.1167]}
      zoom={12}
      minZoom={11}
      maxZoom={18}
      maxBounds={[124.98, 6.02, 125.32, 6.28]}
      maxBoundsViscosity={1.0}
      theme="light"
      className="h-full w-full"
      styles={{
        light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      }}
    >
      <ZoomControls />

      {filteredLocations.map((f, i) => (
        <MapMarker key={`svc-${i}`} longitude={f.properties.lng} latitude={f.properties.lat}>
          <MarkerContent>
            <ServicePin type={f.properties.type} />
          </MarkerContent>
          <MarkerTooltip>
            <span className="font-semibold">{f.properties.name}</span>
          </MarkerTooltip>
          <MarkerPopup closeButton>
            <PopupCard
              title={f.properties.name}
              subtitle={`📞 ${f.properties.contact}`}
              badge={(SERVICE_CONFIG[f.properties.type] || SERVICE_CONFIG.other).label}
              badgeBg={`bg-[${(SERVICE_CONFIG[f.properties.type] || SERVICE_CONFIG.other).color}]`}
            />
          </MarkerPopup>
        </MapMarker>
      ))}

      {filteredReports.map((report) => {
        const displaySeverity = report.status === "pending_review" ? null : report.severity
        return (
          <MapMarker key={`rpt-${report.id}`} longitude={report.location.longitude} latitude={report.location.latitude}>
            <MarkerContent>
              <IncidentPin severity={displaySeverity} status={report.status} />
            </MarkerContent>
            <MarkerTooltip>
              <span className="font-semibold">{report.title}</span>
            </MarkerTooltip>
            <MarkerPopup closeButton>
              <PopupCard
                title={report.title}
                subtitle={report.description ? report.description : "N/A"}
                badge={displaySeverity || "unassigned"}
                badgeBg={
                  displaySeverity === "critical"
                    ? "bg-red-600"
                    : displaySeverity === "high"
                      ? "bg-orange-500"
                      : displaySeverity === "medium"
                        ? "bg-amber-400"
                        : displaySeverity === "low"
                          ? "bg-green-500"
                          : "bg-gray-500"
                }
                status={report.status}
                extra={new Date(report.created_at).toLocaleDateString()}
              />
            </MarkerPopup>
          </MapMarker>
        )
      })}
    </Map>
  )
}

export default MapView
