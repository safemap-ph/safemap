import IncidentHeatmapView from "../../../components/IncidentHeatmapView"

function HeatmapSection({ heatPoints }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">Incident Heatmap</h2>
      <p className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mb-3">
        INTERNAL USE ONLY: Detailed per-district density
      </p>

      <div className="w-full h-[450px] relative rounded-lg overflow-hidden border border-blue-100">
        <IncidentHeatmapView heatPoints={heatPoints} />
      </div>
    </div>
  )
}

export default HeatmapSection
