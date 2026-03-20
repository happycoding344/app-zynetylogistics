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
         {/* Clear empty state for multi-tenant production app */}
         <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full mx-auto flex items-center justify-center mb-4"><Package size={32}/></div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No orders found</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Your logistics history will appear here once you place a request.</p>
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
