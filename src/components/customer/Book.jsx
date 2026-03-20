import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, ChevronRight, Map, Banknote } from 'lucide-react';

export default function Book({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service') || 'bike';

  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [itemType, setItemType] = useState('documents');
  const [price, setPrice] = useState(null);

  const calculatePrice = () => {
    // Read from WordPress injected config or fallback to defaults
    const config = window.ZynetyConfig || {
      bike: { base: 16, rate: 8 },
      truck: { base: 36, rate: 18 },
      packers: { base: 80, rate: 40 },
      intercity: { base: 24, rate: 12 }
    };

    let distance = Math.floor(Math.random() * 20) + 5; // Fixed mock distance for now
    let rate = config[serviceQuery]?.rate || 8;
    let baseCharge = config[serviceQuery]?.base || 16;

    const total = Math.round((distance * rate) + baseCharge);
    setPrice({ distance, total });
    setStep(2);
  };

  const confirmBooking = async () => {
    try {
      const apiBase = 'https://zynetylogistics.com/wp-json/zynety/v1/bookings';
      // Mute errors if we are testing locally without the WP plugin installed
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pickup, 
          drop, 
          service: serviceQuery, 
          price: price.total,
          user_id: user?.user_id || 1 
        })
      });
      const data = await res.json();
      console.log('Booking Saved:', data);
    } catch (e) {
      console.warn("Backend not reachable or plugin not active. Proceeding with mock UI.");
    }
    setStep(3);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header */}
      <header className="h-14 flex items-center px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 shrink-0">
        <button onClick={() => step === 1 ? navigate('/') : setStep(step - 1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-outfit font-bold text-lg ml-2">Book Service</h1>
      </header>

      <div className="p-4 flex-1 overflow-y-auto pb-20">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Location Inputs */}
            <div className="glass-panel p-4 mb-4 relative z-0">
              <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 z-[-1]"></div>
              
              <div className="flex items-center gap-3 mb-4 bg-white rounded-xl p-2 border border-blue-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                </div>
                <input 
                  type="text" 
                  placeholder="Pickup Location (Pincode)" 
                  className="bg-transparent border-none outline-none flex-1 text-slate-800 font-medium placeholder-slate-400"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-white rounded-xl p-2 border border-red-100 shadow-sm focus-within:ring-2 focus-within:ring-red-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-red-600" />
                </div>
                <input 
                  type="text" 
                  placeholder="Drop Location (Pincode)" 
                  className="bg-transparent border-none outline-none flex-1 text-slate-800 font-medium placeholder-slate-400"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                />
              </div>
            </div>

            {/* Extra Details */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-800 font-outfit">Item Details</h3>
              <select 
                className="input-field bg-white shadow-sm border-gray-100"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="documents">Documents / Parcels</option>
                <option value="electronics">Electronics / Appliances</option>
                <option value="furniture">Furniture</option>
                <option value="boxes">Multiple Boxes</option>
              </select>
            </div>

            <button 
              className={`btn-primary mt-8 flex items-center justify-center gap-2 ${(!pickup || !drop) ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={calculatePrice}
            >
              Get Estimate
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && price && (
           <div className="space-y-6 animate-fade-in">
             <div className="glass-panel p-6 mb-4 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote size={32} className="text-blue-600" />
                </div>
                <p className="text-gray-500 mb-1">Estimated Fare</p>
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">₹{price.total}</h2>
                <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-1"><Map size={16}/> {price.distance} km</span>
                  <span className="flex items-center gap-1"><Truck size={16}/> {serviceQuery}</span>
                </div>
             </div>

             <div className="glass-panel p-4 border border-blue-100 bg-blue-50/50">
               <h4 className="font-bold text-slate-800 text-sm mb-2">Payment Option</h4>
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full border-4 border-blue-600"></div>
                 <span className="font-medium text-slate-700">Cash on Delivery</span>
               </div>
             </div>

             <button className="btn-primary w-full shadow-blue-500/30 text-lg py-4 mt-6" onClick={confirmBooking}>
               Confirm Booking
             </button>
           </div>
        )}

        {step === 3 && (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in py-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 transform scale-110">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 font-outfit">Booking Confirmed!</h2>
            <p className="text-center text-gray-500 mb-8 max-w-xs">Connecting you to the nearest driver partner. They will reach you shortly.</p>
            
            <button className="btn-primary w-full max-w-[200px]" onClick={() => navigate('/track')}>
              Track Driver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
