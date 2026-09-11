"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, CheckCircle, AlertTriangle, Scale, ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';

function ScannerContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [step, setStep] = useState<'scan' | 'scanning' | 'result' | 'report' | 'success' | 'error'>('scan');
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenParam) {
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  const verifyToken = async (token: string) => {
    setStep('scanning');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();

      if (res.status === 404) {
        setErrorMessage(data.message || 'Not a registered instrument');
        setStep('error');
        return;
      }

      setResult({
        ...data.instrument,
        isValid: data.valid,
        message: data.message
      });
      setStep('result');

    } catch (err) {
      setErrorMessage('Network error during verification.');
      setStep('error');
    }
  };

  const startScan = () => {
    // In a real app, this would open a QR reader.
    // Since we're demonstrating URL-based QR codes, we simulate it here if no token is passed.
    alert("Please scan one of the generated QR codes from the /qrcodes folder using your phone's camera, or append ?token=<token> to the URL.");
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto p-6 flex flex-col">
        
        {step !== 'scan' && step !== 'scanning' && !tokenParam && (
          <button onClick={() => setStep('scan')} className="self-start mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Scanner
          </button>
        )}

        {step === 'scan' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <div className="bg-blue-100 text-blue-600 p-6 rounded-full">
              <Camera size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verify an Instrument</h2>
              <p className="text-slate-500 mt-2 max-w-sm">Scan the official QR/RFID tag on any weighbridge or fuel dispenser to check its Legal Metrology compliance.</p>
            </div>
            <button 
              onClick={startScan}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Camera size={24} />
              Tap to Scan
            </button>
          </div>
        )}

        {step === 'scanning' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-blue-500 rounded-2xl relative overflow-hidden flex items-center justify-center bg-slate-200">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute w-full h-1 bg-blue-500 animate-[scan_2s_ease-in-out_infinite]"></div>
              <p className="text-sm font-semibold text-slate-600 z-10 bg-white/80 px-3 py-1 rounded-full">Connecting to Registry...</p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="bg-red-100 text-red-600 p-6 rounded-full mb-2">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-slate-600">{errorMessage}</p>
          </div>
        )}

        {step === 'result' && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <Scale size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{result.instrument_type}</h3>
                  <p className="text-sm text-slate-400 font-mono">{result.qr_code_id}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Calibration Status</p>
                    {result.isValid ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="font-bold text-green-600 text-lg">Verified & Valid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle size={20} className="text-red-500" />
                        <span className="font-bold text-red-600 text-lg">{result.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Valid Until</p>
                    <p className="font-semibold text-slate-900">{result.expiry_date}</p>
                  </div>
                </div>

                <hr className="border-slate-100" />
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-slate-800">{result.location_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Registered Owner</p>
                    <p className="text-slate-800">{result.owner_name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center bg-red-50 p-6 rounded-2xl border border-red-100">
              <AlertTriangle className="text-red-500 mx-auto mb-2" size={24} />
              <h4 className="font-bold text-slate-900 mb-1">Notice a discrepancy?</h4>
              <p className="text-sm text-slate-600 mb-4">If the live reading looks incorrect or the physical seal is broken, you can report it.</p>
              <button 
                onClick={() => setStep('report')}
                className="w-full bg-white text-red-600 border border-red-200 font-bold px-4 py-3 rounded-xl hover:bg-red-50 transition"
              >
                Report Instrument
              </button>
            </div>
          </div>
        )}

        {step === 'report' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">Report Discrepancy</h2>
            <p className="text-slate-500 text-sm mb-6">Instrument {result?.qr_code_id} will be queued for priority inspection.</p>
            
            <form onSubmit={otpSent ? handleReportSubmit : handleSendOTP} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              {/* Form implementation remains the same */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="10-digit number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none disabled:opacity-60"
                />
              </div>

              {otpSent && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Enter OTP</label>
                  <input 
                    type="text" 
                    required
                    placeholder="4-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 outline-none text-center font-bold tracking-widest"
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-red-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-red-700 transition">
                {otpSent ? 'Verify & Submit Report' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="bg-green-100 text-green-600 p-6 rounded-full mb-2">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Report Submitted</h2>
            <p className="text-slate-600">Instrument {result?.qr_code_id} flagged for inspection.</p>
            <Link href="/" className="mt-8 text-blue-600 font-semibold underline">Return Home</Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
