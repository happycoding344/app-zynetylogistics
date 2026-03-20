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
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 animate-pulse">
                  <Navigation size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-2">Listening for requests...</h3>
               <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">Stay online to receive new delivery assignments near your live location.</p>
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
