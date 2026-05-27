import { Shield, Clock, CheckCircle, XCircle } from "lucide-react"

// Placeholder events for demo when no real events are passed
const DEMO_EVENTS = [
  {
    description: "Report SF-0142 approved and escalated to in-progress.",
    time: "2m ago",
    tag: "APPROVED",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: CheckCircle,
  },
  {
    description: "Report SF-0138 dismissed — duplicate entry.",
    time: "1h ago",
    tag: "DISMISSED",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    icon: XCircle,
  },
  {
    description: "System maintenance window logged.",
    time: "3h ago",
    tag: "SYSTEM",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: Shield,
  },
  {
    description: "SLA warning triggered for Report SF-0130.",
    time: "5h ago",
    tag: "SLA",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Clock,
  },
]

function AuditFeedPreview({ events }) {
  const items = (events && events.length > 0) ? events : DEMO_EVENTS

  return (
    <div className="w-full">
      <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] mb-3">Recent Audit Feed</h2>
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative pl-5 border-l-[1.5px] border-gray-100 space-y-5">
          {items.map((event, idx) => (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-7 -top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${event.iconBg}`}
              >
                <event.icon className={`w-2.5 h-2.5 ${event.iconColor}`} />
              </div>
              <div className="-mt-1">
                <div className="text-zinc-700 text-xs font-semibold font-['DM_Sans'] leading-tight mb-1 break-words pr-2">
                  {event.description}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[9px] font-medium font-['DM_Sans'] uppercase tracking-wider">
                    {event.time}
                  </span>
                  {event.tag && (
                    <span className="text-gray-400 text-[8px] font-bold font-['DM_Sans'] uppercase tracking-wider border border-gray-200 rounded px-1">
                      {event.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuditFeedPreview
