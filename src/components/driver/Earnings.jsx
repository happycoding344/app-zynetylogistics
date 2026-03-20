import React from 'react';
import { IndianRupee, Wallet, CalendarRange, TrendingUp, Filter, ChevronRight } from 'lucide-react';

export default function Earnings() {
  const transactions = [
    { id: 1, type: "Trip Fare", ref: "CRN120938", date: "Today, 10:45 AM", amount: 320, isCredit: true },
    { id: 2, type: "Platform Fee", ref: "CRN120938", date: "Today, 10:45 AM", amount: 64, isCredit: false },
    { id: 3, type: "Trip Fare", ref: "CRN120911", date: "Yesterday", amount: 450, isCredit: true },
    { id: 4, type: "Incentive", ref: "Daily Target", date: "Yesterday", amount: 200, isCredit: true },
    { id: 5, type: "Payout", ref: "Bank Transfer", date: "Mar 18, 2026", amount: 1250, isCredit: false, isPayout: true },
  ];

  return (
    <div className="p-4 pb-20 animate-fade-in bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-2xl font-extrabold text-slate-800 font-outfit">Earnings</h2>
        <button className="text-blue-600 font-medium text-sm flex items-center gap-1 active:scale-95 transition-all">
          <CalendarRange size={16}/> This Week
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-xl shadow-slate-900/20">
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500 rounded-full opacity-20 blur-3xl"></div>
         <div className="absolute right-0 bottom-0 opacity-10">
            <TrendingUp size={120} />
         </div>

         <div className="relative z-10">
           <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
             <Wallet size={16}/> Available Payout
           </p>
           <h1 className="text-4xl font-extrabold font-outfit tracking-tight mb-4">₹2,840<span className="text-xl text-slate-400">.50</span></h1>
           
           <div className="flex gap-3">
             <button className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors py-2.5 rounded-xl font-bold text-sm backdrop-blur-md border border-white/10">Withdraw</button>
             <button className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20">Details</button>
           </div>
         </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-panel p-4 flex flex-col justify-center">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trips</p>
           <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">42</h3>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Incentives</p>
           <h3 className="text-2xl font-extrabold text-green-600 font-outfit">₹650</h3>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg font-outfit">Recent Activity</h3>
        <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95">
          <Filter size={14} />
        </button>
      </div>

      <div className="space-y-3">
         {transactions.map(txn => (
           <div key={txn.id} className="glass-panel p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.isPayout ? 'bg-purple-100 text-purple-600' : txn.isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <IndianRupee size={16} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">{txn.type}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{txn.ref} • {txn.date}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className={`font-bold font-outfit ${txn.isPayout ? 'text-slate-800' : txn.isCredit ? 'text-green-600' : 'text-slate-800'}`}>
                   {txn.isPayout ? '-' : txn.isCredit ? '+' : '-'}₹{txn.amount}
                </p>
              </div>
           </div>
         ))}
         
         <button className="w-full py-4 text-center text-sm font-bold text-blue-600 flex items-center justify-center gap-1 active:bg-blue-50 transition-colors rounded-xl">
            View All Transactions <ChevronRight size={16} />
         </button>
      </div>
    </div>
  );
}
