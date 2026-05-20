import { useNavigate } from "react-router-dom"
import reportAnonQAImg from "/src/assets/images/QA_report.svg"
import aiAsstQAImg from "/src/assets/images/QA_AI.svg"
import emergencyQAImg from "/src/assets/images/QA_emergency.svg"

function QuickActions({
  showQuickActions,
  setShowQuickActions,
  qaPosition,
  setQaPosition,
  isDraggingQA,
  setIsDraggingQA,
  dragOffset,
  setDragOffset,
  dragStartPos,
  setDragStartPos,
  onEmergencyClick,
  onAIChatClick,
}) {
  const navigate = useNavigate()

  const handleQADragStart = (e) => {
    setIsDraggingQA(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDragOffset({ x: clientX, y: clientY })
    setDragStartPos({ x: clientX, y: clientY })
  }

  const handleQADragMove = (e) => {
    if (!isDraggingQA) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const deltaX = clientX - dragOffset.x
    const deltaY = clientY - dragOffset.y

    // Update position - can move freely in any direction
    setQaPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))
    setDragOffset({ x: clientX, y: clientY })
  }

  const handleQADragEnd = () => {
    setIsDraggingQA(false)
    setDragOffset({ x: 0, y: 0 })
    setDragStartPos({ x: 0, y: 0 })
  }

  // Show button to reveal quick actions when hidden
  if (!showQuickActions) {
    return (
      <button
        className="fixed z-1001 flex flex-col items-center gap-1 bg-white px-4 py-2 rounded-full shadow-lg"
        style={{ left: "50%", bottom: "90px", transform: "translateX(-50%)" }}
        onClick={() => {
          setShowQuickActions(true)
          setQaPosition({ x: 0, y: 0 })
        }}
      >
        <span className="text-xs text-gray-600 font-medium">Show Quick Actions</span>
      </button>
    )
  }

  return (
    <div
      className="fixed z-1000 w-[90%] max-w-sm touch-none cursor-grab active:cursor-grabbing quick-actions-mobile"
      tabIndex={-1}
      onKeyDown={(e) => e.preventDefault()}
      style={{
        left: `calc(40% + ${qaPosition.x}px)`,
        bottom: `calc(90px + ${-qaPosition.y}px)`,
      }}
      onMouseDown={handleQADragStart}
      onMouseMove={handleQADragMove}
      onMouseUp={handleQADragEnd}
      onMouseLeave={handleQADragEnd}
      onTouchStart={handleQADragStart}
      onTouchMove={handleQADragMove}
      onTouchEnd={handleQADragEnd}
    >
      <div className="bg-white rounded-[20px] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Drag Handle */}
        <div
          className="w-10 h-1 mx-auto mt-4 bg-gray-300 rounded-sm cursor-pointer"
          onClick={() => setShowQuickActions(false)}
          tabIndex={-1}
          onKeyDown={(e) => e.preventDefault()}
        />
        <div className="px-5 pt-2 pb-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-bold text-zinc-800 font-['DM_Sans'] tracking-tight">Quick Actions</div>
            <div className="inline-flex items-center gap-1.5">
              <span className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">Live Updates</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex justify-around">
            {/* Track Report */}
            <button className="flex flex-col items-center gap-2" onClick={() => navigate("/track")}>
              <div className="w-24 h-24 px-2.5 py-3 bg-white rounded-2xl flex flex-col justify-start items-center gap-2.5">
                <div className="w-10 h-10 p-2 bg-blue-50 rounded-[20px] flex items-center justify-center">
                  <img src={reportAnonQAImg} alt="Track" className="w-8 h-8" />
                </div>
                <span className="text-neutral-600 text-xs font-semibold font-['DM_Sans'] tracking-tight">
                  Track Report
                </span>
              </div>
            </button>
            {/* Emergency */}
            <button className="flex flex-col items-center gap-2" onClick={onEmergencyClick}>
              <div className="w-24 h-24 px-3.5 py-3 bg-white rounded-2xl flex flex-col justify-start items-center gap-2.5">
                <div className="w-10 h-10 p-2 bg-red-100 rounded-[20px] flex items-center justify-center">
                  <img src={emergencyQAImg} alt="Emergency" className="w-8 h-8" />
                </div>
                <span className="text-red-500 text-xs font-semibold font-['DM_Sans'] tracking-tight">Emergency</span>
              </div>
            </button>
            {/* AI Assistant */}
            <button className="flex flex-col items-center gap-2" onClick={onAIChatClick}>
              <div className="w-24 h-24 px-3 py-3 bg-white rounded-2xl flex flex-col justify-start items-center gap-2.5">
                <div className="w-10 h-10 p-2 bg-blue-50 rounded-[20px] flex items-center justify-center">
                  <img src={aiAsstQAImg} alt="AI" className="w-8 h-8" />
                </div>
                <span className="text-neutral-600 text-xs font-semibold font-['DM_Sans'] tracking-tight">
                  AI Assistant
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickActions
