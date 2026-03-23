import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMapPin, FiClock, FiUsers, FiAlertCircle, FiX, FiChevronDown } from 'react-icons/fi'
import { BsWhatsapp } from 'react-icons/bs'
import { getCenters, checkProximity } from '../services/centerServices'
import { submitQueueReport } from '../services/queueService'

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
  
  const mapRef = useRef(null)
  const googleMapRef = useRef(null)
  const markersRef = useRef([])
  const searchTimeout = useRef(null)

  const counties = [
    'All Kenya', 'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
    'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
    'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
    'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru',
    'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
    'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta',
    'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
    'Vihiga', 'Wajir', 'West Pokot'
  ]

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setShowLocationToast(true)
          setTimeout(() => setShowLocationToast(false), 3000)
          
          
          fetchCenters({ lat: location.lat, lng: location.lng })
        },
        (error) => {
          console.error('Error getting location:', error)
     
          fetchCenters()
        }
      )
    } else {
      
      fetchCenters()
    }
  }, [])


  const fetchCenters = async (locationFilter = null) => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        county: selectedCounty !== 'All Kenya' ? selectedCounty : null,
        search: searchQuery || null,
        ...locationFilter
      }
      
      const response = await getCenters(filters)
      
      if (response.success) {
        
        const transformedCenters = response.data.map(center => ({
          id: center._id,
          name: center.name,
          location: center.location,
          county: center.county,
          constituency: center.constituency,
          lat: center.coordinates.lat,
          lng: center.coordinates.lng,
          waitTime: center.currentQueue?.waitTime || 0,
          status: getStatusText(center.currentQueue?.status || 'FAST MOVING'),
          statusColor: getStatusColor(center.currentQueue?.status || 'FAST MOVING'),
          checkedIn: center.currentQueue?.reportCount || 0,
          distance: center.distanceText || (center.distance ? `${center.distance.toFixed(1)}km` : null),
          workingHours: center.workingHours,
          address: center.address,
          landmark: center.landmark
        }))
        
        setCenters(transformedCenters)
        

        if (transformedCenters.length > 0 && window.google) {
          initMap(transformedCenters)
        }
      }
    } catch (err) {
      console.error('Error fetching centers:', err)
      setError('Failed to load centers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

 
  useEffect(() => {
    fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
  }, [selectedCounty])


  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      
      script.onload = () => {
        if (centers.length > 0) {
          initMap(centers)
        }
      }
    } else if (centers.length > 0) {
      initMap(centers)
    }
  }, [centers])

  const initMap = (centersData) => {
    if (!mapRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Create or update map
    if (!googleMapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: -1.2864, lng: 36.8172 },
        zoom: userLocation ? 13 : 7,
        styles: [
          { "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
          { "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
          { "elementType": "labels.text.stroke", "stylers": [{ "color": "#18181b" }] },
          { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#27272a" }] },
          { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
          { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#09090b" }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      })
      googleMapRef.current = map
    }

    // Add user location marker
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Your Location'
      })
    }

    // Add markers for centers
    centersData.forEach(center => {
      const marker = new window.google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: center.statusColor === 'emerald' ? '#10b981' : 
                     center.statusColor === 'yellow' ? '#eab308' : '#f43f5e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: center.name
      })

      marker.addListener('click', () => {
        setSelectedCenter(center)
        googleMapRef.current.panTo({ lat: center.lat, lng: center.lng })
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (centersData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      if (userLocation) {
        bounds.extend(userLocation)
      }
      centersData.forEach(center => {
        bounds.extend({ lat: center.lat, lng: center.lng })
      })
      googleMapRef.current.fitBounds(bounds)
    }
  }

  // Handle county change
  const handleCountyChange = (county) => {
    setSelectedCounty(county)
    setShowCountyDropdown(false)
  }

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    searchTimeout.current = setTimeout(() => {
      fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
    }, 500)
  }

  // Submit queue report
  const handleSubmitReport = async (status) => {
    if (!userLocation) {
      alert('⚠️ Please enable location to submit a report')
      return
    }

    if (!selectedCenter) return

    try {
      setSubmittingReport(true)

      // First check proximity
      const proximityCheck = await checkProximity(
        selectedCenter.id,
        userLocation.lat,
        userLocation.lng
      )

      if (!proximityCheck.data.isWithinProximity) {
        alert(`📍 You're ${proximityCheck.data.distanceText} away.\n\nYou must be within 500m of the center to submit a report.`)
        return
      }

      // Submit the report
      const response = await submitQueueReport({
        centerId: selectedCenter.id,
        status: status,
        userLat: userLocation.lat,
        userLng: userLocation.lng
      })

      if (response.success) {
        alert('✅ Queue report submitted successfully!\n\nThank you for helping others.')
        setSelectedCenter(null)
        // Refresh centers
        fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(`❌ ${error.message || 'Failed to submit report. Please try again.'}`)
    } finally {
      setSubmittingReport(false)
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return 'zinc'
    const normalized = status.toUpperCase()
    if (normalized.includes('FAST') || normalized.includes('SHORT')) return 'emerald'
    if (normalized.includes('MODERATE')) return 'yellow'
    if (normalized.includes('LONG') || normalized.includes('VERY')) return 'rose'
    return 'zinc'
  }

  // Get status text
  const getStatusText = (status) => {
    if (!status) return 'UNKNOWN'
    return status.toUpperCase()
  }

  // Filter centers for list display
  const filteredCenters = centers

  return (
    <div className="h-screen bg-zinc-950 relative overflow-hidden">
      
      {/* Google Map */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Top Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-transparent pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative mb-4 flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <FiSearch className="text-zinc-500" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search constituency or ward..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
            
            {/* County Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="h-full bg-zinc-900 border-2 border-zinc-800 hover:border-emerald-500/50 rounded-2xl px-5 text-white font-bold text-sm whitespace-nowrap transition-all flex items-center gap-3 min-w-[180px]"
              >
                <FiMapPin className="text-emerald-400" size={18} />
                <span className="flex-1 text-left">{selectedCounty}</span>
                <FiChevronDown className={`text-zinc-500 transition-transform ${showCountyDropdown ? 'rotate-180' : ''}`} size={16} />
              </button>

              {showCountyDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border-2 border-zinc-800 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50">
                  {counties.map((county) => (
                    <button
                      key={county}
                      onClick={() => handleCountyChange(county)}
                      className={`w-full text-left px-5 py-2 font-bold text-sm transition-all first:rounded-t-2xl last:rounded-b-2xl ${
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

      {/* Location Toast */}
      {showLocationToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl shadow-emerald-500/30 animate-slide-down">
          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-black text-sm">Location Verified</span>
          <span className="text-xs font-medium opacity-80">Showing nearest IEBC offices</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-bold">Loading centers...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-rose-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
          <FiAlertCircle size={20} />
          <span className="font-bold">{error}</span>
          <button onClick={() => fetchCenters(userLocation)} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Bottom Sheet - Centers List */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-zinc-950 rounded-t-3xl border-t-2 border-zinc-800 shadow-2xl max-h-[45vh] overflow-hidden">
        <div className="flex justify-center py-2.5 border-b border-zinc-800/50 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1 bg-zinc-700 rounded-full" />
        </div>

        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">
              {selectedCounty === 'All Kenya' ? 'All Centers' : `${selectedCounty} Centers`}
            </h2>
            <p className="text-zinc-500 font-medium text-xs mt-0.5">
              {filteredCenters.length} location{filteredCenters.length !== 1 ? 's' : ''} {userLocation && 'nearby'}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(45vh-100px)] pb-4">
          {loading && filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 font-bold">Loading centers...</p>
            </div>
          )}

          {!loading && filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <FiMapPin className="mx-auto text-zinc-700 mb-3" size={48} />
              <p className="text-zinc-500 font-bold">No centers found</p>
              <p className="text-zinc-600 text-sm mt-1">Try selecting a different county</p>
            </div>
          )}

          {filteredCenters.map((center) => (
            <div
              key={center.id}
              onClick={() => setSelectedCenter(center)}
              className="mx-4 my-2.5 bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden"
              style={{
                borderLeftColor: center.statusColor === 'emerald' ? '#10b981' : 
                                center.statusColor === 'yellow' ? '#eab308' : '#f43f5e',
                borderLeftWidth: '4px'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h3 className="text-white font-black text-base mb-0.5 group-hover:text-emerald-400 transition-colors">
                    {center.name}
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium">{center.location}</p>
                  <p className="text-zinc-600 text-xs font-medium mt-0.5">{center.constituency}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-white mb-0.5">{center.waitTime}m</div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Wait Time</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-lg ${
                    center.statusColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    center.statusColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    <span className="font-black text-[10px] uppercase tracking-wider">{center.status}</span>
                  </div>
                  {center.distance && (
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <FiMapPin size={12} />
                      <span className="font-bold text-[11px]">{center.distance}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCenter(center)
                  }}
                  className="bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-400 font-black text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all"
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp FAB */}
      <button 
        onClick={() => window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank')}
        className="fixed bottom-8 right-6 z-30 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all group cursor-pointer"
      >
        <BsWhatsapp className="text-black" size={24} />
      </button>

      {/* Center Detail Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="relative bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-zinc-800 p-6">
              <button
                onClick={() => setSelectedCenter(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="text-zinc-400" size={20} />
              </button>
              
              <h3 className="text-2xl font-black text-white mb-2">{selectedCenter.name}</h3>
              <p className="text-zinc-400 font-medium">{selectedCenter.location}</p>
              <p className="text-zinc-500 text-sm mt-1">{selectedCenter.constituency}, {selectedCenter.county}</p>
              
              <div className="flex items-center gap-3 mt-4">
                <div className={`px-4 py-2 rounded-xl ${
                  selectedCenter.statusColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  selectedCenter.statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  <span className="font-black text-sm">{selectedCenter.status}</span>
                </div>
                {selectedCenter.distance && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <FiMapPin size={16} />
                    <span className="font-bold text-sm">{selectedCenter.distance} away</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 border-b border-zinc-800">
              <div className="bg-zinc-800/50 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-white mb-1">{selectedCenter.waitTime}m</div>
                <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Wait Time</div>
              </div>
              <div className="bg-zinc-800/50 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-white mb-1">{selectedCenter.checkedIn}</div>
                <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Reports</div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <button 
                onClick={() => window.open(`https://maps.google.com/?q=${selectedCenter.lat},${selectedCenter.lng}`, '_blank')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer"
              >
                Get Directions
              </button>
              
              {/* Queue Report Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSubmitReport('short')}
                  disabled={submittingReport}
                  className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold text-sm py-3 rounded-xl transition-all border border-emerald-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReport ? '...' : 'Short Queue'}
                </button>
                <button 
                  onClick={() => handleSubmitReport('moderate')}
                  disabled={submittingReport}
                  className="bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black font-bold text-sm py-3 rounded-xl transition-all border border-yellow-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReport ? '...' : 'Moderate'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSubmitReport('long')}
                  disabled={submittingReport}
                  className="bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-black font-bold text-sm py-3 rounded-xl transition-all border border-orange-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReport ? '...' : 'Long Wait'}
                </button>
                <button 
                  onClick={() => handleSubmitReport('verylong')}
                  disabled={submittingReport}
                  className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-black font-bold text-sm py-3 rounded-xl transition-all border border-rose-500/30 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReport ? '...' : 'Very Long'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Overlay */}
      {showCountyDropdown && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => setShowCountyDropdown(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Map