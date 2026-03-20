import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Truck, PackageCheck, Globe, ChevronRight, Zap, Clock, Shield } from 'lucide-react';

const SERVICES = [
  {
    id: 'bike',
    name: 'Two Wheeler',
    subtitle: 'Quick local deliveries',
    details: 'Documents, small parcels, food & more',
    eta: '15–30 min',
    base: '₹16',
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
    base: '₹36',
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
    details: 'Professional packing + transport + unpacking',
    eta: 'Scheduled',
    base: '₹500',
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
    base: '₹50',
    icon: Globe,
    gradient: 'from-emerald-500 to-teal-400',
    shadow: 'shadow-emerald-500/20',
    badge: 'Pan India',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
];

export default function BookSelect() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="mb-8 mt-2 px-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 font-outfit tracking-tight leading-tight">
          Choose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Service</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Select the type of delivery that fits your needs.</p>
      </div>

      {/* Trust badges */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {[
          { icon: Zap, label: 'Real-time Tracking', color: 'text-amber-500' },
          { icon: Shield, label: 'Insured Cargo', color: 'text-green-500' },
          { icon: Clock, label: '24× 7 Support', color: 'text-blue-500' },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shrink-0 shadow-sm">
            <b.icon size={14} className={b.color} />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Service Cards */}
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-slate-800 text-base font-outfit">{s.name}</h3>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badgeBg}`}>{s.badge}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{s.details}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From {s.base}/km</span>
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
