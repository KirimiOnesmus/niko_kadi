import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMapPin, FiAlertCircle, FiX, FiChevronDown } from 'react-icons/fi'
import { BsWhatsapp } from 'react-icons/bs'
import { getCenters, checkProximity } from '../services/centerServices'
import { submitQueueReport } from '../services/queueService'

const counties = [
  'All Kenya', 'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru',
  'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
  'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta',
  'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot'
]

const getStatusColor = (status) => {
  if (!status) return 'zinc'
  const n = status.toUpperCase()
  if (n.includes('FAST') || n.includes('SHORT')) return 'emerald'
  if (n.includes('MODERATE')) return 'yellow'
  if (n.includes('LONG') || n.includes('VERY')) return 'rose'
  return 'zinc'
}

const getStatusText = (status) => status ? status.toUpperCase() : 'UNKNOWN'

const StatusBadge = ({ statusColor, status, size = 'sm' }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    yellow:  'bg-yellow-500/10  text-yellow-400  border-yellow-500/30',
    rose:    'bg-rose-500/10    text-rose-400    border-rose-500/30',
    zinc:    'bg-zinc-500/10    text-zinc-400    border-zinc-500/30',
  }
  return (
    <div className={`px-2.5 py-1 rounded-lg border ${colorMap[statusColor] ?? colorMap.zinc}`}>
      <span className={`font-black uppercase tracking-wider ${size === 'sm' ? 'text-[10px]' : 'text-sm'}`}>
        {status}
      </span>
    </div>
  )
}

