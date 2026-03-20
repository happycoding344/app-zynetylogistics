import React from 'react';
import { Package, Search, ChevronRight, CheckCircle2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const navigate = useNavigate();
  // We'll mock some recent orders for the frontend completion.
  // In a full implementation, you'd fetch this from WP REST API filtering by `author=user_id`.

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] relative pb-16 max-w-4xl mx-auto w-full">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-6 sticky top-0 z-20 shadow-sm justify-between">
        <h1 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight">Order History</h1>
        <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
           <Search size={20}/>
        </button>
      </header>

      <div className="p-6">
         {/* Active/Recent Order Placeholder */}
         <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">Recent Bookings</h3>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 relative overflow-hidden group cursor-pointer hover:border-blue-200 transition-colors" onClick={() => navigate('/track')}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
               
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                     <Package size={24}/>
                   </div>
                   <div>
                     <p className="font-bold text-slate-800 text-lg">ZYN-82749</p>
                     <p className="text-xs font-bold text-slate-400 mt-0.5">Today, 02:30 PM</p>
                   </div>
                 </div>
                 <div className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                   <CheckCircle2 size={12}/> Completed
                 </div>
               </div>

               <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 ml-4 mb-6">
                 <div className="relative">
                   <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-600 shadow-sm z-10"></div>
                   <p className="font-bold text-slate-700 text-sm">Andheri West, Mumbai</p>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-purple-600 shadow-sm z-10"></div>
                   <p className="font-bold text-slate-700 text-sm">Bandra Kurla Complex</p>
                 </div>
               </div>

               <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                 <div>
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Paid</p>
                   <p className="font-black text-lg text-slate-800">₹240.00</p>
                 </div>
                 <button className="text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl border border-blue-100 transition-colors flex items-center gap-2">
                   Track Route <Navigation size={14}/>
                 </button>
               </div>
            </div>
         </div>

         {/* Empty State for Old Orders */}
         <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full mx-auto flex items-center justify-center mb-4"><Package size={32}/></div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No past orders</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Your older logistics history will appear here once you start booking with us.</p>
         </div>

      </div>
    </div>
  );
}
