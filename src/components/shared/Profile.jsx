import React from 'react';
import { User, LogOut, Settings, Award, Shield, ChevronRight } from 'lucide-react';

export default function Profile() {
  const userStr = localStorage.getItem('zynety_user');
  const user = userStr ? JSON.parse(userStr) : { email: 'User', role: 'customer' };

  const handleLogout = () => {
    localStorage.removeItem('zynety_user');
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16 w-full max-w-2xl mx-auto">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-6 sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight">My Profile</h1>
      </header>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
           <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex items-center justify-center text-white text-3xl font-black font-outfit">
                 {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-bold text-slate-800 break-all">{user.email}</h2>
                 <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1 capitalize border border-blue-100 bg-blue-50 inline-block px-3 py-1 rounded-lg">{user.role}</p>
              </div>
           </div>
        </div>

        {/* Settings Links */}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 mt-8">Account Settings</h3>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
           <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><User size={20}/></div>
                 <span className="font-bold text-slate-700">Personal Information</span>
              </div>
              <ChevronRight size={20} className="text-slate-400"/>
           </button>
           <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Shield size={20}/></div>
                 <span className="font-bold text-slate-700">Privacy & Passwords</span>
              </div>
              <ChevronRight size={20} className="text-slate-400"/>
           </button>
           <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Award size={20}/></div>
                 <span className="font-bold text-slate-700">Zynety Rewards</span>
              </div>
              <ChevronRight size={20} className="text-slate-400"/>
           </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full mt-8 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-100">
           <LogOut size={20}/> Sign Out
        </button>

        <p className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-8">Zynety Logistics Private Limited • v1.0.0</p>

      </div>
    </div>
  );
}
