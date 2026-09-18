import Link from 'next/link';
import { ShieldCheck, Truck, BarChart3, AlertTriangle, ArrowRight, Activity, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-slate-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="bg-blue-800 text-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Transportation & Logistics
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Digital Trust for India's <br className="hidden md:block"/> Transport Backbone
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/public/scan" className="w-full sm:w-auto bg-green-500 text-slate-900 font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-400 transition shadow-lg shadow-green-500/20">
              <Truck size={20} />
              User Dashboard
            </Link>
            <Link href="/inspector/login" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition border border-white/20">
              <ShieldCheck size={20} />
              Inspector Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 text-center">
          <div>
            <p className="text-4xl font-extrabold text-blue-600">-</p>
            <p className="text-sm text-slate-500 font-medium uppercase mt-1">Verified Instruments</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-600">-</p>
            <p className="text-sm text-slate-500 font-medium uppercase mt-1">Compliance Rate</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-red-500">-</p>
            <p className="text-sm text-slate-500 font-medium uppercase mt-1">Tampering Flags</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-600">-</p>
            <p className="text-sm text-slate-500 font-medium uppercase mt-1">E-Way Bills Secured</p>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="bg-blue-600 py-16 px-6 text-center text-white">
        <h3 className="text-2xl font-bold mb-6">Are you an authorized Legal Metrology Inspector?</h3>
        <Link href="/inspector/login" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-slate-100 transition shadow-lg">
          Launch Field Scanner <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
