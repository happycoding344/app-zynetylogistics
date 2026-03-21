import React, { useState, useEffect } from 'react';
import { IndianRupee, Wallet, CalendarRange, TrendingUp, Filter, ChevronRight, Loader2 } from 'lucide-react';

const WP_REST_API = 'https://zynetylogistics.com/wp-json/wp/v2/zynety_booking';

export default function Earnings() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const userStr = localStorage.getItem('zynety_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const res = await fetch(`${WP_REST_API}?per_page=100&_fields=id,title,date,meta&orderby=date&order=desc`);
        if (!res.ok) throw new Error('Failed to fetch');
        const allBookings = await res.json();
        
        // Filter to include only successful/completed trips assigned to this driver
        const driverBookings = allBookings.filter(b => {
          const m = b.meta;
          const isDriver = m?.driver_email === user.email || String(m?.driver_id) === String(user.user_id || user.id);
          const isCompleted = ['completed', 'delivered', 'closed'].includes(m?.status);
          return isDriver && isCompleted;
        });

        let total = 0;
        const formattedTxns = driverBookings.map(b => {
          const driverCut = parseFloat(b.meta?.total_price || 0);
          total += driverCut;
          return {
            id: b.id,
            type: "Trip Fare",
            ref: b.title?.rendered || `#${b.id}`,
            date: new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: driverCut,
            isCredit: true,
            isPayout: false
          };
        });

        setTotalTrips(formattedTxns.length);
        setTotalEarnings(total);
        setTransactions(formattedTxns);
      } catch (e) {
        console.error("Earnings fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

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
           <h1 className="text-4xl font-extrabold font-outfit tracking-tight mb-4">₹{totalEarnings.toLocaleString('en-IN')}<span className="text-xl text-slate-400">.00</span></h1>
           
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
           <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">{totalTrips}</h3>
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
         {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <p className="font-bold text-sm">Loading Earnings...</p>
            </div>
         ) : transactions.length > 0 ? (
           transactions.map(txn => (
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
           ))
         ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="font-bold text-sm">No recent transactions found.</p>
              <p className="text-xs font-medium mt-1">Complete trips to see earnings here.</p>
            </div>
         )}
         
         <button className="w-full py-4 text-center text-sm font-bold text-blue-600 flex items-center justify-center gap-1 active:bg-blue-50 transition-colors rounded-xl">
            View All Transactions <ChevronRight size={16} />
         </button>
      </div>
    </div>
  );
}
