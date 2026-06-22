import { useState } from 'react'
import MapView from '@/components/MapView'
import RiskLegend from '@/components/RiskLegend'
import BottomNav from '@/components/BottomNav'

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState(null)

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Map + overlays container */}
      <div className="flex-1 relative">
        {/* Fullscreen map */}
        <div className="absolute inset-0">
          <MapView activeFilter={activeFilter} />
        </div>

        {/* Legend overlay — inside relative container so absolute positioning works */}
        <RiskLegend onFilterChange={setActiveFilter} activeFilter={activeFilter} />
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  )
}
