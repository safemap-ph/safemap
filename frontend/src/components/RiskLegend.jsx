import { useState, useEffect } from "react"
import { Hospital, Siren, Flame, Ambulance, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { API_BASE } from "@/lib/api-base"

const services = [
  {
    type: "hospital",
    Icon: Hospital,
    bg: "bg-[#0EA5E9]",
    label: "Hospital",
    activeBg: "bg-sky-50 border-sky-200",
  },
  {
    type: "police",
    Icon: Siren,
    bg: "bg-[#6366F1]",
    label: "Police",
    activeBg: "bg-indigo-50 border-indigo-200",
  },
  {
    type: "fire",
    Icon: Flame,
    bg: "bg-[#F97316]",
    label: "Fire / BFP",
    activeBg: "bg-orange-50 border-orange-200",
  },
  {
    type: "rescue",
    Icon: Ambulance,
    bg: "bg-[#10B981]",
    label: "Rescue",
    activeBg: "bg-emerald-50 border-emerald-200",
  },
]

// Fallback list shown while loading or if the API is unreachable
const FALLBACK_ABUSE_TYPES = [
  { key: "sexual_assault",    label: "Sexual Assault" },
  { key: "physical_abuse",    label: "Physical Abuse" },
  { key: "domestic_violence", label: "Domestic Violence" },
  { key: "stalking",          label: "Stalking" },
  { key: "verbal_abuse",      label: "Verbal Abuse" },
  { key: "emotional_abuse",   label: "Emotional Abuse" },
]

function FilterChip({ active, activeBg, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
        active
          ? `${activeBg} text-slate-800 shadow-sm`
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}

function RiskLegend({ onFilterChange, activeFilter }) {
  const [open, setOpen] = useState(false)
  const [abuseTypes, setAbuseTypes] = useState(FALLBACK_ABUSE_TYPES)

  useEffect(() => {
    fetch(`${API_BASE}/reports/categories`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const cats = data?.categories
        if (Array.isArray(cats) && cats.length > 0) {
          setAbuseTypes(
            cats
              .filter((c) => c.is_active !== false)
              .map((c) => ({
                key: c.name,
                label: c.label || c.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              }))
          )
        }
      })
      .catch(() => {
        // keep fallback list on network error
      })
  }, [])

  const toggle = (type) => onFilterChange(activeFilter === type ? null : type)

  return (
    <div className="absolute top-4 left-4 z-500 w-50">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">
          {/* Header */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition-colors">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Legend</span>
              <ChevronDown
                className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", open && "rotate-180")}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-3">
              {/* Services */}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Services</p>
                <div className="flex flex-col gap-1">
                  {services.map(({ type, Icon, bg, label, activeBg }) => (
                    <FilterChip
                      key={type}
                      active={activeFilter === type}
                      activeBg={activeBg}
                      onClick={() => toggle(type)}
                    >
                      <span className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0", bg)}>
                        <Icon size={11} className="text-white" strokeWidth={2.5} />
                      </span>
                      {label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Abuse Types — fetched from backend */}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Abuse Type</p>
                <div className="flex flex-col gap-1">
                  {abuseTypes.map(({ key, label }) => (
                    <FilterChip
                      key={key}
                      active={activeFilter === key}
                      activeBg="bg-slate-100 border-slate-300"
                      onClick={() => toggle(key)}
                    >
                      {label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {activeFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => onFilterChange(null)}
                >
                  Clear filter
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

export default RiskLegend
