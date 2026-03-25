import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMapPin, FiAlertCircle, FiX, FiChevronDown, FiPlus, FiCheck, FiAlertTriangle } from 'react-icons/fi'
import { BsWhatsapp } from 'react-icons/bs'
import { getCenters, checkProximity, addCenter } from '../services/centerServices'
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

const CENTER_TYPES = [
  { value: 'county_office',  label: 'County Office' },
  { value: 'school',         label: 'School' },
  { value: 'community_hall', label: 'Community Hall' },
  { value: 'mobile_unit',    label: 'Mobile Unit' },
  { value: 'other',          label: 'Other' },
]

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#27272a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09090b' }] },
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

function createLabeledMarker({ map, position, label, color, isNew = false, onClick }) {
  if (!window.google || !map) return null

  const dotColor =
    color === 'emerald' ? '#10b981' :
    color === 'yellow'  ? '#eab308' :
    color === 'rose'    ? '#f43f5e' : '#71717a'

  const glowColor =
    color === 'emerald' ? 'rgba(16,185,129,0.3)'  :
    color === 'yellow'  ? 'rgba(234,179,8,0.3)'   :
    color === 'rose'    ? 'rgba(244,63,94,0.3)'   : 'rgba(113,113,122,0.2)'

  class LabelMarker extends window.google.maps.OverlayView {
    onAdd() {
      const div = document.createElement('div')
      div.style.cssText = 'position:absolute;cursor:pointer;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);user-select:none;'

      div.innerHTML = `
        <div style="
          background:#18181b;
          border:1.5px solid ${dotColor};
          color:#fff;
          font-size:10px;
          font-weight:700;
          font-family:ui-sans-serif,system-ui,sans-serif;
          padding:3px 8px;
          border-radius:6px;
          white-space:nowrap;
          max-width:150px;
          overflow:hidden;
          text-overflow:ellipsis;
          box-shadow:0 2px 10px rgba(0,0,0,0.6);
          letter-spacing:0.01em;
          ${isNew ? 'animation:markerPop 0.35s cubic-bezier(.34,1.56,.64,1);' : ''}
        ">${label}</div>
        <div style="
          width:10px;height:10px;
          border-radius:50%;
          background:${dotColor};
          border:2px solid #fff;
          margin-top:-1px;
          box-shadow:0 0 0 3px ${glowColor};
          flex-shrink:0;
        "></div>
      `
      div.addEventListener('click', () => onClick?.())
      this._div = div
      this.getPanes().overlayMouseTarget.appendChild(div)
    }

    draw() {
      if (!this._div) return
      const p = this.getProjection().fromLatLngToDivPixel(
        new window.google.maps.LatLng(position.lat, position.lng)
      )
      if (p) { this._div.style.left = p.x + 'px'; this._div.style.top = p.y + 'px' }
    }

    onRemove() {
      this._div?.parentNode?.removeChild(this._div)
      this._div = null
    }
  }

  const overlay = new LabelMarker()
  overlay.setMap(map)
  return overlay
}


const StatusBadge = ({ statusColor, status, size = 'sm' }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    yellow:  'bg-yellow-500/10  text-yellow-400  border-yellow-500/30',
    rose:    'bg-rose-500/10    text-rose-400    border-rose-500/30',
    zinc:    'bg-zinc-500/10    text-zinc-400    border-zinc-500/30',
  }
  return (
    <div className={`px-2.5 py-1 rounded-lg border ${colorMap[statusColor] ?? colorMap.zinc}`}>
      <span className={`font-black uppercase tracking-wider ${size === 'sm' ? 'text-[10px]' : 'text-sm'}`}>{status}</span>
    </div>
  )
}

const ADD_STEPS = { IDLE: 'idle', LOCATING: 'locating', FORM: 'form', SUBMITTING: 'submitting', SUCCESS: 'success' }

