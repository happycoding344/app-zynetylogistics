import React from 'react';
import { User, Phone, MessageSquare, Star, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Track() {
  const driver = {
    name: "Ramesh Kumar",
    vehicle: "Tata Ace - MH 12 AB 1234",
    rating: 4.8,
    trips: 1240,
    eta: "5 mins"
  };

  const statuses = [
    { label: "Driver Assigned", time: "10:30 AM", completed: true },
    { label: "Arriving for Pickup", time: "10:35 AM", completed: false, current: true },
    { label: "Goods Loaded", time: "--", completed: false },
    { label: "On the way to Drop", time: "--", completed: false },
    { label: "Delivered", time: "--", completed: false }
  ];

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Map Placeholder */}
      <div className="flex-1 relative bg-gray-200 overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=13&size=600x600&maptype=roadmap&scale=2')] bg-cover bg-center opacity-40 mix-blend-multiply"></div>
         <div className="z-10 flex flex-col items-center glass-panel p-4 pb-3">
             <div className="animate-bounce">
                <MapPin size={40} className="text-blue-600 drop-shadow-md" />
             </div>
             <div className="w-12 h-3 bg-black/10 rounded-full blur-[2px] mt-1 hidden"></div>
             <p className="font-bold text-slate-800 text-sm mt-2 shadow-sm font-outfit">Live Tracking</p>
         </div>
      </div>

      {/* Driver Info & Status Panel */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] shrink-0 z-20 pb-safe">
        {/* Pull Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-5 py-4">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{driver.eta}</h2>
              <p className="text-blue-600 font-medium text-sm">Arriving at Pickup</p>
            </div>
            <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span className="font-outfit font-bold text-slate-700">OTP:</span>
              <span className="font-extrabold text-blue-600 tracking-widest text-lg">4823</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
             <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                <User size={24} className="text-gray-400" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-slate-800">{driver.name}</h3>
               <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                 <span className="flex items-center gap-0.5 font-medium"><Star size={12} className="text-amber-500 fill-amber-500" /> {driver.rating}</span>
                 <span>•</span>
                 <span>{driver.vehicle}</span>
               </div>
             </div>
             <div className="flex gap-2 shrink-0">
               <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                  <Phone size={18} />
               </button>
               <button className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                  <MessageSquare size={18} />
               </button>
             </div>
          </div>

          <div className="mt-6">
            <h4 className="font-bold font-outfit text-slate-800 mb-4">Trip Status</h4>
            <div className="pl-2 border-l-2 border-gray-100 ml-3 space-y-5 relative">
               {statuses.map((s, i) => (
                 <div key={i} className="relative pl-6">
                   {/* Timeline dot */}
                   {s.completed ? (
                     <div className="absolute -left-[29px] w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                       <CheckCircle2 size={12} className="text-white" />
                     </div>
                   ) : s.current ? (
                     <div className="absolute -left-[29px] w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-sm shadow-blue-500/30"></div>
                   ) : (
                     <div className="absolute -left-[23px] w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                   )}
                   
                   <div className={`flex justify-between items-center ${s.completed || s.current ? 'opacity-100' : 'opacity-40'}`}>
                      <span className={`font-medium ${s.current ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>{s.label}</span>
                      <span className="text-xs text-gray-400 font-medium">{s.time}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
