import { Search, Shield, Mail, Edit2, AlertCircle } from "lucide-react"
import { useMemo, useState } from "react"

function StaffManagement({ staffList }) {
  const sortedStaff = useMemo(() => {
    const list = Array.isArray(staffList) ? staffList.slice() : []

    const getKey = (s) =>
      s?.created_at ??
      s?.createdAt ??
      s?.joined_at ??
      s?.joinedAt ??
      s?.hireDate ??
      s?.hired_at ??
      s?.id ??
      s?.empId ??
      null

    const parseVal = (v) => {
      if (v == null) return null
      if (typeof v === "number") return v
      if (typeof v === "string") {
        const t = Date.parse(v)
        if (!isNaN(t)) return t
        const n = Number(v)
        if (!isNaN(n)) return n
        const digits = Number(v.replace(/\D/g, ""))
        return isNaN(digits) ? null : digits
      }
      return null
    }

    return list.sort((a, b) => {
      const va = parseVal(getKey(a))
      const vb = parseVal(getKey(b))
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      return vb - va // descending: newest first
    })
  }, [staffList])

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const availableRoles = useMemo(() => {
    const roles = new Set()
    ;(Array.isArray(staffList) ? staffList : []).forEach((s) => s?.role && roles.add(s.role))
    return Array.from(roles)
  }, [staffList])

  const filteredStaff = useMemo(() => {
    return sortedStaff.filter((s) => {
      if (statusFilter !== "all" && (s.status || "").toUpperCase() !== statusFilter) return false
      if (roleFilter !== "all" && (s.role || "") !== roleFilter) return false
      if (!query) return true
      const q = query.toLowerCase()
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        String(s.empId || s.id || "")
          .toLowerCase()
          .includes(q) ||
        (s.role || "").toLowerCase().includes(q)
      )
    })
  }, [sortedStaff, query, statusFilter, roleFilter])

  return (
    <div className="w-full max-w-sm px-4 mt-10">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans']">Staff Management</h2>
        <button className="h-7 px-3 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-lg text-white text-[10px] font-bold font-['DM_Sans'] flex items-center justify-center">
          + Add New Staff
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1 h-10 bg-white rounded-xl border border-gray-100 flex items-center px-4 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search by name, email, role or ID..."
              className="flex-1 bg-transparent border-none outline-none ml-2 text-zinc-800 text-[11px] font-normal font-['DM_Sans'] placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => {
              setQuery("")
              setStatusFilter("all")
              setRoleFilter("all")
            }}
            className="h-10 px-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600"
          >
            Clear
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-700"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs font-bold font-['DM_Sans']">No staff found</p>
          </div>
        ) : (
          filteredStaff.map((staff, idx) => (
            <div
              key={staff.id ?? staff.empId ?? idx}
              className="w-full bg-white rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border-l-4 border-[#1e3a8a] p-4 flex flex-col pt-3 relative"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 text-[9px] font-bold font-['DM_Sans'] uppercase tracking-wider">
                  ID: {filteredStaff.length - idx}
                  {staff.empId ? ` • ${staff.empId}` : ""}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[8px] font-bold font-['DM_Sans'] uppercase tracking-widest ${staff.status === "ACTIVE" ? "bg-blue-50 text-[#1e3a8a]" : "bg-gray-100 text-gray-500"}`}
                >
                  {staff.status}
                </span>
              </div>

              <h3 className="text-[#1e3a8a] text-[15px] font-extrabold font-['DM_Sans'] mb-2.5">{staff.name}</h3>

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
          ))
        )}
      </div>
    </div>
  )
}

export default StaffManagement
