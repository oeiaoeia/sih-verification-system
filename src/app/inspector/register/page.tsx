'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, PlusCircle, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterInstrument() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    qr_code_id: '',
    instrument_type: 'Fuel Dispenser',
    location_name: '',
    owner_name: '',
    calibration_date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/instruments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register instrument');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-lg">
        <Link href="/inspector/dashboard" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {!successData ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <PlusCircle size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Register Instrument</h1>
                <p className="text-sm text-slate-500">Add a new device to the verification system</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instrument ID / Name</label>
                <input 
                  type="text" 
                  name="qr_code_id"
                  required
                  placeholder="e.g. FD-NEW-01" 
                  value={formData.qr_code_id}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instrument Type</label>
                <select 
                  name="instrument_type" 
                  value={formData.instrument_type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none focus:border-blue-500 transition"
                >
                  <option value="Fuel Dispenser">Fuel Dispenser</option>
                  <option value="Weighbridge">Weighbridge</option>
                  <option value="Taxi Meter">Taxi Meter</option>
                  <option value="Retail Scale">Retail Scale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location Name</label>
                <input 
                  type="text" 
                  name="location_name"
                  required
                  placeholder="e.g. Mumbai Central Station" 
                  value={formData.location_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Owner Name</label>
                <input 
                  type="text" 
                  name="owner_name"
                  required
                  placeholder="e.g. IndianOil" 
                  value={formData.owner_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Calibration Date</label>
                <input 
                  type="date" 
                  name="calibration_date"
                  required
                  value={formData.calibration_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none focus:border-blue-500 transition"
                />
                <p className="text-xs text-slate-400 mt-1">Expiry will be automatically set to 1 year from this date.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold px-4 py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {loading ? 'Registering...' : 'Register Instrument'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-green-100 text-green-600 p-4 rounded-full inline-flex mb-4">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h2>
            <p className="text-slate-500 text-sm mb-6">
              Instrument <strong>{successData.instrument.qr_code_id}</strong> is now in the registry.
            </p>

            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 inline-block">
              <img src={successData.qrCodeDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg shadow-sm" />
              <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                <QrCode size={14} /> Unique Token Generated
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => router.push(`/inspector/scan?token=${successData.instrument.qr_token}`)}
                className="w-full bg-blue-600 text-white font-bold px-4 py-3.5 rounded-xl hover:bg-blue-700 transition"
              >
                Run Initial Inspection (Seal & Calib)
              </button>
              <button 
                onClick={() => setSuccessData(null)}
                className="w-full bg-slate-100 text-slate-600 font-bold px-4 py-3.5 rounded-xl hover:bg-slate-200 transition"
              >
                Register Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
