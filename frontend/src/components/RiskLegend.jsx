import { useState } from "react"
import { Hospital, Siren, Flame, Ambulance, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"

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

const severities = [
  {
    key: "critical",
    color: "#FF2D55",
    label: "Critical",
    activeBg: "bg-rose-50 border-rose-200",
  },
  {
    key: "high",
    color: "#FF9F0A",
    label: "High",
    activeBg: "bg-amber-50 border-amber-200",
  },
  {
    key: "medium",
    color: "#FFD60A",
    label: "Medium",
    activeBg: "bg-yellow-50 border-yellow-200",
  },
  {
    key: "low",
    color: "#30D158",
    label: "Low",
    activeBg: "bg-green-50 border-green-200",
  },
]

function FilterChip({ active, activeBg, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
        active ? `${activeBg} text-slate-800 shadow-sm` : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}

function RiskLegend({ onFilterChange, activeFilter }) {
    const [open, setOpen] = useState(false)

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

              {/* Severity */}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Severity</p>
                <div className="flex flex-col gap-1">
                  {severities.map(({ key, color, label, activeBg }) => (
                    <FilterChip key={key} active={activeFilter === key} activeBg={activeBg} onClick={() => toggle(key)}>
                      {/* neon aura dot */}
                      <span
                        style={{
                          position: "relative",
                          width: 14,
                          height: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: color + "33",
                            boxShadow: `0 0 6px 2px ${color}44`,
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: color,
                            boxShadow: `0 0 6px ${color}`,
                          }}
                        />
                      </span>
                      {label}
                      <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0 h-4 font-bold">
                        {key === "critical" ? "!!!" : key === "high" ? "!!" : key === "medium" ? "!" : "·"}
                      </Badge>
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
