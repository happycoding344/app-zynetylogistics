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
      gradient: 'from-blue-600 to-cyan-500',
      shadow: 'shadow-blue-500/20',
      iconColor: 'text-white'
    },
    {
      id: 'truck',
      name: 'Trucks',
      desc: 'Heavy goods & furniture',
      icon: Truck,
      gradient: 'from-purple-600 to-pink-500',
      shadow: 'shadow-purple-500/20',
      iconColor: 'text-white'
    },
    {
      id: 'packers',
      name: 'Packers & Movers',
      desc: 'Full house shifting',
      icon: PackageCheck,
      gradient: 'from-orange-500 to-amber-400',
      shadow: 'shadow-orange-500/20',
      iconColor: 'text-white'
    },
    {
      id: 'intercity',
      name: 'Intercity',
      desc: 'Outstation transport',
      icon: Globe,
      gradient: 'from-emerald-500 to-teal-400',
      shadow: 'shadow-emerald-500/20',
      iconColor: 'text-white'
    }
  ];

  return (
    <div className="p-2 pb-20 animate-fade-in relative max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-10 mt-4 px-2">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 font-outfit tracking-tight leading-tight">
          What are we <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">moving today?</span>
        </h2>
        <p className="text-slate-500 mt-3 text-lg font-medium">Book a vehicle securely & instantly.</p>
      </div>

      {/* Hero Banner Offer */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl mb-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl shadow-slate-900/20 group cursor-pointer hover:scale-[1.01] transition-transform">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl group-hover:bg-purple-500 transition-colors duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>
        <div className="z-10 mb-6 md:mb-0">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Limited Offer
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Get 20% off <br/>on your first ride.</h3>
        </div>
        <div className="z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl transform md:rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500">
          <span className="font-extrabold text-3xl">%</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h3 className="font-extrabold text-xl md:text-2xl font-outfit text-slate-800 tracking-tight">Explore Services</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {services.map((service) => (
          <div 
            key={service.id} 
            onClick={() => navigate(`/book?service=${service.id}`)}
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-200 hover:-translate-y-1 block"
          >
            <div className={`absolute -right-16 -top-16 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${service.gradient} shadow-lg ${service.shadow} mb-6 relative z-10 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
              <service.icon size={28} className={service.iconColor} strokeWidth={2.5} />
            </div>
            
            <div className="relative z-10">
              <h4 className="font-extrabold text-lg text-slate-800 mb-1.5">{service.name}</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{service.desc}</p>
            </div>
            
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors z-10 hidden sm:flex">
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
