import { useNavigate } from 'react-router-dom'
import reportImg from '/src/assets/images/ft_report.svg'

function ReportButton() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-1001 flex flex-col items-center">
      <button 
        onClick={() => navigate('/report')}
        className="flex flex-col items-center gap-1"
      >
        <div className="h-12 p-3 bg-blue-950 rounded-3xl shadow-[0px_4px_16px_0px_rgba(26,42,108,0.40)] outline-solid outline-[3px] outline-offset-[-3px] outline-white inline-flex justify-start items-start gap-2.5">
          <img src={reportImg} alt="Report" className="w-6 h-6" />
        </div>
        <span className="text-xs text-blue-950 font-medium bg-white px-2 py-0.5 rounded mt-1">Reports</span>
      </button>
    </div>
  )
}

export default ReportButton
