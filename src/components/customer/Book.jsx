import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, ChevronRight, User, Phone, Search, Navigation } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '1.5rem',
  marginTop: '1rem',
  border: '1px solid #e2e8f0'
};

const center = {
  lat: 19.0760, // Mumbai default
  lng: 72.8777
};

export default function Book({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service') || 'bike';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  const [price, setPrice] = useState(null);

  // Form State
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

  // Lat/Lng for Map
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const pickupAutocompleteRef = useRef(null);
  const dropAutocompleteRef = useRef(null);

  const extractPincode = (place) => {
    let pincode = '';
    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
          break;
        }
      }
    }
    return pincode;
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      const pincode = extractPincode(place);
      setFormData(prev => ({
        ...prev, 
        pickup_address: place.formatted_address || place.name,
        pickup_pincode: pincode || prev.pickup_pincode
      }));
      if (place.geometry) {
        setPickupCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocompleteRef.current) {
      const place = dropAutocompleteRef.current.getPlace();
      const pincode = extractPincode(place);
      setFormData(prev => ({
        ...prev, 
        drop_address: place.formatted_address || place.name,
        drop_pincode: pincode || prev.drop_pincode
      }));
      if (place.geometry) {
        setDropCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    }
  };

  const handleMarkerDragEnd = async (e, type) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newCoords = { lat, lng };

    if (type === 'pickup') setPickupCoords(newCoords);
    else setDropCoords(newCoords);

    // Reverse Geocode
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newCoords }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const pincode = extractPincode(place);
        if (type === 'pickup') {
          setFormData(prev => ({
            ...prev,
            pickup_address: place.formatted_address,
            pickup_pincode: pincode || prev.pickup_pincode
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            drop_address: place.formatted_address,
            drop_pincode: pincode || prev.drop_pincode
          }));
        }
      }
    });
  };

  const calculatePrice = () => {
    if (!pickupCoords || !dropCoords) {
        // Fallback to older logic if maps failed
        if (!formData.pickup_pincode || !formData.drop_pincode) return;
    }
    
    setCalculating(true);
    
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickupCoords || formData.pickup_address],
        destinations: [dropCoords || formData.drop_address],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const distanceText = response.rows[0].elements[0].distance.text;
          const distanceValue = response.rows[0].elements[0].distance.value / 1000; // in km
          
          const config = window.ZynetyConfig || {};
          let base = 16;
          
          if(serviceQuery === 'truck') {
            base = parseFloat(config.truck_base) || 36;
          } else if (serviceQuery === 'bike') {
            base = parseFloat(config.bike_base) || 16;
          } else if (serviceQuery === 'packers') {
            base = parseFloat(config.packers_base) || 500;
          }
          
          // User Formula: Base + (Distance * 16)
          const perKmRate = 16;
          const calcPrice = Math.floor(base + (distanceValue * perKmRate));
          
          setPrice({
            distance: distanceValue.toFixed(1),
            total: calcPrice,
            base: base
          });
          setCalculating(false);
          setStep(3);
        } else {
          console.error("Distance Calculation Failed", status);
          setCalculating(false);
          alert("Could not calculate distance. Please check addresses.");
        }
      }
    );
  };

  const confirmBooking = async () => {
    try {
      const apiBase = 'https://zynetylogistics.com/wp-json/zynety/v1/bookings';
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          pickup: formData.pickup_address,
          drop: formData.drop_address,
          service: serviceQuery, 
          price: price.total,
          user_id: user?.user_id || 1 
        })
      });
      const data = await res.json();
      console.log('Booking Saved:', data);
    } catch (e) {
      console.warn("Backend not reachable or plugin not active.", e);
    }
    setStep(4);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] relative pb-16">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-4 sticky top-0 z-20 shadow-sm">
        <button onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50 active:bg-slate-100 transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-xl font-outfit font-extrabold ml-2 text-slate-800 tracking-tight">
          {step === 1 ? 'Pickup Details' : step === 2 ? 'Drop Details' : step === 3 ? 'Confirm Order' : 'Success'}
        </h1>
      </header>

      {/* STEP INDICATOR */}
      {step < 4 && (
        <div className="flex px-10 py-6 bg-white border-b border-slate-50 justify-between items-center">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
          <div className={`flex-1 h-1.5 self-center mx-3 rounded-full transition-all ${step >= 2 ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-100'}`}></div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
          <div className={`flex-1 h-1.5 self-center mx-3 rounded-full transition-all ${step >= 3 ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-100'}`}></div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
        </div>
      )}

      {/* STEP 1: SENDER & PICKUP */}
      {step === 1 && (
        <div className="p-4 space-y-6 flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50">
            <h2 className="font-outfit font-extrabold text-xl text-slate-800 mb-6 flex items-center"><MapPin size={22} className="mr-3 text-blue-600"/> Pickup Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Sender Name</label>
                <input type="text" name="sender_name" value={formData.sender_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Enter Full Name" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Mobile Number</label>
                <input type="tel" name="sender_phone" value={formData.sender_phone} onChange={handleChange} maxLength="10" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="10-digit number" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Pickup Address (Search on Map)</label>
                {isLoaded ? (
                  <Autocomplete 
                    onLoad={(ref) => (pickupAutocompleteRef.current = ref)} 
                    onPlaceChanged={onPickupPlaceChanged}>
                    <div className="relative group">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Street, Locality, City..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="animate-pulse bg-slate-100 h-12 rounded-2xl w-full"></div>
                )}
              </div>

              {isLoaded && pickupCoords && (
                <div className="relative group">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-blue-600 border border-blue-100 shadow-sm flex items-center gap-2">
                    <Navigation size={12}/> Drag pin to refine location
                  </div>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={pickupCoords || center}
                    zoom={15}
                    options={{ disableDefaultUI: true, borderRadius: '24px' }}
                  >
                    <Marker 
                      position={pickupCoords} 
                      draggable={true} 
                      onDragEnd={(e) => handleMarkerDragEnd(e, 'pickup')}
                    />
                  </GoogleMap>
                </div>
              )}

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest pl-1">Autodetected Pincode</span>
                <input type="tel" name="pickup_pincode" value={formData.pickup_pincode} onChange={handleChange} maxLength="6" className="bg-transparent text-right font-black text-blue-800 text-lg outline-none w-24" placeholder="000000" />
              </div>
            </div>
            
            <button 
              className={`w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(formData.sender_name && formData.sender_phone.length === 10 && formData.pickup_pincode) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
              onClick={() => setStep(2)}
            >
              Confirm Pickup <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: RECEIVER & DROP */}
      {step === 2 && (
        <div className="p-4 space-y-6 flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50">
            <h2 className="font-outfit font-extrabold text-xl text-slate-800 mb-6 flex items-center"><MapPin size={22} className="mr-3 text-purple-600"/> Drop Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Receiver Name</label>
                <input type="text" name="receiver_name" value={formData.receiver_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all" placeholder="Enter Full Name" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Mobile Number</label>
                <input type="tel" name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} maxLength="10" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all" placeholder="10-digit number" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Drop Address (Search on Map)</label>
                {isLoaded ? (
                  <Autocomplete 
                    onLoad={(ref) => (dropAutocompleteRef.current = ref)} 
                    onPlaceChanged={onDropPlaceChanged}>
                    <div className="relative group">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input type="text" name="drop_address" value={formData.drop_address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm" placeholder="Search destination..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="animate-pulse bg-slate-100 h-12 rounded-2xl w-full"></div>
                )}
              </div>

              {isLoaded && dropCoords && (
                <div className="relative group">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-purple-600 border border-purple-100 shadow-sm flex items-center gap-2">
                    <Navigation size={12}/> Drag pin to refine location
                  </div>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={dropCoords || center}
                    zoom={15}
                    options={{ disableDefaultUI: true }}
                  >
                    <Marker 
                      position={dropCoords} 
                      draggable={true} 
                      onDragEnd={(e) => handleMarkerDragEnd(e, 'drop')}
                    />
                  </GoogleMap>
                </div>
              )}

              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest pl-1">Autodetected Pincode</span>
                <input type="tel" name="drop_pincode" value={formData.drop_pincode} onChange={handleChange} maxLength="6" className="bg-transparent text-right font-black text-purple-800 text-lg outline-none w-24" placeholder="000000" />
              </div>
            </div>
            
            <button 
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(formData.receiver_name && formData.receiver_phone.length === 10 && formData.drop_pincode) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
              onClick={calculatePrice}
              disabled={calculating}
            >
              {calculating ? (
                <>
                  <Activity size={20} className="animate-spin" />
                  Calculating Fare...
                </>
              ) : (
                <>
                  Get Pricing <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRICE CONFIRMATION */}
      {step === 3 && price && (
        <div className="p-4 space-y-6 flex-1 h-full flex flex-col max-w-2xl mx-auto w-full">
           <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col h-full">
              <h3 className="text-2xl font-outfit font-extrabold text-slate-800 mb-8 tracking-tight">Booking Summary</h3>
              
              <div className="relative pl-8 space-y-10 mb-8 border-l-2 border-slate-100 ml-4">
                 <div className="relative">
                   <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-blue-600 shadow-md shadow-blue-200 z-10"></div>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pickup ({formData.pickup_pincode})</p>
                   <p className="font-bold text-slate-800 text-sm leading-snug">{formData.pickup_address}</p>
                   <p className="text-xs font-medium text-slate-400 mt-1">{formData.sender_name} • {formData.sender_phone}</p>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-purple-600 shadow-md shadow-purple-200 z-10"></div>
                   <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Drop ({formData.drop_pincode})</p>
                   <p className="font-bold text-slate-800 text-sm leading-snug">{formData.drop_address}</p>
                   <p className="text-xs font-medium text-slate-400 mt-1">{formData.receiver_name} • {formData.receiver_phone}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Distance</p>
                    <p className="text-lg font-black text-slate-800">{price.distance} km</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rate / km</p>
                    <p className="text-lg font-black text-slate-800">₹16</p>
                 </div>
              </div>

              <div className="mt-auto bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-bl-full filter blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                 <div className="flex items-center justify-between mb-8 opacity-70">
                    <span className="text-slate-400 font-bold tracking-wide">Vehicle Base Fare</span>
                    <span className="text-white font-black">₹{price.base}</span>
                 </div>
                 <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                        <Activity size={12} className="text-green-500"/> Final Estimate
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-white text-4xl font-black tracking-tighter">₹{price.total}</span>
                      </div>
                    </div>
                    <button onClick={confirmBooking} className="py-4 px-8 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all">
                       Book Now
                    </button>
                 </div>
                 <p className="text-[9px] text-center text-slate-600 mt-6 font-bold uppercase tracking-widest">Zynety Logistics Private Limited • Verified Pricing</p>
              </div>
           </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 max-w-md mx-auto h-full">
          <div className="w-28 h-28 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mb-8 relative border border-green-100">
             <div className="absolute inset-0 bg-green-500/10 rounded-[2.5rem] animate-ping duration-[2000ms]"></div>
             <CheckCircle2 size={56} strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-outfit font-extrabold text-slate-800 mb-4 tracking-tight">Way to go!</h2>
          <p className="text-slate-500 font-bold mb-10 leading-relaxed opacity-80">Your booking is live. A Zynety logistics partner will arrive at the pickup spot soon.</p>
          
          <div className="w-full space-y-3">
            <button 
              onClick={() => navigate('/track')}
              className="bg-green-600 hover:bg-green-700 text-white w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-green-600/20 active:scale-[0.98]"
            >
              Track Real-time
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 text-base font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest ml-1"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
