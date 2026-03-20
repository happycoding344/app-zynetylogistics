import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Truck, PackageCheck, Globe, ChevronRight } from 'lucide-react';

export default function CustomerHome() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'bike',
      name: 'Two Wheeler',
      desc: 'Quick local deliveries',
      icon: Bike,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'truck',
      name: 'Truck',
      desc: 'Heavy goods & furniture',
      icon: Truck,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'packers',
      name: 'Packers & Movers',
      desc: 'Full house shifting',
      icon: PackageCheck,
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      id: 'intercity',
      name: 'Intercity',
      desc: 'Outstation transport',
      icon: Globe,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <div className="p-4 pb-20 animate-fade-in relative">
      {/* Welcome Section */}
      <div className="mb-6 mt-2">
        <h2 className="text-3xl font-extrabold text-gray-800 font-outfit tracking-tight">
          What are we <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">moving today?</span>
        </h2>
        <p className="text-gray-500 mt-2">Book a vehicle securely & instantly.</p>
      </div>

      {/* Hero Banner Offer */}
      <div className="glass-panel p-5 mb-8 relative overflow-hidden flex items-center justify-between shadow-blue-500/10 shadow-lg">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="z-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Limited Offer</p>
          <h3 className="text-xl font-bold text-slate-800">Get 20% off <br/>on first ride</h3>
        </div>
        <div className="z-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transform rotate-[-10deg]">
          <span className="font-extrabold text-2xl">%</span>
        </div>
      </div>

      {/* Services Grid */}
      <h3 className="font-bold text-lg mb-4 font-outfit text-slate-800">Explore Services</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <div 
            key={service.id} 
            onClick={() => navigate(`/book?service=${service.id}`)}
            className="glass-panel p-4 flex flex-col items-start gap-3 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] border border-transparent hover:border-gray-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.bgLight}`}>
              <service.icon size={24} className={service.iconColor} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-0.5">{service.name}</h4>
              <p className="text-xs text-slate-500 leading-tight">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
