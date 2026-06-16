import { useState, useRef, useEffect } from 'react'
import logoImg from '/src/assets/images/Logo.svg'
import searchImg from '/src/assets/images/search.svg'

function Header({ onSearch, searchResults, searchQuery }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (searchQuery !== undefined) {
      setQuery(searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    setShowDropdown(true)
    
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSelect = (loc) => {
    setQuery(loc.name)
    setShowDropdown(false)
    if (onSearch) {
      onSearch(loc.name)
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'hospital': return '🏥'
      case 'police': return '👮'
      case 'fire': return '🚒'
      case 'rescue': return '🚑'
      default: return '📍'
    }
  }

  const results = searchResults || []

  return (
    <header className="bg-white shadow-md z-40">
      <div className="flex flex-col items-center px-4 py-3 gap-3">
        <img src={logoImg} alt="SafeMap" className="h-10 w-auto" />
        
        <div className="w-full max-w-md">
          <div className="relative">
            <img src={searchImg} alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input 
              type="text" 
              value={query}
              onChange={handleSearch}
              onFocus={() => query.length > 0 && setShowDropdown(true)}
              placeholder="Search safe zones or locations..." 
              className="w-full h-10 pl-10 pr-4 bg-gray-100 rounded-full outline-hidden"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
