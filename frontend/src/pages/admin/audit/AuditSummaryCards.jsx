import { CheckCircle, XCircle, Shield, FileText, Clock } from "lucide-react"

function AuditSummaryCards({ stats }) {
    return (
        <div className="w-full max-w-sm px-4 mt-4">
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-extrabold font-['DM_Sans'] text-purple-600">
                        {stats.submissions ?? 0}
                    </div>
                    <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                        Submitted
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-lg font-extrabold font-['DM_Sans'] text-yellow-600">
                        {stats.pending ?? 0}
                    </div>
                    <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                        Pending
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-extrabold font-['DM_Sans'] text-green-600">
                        {stats.approvals ?? 0}
                    </div>
                    <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                        Approved
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <div className="text-lg font-extrabold font-['DM_Sans'] text-red-500">
                        {stats.dismissals ?? 0}
                    </div>
                    <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                        Dismissed
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <Shield className="w-5 h-5 text-[#1e3a8a] mx-auto mb-1" />
                    <div className="text-lg font-extrabold font-['DM_Sans'] text-[#1e3a8a]">
                        {stats.verifications ?? 0}
                    </div>
                    <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                        Verified
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditSummaryCards
