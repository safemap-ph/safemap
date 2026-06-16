import React, { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import AdminLayout from "../../../components/admin/AdminLayout"
import DirectoryAddDialog from "../../../components/admin/management/DirectoryAddDialog"

function AdminManagementPage() {
  const [currentTab, setCurrentTab] = useState("directory")
  const [directories, setDirectories] = useState([])
  const [categories, setCategories] = useState([])
  const [isAddDirOpen, setIsAddDirOpen] = useState(false)

  useEffect(() => {
    async function load() {
      // minimal loader to keep UI consistent; real loader elsewhere
      setDirectories([])
      setCategories([])
    }
    load()
  }, [])

  const handleAddDirectory = async (data) => {
    setDirectories((prev) => [data, ...prev])
    setIsAddDirOpen(false)
  }

  const handleDeleteDirectory = async (id) => {
    setDirectories((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <AdminLayout activeTab="management">
      <div className="w-full max-w-sm px-4 mb-4">
        <h1 className="text-zinc-800 text-xl font-extrabold">Directory Management</h1>
      </div>

      <div className="w-full max-w-sm px-4 pb-20 space-y-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-slate-600">Preview mode: management UI simplified for compilation.</p>
        </div>
      </div>

      <DirectoryAddDialog isOpen={isAddDirOpen} onClose={() => setIsAddDirOpen(false)} onAdd={handleAddDirectory} />
    </AdminLayout>
  )
}

export default AdminManagementPage
