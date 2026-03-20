import React from 'react';
import { User, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Settings } from 'lucide-react';

export default function Profile({ role, setRole, setIsAuthenticated }) {
  const toggleRole = () => {
    setRole(role === 'customer' ? 'driver' : 'customer');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const options = [
    { icon: User, label: "Edit Profile" },
    { icon: Shield, label: "Privacy Policy" },
    { icon: CreditCard, label: "Payment Methods" },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help & Support" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 pt-10 pb-6 px-6 text-white text-center rounded-b-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 flex items-center justify-center mb-3 shadow-sm">
                <span className="text-2xl font-bold font-outfit">S</span>
            </div>
            <h2 className="text-2xl font-extrabold font-outfit tracking-tight">Sang्राम Singh</h2>
            <p className="text-blue-100 font-medium text-sm">+91 98765 43210</p>
            
            <div className="mt-4 inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-xs font-bold uppercase tracking-wider">{role === 'customer' ? 'Customer Profile' : 'Driver Profile'}</span>
            </div>
        </div>
      </div>

      <div className="p-4 mt-2 mb-20 space-y-4">
        {/* Role Toggle Switch */}
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-blue-500">
           <div>
             <h4 className="font-bold text-slate-800 text-sm">Switch Account Mode</h4>
             <p className="text-xs text-gray-500 mt-0.5">Currently acting as {role === 'customer' ? 'Customer' : 'Driver Partner'}</p>
           </div>
           <button 
             onClick={toggleRole}
             className="bg-blue-50 text-blue-600 active:scale-95 transition-all text-xs font-bold px-4 py-2 rounded-xl shadow-sm border border-blue-100"
           >
             Switch to {role === 'customer' ? 'Driver' : 'Customer'}
           </button>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           {options.map((opt, i) => (
             <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50 transition-colors last:border-0 cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-gray-100">
                     <opt.icon size={16} />
                   </div>
                   <span className="font-medium text-slate-700 text-sm">{opt.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
             </div>
           ))}
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white border border-red-100 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 font-bold active:bg-red-50 transition-colors shadow-sm"
        >
           <LogOut size={18} />
           Log Out
        </button>
      </div>
    </div>
  );
}