const Map = () => {
  const [selectedCounty, setSelectedCounty] = useState('All Kenya')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLocationToast, setShowLocationToast] = useState(false)
  const [showCountyDropdown, setShowCountyDropdown] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [sheetExpanded, setSheetExpanded] = useState(false)

  const mapRef = useRef(null)
  const googleMapRef = useRef(null)
  const markersRef = useRef([])
  const searchTimeout = useRef(null)

 
  const fetchCenters = async (locationFilter = null) => {
    try {
      setLoading(true)
      setError(null)
      const filters = {
        county: selectedCounty !== 'All Kenya' ? selectedCounty : null,
        search: searchQuery || null,
        ...locationFilter,
      }
      const response = await getCenters(filters)
      if (response.success) {
        const transformed = response.data.map(c => ({
          id: c._id,
          name: c.name,
          location: c.location,
          county: c.county,
          constituency: c.constituency,
          lat: c.coordinates.lat,
          lng: c.coordinates.lng,
          waitTime: c.currentQueue?.waitTime || 0,
          status: getStatusText(c.currentQueue?.status || 'FAST MOVING'),
          statusColor: getStatusColor(c.currentQueue?.status || 'FAST MOVING'),
          checkedIn: c.currentQueue?.reportCount || 0,
          distance: c.distanceText || (c.distance ? `${c.distance.toFixed(1)}km` : null),
          workingHours: c.workingHours,
          address: c.address,
          landmark: c.landmark,
        }))
        setCenters(transformed)
        if (transformed.length > 0 && window.google) initMap(transformed)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load centers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude }
          setUserLocation(loc)
          setShowLocationToast(true)
          setTimeout(() => setShowLocationToast(false), 3000)
          fetchCenters(loc)
        },
        () => fetchCenters()
      )
    } else {
      fetchCenters()
    }
  }, [])

  useEffect(() => {
    fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
  }, [selectedCounty])


  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      script.onload = () => { if (centers.length > 0) initMap(centers) }
    } else if (centers.length > 0) {
      initMap(centers)
    }
  }, [centers])

  const initMap = (centersData) => {
    if (!mapRef.current || !window.google) return
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: -1.2864, lng: 36.8172 },
        zoom: userLocation ? 13 : 7,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
          { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#27272a' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09090b' }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      })
    }

    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
        title: 'Your Location',
      })
    }

    centersData.forEach(center => {
      const marker = new window.google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: center.statusColor === 'emerald' ? '#10b981' : center.statusColor === 'yellow' ? '#eab308' : '#f43f5e',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: center.name,
      })
      marker.addListener('click', () => {
        setSelectedCenter(center)
        googleMapRef.current.panTo({ lat: center.lat, lng: center.lng })
      })
      markersRef.current.push(marker)
    })

    if (centersData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      if (userLocation) bounds.extend(userLocation)
      centersData.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }))
      googleMapRef.current.fitBounds(bounds)
    }
  }

  const handleCountyChange = (county) => {
    setSelectedCounty(county)
    setShowCountyDropdown(false)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
    }, 500)
  }

  const handleSubmitReport = async (status) => {
    if (!userLocation) { alert('Please enable location to submit a report'); return }
    if (!selectedCenter) return
    try {
      setSubmittingReport(true)
      const proximity = await checkProximity(selectedCenter.id, userLocation.lat, userLocation.lng)
      if (!proximity.data.isWithinProximity) {
        alert(`You're ${proximity.data.distanceText} away.\n\nYou must be within 500m to submit a report.`)
        return
      }
      const response = await submitQueueReport({ centerId: selectedCenter.id, status, userLat: userLocation.lat, userLng: userLocation.lng })
      if (response.success) {
        alert('Queue report submitted successfully!\n\nThank you for helping others.')
        setSelectedCenter(null)
        fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
      }
    } catch (err) {
      alert(`${err.message || 'Failed to submit report. Please try again.'}`)
    } finally {
      setSubmittingReport(false)
    }
  }

  
  const sheetHeight = sheetExpanded ? 'max-h-[75vh]' : 'max-h-[42vh]'

  return (
    <div className="h-screen bg-zinc-950 relative overflow-hidden">

      
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

     
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-transparent pt-4 pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex gap-2">

           
            <div className="relative flex-1 min-w-0">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Search constituency or ward..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl sm:rounded-2xl pl-10 pr-3 py-2.5 sm:py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

          
            <div className="relative shrink-0">
              <button
                onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="h-full bg-zinc-900 border-2 border-zinc-800 hover:border-emerald-500/50 rounded-xl sm:rounded-2xl px-3 sm:px-5 text-white font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-3"
              >
                <FiMapPin className="text-emerald-400 shrink-0" size={16} />
                
                <span className="hidden sm:block max-w-[120px] truncate">{selectedCounty}</span>
                <span className="sm:hidden text-xs">{selectedCounty === 'All Kenya' ? 'County' : selectedCounty.split(' ')[0]}</span>
                <FiChevronDown className={`text-zinc-500 transition-transform shrink-0 ${showCountyDropdown ? 'rotate-180' : ''}`} size={14} />
              </button>

              {showCountyDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-zinc-900 border-2 border-zinc-800 rounded-2xl shadow-2xl max-h-72 sm:max-h-96 overflow-y-auto z-50">
                  {counties.map((county) => (
                    <button
                      key={county}
                      onClick={() => handleCountyChange(county)}
                      className={`w-full text-left px-4 sm:px-5 py-2 font-bold text-xs sm:text-sm transition-all first:rounded-t-2xl last:rounded-b-2xl ${
                        selectedCounty === county
                          ? 'bg-emerald-500 text-black'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {county}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {showLocationToast && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-2xl shadow-emerald-500/30 animate-slide-down whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-black text-xs sm:text-sm">Location Verified</span>
          <span className="text-[10px] sm:text-xs font-medium opacity-80 hidden sm:block">Showing nearest IEBC offices</span>
        </div>
      )}

   
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-bold text-sm">Loading centers...</span>
          </div>
        </div>
      )}

    
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-rose-500 text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl max-w-[90vw]">
          <FiAlertCircle size={16} className="shrink-0" />
          <span className="font-bold text-sm truncate">{error}</span>
          <button onClick={() => fetchCenters(userLocation)} className="ml-1 underline text-sm shrink-0">Retry</button>
        </div>
      )}

   
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-zinc-950 rounded-t-3xl border-t-2 border-zinc-800 shadow-2xl ${sheetHeight} flex flex-col transition-all duration-300`}>
        
       
        <div
          className="flex justify-center py-2.5 border-b border-zinc-800/50 cursor-pointer shrink-0"
          onClick={() => setSheetExpanded(p => !p)}
        >
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white">
              {selectedCounty === 'All Kenya' ? 'All Centers' : `${selectedCounty} Centers`}
            </h2>
            <p className="text-zinc-500 font-medium text-[11px] sm:text-xs mt-0.5">
              {centers.length} location{centers.length !== 1 ? 's' : ''}{userLocation ? ' nearby' : ''}
            </p>
          </div>
          <button
            onClick={() => setSheetExpanded(p => !p)}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Toggle sheet"
          >
            <FiChevronDown className={`transition-transform ${sheetExpanded ? 'rotate-180' : ''}`} size={20} />
          </button>
        </div>

 
        <div className="overflow-y-auto flex-1 pb-4">
          {loading && centers.length === 0 && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 font-bold text-sm">Loading centers...</p>
            </div>
          )}

          {!loading && centers.length === 0 && (
            <div className="text-center py-10">
              <FiMapPin className="mx-auto text-zinc-700 mb-3" size={40} />
              <p className="text-zinc-500 font-bold text-sm">No centers found</p>
              <p className="text-zinc-600 text-xs mt-1">Try selecting a different county</p>
            </div>
          )}

          {centers.map((center) => (
            <div
              key={center.id}
              onClick={() => setSelectedCenter(center)}
              className="mx-3 sm:mx-4 my-2 bg-zinc-900/50 border-2 border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 cursor-pointer transition-all group"
              style={{
                borderLeftColor: center.statusColor === 'emerald' ? '#10b981' : center.statusColor === 'yellow' ? '#eab308' : '#f43f5e',
                borderLeftWidth: '4px',
              }}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 pr-3 min-w-0">
                  <h3 className="text-white font-black text-sm sm:text-base mb-0.5 group-hover:text-emerald-400 transition-colors truncate">
                    {center.name}
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium truncate">{center.location}</p>
                  <p className="text-zinc-600 text-[11px] font-medium mt-0.5 truncate">{center.constituency}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-white">{center.waitTime}m</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Wait</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusBadge statusColor={center.statusColor} status={center.status} />
                  {center.distance && (
                    <div className="flex items-center gap-1 text-zinc-600 shrink-0">
                      <FiMapPin size={11} />
                      <span className="font-bold text-[10px] sm:text-[11px]">{center.distance}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedCenter(center) }}
                  className="bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-400 font-black text-[10px] uppercase px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <button
        onClick={() => window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank')}
        className="fixed bottom-[44vh] sm:bottom-8 right-4 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all"
      >
        <BsWhatsapp className="text-black" size={22} />
      </button>

    
      {selectedCenter && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto">

            
            <div className="relative bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-zinc-800 p-5 sm:p-6">
              <button
                onClick={() => setSelectedCenter(null)}
                className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
              >
                <FiX className="text-zinc-400" size={18} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 pr-12">{selectedCenter.name}</h3>
              <p className="text-zinc-400 font-medium text-sm sm:text-base">{selectedCenter.location}</p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">{selectedCenter.constituency}, {selectedCenter.county}</p>

              <div className="flex items-center gap-3 mt-3 sm:mt-4 flex-wrap">
                <StatusBadge statusColor={selectedCenter.statusColor} status={selectedCenter.status} size="md" />
                {selectedCenter.distance && (
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <FiMapPin size={14} />
                    <span className="font-bold text-xs sm:text-sm">{selectedCenter.distance} away</span>
                  </div>
                )}
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-6 border-b border-zinc-800">
              <div className="bg-zinc-800/50 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{selectedCenter.waitTime}m</div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Wait Time</div>
              </div>
              <div className="bg-zinc-800/50 rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{selectedCenter.checkedIn}</div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Reports</div>
              </div>
            </div>

            
            <div className="p-4 sm:p-6 space-y-2.5">
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${selectedCenter.lat},${selectedCenter.lng}`, '_blank')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm sm:text-base py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Get Directions
              </button>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'short',    label: 'Short Queue', color: 'emerald' },
                  { key: 'moderate', label: 'Moderate',    color: 'yellow'  },
                  { key: 'long',     label: 'Long Wait',   color: 'orange'  },
                  { key: 'verylong', label: 'Very Long',   color: 'rose'    },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => handleSubmitReport(key)}
                    disabled={submittingReport}
                    className={`bg-${color}-500/20 hover:bg-${color}-500 text-${color}-400 hover:text-black font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-all border border-${color}-500/30 disabled:opacity-50`}
                  >
                    {submittingReport ? '...' : label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

   
      {showCountyDropdown && (
        <div className="fixed inset-0 z-[5]" onClick={() => setShowCountyDropdown(false)} />
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity:0; transform:translate(-50%,-16px); }
          to   { opacity:1; transform:translate(-50%,0); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-slide-up   { animation: slide-up   0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default Map