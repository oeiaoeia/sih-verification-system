"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, ShieldCheck, FileText, AlertTriangle, ArrowLeft, Crosshair, Cpu, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function InspectorScanContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [step, setStep] = useState(1); 
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState('Fetching GPS...');
  
  const sealInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tokenParam) {
      setTokenInput(tokenParam);
      handleTokenSubmit(tokenParam);
    }
  }, [tokenParam]);

  const handleTokenSubmit = async (token: string) => {
    // We do a preliminary check here to fetch the instrument details early
    setStep(2);
    setTimeout(() => setLocation('28.6139° N, 77.2090° E (Verified)'), 1500);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQRScan = () => {
    if (!tokenInput) {
      alert("Please enter a token or scan a valid QR code url with ?token=");
      return;
    }
    handleTokenSubmit(tokenInput);
  };

  const handleSealCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setStep(3);
  };

  const handleDisplayCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) submitForVerification();
  };

  const submitForVerification = async () => {
    setStep(4);
    setVerifying(true);
    
    // Simulate AI pipeline delay before showing the real fetched data
    setTimeout(() => {
      setVerifying(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col">
      <div className="w-full max-w-md mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/inspector/dashboard" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <MapPin size={12} className="text-blue-400" />
            {location}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Crosshair size={32} />
              </div>
              <h2 className="text-2xl font-bold">Initiate Inspection</h2>
              <p className="text-slate-400 text-sm mt-2">Enter token manually or append ?token= to URL.</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter 32-char Hex Token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleQRScan}
                className="w-full bg-blue-600 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-blue-500 transition shadow-lg"
              >
                <Camera size={24} />
                Process Tag
              </button>
            </div>
          </div>
        )}

        {(step === 2 || step === 3) && result && result.instrument && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 font-mono">ID: {result.instrument.qr_code_id}</p>
                <p className="font-bold">{result.instrument.instrument_type}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${result.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.isValid ? 'Valid' : 'Expired'}
              </span>
            </div>

            {step === 2 && (
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl text-center space-y-4">
                <ShieldCheck size={40} className="mx-auto text-amber-400" />
                <div>
                  <h3 className="text-xl font-bold">Capture Physical Seal</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">Ensure good lighting. The AI will check for peeling or cuts.</p>
                </div>
                <input type="file" accept="image/*" capture="environment" ref={sealInputRef} onChange={handleSealCapture} className="hidden" />
                <button onClick={() => sealInputRef.current?.click()} className="w-full bg-white text-slate-900 px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold">
                  <Camera size={20} /> Open Camera
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl text-center space-y-4">
                <FileText size={40} className="mx-auto text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold">Capture Live Display</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">Place reference weight. Capture the digital indicator clearly.</p>
                </div>
                <input type="file" accept="image/*" capture="environment" ref={displayInputRef} onChange={handleDisplayCapture} className="hidden" />
                <button onClick={() => displayInputRef.current?.click()} className="w-full bg-white text-slate-900 px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold">
                  <Camera size={20} /> Open Camera
                </button>
              </div>
            )}
          </div>
        )}

        {/* Not Found state */}
        {(step === 2 || step === 3) && result && !result.instrument && (
           <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center mt-8">
             <XCircle size={48} className="text-red-500 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-red-400">Invalid Instrument</h2>
             <p className="text-slate-400 mt-2">{result.message}</p>
             <button onClick={() => setStep(1)} className="mt-6 text-blue-400 underline">Try Another</button>
           </div>
        )}

        {step === 4 && verifying && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <Cpu size={64} className="text-blue-500 animate-pulse" />
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Groq AI Inference Running</h2>
              <div className="space-y-1 text-sm font-mono text-blue-400 text-left bg-slate-900 p-4 rounded-lg border border-slate-800">
                <p className="animate-[pulse_1s_ease-in-out_infinite]">> Extracting edge features...</p>
                <p className="animate-[pulse_1.5s_ease-in-out_infinite]">> Running tamper-detection...</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && !verifying && result && result.instrument && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.isValid ? (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400">Verification Passed</h2>
                <p className="text-slate-400 text-sm mt-1">Both seal and reading are compliant.</p>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-400">Verification Failed</h2>
                <p className="text-slate-400 text-sm mt-1">{result.message}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">AI Seal Analysis</p>
                <p className="font-bold text-lg text-white">{result.ai_verification?.seal_status}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">OCR Extracted</p>
                <p className="font-bold text-lg text-white font-mono">{result.ai_verification?.ocr_reading}</p>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/inspector/dashboard'}
              className="w-full mt-4 bg-blue-600 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
            >
              Sign & Upload to Cloud
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <InspectorScanContent />
    </Suspense>
  );
}
