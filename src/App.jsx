import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Truck, Package, Bike, ArrowRight, User, Star, ChevronRight, Activity, MapPin, Search, Plus, List, Navigation, Menu, X, Home, Compass, Map, Power, LogOut, Phone } from 'lucide-react';
import CustomerHome from './components/customer/Home';
import BookSelect from './components/customer/BookSelect';
import Book from './components/customer/Book';
import Track from './components/customer/Track';
import Orders from './components/shared/Orders';
import Profile from './components/shared/Profile';
import Contact from './components/shared/Contact';
import DriverHome from './components/driver/Home';

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer' | 'driver'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveCity, setLiveCity] = useState('Locating...');

  React.useEffect(() => {
    if (isAuthenticated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!key) { setLiveCity('Mumbai'); return; }
          try {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`);
            const data = await res.json();
            if (data.status === 'OK' && data.results[0]) {
              const city = data.results[0].address_components.find(c => c.types.includes("locality"))?.long_name || 'Mumbai';
              setLiveCity(city);
            } else {
              setLiveCity('Unknown Location');
            }
          } catch(e) {
            setLiveCity('Mumbai');
          }
        },
        () => setLiveCity('Mumbai')
      );
    } else if (isAuthenticated) {
      setLiveCity('Mumbai');
    }
  }, [isAuthenticated]);

  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('zynety_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setRole(userData.role || 'customer');
        setEmail(userData.email || '');
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Dynamically inject Tailwind CSS to bypass Vite production stripping
  React.useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.async = true;
      document.head.appendChild(script);

      const config = document.createElement('script');
      config.innerHTML = `
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                inter: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
              }
            }
          }
        }
      `;
      document.head.appendChild(config);
    }
  }, []);

  const handleAuth = async () => {
    if(!email || !password) return;
    try {
      const apiBase = 'https://zynetylogistics.com/wp-json/zynety/v1/auth';
      const action = isLogin ? 'login' : 'signup';
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action, role })
      });
      const data = await res.json();
      if(data.status === 'success') {
        const userData = { ...data, role }; // Ensure role is included
        localStorage.setItem('zynety_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        alert(data.message || "Authentication failed. Please try again.");
      }
    } catch (e) {
      console.warn("API Error, falling back to mock login for development", e);
      const mockUser = { user_id: 1, email, role };
      localStorage.setItem('zynety_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zynety_user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 font-inter">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 w-full max-w-sm rounded-3xl text-center shadow-xl shadow-blue-900/10 transition-all hover:shadow-blue-900/20">
          <div className="mx-auto flex items-center justify-center mb-6">
            <img src="/Logo.png" alt="Zynety Logistics Logo" className="w-32 h-auto drop-shadow-2xl" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 font-outfit tracking-tight">Zynety Logistics</h1>
          <p className="text-sm font-medium text-slate-500 mb-8">India's Unified Logistics Platform</p>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
             <button onClick={() => setRole('customer')} className={`flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-lg transition-all ${role === 'customer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:bg-slate-200'}`}>Customer</button>
             <button onClick={() => setRole('driver')} className={`flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-lg transition-all ${role === 'driver' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:bg-slate-200'}`}>Driver Partner</button>
          </div>

          <div className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Email Address</label>
              <input 
                type="email" 
                className="font-semibold text-base py-3 px-4 w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Password</label>
              <input 
                type="password" 
                className="font-semibold text-base py-3 px-4 w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all mb-1" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 py-4 text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] ${(email && password) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} 
              onClick={handleAuth}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            <div className="text-center mt-2">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-8 font-medium">By continuing, you agree to our Terms of Service & Privacy Policy.<br/><br/>Authorization:<br/><span className="font-bold text-slate-500">Zynety Logistics Private Limited</span></p>
        </div>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, href }) => {
    const isActive = window.location.pathname === href;
    return (
      <Link to={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-full shadow-sm z-30 shrink-0">
           <div className="h-20 flex items-center px-6 border-b border-slate-100">
             <img src="/Logo.png" alt="Logo" className="w-[42px] h-[42px] object-contain drop-shadow-sm mr-3" onError={(e) => { e.target.style.display = 'none'; }} />
             <h1 className="font-outfit font-extrabold text-2xl tracking-tight text-slate-800">Zynety</h1>
           </div>
           
           <div className="p-4 flex flex-col gap-1 flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-4">Menu</div>
              {role === 'driver' ? (
                <>
                  <NavItem icon={Home} label="Dashboard" href="/" />
                  <NavItem icon={Map} label="Active Trips" href="/track" />
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-8">Account</div>
                  <NavItem icon={User} label="My Profile" href="/profile" />
                  <NavItem icon={List} label="Earnings" href="/orders" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-red-500 hover:bg-red-50 mt-2">
                    <LogOut size={20} strokeWidth={2} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavItem icon={Home} label="Dashboard" href="/" />
                  <NavItem icon={Plus} label="New Booking" href="/book-select" />

                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-8">Account</div>
                  <NavItem icon={User} label="My Profile" href="/profile" />
                  <NavItem icon={List} label="Order History" href="/orders" />
                  <NavItem icon={Phone} label="Contact Us" href="/contact" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-red-500 hover:bg-red-50 mt-2">
                    <LogOut size={20} strokeWidth={2} /> Sign Out
                  </button>
                </>
              )}
           </div>

           <div className="p-4 border-t border-slate-100">
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-outfit">
                 {email?.charAt(0).toUpperCase() || 'U'}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">{email || 'User'}</p>
                 <p className="text-xs font-medium text-slate-500 capitalize">{role}</p>
               </div>
             </div>
           </div>
        </aside>

        {/* Mobile Header + Overlay Sidebar */}
        <div className="md:hidden">
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
          )}
          
          <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
               <div className="flex items-center gap-2">
                 <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                 <h1 className="font-outfit font-extrabold text-xl tracking-tight text-slate-800">Zynety</h1>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-full"><X size={20}/></button>
             </div>
             
             <div className="p-3 flex flex-col gap-1 overflow-y-auto flex-1 mt-2">
                {role === 'driver' ? (
                  <>
                    <NavItem icon={Home} label="Dashboard" href="/" />
                    <NavItem icon={Map} label="Active Trips" href="/track" />
                    <div className="h-px bg-slate-100 my-2 mx-4"></div>
                    <NavItem icon={List} label="Earnings" href="/orders" />
                    <NavItem icon={User} label="My Profile" href="/profile" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-red-500 hover:bg-red-50 mt-2 w-full text-left">
                      <LogOut size={20} strokeWidth={2} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavItem icon={Home} label="Dashboard" href="/" />
                    <NavItem icon={Plus} label="New Booking" href="/book-select" />

                    <div className="h-px bg-slate-100 my-2 mx-4"></div>
                    <NavItem icon={List} label="Order History" href="/orders" />
                    <NavItem icon={User} label="My Profile" href="/profile" />
                    <NavItem icon={Phone} label="Contact Us" href="/contact" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-red-500 hover:bg-red-50 mt-2 w-full text-left">
                      <LogOut size={20} strokeWidth={2} /> Sign Out
                    </button>
                  </>
                )}
             </div>
          </aside>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
          
          {/* Main Top Navbar (Mobile only, or status indicator on Desktop) */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
             <div className="flex items-center gap-3">
               <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}>
                 <Menu size={24} />
               </button>
               <h1 className="font-outfit font-bold text-lg text-slate-800 md:hidden">Zynety Logistics</h1>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
                 <Activity size={14} className="text-green-500" /> Network Online
               </div>
               <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 font-bold text-sm">
                 <MapPin size={14} /> {liveCity}
               </div>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full h-full p-4 sm:p-6 lg:p-8">
              <Routes>
                {role === 'driver' ? (
                  <Route path="/" element={<DriverHome user={user} />} />
                ) : (
                  <Route path="/" element={<CustomerHome />} />
                )}
                <Route path="/book-select" element={<BookSelect />} />
                <Route path="/book" element={<Book user={user} />} />
                <Route path="/track" element={<Track />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
