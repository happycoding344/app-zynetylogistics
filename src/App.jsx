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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const [user, setUser] = useState(null); // stores user_id and email if authenticated

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
        setUser(data);
        setIsAuthenticated(true);
      } else {
        alert(data.message || "Authentication failed. Please try again.");
      }
    } catch (e) {
      console.warn("API Error, falling back to mock login for development", e);
      setUser({ user_id: 1, email, role });
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 auth-bg font-inter">
        <div className="glass-panel p-8 w-full max-w-sm text-center shadow-xl shadow-blue-500/10">
          <div className="mx-auto flex items-center justify-center mb-6">
            <img src="/Logo.png" alt="Zynety Logistics Logo" className="w-32 h-auto drop-shadow-lg" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 font-outfit tracking-tight">Zynety Logistics</h1>
          <p className="text-sm font-medium text-slate-500 mb-10">India's Unified Logistics Platform</p>
          
          <div className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Email Address</label>
              <input 
                type="email" 
                className="input-field font-semibold text-base py-3 px-4 w-full border border-gray-200 rounded-xl" 
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block ml-1">Password</label>
              <input 
                type="password" 
                className="input-field font-semibold text-base py-3 px-4 w-full border border-gray-200 rounded-xl mb-1" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              className={`btn-primary shadow-blue-500/30 mt-2 py-4 text-lg ${(email && password) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} 
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
          
          
          <p className="text-xs text-slate-400 mt-6 font-medium">By continuing, you agree to our Terms of Service & Privacy Policy.<br/><br/>Authorization:<br/><span className="font-bold text-slate-500">Zynety Logistics Private Limited</span></p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-800 font-inter">
        
        {role === 'customer' && (
           <header className="h-16 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shrink-0">
             <div className="flex items-center gap-3">
               <img src="/Logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
               <h1 className="font-outfit font-extrabold text-[22px] tracking-tight text-slate-800">Zynety Logistics</h1>
             </div>
             <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 font-bold text-sm">
               <MapPin size={14} /> Mumbai
             </div>
           </header>
        )}

        {role === 'driver' && (
           <header className="h-16 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shrink-0 text-white">
             <div className="flex items-center gap-3">
               <img src="/Logo.png" alt="Logo" className="w-10 h-10 object-contain bg-white rounded-lg p-1" onError={(e) => { e.target.style.display = 'none'; }} />
               <h1 className="font-outfit font-extrabold text-[20px] tracking-tight">Zynety Logistics <span className="text-xs font-bold bg-orange-500 px-2 py-0.5 rounded-md ml-1 inline-block align-middle pb-[3px]">Partner</span></h1>
             </div>
           </header>
        )}

        {/* Main Route Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full max-w-md mx-auto relative bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)]">
          <Routes>
            {role === 'customer' ? (
              <>
                <Route path="/" element={<CustomerHome user={user} />} />
                <Route path="/book" element={<Book user={user} />} />
                <Route path="/track" element={<Track user={user} />} />
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
