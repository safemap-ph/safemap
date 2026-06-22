import { useState, useEffect } from "react"
import {
    Search,
    Map,
    Trash2,
    Filter,
    Plus,
    Send,
    Settings2,
    Activity,
    Tag,
    Shield,
} from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"
import DirectoryAddDialog from "../../../components/admin/management/DirectoryAddDialog"

function AdminManagementPage() {
    // Top-level tab state
    const [currentTab, setCurrentTab] = useState("directory") // "directory" or "category"

    // Directory State
    const [directories, setDirectories] = useState([])
    const [dirSearch, setDirSearch] = useState("")
    const [isAddDirOpen, setIsAddDirOpen] = useState(false)

    // Category State
    const [categories, setCategories] = useState([])
    const [catSearch, setCatSearch] = useState("")

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    })

    const handleDeleteDirectory = async id => {
        if (!confirm("Are you sure you want to delete this contact?")) return
        try {
            const res = await fetch(
                `http://localhost:5000/api/help/contacts/${id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                },
            )
            if (res.ok) {
                setDirectories(directories.filter(d => d.id !== id))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteCategory = async id => {
        if (!confirm("Are you sure you want to delete this category?")) return
        try {
            const res = await fetch(
                `http://localhost:5000/api/reports/categories/${id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                },
            )
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id))
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleAddDirectory = async data => {
        try {
            const res = await fetch("http://localhost:5000/api/help/contacts", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            })
            if (res.ok) {
                const result = await res.json()
                setDirectories([result.contact, ...directories])
                setIsAddDirOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddCategory = async () => {
        const name = prompt("Enter category name (e.g. child_abuse):")
        if (!name) return
        const label = prompt("Enter category label (e.g. Child Abuse):")
        if (!label) return

        try {
            const res = await fetch(
                "http://localhost:5000/api/reports/categories",
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ name, label, priority: "medium" }),
                },
            )
            if (res.ok) {
                const newCat = await res.json()
                setCategories([newCat, ...categories])
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleEditDirectory = async dir => {
        const name = prompt("Edit contact name:", dir.name)
        if (!name) return
        const phone = prompt("Edit phone number:", dir.phone)
        if (!phone) return
        const location = prompt("Edit location address:", dir.location)
        if (!location) return

        try {
            const res = await fetch(
                `http://localhost:5000/api/help/contacts/${dir.id}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ name, phone, location }),
                },
            )
            if (res.ok) {
                const result = await res.json()
                setDirectories(
                    directories.map(d =>
                        d.id === dir.id ? result.contact : d,
                    ),
                )
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleEditCategory = async cat => {
        const label = prompt("Edit category label:", cat.label)
        if (!label) return
        const priority = prompt(
            "Edit priority (low, medium, high, critical):",
            cat.priority,
        )
        if (!priority) return

        try {
            const res = await fetch(
                `http://localhost:5000/api/reports/categories/${cat.id}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ label, priority }),
                },
            )
            if (res.ok) {
                const updatedCat = await res.json()
                setCategories(
                    categories.map(c => (c.id === cat.id ? updatedCat : c)),
                )
            }
        } catch (err) {
            console.error(err)
        }
    }

    const loadData = async () => {
        // Fallback mock data arrays matching backend structure
        const mockDirectories = [
            {
                id: 1,
                name: "Gensan Medical Center",
                phone: "887-9898",
                type: "hospital",
                location: "General Santos City",
                latitude: 6.0828,
                longitude: 125.1481,
                is_active: true,
            },
            {
                id: 2,
                name: "GSC Police Office",
                phone: "552-5573",
                type: "police",
                location: "General Santos City",
                latitude: 6.1103,
                longitude: 125.1668,
                is_active: true,
            },
        ]

        const mockCategories = [
            {
                id: 1,
                name: "sexual_assault",
                label: "Sexual Assault",
                priority: "critical",
                is_active: true,
                report_count: 0,
            },
            {
                id: 2,
                name: "physical_abuse",
                label: "Physical Abuse",
                priority: "critical",
                is_active: true,
                report_count: 0,
            },
            {
                id: 3,
                name: "domestic_violence",
                label: "Domestic Violence",
                priority: "critical",
                is_active: true,
                report_count: 0,
            },
            {
                id: 4,
                name: "stalking",
                label: "Stalking",
                priority: "high",
                is_active: true,
                report_count: 0,
            },
            {
                id: 5,
                name: "verbal_abuse",
                label: "Verbal Abuse",
                priority: "medium",
                is_active: true,
                report_count: 0,
            },
            {
                id: 6,
                name: "emotional_abuse",
                label: "Emotional Abuse",
                priority: "medium",
                is_active: true,
                report_count: 0,
            },
            {
                id: 7,
                name: "other",
                label: "Other",
                priority: "low",
                is_active: true,
                report_count: 0,
            },
        ]

        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        try {
            // Attempt to fetch from backend
            const dirRes = await fetch(
                "http://localhost:5000/api/help/contacts",
                { headers },
            )
            const catRes = await fetch(
                "http://localhost:5000/api/reports/categories",
                { headers },
            )

            if (dirRes.ok && catRes.ok) {
                const dirData = await dirRes.json()
                const catData = await catRes.json()

                setDirectories(dirData.contacts || mockDirectories)
                setCategories(catData.categories || mockCategories)
                return
            }
        } catch (error) {
            console.error("Management fetch failed, using fallback:", error)
        }
        setDirectories(mockDirectories)
        setCategories(mockCategories)
    }

    return (
        <AdminLayout activeTab="management">
            {/* Header Area */}
            <div className="w-full max-w-sm px-4 mb-4">
                <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-sm mb-4 border border-slate-200">
                    <button
                        onClick={() => setCurrentTab("directory")}
                        className={`flex-1 py-2 text-xs font-bold font-['DM_Sans'] rounded-lg transition-all ${
                            currentTab === "directory"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:bg-slate-200/50"
                        }`}>
                        Directory
                    </button>
                    <button
                        onClick={() => setCurrentTab("category")}
                        className={`flex-1 py-2 text-xs font-bold font-['DM_Sans'] rounded-lg transition-all ${
                            currentTab === "category"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:bg-slate-200/50"
                        }`}>
                        Category & Tag
                    </button>
                </div>
                <h1 className="text-zinc-800 text-xl font-extrabold font-['DM_Sans']">
                    {currentTab === "directory"
                        ? "Directory Management"
                        : "Category & Tag Management"}
                </h1>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-sm px-4 pb-20 space-y-5">
                {currentTab === "directory" && (
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100">
                            <h3 className="text-slate-400 text-xs font-bold font-['DM_Sans'] mb-3">
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setIsAddDirOpen(true)}
                                    className="w-full bg-[#1f295b] text-white py-3 rounded-xl font-bold text-sm font-['DM_Sans'] shadow-sm hover:bg-[#151c3d] transition-colors">
                                    New Entry
                                </button>
                                <button className="w-full bg-white text-[#1f295b] py-3 rounded-xl font-bold text-sm font-['DM_Sans'] border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.05)] border border-slate-100">
                                <div className="text-slate-400 text-[9px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1">
                                    Total Contacts
                                </div>
                                <div className="text-[#1f295b] text-xl font-extrabold font-['DM_Sans']">
                                    {directories.length}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.05)] border border-slate-100">
                                <div className="text-slate-400 text-[9px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1">
                                    Active Categories
                                </div>
                                <div className="text-[#1f295b] text-xl font-extrabold font-['DM_Sans']">
                                    {categories.length}
                                </div>
                            </div>
                        </div>

                        {/* Categories Box */}
                        <div className="bg-white rounded-2xl shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100">
                                <h3 className="text-slate-400 text-xs font-bold font-['DM_Sans']">
                                    Service Categories
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-50 rounded-md text-[#1f295b]">
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-[#1f295b] font-bold text-sm font-['DM_Sans']">
                                            Emergency
                                        </span>
                                    </div>
                                    <span className="px-2 py-1 bg-[#1f295b] text-white text-[10px] font-bold rounded-full">
                                        12
                                    </span>
                                </div>
                                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-50 rounded-md text-[#1f295b]">
                                            <Activity size={16} />
                                        </div>
                                        <span className="text-[#1f295b] font-bold text-sm font-['DM_Sans']">
                                            Medical
                                        </span>
                                    </div>
                                    <span className="text-slate-500 text-xs font-medium">
                                        08
                                    </span>
                                </div>
                                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-50 rounded-md text-[#1f295b]">
                                            <Settings2 size={16} />
                                        </div>
                                        <span className="text-[#1f295b] font-bold text-sm font-['DM_Sans']">
                                            Social Svcs
                                        </span>
                                    </div>
                                    <span className="text-slate-500 text-xs font-medium">
                                        24
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search by name, number, or location..."
                                value={dirSearch}
                                onChange={e => setDirSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium font-['DM_Sans'] outline-none focus:border-[#1f295b] shadow-[0px_8px_24px_rgba(149,157,165,0.05)]"
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {directories.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-xs font-bold font-['DM_Sans']">
                                        No contacts found
                                    </p>
                                </div>
                            ) : (
                                directories
                                    .filter(d => {
                                        const search = dirSearch.toLowerCase()
                                        return (
                                            (
                                                d.name?.toLowerCase() || ""
                                            ).includes(search) ||
                                            (d.phone || "")
                                                .toString()
                                                .includes(search) ||
                                            (
                                                d.location?.toLowerCase() || ""
                                            ).includes(search)
                                        )
                                    })
                                    .map(dir => (
                                        <div
                                            key={`dir-${dir.id || Math.random()}`}
                                            className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100 flex flex-col relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-slate-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-wider">
                                                    ID: {dir.id}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                                                        dir.type === "hospital"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : dir.type ===
                                                                "police"
                                                              ? "bg-blue-50 text-blue-600"
                                                              : dir.type ===
                                                                  "fire"
                                                                ? "bg-orange-50 text-orange-600"
                                                                : "bg-purple-50 text-purple-600"
                                                    }`}>
                                                    {dir.type}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold font-['DM_Sans'] text-[#1f295b] mb-1">
                                                {dir.name}
                                            </h3>
                                            <p className="text-base font-bold font-['DM_Sans'] mb-3 text-blue-600">
                                                {dir.phone}
                                            </p>
                                            <div className="mb-4">
                                                <p className="text-slate-400 text-[9px] font-medium font-['DM_Sans'] mb-1">
                                                    Location Data
                                                </p>
                                                <div className="flex items-start gap-1">
                                                    <Map className="w-3 h-3 text-[#1f295b] shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[11px] font-bold font-['DM_Sans'] leading-tight text-slate-800">
                                                            {dir.location}
                                                        </p>
                                                        <p className="text-slate-400 text-[9px] font-medium mt-0.5 uppercase tracking-tighter">
                                                            LAT: {dir.latitude}{" "}
                                                            | LONG:{" "}
                                                            {dir.longitude}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-auto">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteDirectory(
                                                            dir.id,
                                                        )
                                                    }
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditDirectory(dir)
                                                    }
                                                    className="px-5 py-2 bg-[#1f295b] text-white rounded-lg text-xs font-bold font-['DM_Sans'] hover:bg-[#151c3d] transition-colors">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {currentTab === "category" && (
                    <div className="space-y-4">
                        <button
                            onClick={handleAddCategory}
                            className="bg-[#1f295b] text-white px-4 py-2 rounded-full text-[11px] font-bold font-['DM_Sans'] shadow hover:bg-[#151c3d] transition-colors">
                            + New Category
                        </button>

                        <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100 flex flex-col gap-3">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, number, or location..."
                                    value={catSearch}
                                    onChange={e => setCatSearch(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium font-['DM_Sans'] outline-none focus:border-[#1f295b]"
                                />
                            </div>
                            <button className="w-full bg-blue-50/50 text-[#1f295b] py-3 rounded-xl font-bold text-sm font-['DM_Sans'] border border-blue-50 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                                <Filter size={16} /> Filter
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {categories
                                .filter(c => {
                                    const search = catSearch.toLowerCase()
                                    return (
                                        (c.label?.toLowerCase() || "").includes(
                                            search,
                                        ) ||
                                        (c.name?.toLowerCase() || "").includes(
                                            search,
                                        )
                                    )
                                })
                                .map(cat => (
                                    <div
                                        key={`cat-${cat.id || Math.random()}`}
                                        className={`bg-white rounded-2xl p-5 shadow-[0px_8px_24px_rgba(149,157,165,0.08)] border-l-[6px] ${
                                            cat.priority === "critical"
                                                ? "border-red-500"
                                                : cat.priority === "high"
                                                  ? "border-amber-400"
                                                  : cat.priority === "low"
                                                    ? "border-slate-300"
                                                    : "border-[#1f295b]"
                                        } flex flex-col relative`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-slate-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-widest">
                                                ID: {cat.id}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold font-['DM_Sans'] uppercase ${
                                                    cat.priority === "critical"
                                                        ? "bg-red-50 text-red-600"
                                                        : cat.priority ===
                                                            "high"
                                                          ? "bg-amber-50 text-amber-600"
                                                          : cat.priority ===
                                                              "low"
                                                            ? "bg-slate-100 text-slate-500"
                                                            : "bg-blue-50 text-blue-600"
                                                }`}>
                                                {cat.priority}
                                            </span>
                                        </div>
                                        <h3 className="text-[#1f295b] text-base font-extrabold font-['DM_Sans'] mb-1">
                                            {cat.label}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-medium font-['DM_Sans'] leading-relaxed mb-3">
                                            {cat.description ||
                                                `Category for ${cat.label} incidents.`}
                                        </p>
                                        <div className="flex items-center gap-1.5 mb-4">
                                            <Tag
                                                size={11}
                                                className="text-slate-400"
                                            />
                                            <span className="text-slate-500 text-[10px] font-bold font-['DM_Sans']">
                                                {cat.report_count ?? 0} report
                                                {(cat.report_count ?? 0) !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                                                />
                                                <span className="text-[#1f295b] text-[10px] font-bold font-['DM_Sans']">
                                                    {cat.is_active
                                                        ? "ACTIVE"
                                                        : "INACTIVE"}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            cat.id,
                                                        )
                                                    }
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditCategory(cat)
                                                    }
                                                    className="p-2 bg-slate-100 text-[#1f295b] rounded-lg hover:bg-slate-200 transition-colors">
                                                    <Settings2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Global Tags */}
                        <div className="bg-white rounded-2xl shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-[#1f295b] text-sm font-bold font-['DM_Sans']">
                                        Global Tags
                                    </h3>
                                    <p className="text-slate-400 text-[9px] font-bold mt-0.5 uppercase tracking-wider">
                                        Universal Filtering Metadata
                                    </p>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-[#1f295b] text-white flex items-center justify-center hover:bg-[#151c3d] transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-50/50">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {[
                                        "Urgent \u00d7",
                                        "First-Response \u00d7",
                                        "Escalated \u00d7",
                                        "Night-Shift \u00d7",
                                        "Legal-Review \u00d7",
                                        "Verified \u00d7",
                                    ].map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 bg-white border border-blue-100 text-[#1f295b] text-xs font-semibold rounded-full shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="relative mt-2">
                                    <input
                                        type="text"
                                        placeholder="Add new tag..."
                                        className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-xs font-medium font-['DM_Sans'] outline-none focus:border-[#1f295b]"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1f295b] hover:text-blue-700">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1f295b] rounded-2xl p-5 shadow-lg border border-[#3b4b8a]">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="text-white w-4 h-4" />
                                <h3 className="text-white text-xs font-bold font-['DM_Sans'] tracking-widest uppercase">
                                    Taxonomy Insight
                                </h3>
                            </div>
                            <p className="text-[#a4b4f0] text-xs font-medium leading-relaxed mb-4">
                                Recent reporting patterns suggest a need for a{" "}
                                <span className="text-white font-bold">
                                    "Digital Conduct"
                                </span>{" "}
                                sub-category.
                            </p>
                            <button className="w-full bg-[#2a3773] text-white border border-[#4456a3] py-2.5 rounded-lg text-[11px] font-bold hover:bg-[#34458a] transition-colors">
                                GENERATE DRAFT CATEGORY
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay Dialogs could be rendered here later */}
            <DirectoryAddDialog
                isOpen={isAddDirOpen}
                onClose={() => setIsAddDirOpen(false)}
                onAdd={handleAddDirectory}
            />
        </AdminLayout>
    )
}

export default AdminManagementPage
