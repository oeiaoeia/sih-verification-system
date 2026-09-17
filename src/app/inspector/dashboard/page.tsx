"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, AlertCircle, MapPin, Search, Filter, X } from 'lucide-react';

export default function InspectorDashboard() {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadInstruments = () => {
      fetch('/api/instruments')
        .then(res => res.json())
        .then(data => {
          if (data.instruments) setInstruments(data.instruments);
          setLoading(false);
        });
    };

    loadInstruments();
    
    // Auto-poll every 3 seconds for a magical live-demo feel
    const interval = setInterval(loadInstruments, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Legal Metrology Dashboard</h1>
            <p className="text-slate-500">Welcome back, Inspector. Here is your jurisdiction registry.</p>
          </div>
          <Link href="/inspector/scan" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 font-medium shadow-sm transition">
            <Camera size={18} />
            New Field Inspection
          </Link>
        </div>

        {/* Global Registry Map / List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Jurisdiction Registry</h2>
                <p className="text-slate-500 text-sm mt-0.5">Live monitoring of instruments in your zone</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  href="/inspector/register"
                  className="bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm"
                >
                  + Register New Instrument
                </Link>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search ID or location..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading instruments...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Instrument ID</th>
                    <th className="px-6 py-4">Type & Location</th>
                    <th className="px-6 py-4">Linked E-Way Bill</th>
                    <th className="px-6 py-4">Public Flags</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((item, i) => {
                    const eway = `EWB-2026-${item.qr_code_id.replace(/-/g, '').substring(0, 6)}`;
                    const activeFlags = item.discrepancy_reports?.filter((r: any) => r.status === 'Pending').length || 0;
                    return (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.qr_code_id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{item.instrument_type}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.location_name}</div>
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-mono text-xs">{eway}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-700">{activeFlags}</span>
                            {activeFlags > 0 && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/inspector/scan?token=${item.qr_token}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            New Inspection
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
