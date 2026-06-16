function AuditFeedPreview({ events }) {
    return (
        <div className="w-full max-w-sm px-4 mt-8">
            <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] mb-4">
                Audit Feed
            </h2>

            <div className="w-full bg-white rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-5">
                <div className="relative pl-6 border-l-[1.5px] border-gray-100/80 space-y-6">
                    {events.map((event, idx) => (
                        <div key={idx} className="relative">
                            {/* Vertical Line Connector Circle */}
                            <div
                                className={`absolute -left-7.75 -top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${event.iconBg}`}>
                                <event.icon
                                    className={`w-3 h-3 ${event.iconColor}`}
                                />
                            </div>

                            <div className="-mt-1">
                                <div className="text-zinc-800 text-xs font-bold font-['DM_Sans'] leading-tight mb-1 wrap-break-word pr-2">
                                    {event.description}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 text-[9px] font-medium font-['DM_Sans'] uppercase tracking-wider">
                                        {event.time}
                                    </span>
                                    {event.tag && (
                                        <span className="text-gray-400 text-[8px] font-bold font-['DM_Sans'] uppercase tracking-wider">
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
