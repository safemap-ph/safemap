import { CheckCircle, XCircle, Edit2, LogIn, Shield, AlertTriangle, FileText, Clock } from "lucide-react"

export const AUDIT_TYPES = {
    submitted: { icon: FileText, bg: "bg-purple-50", iconColor: "text-purple-500", label: "SUBMITTED", labelBg: "bg-purple-100", labelText: "text-purple-600" },
    pending: { icon: Clock, bg: "bg-yellow-50", iconColor: "text-yellow-500", label: "PENDING", labelBg: "bg-yellow-100", labelText: "text-yellow-600" },
    approved: { icon: CheckCircle, bg: "bg-green-50", iconColor: "text-green-500", label: "APPROVAL", labelBg: "bg-green-100", labelText: "text-green-600" },
    dismissed: { icon: XCircle, bg: "bg-red-50", iconColor: "text-red-500", label: "DISMISSAL", labelBg: "bg-red-100", labelText: "text-red-500" },
    verified: { icon: Shield, bg: "bg-blue-50", iconColor: "text-blue-600", label: "PNP_VERIFY", labelBg: "bg-blue-100", labelText: "text-blue-700" },
    modified: { icon: Edit2, bg: "bg-slate-100", iconColor: "text-gray-500", label: "META_UPDATE", labelBg: "bg-gray-100", labelText: "text-gray-500" },
    login: { icon: LogIn, bg: "bg-indigo-50", iconColor: "text-indigo-500", label: "AUTH_EVENT", labelBg: "bg-indigo-100", labelText: "text-indigo-600" },
    flagged: { icon: AlertTriangle, bg: "bg-amber-50", iconColor: "text-amber-500", label: "FLAGGED", labelBg: "bg-amber-100", labelText: "text-amber-600" },
}

function formatTime(dateStr) {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

function AuditTimeline({ groupedEntries, loading }) {
    if (loading) {
        return <div className="text-center py-12 text-gray-400 text-sm font-['DM_Sans']">Loading audit logs...</div>
    }

    if (Object.keys(groupedEntries).length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-300 text-4xl mb-3">📝</div>
                <div className="text-gray-400 text-sm font-['DM_Sans']">No audit entries found</div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm px-4 mt-5 space-y-5">
            {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-wider whitespace-nowrap">
                            {date}
                        </div>
                        <div className="flex-1 h-[1px] bg-gray-200" />
                    </div>

                    <div className="w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-gray-100 p-5">
                        <div className="relative pl-7 border-l-[2px] border-gray-200 space-y-6">
                            {entries.map((entry) => {
                                const typeInfo = AUDIT_TYPES[entry.type] || AUDIT_TYPES.modified
                                const Icon = typeInfo.icon

                                return (
                                    <div key={entry.id} className="relative">
                                        <div className={`w-8 h-8 ${typeInfo.bg} rounded-full flex items-center justify-center absolute -left-[43px] -top-1 border-[4px] border-white`}>
                                            <Icon className={`w-3.5 h-3.5 ${typeInfo.iconColor}`} />
                                        </div>

                                        <div className="flex flex-col -mt-1">
                                            <div className="text-zinc-800 text-[12px] font-semibold font-['DM_Sans'] leading-tight">
                                                {entry.description}
                                            </div>

                                            {entry.notes && (
                                                <div className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mt-1 line-clamp-2 italic">
                                                    "{entry.notes}"
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-gray-400 text-[10px] font-normal font-['DM_Sans']">
                                                    {formatTime(entry.timestamp)}
                                                </span>
                                                <span className={`px-1.5 py-0.5 ${typeInfo.labelBg} ${typeInfo.labelText} text-[8px] font-bold font-['DM_Sans'] rounded tracking-wider`}>
                                                    {typeInfo.label}
                                                </span>
                                                {entry.reviewedBy && (
                                                    <span className="text-gray-400 text-[9px] font-medium font-['DM_Sans']">
                                                        by {entry.reviewedBy}
                                                    </span>
                                                )}
                                                {entry.category && (
                                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold font-['DM_Sans'] rounded uppercase">
                                                        {entry.category?.replace("_", " ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AuditTimeline
