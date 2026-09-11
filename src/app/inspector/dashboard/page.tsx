"use client";

import Link from 'next/link';
import { Camera, AlertCircle, CheckCircle, MapPin, Search, Filter } from 'lucide-react';

const mockInspections = [
  { id: 'QR-WB-001', type: 'Weighbridge', location: 'NH-48 Checkpoint, Delhi', status: 'Valid', date: '2026-09-10', risk: 'Low' },
  { id: 'QR-FD-084', type: 'Fuel Dispenser', location: 'HP Petrol Pump, Gurgaon', status: 'Flagged', date: '2026-09-09', risk: 'High', reports: 3 },
  { id: 'QR-WB-112', type: 'Weighbridge', location: 'Industrial Area, Noida', status: 'Expired', date: '2025-08-12', risk: 'Medium' },
];

export default function InspectorDashboard() {
  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Legal Metrology Dashboard</h1>
            <p className="text-slate-500">Welcome back, Inspector Sharma. You have 3 priority flags today.</p>
          </div>
          <Link href="/inspector/scan" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 font-medium shadow-sm transition">
            <Camera size={18} />
            New Field Inspection
          </Link>
        </div>

        {/* Priority Triage Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertCircle size={20} />
              Priority Triage Queue
            </div>
            <span className="text-sm text-red-600 font-medium">Flagged by Transporters</span>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 p-4 border border-red-100 bg-white rounded-lg shadow-sm">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Instrument QR-FD-084</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> HP Petrol Pump, Gurgaon
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">3 Discrepancy Reports</p>
                <p className="text-xs text-slate-400">"Under-dispensing suspected"</p>
              </div>
              <div className="ml-4 pl-4 border-l">
                <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700">Dispatch Audit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Registry Map / List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">Jurisdiction Registry</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search ID or Location" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><Filter size={18}/></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Instrument ID</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Last Inspected</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockInspections.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-slate-900">{item.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.type}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Valid' ? 'bg-green-100 text-green-800' :
                        item.status === 'Flagged' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-medium">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
