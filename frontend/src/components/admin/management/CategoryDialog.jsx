import { useEffect, useState } from "react"
import { X, Tag, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { API_BASE } from "@/lib/api-base"

const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export default function CategoryDialog({ isOpen, onClose, onSave, editCategory }) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    priority: "medium",
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setFormData({
          name: editCategory.name || "",
          label: editCategory.label || editCategory.name || "",
          description: editCategory.description || editCategory.desc || "",
          priority: editCategory.priority?.toLowerCase().replace(" priority", "") || "medium",
        })
      } else {
        setFormData({ name: "", label: "", description: "", priority: "medium" })
      }
      setErrors({})
      setSubmitError("")
    }
  }, [isOpen, editCategory])

  if (!isOpen) return null

  const validate = () => {
    const next = {}
    if (!formData.label.trim()) next.label = "Label is required."
    if (!formData.name.trim()) next.name = "Name (key) is required."
    else if (!/^[a-z0-9_]+$/.test(formData.name.trim()))
      next.name = "Only lowercase letters, numbers, and underscores."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError("")

    const token = localStorage.getItem("token")
    const isEdit = !!editCategory
    const url = isEdit
      ? `${API_BASE}/reports/categories/${editCategory.id}`
      : `${API_BASE}/reports/categories`
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          label: formData.label.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      onSave(data)
      onClose()
    } catch (err) {
      setSubmitError(err.message || "Failed to save. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-generate name key from label
  const handleLabelChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      label: val,
      // Only auto-fill name if not editing and user hasn't manually changed it
      ...(!editCategory && { name: val.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }),
    }))
    setErrors((prev) => ({ ...prev, label: undefined, name: undefined }))
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-[680px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white p-5 text-center relative border-b border-slate-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Tag className="text-[#1f295b] w-6 h-6" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold font-['DM_Sans'] tracking-wide">
            {editCategory ? "Edit Category" : "New Category"}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {editCategory ? "Update an existing report category" : "Add a new incident report category"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
              Display Label *
            </label>
            <input
              type="text"
              placeholder="e.g. Sexual Assault"
              value={formData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
            />
            <p className="text-slate-400 text-xs mt-2 font-medium font-['DM_Sans']">
              The category name/key is generated automatically from the label.
            </p>
            {errors.label && <p className="text-[10px] text-red-600 font-medium mt-1">{errors.label}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <Select value={formData.priority} onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-full h-12 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 bg-white focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="z-[100000] w-full min-w-full">
                {PRIORITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
              Description
              <span className="ml-1 text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Brief description of this category..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm resize-none"
            />
          </div>

          {submitError && (
            <p className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1f295b] text-white py-3.5 rounded-xl font-bold font-['DM_Sans'] shadow-md shadow-[#1f295b]/30 hover:bg-[#151c3d] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : editCategory ? (
              "Save Changes"
            ) : (
              "Add Category"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
