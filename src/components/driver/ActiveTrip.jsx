import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation2, Phone, MessageSquare, CheckCircle2, Navigation, MapPin, Play } from 'lucide-react';

export default function ActiveTrip() {
  const navigate = useNavigate();
  const [tripState, setTripState] = useState('navigating_pickup'); // navigating_pickup, at_pickup, loaded, navigating_drop, completed

  const advanceState = () => {
    if(tripState === 'navigating_pickup') setTripState('at_pickup');
    else if(tripState === 'at_pickup') setTripState('navigating_drop');
    else if(tripState === 'navigating_drop') setTripState('completed');
  };

  if(tripState === 'completed') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in p-6 bg-gradient-to-b from-orange-50 to-[#F8FAFC]">
        <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 transform scale-110">
           <CheckCircle2 size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 font-outfit">Trip Completed</h2>
        <h1 className="text-5xl font-extrabold text-emerald-600 tracking-tight font-outfit mb-6">₹320</h1>
        
        <div className="glass-panel p-4 w-full mb-8 text-center flex justify-around">
           <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Time</p>
              <p className="font-bold text-slate-800">22 mins</p>
           </div>
           <div className="w-px bg-gray-200"></div>
           <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Distance</p>
              <p className="font-bold text-slate-800">8.2 km</p>
           </div>
        </div>
        
        <button className="btn-primary w-full shadow-orange-500/30 bg-gradient-to-r from-orange-500 to-red-500" onClick={() => navigate('/')}>
          Find Next Trip
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Map Header / Navigation Frame */}
      <div className="flex-1 relative bg-gray-800 overflow-hidden flex flex-col justify-end">
         <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=14&scale=2&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ca4bc&style=feature:all|element:labels.text.stroke|visibility:on|color:0x1b2c3d&style=feature:landscape|element:geometry|color:0x2c3b4d')] bg-cover bg-center mix-blend-screen opacity-60"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80 z-0"></div>
         
         <div className="absolute top-4 left-4 right-4 z-10">
           <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-gray-700 shadow-2xl">
             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/30">
               <Navigation2 size={24} className="transform rotate-45" />
             </div>
             <div className="flex-1">
               <h3 className="text-white font-bold text-lg leading-tight">Proceed to {tripState.includes('pickup') ? 'Pickup' : 'Drop'}</h3>
               <p className="text-emerald-400 font-medium text-sm">In 1.2 km, Turn Left</p>
             </div>
             <div className="text-right">
               <h3 className="text-white font-extrabold text-xl leading-tight">5 <span className="text-sm font-medium text-gray-400">min</span></h3>
             </div>
           </div>
         </div>
      </div>

      {/* Actions and Info Panel */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] shrink-0 z-20 pb-safe relative -mt-6">
        <div className="w-full flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-5 py-4">
           {/* Customer Details */}
           <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                   A
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800 text-lg leading-tight">Amit Sharma</h3>
                   <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                     <Phone size={12}/> Customer
                   </p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm"><MessageSquare size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm"><Phone size={18} /></button>
              </div>
           </div>

           <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                 {tripState.includes('pickup') ? <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div> : <MapPin size={16} className="text-red-500" />}
              </div>
              <div className="text-sm">
                 <p className="font-bold text-slate-800">{tripState.includes('pickup') ? 'Pickup Location' : 'Drop Location'}</p>
                 <p className="text-gray-500 truncate line-clamp-1">12th Cross Road, Business Park, Andheri East</p>
              </div>
           </div>

           <button 
             className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all"
             onClick={advanceState}
           >
             {tripState === 'navigating_pickup' ? 'Arrived at Pickup' : 
              tripState === 'at_pickup' ? (
                <>Start Trip <Play size={20} fill="currentColor" /></>
              ) : 'Complete Drop'}
           </button>
        </div>
      </div>
    </div>
  );
}
