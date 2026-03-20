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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2rem] m-4 shadow-sm border border-slate-100">
         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border-2 border-dashed border-slate-200">
            <MapPin size={32} />
         </div>
         <h2 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight mb-2">No Active Trips</h2>
         <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">You don't have any ongoing deliveries right now. Once you book a fleet, you can track it live here.</p>
         
         <button onClick={() => window.location.href='/book-select'} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            Book a Delivery <ChevronRight size={18} />
         </button>
      </div>
    </div>
  );
}
