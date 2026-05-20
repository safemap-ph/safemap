import { CheckCircle, XCircle, Shield, FileText, Clock } from "lucide-react"
import Skeleton from "@/components/ui/Skeleton"

function AuditSummaryCards({ stats, loading = false }) {
  const renderValue = (value, className) => {
    if (loading) return <Skeleton className="h-5 w-10 mx-auto" />
    return <div className={className}>{value ?? 0}</div>
  }

  return (
    <div className="w-full max-w-sm px-4 mt-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          {renderValue(stats.submissions, "text-lg font-extrabold font-['DM_Sans'] text-purple-600")}
          <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">Submitted</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          {renderValue(stats.pending, "text-lg font-extrabold font-['DM_Sans'] text-yellow-600")}
          <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
          {renderValue(stats.approvals, "text-lg font-extrabold font-['DM_Sans'] text-green-600")}
          <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">Approved</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          {renderValue(stats.dismissals, "text-lg font-extrabold font-['DM_Sans'] text-red-500")}
          <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">Dismissed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
          {renderValue(stats.verifications, "text-lg font-extrabold font-['DM_Sans'] text-green-600")}
          <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">Verified</div>
        </div>
      </div>
    </div>
  )
}

export default AuditSummaryCards
