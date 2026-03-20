import React, { useState } from 'react';
import { Power, MapPin, Navigation, Compass, Star, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DriverHome({ user }) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="flex flex-col h-full relative pb-16">
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-bl-full filter blur-3xl"></div>
         <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
               <h2 className="text-2xl font-outfit font-extrabold tracking-tight">Driver Dashboard</h2>
               <p className="text-slate-400 font-medium text-sm mt-1">{user?.email || 'Partner'}</p>
            </div>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isOnline ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-slate-800 text-slate-400'}`}
            >
              <Power size={24} strokeWidth={3} />
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Today's Earnings</p>
               <p className="text-2xl font-black text-white">₹{isOnline ? '0' : '---'}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Active Hours</p>
               <p className="text-2xl font-black text-white">{isOnline ? '0.0h' : 'Offline'}</p>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
         <h3 className="font-extrabold text-slate-800 font-outfit text-lg tracking-tight">Available Requests</h3>
      </div>

      {isOnline ? (
         <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100">Mini Truck</span>
                     <span className="text-xs font-bold text-slate-400">2 min ago</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">₹450</span>
               </div>
               
               <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 ml-3 mb-5">
                 <div className="relative">
                   <div className="absolute -left-[29px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-blue-600 shadow-sm z-10"></div>
                   <p className="font-bold text-slate-700 text-sm">Andheri East</p>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-[29px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-purple-600 shadow-sm z-10"></div>
                   <p className="font-bold text-slate-700 text-sm">Borivali West</p>
                 </div>
               </div>

               <div className="flex gap-3">
                  <button className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors active:scale-[0.98]">Accept Trip</button>
                  <button className="px-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors">Decline</button>
               </div>
            </div>
         </div>
      ) : (
         <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
               <Power size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">You are Offline</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">Tap the power button above to go online and start receiving new delivery requests.</p>
         </div>
      )}
    </div>
  );
}
