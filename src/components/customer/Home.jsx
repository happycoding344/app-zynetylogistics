import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Truck, PackageCheck, Globe, ChevronRight, Zap, Shield, Clock } from 'lucide-react';

const SERVICES = [
  {
    id: 'bike',
    name: 'Two Wheeler',
    subtitle: 'Quick local deliveries',
    details: 'Documents, small parcels, food & more',
    eta: '15–30 min',
    base: '₹16/km',
    icon: Bike,
    gradient: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    badge: 'Most Popular',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'truck',
    name: 'Truck / Mini Truck',
    subtitle: 'Heavy goods & furniture',
    details: 'Appliances, machinery, bulk cargo',
    eta: '1–3 hours',
    base: '₹36/km',
    icon: Truck,
    gradient: 'from-purple-600 to-pink-500',
    shadow: 'shadow-purple-500/20',
    badge: 'Heavy Load',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'packers',
    name: 'Packers & Movers',
    subtitle: 'Complete house shifting',
    details: 'Professional packing + transport',
    eta: 'Scheduled',
    base: 'From ₹500',
    icon: PackageCheck,
    gradient: 'from-orange-500 to-amber-400',
    shadow: 'shadow-orange-500/20',
    badge: 'Full Service',
    badgeBg: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'intercity',
    name: 'Intercity Delivery',
    subtitle: 'Outstation transport',
    details: 'City to city, long-haul logistics',
    eta: 'Next Day+',
    base: '₹50/km',
    icon: Globe,
    gradient: 'from-emerald-500 to-teal-400',
    shadow: 'shadow-emerald-500/20',
    badge: 'Pan India',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
];

export default function CustomerHome() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      {/* Welcome */}
      <div className="mb-8 mt-2 px-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 font-outfit tracking-tight leading-tight">
          What are we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">moving today?</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Book a vehicle securely &amp; instantly.</p>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-7 rounded-3xl mb-10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl shadow-slate-900/20 group cursor-pointer hover:scale-[1.01] transition-transform"
        onClick={() => navigate('/book-select')}>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl group-hover:bg-purple-500 transition-colors duration-700" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-2xl" />
        <div className="z-10 mb-4 md:mb-0">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Limited Offer
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Get 20% off <br />on your first ride.</h3>
          <p className="text-slate-400 text-sm mt-2 font-medium">Use code: <span className="text-white font-black">ZYNETY20</span></p>
        </div>
        <div className="z-10 mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-600/30">
          Book Now <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {[
          { icon: Zap, label: 'Real-time Tracking', color: 'text-amber-500' },
          { icon: Shield, label: 'Insured Cargo', color: 'text-green-500' },
          { icon: Clock, label: '24×7 Support', color: 'text-blue-500' },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shrink-0 shadow-sm">
            <b.icon size={14} className={b.color} />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between px-1 mb-5">
        <h3 className="font-extrabold text-xl font-outfit text-slate-800 tracking-tight">Explore Services</h3>
        <button onClick={() => navigate('/book-select')} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
          See all <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Service Cards — same detail level as BookSelect */}
      <div className="space-y-4">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/book?service=${s.id}`)}
            className="w-full bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-0.5 group text-left flex items-center gap-5"
          >
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <s.icon size={30} className="text-white" strokeWidth={2} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-extrabold text-slate-800 text-base font-outfit">{s.name}</h4>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badgeBg}`}>{s.badge}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{s.details}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From {s.base}</span>
                <span className="text-[10px] font-black text-slate-300">•</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ETA: {s.eta}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
              <ChevronRight size={18} strokeWidth={3} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
