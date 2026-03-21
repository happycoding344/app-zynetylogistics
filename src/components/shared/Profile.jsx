import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Award, Shield, ChevronRight, Save, Edit3, X, CheckCircle2, Phone, Briefcase, MapPin, Mail, Loader2, Gift } from 'lucide-react';

const API_BASE = 'https://zynetylogistics.com/wp-json/zynety/v1';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'rewards'
  
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    company: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('zynety_user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      setFormData({
        display_name: parsedUser.display_name || '',
        phone: parsedUser.phone || '',
        company: parsedUser.company || '',
        address: parsedUser.address || ''
      });
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zynety_user');
    window.location.href = '/';
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id || user.id || 0,
          user_email: user.email,
          ...formData
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updatedUser = {
          ...user,
          display_name: data.display_name,
          phone: data.phone,
          company: data.company,
          address: data.address
        };
        setUser(updatedUser);
        localStorage.setItem('zynety_user', JSON.stringify(updatedUser));
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16 w-full max-w-2xl mx-auto">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-6 sticky top-0 z-20 shadow-sm justify-between shrink-0">
        <h1 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight">My Profile</h1>
        {!isEditing && activeTab === 'profile' && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
          >
            <Edit3 size={14} /> Edit
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {message && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 size={16} /> {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex items-center justify-center text-white text-3xl font-black font-outfit shrink-0">
                   {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                   <h2 className="text-2xl font-bold text-slate-800 truncate font-outfit">{user.display_name || 'My Account'}</h2>
                   <p className="text-sm font-medium text-slate-500 truncate flex items-center gap-1.5 mt-0.5"><Mail size={14} className="text-slate-400"/> {user.email}</p>
                   <div className="mt-3 flex gap-2">
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md">{user.role}</span>
                     {user.company && <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-md max-w-[120px] truncate">{user.company}</span>}
                   </div>
                </div>
             </div>
          </div>

          {!isEditing ? (
            <>
              {/* Tabs */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  Personal Details
                </button>
                <button 
                  onClick={() => setActiveTab('rewards')}
                  className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${activeTab === 'rewards' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <Award size={16} /> Zynety Rewards
                </button>
              </div>

              {activeTab === 'profile' && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Full Name</p>
                      <p className="font-bold text-slate-800">{user.display_name || <span className="text-slate-300 font-medium">Not set</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                      <p className="font-bold text-slate-800">{user.phone || <span className="text-slate-300 font-medium">Not set</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Briefcase size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Company Name</p>
                      <p className="font-bold text-slate-800">{user.company || <span className="text-slate-300 font-medium">Not set</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Saved Address</p>
                      <p className="font-bold text-slate-800 text-sm leading-relaxed">{user.address || <span className="text-slate-300 font-medium whitespace-pre-line">Not set</span>}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                    <Gift size={120} className="absolute -right-6 -bottom-6 text-white/10" />
                    <div className="relative z-10 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={20} className="text-orange-200" />
                        <h3 className="font-black tracking-widest uppercase text-xs text-orange-200">First Order Benefit</h3>
                      </div>
                      <h2 className="text-3xl font-outfit font-extrabold mb-1">Get 20% Off</h2>
                      <p className="text-orange-100 font-medium text-sm max-w-[80%] mb-6">Claim your welcome discount on your first booking with Zynety Logistics.</p>
                      
                      <div className="p-4 bg-black/10 rounded-2xl border border-white/20 flex items-center justify-between backdrop-blur-sm">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-black text-orange-200 mb-0.5">Coupon Code</p>
                          <p className="text-2xl font-black font-mono tracking-wider">Zynety20</p>
                        </div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText('Zynety20'); alert('Copied to clipboard!'); }}
                          className="bg-white text-orange-600 font-bold px-4 py-2 rounded-xl text-xs shadow-sm hover:bg-orange-50 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-2">How to use rewards?</h3>
                    <ul className="text-sm text-slate-500 space-y-2 font-medium">
                      <li className="flex gap-2"><span className="text-orange-500 font-bold">1.</span> Proceed to book a new delivery vehicle.</li>
                      <li className="flex gap-2"><span className="text-orange-500 font-bold">2.</span> On the checkout confirmation screen, look for the coupon field.</li>
                      <li className="flex gap-2"><span className="text-orange-500 font-bold">3.</span> Paste <strong className="text-slate-700 mx-1">Zynety20</strong> and tap Apply.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Editing Form */
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-slate-800 text-lg font-outfit">Edit Details</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name <span className="font-medium normal-case text-slate-300">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Your Business Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Default Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter your complete address..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-100 group">
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>

          <p className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-8 pb-4">Zynety Logistics Private Limited • v1.1.0</p>

        </div>
      </div>
    </div>
  );
}
