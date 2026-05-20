import { Search, Shield, Mail, Edit2, AlertCircle } from "lucide-react"
import { useMemo, useState } from "react"

function StaffManagement({ staffList }) {
  return (
    <div className="w-full max-w-sm px-4 mt-10">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans']">Staff Management</h2>
        <button className="h-7 px-3 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-lg text-white text-[10px] font-bold font-['DM_Sans'] flex items-center justify-center">
          + Add New Staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full h-10 bg-white rounded-xl border border-gray-100 flex items-center px-4 mb-4 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search staff members..."
          className="flex-1 bg-transparent border-none outline-none ml-2 text-zinc-800 text-[11px] font-normal font-['DM_Sans'] placeholder-gray-400"
        />
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {staffList.map((staff, idx) => (
          <div
            key={idx}
            className="w-full bg-white rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border-l-4 border-[#1e3a8a] p-4 flex flex-col pt-3 relative"
          >
            {/* ID & Status */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-[9px] font-bold font-['DM_Sans'] uppercase tracking-wider">
                {staff.empId}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[8px] font-bold font-['DM_Sans'] uppercase tracking-widest ${staff.status === "ACTIVE" ? "bg-blue-50 text-[#1e3a8a]" : "bg-gray-100 text-gray-500"}`}
              >
                {staff.status}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-[#1e3a8a] text-[15px] font-extrabold font-['DM_Sans'] mb-2.5">{staff.name}</h3>

            {/* Details */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 text-[10px] font-medium font-['DM_Sans']">{staff.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 text-[10px] font-medium font-['DM_Sans']">{staff.email}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 h-7 bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg flex items-center justify-center gap-1.5 border-none cursor-pointer text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans']">
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button className="flex-1 h-7 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-center justify-center gap-1.5 border-none cursor-pointer text-red-500 text-[10px] font-bold font-['DM_Sans']">
                <AlertCircle className="w-3 h-3" />
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaffManagement
