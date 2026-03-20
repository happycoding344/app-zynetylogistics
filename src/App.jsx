import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Home, Package, MapPin, User, Truck, DollarSign, Navigation } from 'lucide-react'

// Components
import CustomerHome from './components/customer/Home'
import Book from './components/customer/Book'
import Track from './components/customer/Track'
import Dashboard from './components/driver/Dashboard'
import ActiveTrip from './components/driver/ActiveTrip'
import Earnings from './components/driver/Earnings'
import Profile from './components/Profile'

// Unified Nav Bar mapped by role
const BottomNav = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const customerTabs = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Book', icon: Package, path: '/book' },
    { name: 'Track', icon: MapPin, path: '/track' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];
  const driverTabs = [
    { name: 'Dash', icon: Home, path: '/' },
    { name: 'Trip', icon: Navigation, path: '/trip' },
    { name: 'Earnings', icon: DollarSign, path: '/earnings' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  const tabs = role === 'customer' ? customerTabs : driverTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav flex justify-around items-center h-16 pb-safe border-t border-gray-100 z-50">
      {tabs.map((tab, idx) => {
        const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
        return (
          <div 
            key={idx} 
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-all duration-200 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <tab.icon size={22} className={`mb-1 ${isActive ? 'fill-blue-50 stroke-blue-600 drop-shadow-sm' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.name}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer' | 'driver'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 auth-bg font-inter">
        <div className="glass-panel p-8 w-full max-w-sm text-center shadow-xl shadow-blue-500/10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform -rotate-6 hover:rotate-0 transition-transform">
            <Truck size={40} className="transform rotate-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 font-outfit tracking-tight">Zynety</h1>
          <p className="text-sm font-medium text-slate-500 mb-10">India's Unified Logistics Platform</p>
          
          <div className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 border-r border-gray-200 pr-3">+91</span>
                <input 
                  type="tel" 
                  maxLength="10"
                  className="input-field pl-16 font-bold tracking-widest text-lg" 
                  placeholder="00000 00000"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <button 
              className={`btn-primary shadow-blue-500/30 mt-2 py-4 text-lg ${phone.length === 10 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} 
              onClick={() => setIsAuthenticated(true)}
            >
              Send OTP
            </button>
          </div>
          
          <p className="text-xs text-slate-400 mt-6 font-medium">By continuing, you agree to our Terms of Service & Privacy Policy.</p>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/app">
      <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-800 font-inter">
        
        {/* Top App Bar inside main flow */}
        {role === 'customer' && (
           <header className="h-14 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                 <Truck size={18} />
               </div>
               <h1 className="font-outfit font-extrabold text-xl tracking-tight">Zynety</h1>
             </div>
             <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 font-bold text-sm">
               <MapPin size={14} /> Mumbai
             </div>
           </header>
        )}

        {role === 'driver' && (
           <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shrink-0 text-white">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                 <Truck size={18} />
               </div>
               <h1 className="font-outfit font-extrabold text-xl tracking-tight">Zynety <span className="text-xs font-bold bg-orange-500 px-2 py-0.5 rounded-md ml-1 inline-block align-middle pb-[3px]">Partner</span></h1>
             </div>
           </header>
        )}

        {/* Main Route Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full max-w-md mx-auto relative bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)]">
          <Routes>
            {role === 'customer' ? (
              <>
                <Route path="/" element={<CustomerHome />} />
                <Route path="/book" element={<Book />} />
                <Route path="/track" element={<Track />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trip" element={<ActiveTrip />} />
                <Route path="/earnings" element={<Earnings />} />
              </>
            )}
            <Route path="/profile" element={<Profile role={role} setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Unified Bottom Nav */}
        <BottomNav role={role} />
      </div>
    </Router>
  );
}