function AddLocationModal({ isOpen, onClose, map, onSuccess }) {
  const [step, setStep]                         = useState(ADD_STEPS.IDLE)
  const [pickedLatLng, setPickedLatLng]         = useState(null)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [form, setForm]                         = useState({ name: '', county: '', constituency: '', type: 'other', address: '' })
  const [formError, setFormError]               = useState(null)
  const [duplicate, setDuplicate]               = useState(null)
  const [showCountyPicker, setShowCountyPicker] = useState(false)
  const previewMarkerRef                        = useRef(null)

 
  useEffect(() => {
    if (isOpen) startLocating()
    else        resetState()
  }, [isOpen])

  function resetState() {
    previewMarkerRef.current?.setMap(null)
    previewMarkerRef.current = null
    setStep(ADD_STEPS.IDLE)
    setPickedLatLng(null)
    setLocationAccuracy(null)
    setForm({ name: '', county: '', constituency: '', type: 'other', address: '' })
    setFormError(null)
    setDuplicate(null)
    setShowCountyPicker(false)
  }

  function handleClose() { resetState(); onClose() }

  function startLocating() {
    setStep(ADD_STEPS.LOCATING)
    setFormError(null)
    setPickedLatLng(null)
    setLocationAccuracy(null)

    if (!navigator.geolocation) {
      setFormError('GPS is not supported on this device.')
      setStep(ADD_STEPS.FORM)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const accuracy = Math.round(pos.coords.accuracy)

        setPickedLatLng({ lat, lng })
        setLocationAccuracy(accuracy)

       
        if (map && window.google) {
          previewMarkerRef.current?.setMap(null)
          previewMarkerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10b981',
              fillOpacity: 0.6,
              strokeColor: '#fff',
              strokeWeight: 2.5,
            },
            animation: window.google.maps.Animation.DROP,
            zIndex: 999,
          })
          map.panTo({ lat, lng })
          map.setZoom(17)
        }

        setStep(ADD_STEPS.FORM)
      },
      (err) => {
        const msg =
          err.code === 1 ? 'Location access denied. Please allow it in browser settings.' :
          err.code === 2 ? 'GPS unavailable. Try moving outdoors.' :
                           'Location timed out. Please try again.'
        setFormError(msg)
        setStep(ADD_STEPS.FORM)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function handleSubmit() {
    setFormError(null)
    setDuplicate(null)
    if (!pickedLatLng)     { setFormError('Location not detected. Tap "Re-detect" above.'); return }
    if (!form.name.trim()) { setFormError('Center name is required.'); return }
    if (!form.county)      { setFormError('Please select a county.'); return }

    setStep(ADD_STEPS.SUBMITTING)

    try {
      const res = await addCenter({
        name:         form.name.trim(),
        county:       form.county,
        constituency: form.constituency.trim(),
        type:         form.type,
        address:      form.address.trim(),
        latitude:     pickedLatLng.lat,
        longitude:    pickedLatLng.lng,
      })

      if (res.success) {
        previewMarkerRef.current?.setMap(null)
        previewMarkerRef.current = null
        setStep(ADD_STEPS.SUCCESS)
        onSuccess?.(res.data)
        setTimeout(handleClose, 2200)
      }
    } catch (err) {
      if (err?.status === 409 || err?.error === 'duplicate') {
        setDuplicate(err.existing || err)
        setStep(ADD_STEPS.FORM)
        if (map && err.existing) map.panTo({ lat: err.existing.lat, lng: err.existing.lng })
      } else {
        setFormError(err?.message || err?.error || 'Something went wrong. Try again.')
        setStep(ADD_STEPS.FORM)
      }
    }
  }

  if (!isOpen) return null

  const accColor = !locationAccuracy ? '' : locationAccuracy <= 15 ? 'bg-emerald-400' : locationAccuracy <= 50 ? 'bg-yellow-400' : 'bg-rose-400'
  const accLabel = !locationAccuracy ? '' : locationAccuracy <= 15 ? 'Excellent' : locationAccuracy <= 50 ? 'Good' : 'Poor — move outdoors'
  const isDisabled = step === ADD_STEPS.SUBMITTING || step === ADD_STEPS.LOCATING

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-modal-in">

      
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <FiMapPin className="text-emerald-400" size={17} />
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-tight">Add Registration Center</h2>
              <p className="text-zinc-500 text-xs font-medium mt-0.5">You must be physically at the booth</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex 
          items-center justify-center transition-colors cursor-pointer">
            <FiX className="text-zinc-400" size={15} />
          </button>
        </div>

    
        <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-3 min-h-[52px]">
          {step === ADD_STEPS.LOCATING ? (
            <>
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-white font-bold text-xs">Detecting your location…</p>
                <p className="text-zinc-500 text-[11px] mt-0.5">Stand at the booth for best accuracy</p>
              </div>
            </>
          ) : pickedLatLng ? (
            <>
              <div className={`w-2 h-2 rounded-full shrink-0 ${accColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 text-xs font-medium font-mono">
                  {pickedLatLng.lat.toFixed(5)}, {pickedLatLng.lng.toFixed(5)}
                </p>
                <p className="text-zinc-500 text-[11px] mt-0.5">~{locationAccuracy}m accuracy · {accLabel}</p>
              </div>
              <button onClick={startLocating} className="text-emerald-400 text-[11px] font-black
               hover:text-emerald-300 transition-colors shrink-0 cursor-pointer">
                Re-detect
              </button>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <p className="text-zinc-400 text-xs font-medium flex-1">Location not detected</p>
              <button onClick={startLocating} className="text-emerald-400 text-[11px] font-black
               hover:text-emerald-300 transition-colors cursor-pointer shrink-0">
                Try again
              </button>
            </>
          )}
        </div>

       
        {step === ADD_STEPS.SUCCESS && (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
              <FiCheck className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Location Added!</h3>
            <p className="text-zinc-400 text-sm">
              <span className="text-emerald-400 font-bold">"{form.name}"</span> is now on the map for everyone.
            </p>
          </div>
        )}


        {step !== ADD_STEPS.SUCCESS && (
          <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">

            {duplicate && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3.5 flex gap-3">
                <FiAlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={15} />
                <div>
                  <p className="text-yellow-300 font-black text-sm">Already registered</p>
                  <p className="text-yellow-400/70 text-xs mt-1 leading-relaxed">
                    "{duplicate.name}" in {duplicate.county} already exists at this location.
                  </p>
                </div>
              </div>
            )}

            {formError && !duplicate && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex gap-2.5">
                <FiAlertCircle className="text-rose-400 shrink-0 mt-0.5" size={14} />
                <p className="text-rose-300 text-sm leading-relaxed">{formError}</p>
              </div>
            )}

           
            <div>
              <label className="block text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                Center name <span className="text-rose-400">*</span>
              </label>
              <input
                className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-white text-sm
                 placeholder-zinc-700 outline-none transition-all font-medium disabled:opacity-50"
                placeholder="e.g. Westlands Primary School"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={isDisabled}
              />
            </div>

            
            <div>
              <label className="block text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                County <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setShowCountyPicker(p => !p)}
                  className="w-full bg-zinc-950 border-2 border-zinc-800 hover:border-emerald-500/40 rounded-xl 
                  px-3.5 py-2.5 text-left flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span className={`text-sm font-medium ${form.county ? 'text-white' : 'text-zinc-700'}`}>
                    {form.county || 'Select county'}
                  </span>
                  <FiChevronDown className={`text-zinc-500 transition-transform ${showCountyPicker ? 'rotate-180' : ''}`} size={15} />
                </button>
                {showCountyPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl max-h-48 overflow-y-auto z-20 shadow-2xl">
                    {counties.filter(c => c !== 'All Kenya').map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => { setForm({ ...form, county: c }); setShowCountyPicker(false) }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-all first:rounded-t-2xl last:rounded-b-2xl ${
                          form.county === c ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          
            <div>
              <label className="block text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                Constituency / Ward
              </label>
              <input
                className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500/60 rounded-xl
                 px-3.5 py-2.5 text-white text-sm placeholder-zinc-700 outline-none transition-all font-medium 
                 disabled:opacity-50"
                placeholder="e.g. Westlands Constituency"
                value={form.constituency}
                onChange={e => setForm({ ...form, constituency: e.target.value })}
                disabled={isDisabled}
              />
            </div>

            
            <div>
              <label className="block text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-2">Center type</label>
              <div className="flex flex-wrap gap-2">
                {CENTER_TYPES.map(t => (
                  <button
                    key={t.value} type="button" disabled={isDisabled}
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                      form.type === t.value
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >{t.label}</button>
                ))}
              </div>
            </div>

           
            <div>
              <label className="block text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                Address / Landmark <span className="text-zinc-600 font-normal normal-case">(optional)</span>
              </label>
              <input
                className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500/60 rounded-xl
                 px-3.5 py-2.5 text-white text-sm placeholder-zinc-700 outline-none transition-all font-medium disabled:opacity-50"
                placeholder="e.g. Near Total petrol station, off Waiyaki Way"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                disabled={isDisabled}
              />
            </div>
          </div>
        )}

       
        {step !== ADD_STEPS.SUCCESS && (
          <div className="px-6 pb-6 pt-3 flex gap-3 border-t border-zinc-800/60">
            <button
              type="button" onClick={handleClose}
              className="flex-1 py-3 rounded-xl border-2 border-zinc-800 bg-transparent text-zinc-400 font-black
               text-sm cursor-pointerhover:border-zinc-600 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button" onClick={handleSubmit} disabled={isDisabled}
              className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 
              disabled:cursor-not-allowed text-black font-black text-sm transition-all flex items-center
               justify-center gap-2 cursor-pointer"
            >
              {step === ADD_STEPS.SUBMITTING || step === ADD_STEPS.LOCATING
                ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{step === ADD_STEPS.LOCATING ? 'Detecting…' : 'Saving…'}</>
                : <><FiPlus size={16} strokeWidth={3} />Save location</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const Map = () => {
  const [selectedCounty, setSelectedCounty]         = useState('All Kenya')
  const [searchQuery, setSearchQuery]               = useState('')
  const [selectedCenter, setSelectedCenter]         = useState(null)
  const [userLocation, setUserLocation]             = useState(null)
  const [centers, setCenters]                       = useState([])
  const [loading, setLoading]                       = useState(true)
  const [error, setError]                           = useState(null)
  const [showLocationToast, setShowLocationToast]   = useState(false)
  const [showCountyDropdown, setShowCountyDropdown] = useState(false)
  const [submittingReport, setSubmittingReport]     = useState(false)
  const [sheetExpanded, setSheetExpanded]           = useState(false)
  const [showAddModal, setShowAddModal]             = useState(false)

  const mapRef          = useRef(null)
  const googleMapRef    = useRef(null)
  const labelMarkersRef = useRef([])
  const searchTimeout   = useRef(null)

  const fetchCenters = async (locationFilter = null) => {
    try {
      setLoading(true); setError(null)
      const filters = {
        county: selectedCounty !== 'All Kenya' ? selectedCounty : null,
        search: searchQuery || null,
        ...locationFilter,
      }
      const response = await getCenters(filters)
      if (response.success) {
        const transformed = response.data.map(c => ({
          id:          c._id,
          name:        c.name,
          location:    c.location,
          county:      c.county,
          constituency:c.constituency,
          lat:         c.coordinates.lat,
          lng:         c.coordinates.lng,
          waitTime:    c.currentQueue?.waitTime || 0,
          status:      getStatusText(c.currentQueue?.status || 'FAST MOVING'),
          statusColor: getStatusColor(c.currentQueue?.status || 'FAST MOVING'),
          checkedIn:   c.currentQueue?.reportCount || 0,
          distance:    c.distanceText || (c.distance ? `${c.distance.toFixed(1)}km` : null),
          workingHours:c.workingHours,
          address:     c.address,
          landmark:    c.landmark,
          type:        c.type,
        }))
        setCenters(transformed)
        if (transformed.length > 0 && window.google) renderMarkers(transformed)
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
    } else fetchCenters()
  }, [])

  useEffect(() => {
    fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
  }, [selectedCounty])

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true; script.defer = true
      document.head.appendChild(script)
      script.onload = () => { if (centers.length > 0) renderMarkers(centers) }
    } else if (centers.length > 0) renderMarkers(centers)
  }, [centers])

  const renderMarkers = (centersData) => {
    if (!mapRef.current || !window.google) return

    
    labelMarkersRef.current.forEach(m => m.setMap(null))
    labelMarkersRef.current = []

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: -1.2864, lng: 36.8172 },
        zoom: userLocation ? 13 : 7,
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
      })
    }

    
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
        title: 'Current Location',
        zIndex: 100,
      })
    }

 
    centersData.forEach(center => {
      const overlay = createLabeledMarker({
        map: googleMapRef.current,
        position: { lat: center.lat, lng: center.lng },
        label: center.name,
        color: center.statusColor,
        onClick: () => {
          setSelectedCenter(center)
          googleMapRef.current.panTo({ lat: center.lat, lng: center.lng })
        },
      })
      if (overlay) labelMarkersRef.current.push(overlay)
    })

    if (centersData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      if (userLocation) bounds.extend(userLocation)
      centersData.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }))
      googleMapRef.current.fitBounds(bounds)
    }
  }

  const handleCenterAdded = (newCenter) => {
    const transformed = {
      id: newCenter.id, name: newCenter.name, county: newCenter.county,
      lat: newCenter.lat, lng: newCenter.lng,
      status: 'FAST MOVING', statusColor: 'emerald', waitTime: 0, checkedIn: 0, type: newCenter.type,
    }
    setCenters(prev => [...prev, transformed])

    if (googleMapRef.current && window.google) {
      const overlay = createLabeledMarker({
        map: googleMapRef.current,
        position: { lat: newCenter.lat, lng: newCenter.lng },
        label: newCenter.name,
        color: 'emerald',
        isNew: true,
        onClick: () => {
          setSelectedCenter(transformed)
          googleMapRef.current.panTo({ lat: newCenter.lat, lng: newCenter.lng })
        },
      })
      if (overlay) labelMarkersRef.current.push(overlay)
    }
  }

  const handleCountyChange = (county) => { setSelectedCounty(county); setShowCountyDropdown(false) }

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
        alert(`You're ${proximity.data.distanceText} away.\n\nYou must be within 500m to submit a report.`); return
      }
      const response = await submitQueueReport({ centerId: selectedCenter.id, status, userLat: userLocation.lat, userLng: userLocation.lng })
      if (response.success) {
        alert('Queue report submitted!\n\nThank you for helping others.')
        setSelectedCenter(null)
        fetchCenters(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)
      }
    } catch (err) {
      alert(err.message || 'Failed to submit report. Please try again.')
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
                type="text" placeholder="Search constituency or ward..."
                value={searchQuery} onChange={handleSearch}
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
                  {counties.map(county => (
                    <button key={county} onClick={() => handleCountyChange(county)}
                      className={`w-full text-left px-4 sm:px-5 py-2 font-bold text-xs sm:text-sm transition-all first:rounded-t-2xl last:rounded-b-2xl ${
                        selectedCounty === county ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >{county}</button>
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
        <div className="flex justify-center py-2.5 border-b border-zinc-800/50 cursor-pointer shrink-0" onClick={() => setSheetExpanded(p => !p)}>
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs px-3 py-1.5 rounded-full transition-all"
          >
            <FiPlus size={13} strokeWidth={3} />
            Add location
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
          {centers.map(center => (
            <div
              key={center.id}
              onClick={() => { setSelectedCenter(center); googleMapRef.current?.panTo({ lat: center.lat, lng: center.lng }) }}
              className="mx-3 sm:mx-4 my-2 bg-zinc-900/50 border-2 border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 cursor-pointer transition-all group"
              style={{ borderLeftColor: center.statusColor === 'emerald' ? '#10b981' : center.statusColor === 'yellow' ? '#eab308' : '#f43f5e', borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 pr-3 min-w-0">
                  <h3 className="text-white font-black text-sm sm:text-base mb-0.5 group-hover:text-emerald-400 transition-colors truncate">{center.name}</h3>
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
                  onClick={e => { e.stopPropagation(); setSelectedCenter(center) }}
                  className="bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-400 font-black text-[10px] uppercase px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                >Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => window.open('https://wa.me/number', '_blank')}
        className="fixed bottom-[44vh] sm:bottom-8 right-4 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all"
      >
        <BsWhatsapp className="text-black" size={22} />
      </button>

      {selectedCenter && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="relative bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-zinc-800 p-5 sm:p-6">
              <button onClick={() => setSelectedCenter(null)} className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors">
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
              >Get Directions</button>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'short',    label: 'Short Queue', color: 'emerald' },
                  { key: 'moderate', label: 'Moderate',    color: 'yellow'  },
                  { key: 'long',     label: 'Long Wait',   color: 'orange'  },
                  { key: 'verylong', label: 'Very Long',   color: 'rose'    },
                ].map(({ key, label, color }) => (
                  <button
                    key={key} onClick={() => handleSubmitReport(key)} disabled={submittingReport}
                    className={`bg-${color}-500/20 hover:bg-${color}-500 text-${color}-400 hover:text-black font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-all border border-${color}-500/30 disabled:opacity-50`}
                  >{submittingReport ? '...' : label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCountyDropdown && <div className="fixed inset-0 z-[5]" onClick={() => setShowCountyDropdown(false)} />}

 
      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        map={googleMapRef.current}
        onSuccess={newCenter => { setShowAddModal(false); handleCenterAdded(newCenter) }}
      />

      <style>{`
        @keyframes slide-down { from{opacity:0;transform:translate(-50%,-16px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes slide-up   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modal-in   { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes markerPop  { 0%{transform:translate(-50%,-100%) scale(0.6);opacity:0} 70%{transform:translate(-50%,-100%) scale(1.1)} 100%{transform:translate(-50%,-100%) scale(1);opacity:1} }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-slide-up   { animation: slide-up   0.3s ease-out; }
        .animate-modal-in   { animation: modal-in   0.25s ease-out; }
      `}</style>
    </div>
  )
}

export default Map