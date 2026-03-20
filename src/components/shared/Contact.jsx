import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // Simulate submission — wire to backend when ready
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="pb-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-2 px-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 font-outfit tracking-tight">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Touch</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium">We're here to help. Reach out to us through any channel below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Contact Details Card */}
        <div className="space-y-4">

          {/* Email */}
          <a href="mailto:contact@zynetylogistics.com" className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
              <p className="font-bold text-slate-800 text-sm">contact@zynetylogistics.com</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">We reply within 24 hours</p>
            </div>
          </a>

          {/* Phone */}
          <a href="tel:+919211069064" className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-100 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
              <Phone size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
              <p className="font-bold text-slate-800 text-sm">+91 9211069064</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Mon–Sat, 9 AM – 7 PM IST</p>
            </div>
          </a>

          {/* Office */}
          <div className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Our Office</p>
              <p className="font-bold text-slate-800 text-sm leading-relaxed">
                Bhogal Complex, Plot No. 3, 4th Floor,<br />
                Pvt Shop No. 404, Veer Shavarkar Block,<br />
                Shakarpur, East Delhi, Delhi — 110092
              </p>
            </div>
          </div>

          {/* Map Embed */}
          <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <iframe
              title="Zynety Logistics Office"
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAbc123&q=Shakarpur,East+Delhi,Delhi+110092"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <a
              href="https://goo.gl/maps/Shakarpur+East+Delhi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <MapPin size={14} /> Open in Google Maps
            </a>
          </div>
        </div>

        {/* Contact Form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center bg-green-50 border border-green-100 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm mb-4 border border-green-100">
              <CheckCircle2 size={36} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 font-outfit">Message Sent!</h3>
            <p className="text-slate-500 font-medium text-sm max-w-xs leading-relaxed">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg font-outfit flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" /> Send Us a Message
            </h3>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name *</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address *</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phone (Optional)</label>
              <input
                type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Your Message *</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} required rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !form.name || !form.email || !form.message}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
            >
              {sending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : (
                <><Send size={16} /> Send Message</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
