import IncidentHeatmapView from "../../../components/IncidentHeatmapView"

function HeatmapSection({ heatPoints }) {
    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">
                Incident Heatmap
            </h2>
            <p className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mb-3">
                INTERNAL USE ONLY: Detailed per-district density
            </p>

            <div className="w-full h-60 relative rounded-lg overflow-hidden border border-blue-100">
                <IncidentHeatmapView heatPoints={heatPoints} />

                <div className="absolute bottom-3 left-3 bg-[#1e3a8a] rounded-lg p-3 w-40 shadow-lg z-998">
                    <div className="text-blue-100 text-[9px] font-bold font-['DM_Sans'] tracking-wider mb-2">
                        DENSITY INDEX
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-white text-[10px] font-medium font-['DM_Sans']">
                            Critical {">"} 15 cases
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                        <span className="text-white text-[10px] font-medium font-['DM_Sans']">
                            Warning 5-14 cases
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeatmapSection
