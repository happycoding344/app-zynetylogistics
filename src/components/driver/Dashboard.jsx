import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Power, MapPin, IndianRupee, BellRing, Clock } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = React.useState(true);

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
           <h2 className="text-2xl font-extrabold text-slate-800 font-outfit">Today</h2>
           <p className="text-gray-500 font-medium text-sm">4 Trips • ₹1,250</p>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md ${
            isOnline ? 'bg-green-100 text-green-700 shadow-green-500/20' : 'bg-gray-200 text-gray-600 shadow-gray-500/10'
          }`}
        >
          <Power size={16} />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {isOnline ? (
        <>
          {/* Active Need */}
          <div className="glass-panel p-5 mb-6 border-l-4 border-orange-500 relative overflow-hidden bg-orange-50/30">
             <div className="absolute -right-6 -top-6 text-orange-200 opacity-20 transform rotate-12 scale-150">
               <BellRing size={100} />
             </div>
             <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1"><span className="animate-pulse w-2.5 h-2.5 bg-orange-500 rounded-full block"></span> New Request</p>
             <div className="flex justify-between items-end">
               <div>
                  <h3 className="font-extrabold text-2xl text-slate-800 font-outfit">₹320</h3>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1"><Clock size={14}/> 8 km total • 25 mins</p>
               </div>
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500">
                  <Package size={24} />
               </div>
             </div>
             
             <div className="mt-4 space-y-2 relative before:absolute before:inset-y-[14px] before:left-[11px] before:w-0.5 before:bg-orange-100 before:-z-10">
               <div className="flex gap-3 text-sm z-10 relative">
                 <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border-2 border-white"><div className="w-2 h-2 rounded-full bg-orange-500"></div></div>
                 <div className="flex-1 bg-white p-2 rounded-lg border border-orange-100/50 shadow-sm truncate">Andheri East</div>
               </div>
               <div className="flex gap-3 text-sm z-10 relative">
                 <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 border-2 border-white"><MapPin size={12} className="text-red-500" /></div>
                 <div className="flex-1 bg-white p-2 rounded-lg border border-red-100/50 shadow-sm truncate">Bandra West</div>
               </div>
             </div>

             <div className="flex gap-3 mt-5">
               <button className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-white border border-gray-200 shadow-sm active:scale-95 transition-all">Reject</button>
               <button 
                className="flex-[2] py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/40 active:scale-95 transition-all"
                onClick={() => navigate('/trip')}
               >Accept</button>
             </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-8 text-center bg-gray-50 mt-10">
           <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-60">
             <Power size={32} className="text-gray-500" />
           </div>
           <h3 className="font-bold text-xl text-slate-800 font-outfit mb-2">You're Offline</h3>
           <p className="text-sm text-gray-500 mb-6">Go online to start receiving delivery requests.</p>
           <button onClick={() => setIsOnline(true)} className="btn-primary bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30">Go Online</button>
        </div>
      )}

      {/* Recommended Zones */}
      <div className="mt-8">
        <h4 className="font-bold text-slate-800 font-outfit mb-3">High Demand Zones</h4>
        <div className="space-y-3">
           {['Andheri East (2.4x)', 'Powai (1.8x)', 'BKC (1.5x)'].map((zone, i) => (
             <div key={i} className="glass-panel p-3 flex items-center justify-between border-l-2" style={{borderLeftColor: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#eab308'}}>
                <span className="font-medium text-slate-700 text-sm">{zone}</span>
                <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-1 rounded">Surge</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
