import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, ChevronRight, User, Phone, Search } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);

  const calculatePrice = () => {
    if (!formData.pickup_pincode || !formData.drop_pincode || formData.pickup_pincode.length < 6 || formData.drop_pincode.length < 6) return;
    setCalculating(true);
    
    setTimeout(() => {
      // Mock Distance Calculation
      const dist = Math.floor(Math.random() * 20) + 5; 
      
      const config = window.ZynetyConfig || {};
      let base = 16, rate = 8; // fallback bike defaults
      
      if(serviceQuery === 'truck') {
        base = parseFloat(config.truck_base) || 36;
        rate = parseFloat(config.truck_rate) || 18;
      } else if (serviceQuery === 'bike') {
        base = parseFloat(config.bike_base) || 16;
        rate = parseFloat(config.bike_rate) || 8;
      } else if (serviceQuery === 'packers') {
        base = parseFloat(config.packers_base) || 500;
        rate = 50;
      }
      
      const calcPrice = Math.floor(base + (dist * rate));
      
      setPrice({
        distance: dist,
        total: calcPrice,
        base: base
      });
      setCalculating(false);
      setStep(3); // Go to confirm step
    }, 1200);
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
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      <header className="h-16 flex border-b border-gray-200 bg-white items-center px-4 sticky top-0 z-20 shadow-sm">
        <button onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-outfit font-extrabold ml-2 text-slate-800">
          {step === 1 ? 'Sender Details' : step === 2 ? 'Receiver Details' : step === 3 ? 'Confirm Order' : 'Booking Successful'}
        </h1>
      </header>

      {/* STEP INDICATOR */}
      {step < 4 && (
        <div className="flex px-8 py-4 bg-white border-b border-slate-100 justify-between">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
          <div className={`flex-1 h-1 self-center mx-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          <div className={`flex-1 h-1 self-center mx-2 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
        </div>
      )}

      {/* STEP 1: SENDER DETAILS */}
      {step === 1 && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="glass-panel p-5 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center"><User size={18} className="mr-2 text-blue-600"/> Sender Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Sender Name</label>
                <input type="text" name="sender_name" value={formData.sender_name} onChange={handleChange} className="input-field mt-1 font-semibold" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input type="tel" name="sender_phone" value={formData.sender_phone} onChange={handleChange} maxLength="10" className="input-field mt-1 font-semibold" placeholder="9876543210" />
              </div>
              <div className="h-px bg-slate-100 my-4"></div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Pickup Location</label>
                {isLoaded ? (
                  <Autocomplete 
                    onLoad={setPickupAutocomplete} 
                    onPlaceChanged={() => {
                        if(pickupAutocomplete !== null) {
                            const place = pickupAutocomplete.getPlace();
                            setFormData(prev => ({...prev, pickup_address: place.formatted_address || place.name}));
                        }
                    }}>
                    <div className="relative mt-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange} className="input-field pl-9 font-semibold text-sm" placeholder="Search Google Maps..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange} className="input-field mt-1 font-semibold text-sm" placeholder="Loading Maps..." />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Pincode</label>
                <input type="tel" name="pickup_pincode" value={formData.pickup_pincode} onChange={handleChange} maxLength="6" className="input-field mt-1 font-semibold text-lg tracking-widest text-blue-800" placeholder="000 000" />
              </div>
            </div>
            
            <button 
              className={`btn-primary mt-6 py-4 w-full ${(formData.sender_name && formData.sender_phone.length === 10 && formData.pickup_pincode.length >= 6) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
              onClick={() => setStep(2)}
            >
              Continue to Receiver <ChevronRight size={20} className="ml-1 inline" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: RECEIVER DETAILS */}
      {step === 2 && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="glass-panel p-5 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center"><User size={18} className="mr-2 text-purple-600"/> Receiver Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Receiver Name</label>
                <input type="text" name="receiver_name" value={formData.receiver_name} onChange={handleChange} className="input-field mt-1 font-semibold" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input type="tel" name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} maxLength="10" className="input-field mt-1 font-semibold" placeholder="9876543210" />
              </div>
              <div className="h-px bg-slate-100 my-4"></div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Drop Location</label>
                {isLoaded ? (
                  <Autocomplete 
                    onLoad={setDropAutocomplete} 
                    onPlaceChanged={() => {
                        if(dropAutocomplete !== null) {
                            const place = dropAutocomplete.getPlace();
                            setFormData(prev => ({...prev, drop_address: place.formatted_address || place.name}));
                        }
                    }}>
                    <div className="relative mt-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="drop_address" value={formData.drop_address} onChange={handleChange} className="input-field pl-9 font-semibold text-sm" placeholder="Search Google Maps..." />
                    </div>
                  </Autocomplete>
                ) : (
                  <input type="text" name="drop_address" value={formData.drop_address} onChange={handleChange} className="input-field mt-1 font-semibold text-sm" placeholder="Loading Maps..." />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Pincode</label>
                <input type="tel" name="drop_pincode" value={formData.drop_pincode} onChange={handleChange} maxLength="6" className="input-field mt-1 font-semibold text-lg tracking-widest text-purple-800" placeholder="000 000" />
              </div>
            </div>
            
            <button 
              className={`btn-primary bg-gradient-to-r from-blue-600 to-purple-600 mt-6 py-4 w-full ${(formData.receiver_name && formData.receiver_phone.length === 10 && formData.drop_pincode.length >= 6) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
              onClick={calculatePrice}
            >
              {calculating ? 'Calculating Route...' : 'Get Estimated Price'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRICE CONFIRMATION */}
      {step === 3 && price && (
        <div className="p-4 space-y-4 flex-1 h-full flex flex-col">
          <div className="glass-panel p-6 shadow-sm mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Route Info</h3>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-white border-[4px] border-blue-500 shadow-sm z-10"></div>
                <p className="text-xs font-bold text-blue-600 uppercase mb-0.5">Pickup ({formData.pickup_pincode})</p>
                <p className="text-sm font-semibold text-slate-800 truncate line-clamp-2">{formData.pickup_address || 'Custom Location'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formData.sender_name} - {formData.sender_phone}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-white border-[4px] border-purple-500 shadow-sm z-10"></div>
                <p className="text-xs font-bold text-purple-600 uppercase mb-0.5">Drop ({formData.drop_pincode})</p>
                <p className="text-sm font-semibold text-slate-800 truncate line-clamp-2">{formData.drop_address || 'Custom Location'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formData.receiver_name} - {formData.receiver_phone}</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center bg-slate-50 rounded-xl p-3">
               <div>
                 <p className="text-xs text-slate-500 font-medium">Est. Distance</p>
                 <p className="font-bold text-slate-800">{price.distance} km</p>
               </div>
               <div className="w-px h-8 bg-gray-300"></div>
               <div>
                 <p className="text-xs text-slate-500 font-medium text-right">Service Base</p>
                 <p className="font-bold text-slate-800 text-right">₹{price.base}</p>
               </div>
            </div>
          </div>

          <div className="mt-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full filter blur-xl"></div>
             <p className="text-slate-400 font-medium mb-1">Total Estimate</p>
             <div className="flex items-end gap-2 mb-6">
               <span className="text-4xl font-extrabold text-white tracking-tight leading-none">₹{price.total}</span>
             </div>
             
             <button onClick={confirmBooking} className="py-4 w-full bg-white text-slate-900 rounded-xl font-bold text-lg transition-transform active:scale-[0.98] flex items-center justify-center">
               Confirm Booking
             </button>
             <p className="text-[10px] text-center text-slate-500 mt-4 h-4">Final price may vary based on wait time.</p>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 relative">
             <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping"></div>
             <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-outfit font-extrabold text-slate-800 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed px-4">Your request has been sent to nearby Zynety driver partners.</p>
          
          <button 
            onClick={() => navigate('/track')}
            className="btn-primary w-full py-4 text-lg bg-green-600 hover:bg-green-700 shadow-green-500/30"
          >
            Track My Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 text-lg font-bold text-slate-600 mt-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
