import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, Search, Navigation, Activity, ArrowRight, AlertTriangle } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';

// CRITICAL: libraries array must be defined OUTSIDE the component to prevent re-renders
const LIBRARIES = ['places'];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '220px',
  borderRadius: '1.5rem',
  marginTop: '1rem',
  border: '1px solid #e2e8f0'
};

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };

const SERVICE_CONFIG = {
  bike: { label: 'Two Wheeler', base: 16, color: 'blue' },
  truck: { label: 'Truck', base: 36, color: 'purple' },
  packers: { label: 'Packers & Movers', base: 500, color: 'orange' },
  intercity: { label: 'Intercity', base: 50, color: 'emerald' },
};

const PER_KM_RATE = 16;

export default function Book({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service') || 'bike';
  const serviceInfo = SERVICE_CONFIG[serviceQuery] || SERVICE_CONFIG.bike;

  // ─── ALL HOOKS MUST BE CALLED FIRST, BEFORE ANY CONDITIONAL RETURNS ───
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  const [price, setPrice] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    pickup_address: '',
    pickup_pincode: '',
    receiver_name: '',
    receiver_phone: '',
    drop_address: '',
    drop_pincode: '',
  });

  const pickupAutoRef = useRef(null);
  const dropAutoRef = useRef(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | done | denied

  // ─── GPS AUTO-FILL PICKUP LOCATION ─────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickupCoords({ lat, lng });
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key) { setGpsStatus('done'); return; }
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
          );
          const data = await res.json();
          if (data.status === 'OK' && data.results[0]) {
            const place = data.results[0];
            const pinComp = place.address_components?.find(c => c.types.includes('postal_code'));
            setFormData(prev => ({
              ...prev,
              pickup_address: place.formatted_address || '',
              pickup_pincode: pinComp?.long_name || prev.pickup_pincode,
            }));
          }
        } catch (_) { /* silent fail */ }
        setGpsStatus('done');
      },
      () => setGpsStatus('denied'),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // ─── HANDLERS ─────────────────────────────────────────────────────────
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const extractPincode = (place) => {
    if (!place?.address_components) return '';
    const comp = place.address_components.find(c => c.types.includes('postal_code'));
    return comp?.long_name || '';
  };

  const onPickupPlaceChanged = () => {
    if (!pickupAutoRef.current) return;
    const place = pickupAutoRef.current.getPlace();
    if (!place?.geometry) return;
    const pincode = extractPincode(place);
    setFormData(prev => ({
      ...prev,
      pickup_address: place.formatted_address || place.name || '',
      pickup_pincode: pincode || prev.pickup_pincode,
    }));
    setPickupCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
  };

  const onDropPlaceChanged = () => {
    if (!dropAutoRef.current) return;
    const place = dropAutoRef.current.getPlace();
    if (!place?.geometry) return;
    const pincode = extractPincode(place);
    setFormData(prev => ({
      ...prev,
      drop_address: place.formatted_address || place.name || '',
      drop_pincode: pincode || prev.drop_pincode,
    }));
    setDropCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
  };

  const reverseGeocode = (latLng, type) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const pincode = extractPincode(place);
        if (type === 'pickup') {
          setFormData(prev => ({ ...prev, pickup_address: place.formatted_address, pickup_pincode: pincode || prev.pickup_pincode }));
        } else {
          setFormData(prev => ({ ...prev, drop_address: place.formatted_address, drop_pincode: pincode || prev.drop_pincode }));
        }
      }
    });
  };

  const handleMarkerDrag = (e, type) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (type === 'pickup') setPickupCoords(coords);
    else setDropCoords(coords);
    reverseGeocode(coords, type);
  };

  const calculatePrice = () => {
    if (!pickupCoords || !dropCoords) {
      if (!formData.pickup_address || !formData.drop_address) return;
    }
    if (!window.google) {
      alert('Google Maps not loaded yet. Please wait a moment and try again.');
      return;
    }
    setCalculating(true);
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickupCoords || formData.pickup_address],
        destinations: [dropCoords || formData.drop_address],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setCalculating(false);
        if (status === 'OK' && response.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const distKm = response.rows[0].elements[0].distance.value / 1000;
          const basePrice = serviceInfo.base;
          const totalPrice = Math.floor(basePrice + distKm * PER_KM_RATE);
          setPrice({ distance: distKm.toFixed(1), total: totalPrice, base: basePrice });
          setStep(3);
        } else {
          alert('Could not calculate distance. Please verify both addresses.');
        }
      }
    );
  };

  const confirmBooking = async (paymentId = 'direct_confirm') => {
    let bookingId = null;
    try {
      const res = await fetch('https://zynetylogistics.com/wp-json/zynety/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Match exact field names expected by the plugin
          sender_name:    formData.sender_name,
          sender_phone:   formData.sender_phone,
          pickup:         formData.pickup_address,
          pickup_pincode: formData.pickup_pincode,
          receiver_name:  formData.receiver_name,
          receiver_phone: formData.receiver_phone,
          drop:           formData.drop_address,
          drop_pincode:   formData.drop_pincode,
          service:        serviceQuery,
          price:          price?.total,
          distance:       price?.distance,
          payment_id:     paymentId,
          user_id:        user?.user_id || user?.id || 0,
          user_email:     user?.email || '',   // ← ensures booking is always linked to the user
        }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.booking_id) {
        bookingId = data.booking_id;
        // Persist so Track page can fetch and display this booking's status
        localStorage.setItem('zynety_last_booking_id', data.booking_id);
        localStorage.setItem('zynety_last_booking_ref', data.booking_ref || '');
      }
    } catch (e) {
      console.warn('Backend error — proceeding to confirmation screen:', e);
    }
    setStep(4);
  };

  const handlePayment = () => {
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!rzpKey) {
      console.warn('Razorpay key not set. Using direct confirm.');
      confirmBooking('no_key_dev');
      return;
    }
    if (!window.Razorpay) {
      alert('Payment gateway not loaded. Please check internet connection.');
      return;
    }
    const rzp = new window.Razorpay({
      key: rzpKey,
      amount: (price?.total || 0) * 100,
      currency: 'INR',
      name: 'Zynety Logistics',
      description: `${serviceInfo.label} — ${formData.pickup_pincode} → ${formData.drop_pincode}`,
      image: '/Logo.png',
      handler: (res) => confirmBooking(res.razorpay_payment_id),
      prefill: {
        name: formData.sender_name || '',
        email: user?.email || '',
        contact: formData.sender_phone || '',
      },
      theme: { color: '#2563EB' },
    });
    rzp.on('payment.failed', (res) => alert('Payment failed: ' + res.error.description));
    rzp.open();
  };

  // ─── CONDITIONAL RENDERS (ALL HOOKS ARE ABOVE THIS POINT) ─────────────
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-sm shadow-sm">
          <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-slate-800 font-bold mb-2 text-lg">Maps Loading Error</h2>
          <p className="text-slate-600 text-sm mb-4">Google Maps failed to load. The booking form below still works — just type addresses manually.</p>
          <p className="text-slate-400 text-xs font-mono">{loadError.message}</p>
        </div>
      </div>
    );
  }

  const pickupValid = formData.sender_name && formData.sender_phone.length >= 10 && (formData.pickup_address || formData.pickup_pincode);
  const dropValid = formData.receiver_name && formData.receiver_phone.length >= 10 && (formData.drop_address || formData.drop_pincode);

  // ─── FULL RENDER ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="h-16 flex items-center px-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm shrink-0">
        <button
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <div className="ml-3">
          <h1 className="text-lg font-extrabold text-slate-800 font-outfit leading-tight">
            {step === 1 ? 'Pickup Details' : step === 2 ? 'Drop Details' : step === 3 ? 'Confirm & Pay' : 'Booking Confirmed!'}
          </h1>
          <p className="text-xs text-slate-500 font-medium capitalize">{serviceInfo.label} Delivery</p>
        </div>
      </header>

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-b border-slate-50 shrink-0">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${step >= n ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}>{n}</div>
              {n < 3 && <div className={`flex-1 h-1.5 rounded-full transition-all ${step > n ? 'bg-blue-600' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── STEP 1: PICKUP ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-4 space-y-5 max-w-2xl mx-auto w-full">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="font-extrabold text-lg text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><MapPin size={18} /></span>
                Sender & Pickup
              </h2>

              {/* GPS Status Banner */}
              {gpsStatus === 'loading' && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-4 text-xs font-bold text-blue-600">
                  <span className="w-3 h-3 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin shrink-0" />
                  Detecting your location to autofill pickup address…
                </div>
              )}
              {gpsStatus === 'done' && formData.pickup_address && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-4 text-xs font-bold text-green-600">
                  <Navigation size={12} className="shrink-0" />
                  Pickup address autofilled from your GPS location. You can edit it.
                </div>
              )}
              {gpsStatus === 'denied' && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4 text-xs font-bold text-amber-600">
                  <MapPin size={12} className="shrink-0" />
                  Location permission denied. Please type your pickup address manually.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Sender Name *</label>
                  <input type="text" name="sender_name" value={formData.sender_name} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mobile Number *</label>
                  <input type="tel" name="sender_phone" value={formData.sender_phone} onChange={handleChange} maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="10-digit number" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pickup Address *</label>
                {isLoaded ? (
                  <Autocomplete onLoad={(ref) => { pickupAutoRef.current = ref; }} onPlaceChanged={onPickupPlaceChanged}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Search pickup address..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="Type pickup address..." />
                  </div>
                )}
              </div>

              {isLoaded && pickupCoords && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4">
                  <div className="bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-blue-100">
                    <Navigation size={10} /> Drag pin to refine location
                  </div>
                  <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={pickupCoords} zoom={15} options={{ disableDefaultUI: true }}>
                    <Marker position={pickupCoords} draggable onDragEnd={(e) => handleMarkerDrag(e, 'pickup')} />
                  </GoogleMap>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pincode</label>
                <input type="tel" name="pickup_pincode" value={formData.pickup_pincode} onChange={handleChange} maxLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Auto-filled or enter manually" />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!pickupValid}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Confirm Pickup <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: DROP ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-4 space-y-5 max-w-2xl mx-auto w-full">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="font-extrabold text-lg text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"><MapPin size={18} /></span>
                Receiver & Drop
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Receiver Name *</label>
                  <input type="text" name="receiver_name" value={formData.receiver_name} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                    placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mobile Number *</label>
                  <input type="tel" name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                    placeholder="10-digit number" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Drop Address *</label>
                {isLoaded ? (
                  <Autocomplete onLoad={(ref) => { dropAutoRef.current = ref; }} onPlaceChanged={onDropPlaceChanged}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="drop_address" value={formData.drop_address} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                        placeholder="Search drop address..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="drop_address" value={formData.drop_address} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                      placeholder="Type drop address..." />
                  </div>
                )}
              </div>

              {isLoaded && dropCoords && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4">
                  <div className="bg-purple-50 px-3 py-1.5 text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-purple-100">
                    <Navigation size={10} /> Drag pin to refine location
                  </div>
                  <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={dropCoords} zoom={15} options={{ disableDefaultUI: true }}>
                    <Marker position={dropCoords} draggable onDragEnd={(e) => handleMarkerDrag(e, 'drop')} />
                  </GoogleMap>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pincode</label>
                <input type="tel" name="drop_pincode" value={formData.drop_pincode} onChange={handleChange} maxLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                  placeholder="Auto-filled or enter manually" />
              </div>
            </div>

            <button
              onClick={calculatePrice}
              disabled={!dropValid || calculating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {calculating ? <><Activity size={18} className="animate-spin" /> Calculating...</> : <>Get Price <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {/* ── STEP 3: CONFIRM ────────────────────────────────────── */}
        {step === 3 && price && (
          <div className="p-4 max-w-2xl mx-auto w-full">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 mb-6">Booking Summary</h3>

              <div className="relative pl-7 space-y-6 mb-6 border-l-2 border-slate-100 ml-3">
                <div className="relative">
                  <div className="absolute -left-[33px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600 shadow z-10" />
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Pickup ({formData.pickup_pincode})</p>
                  <p className="font-bold text-slate-800 text-sm">{formData.pickup_address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formData.sender_name} · {formData.sender_phone}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[33px] top-1 w-5 h-5 rounded-full bg-white border-4 border-purple-600 shadow z-10" />
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-0.5">Drop ({formData.drop_pincode})</p>
                  <p className="font-bold text-slate-800 text-sm">{formData.drop_address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formData.receiver_name} · {formData.receiver_phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Distance</p>
                  <p className="font-black text-slate-800 mt-1">{price.distance} km</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Rate/km</p>
                  <p className="font-black text-slate-800 mt-1">₹{PER_KM_RATE}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Base Fare</p>
                  <p className="font-black text-slate-800 mt-1">₹{price.base}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Estimate</p>
                  <p className="text-white text-4xl font-black">₹{price.total}</p>
                  <p className="text-slate-500 text-xs mt-1 font-medium">Base ₹{price.base} + {price.distance}km × ₹{PER_KM_RATE}</p>
                </div>
                <button
                  onClick={handlePayment}
                  className="bg-white text-slate-900 font-black py-3.5 px-6 rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all text-sm"
                >
                  Book & Pay ₹{price.total}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ────────────────────────────────────── */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mb-6 border border-green-100 relative">
              <div className="absolute inset-0 bg-green-400/10 rounded-3xl animate-ping" />
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3 font-outfit">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-xs">Your logistics partner has been notified. They will arrive at the pickup location shortly.</p>
            <div className="w-full space-y-3">
              <button onClick={() => navigate('/track')} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20">
                Track Live
              </button>
              <button onClick={() => navigate('/')} className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
