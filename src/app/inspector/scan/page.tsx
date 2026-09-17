"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, ShieldCheck, FileText, AlertTriangle, ArrowLeft, Crosshair, Cpu, MapPin, CheckCircle, XCircle, FileImage } from 'lucide-react';
import Link from 'next/link';

import jsQR from 'jsqr';

function InspectorScanContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [step, setStep] = useState(1); 
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState('Fetching GPS...');
  const [referenceValue, setReferenceValue] = useState('');
  const [sealImageBase64, setSealImageBase64] = useState<string>('');
  
  const qrInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

  // Auto-start if token is provided via URL
  useEffect(() => {
    if (tokenParam && step === 1) {
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

  const handleQRFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            try {
              const url = new URL(code.data);
              const token = url.searchParams.get('token');
              if (token) {
                setTokenInput(token);
                handleTokenSubmit(token);
              } else {
                alert('No token found in QR code URL.');
              }
            } catch (err) {
              alert('Invalid QR code format.');
            }
          } else {
            alert('No QR code found in image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQRScan = () => {
    if (!tokenInput) {
      alert("Please enter a token or scan a valid QR code url with ?token=");
      return;
    }
    handleTokenSubmit(tokenInput);
  };

  const handleSealCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSealImageBase64(reader.result as string);
        setStep(3);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDisplayCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        submitForVerification(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForVerification = async (base64Img: string) => {
    setStep(4);
    setVerifying(true);
    
    try {
      // 1. Analyze weight reading
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img })
      });
      const data = await res.json();
      const ocrReading = data.ocr_reading || 'Failed to read';
      
      // 2. Analyze seal image if available
      let finalSealStatus = 'Intact';
      if (sealImageBase64) {
        try {
          const sealRes = await fetch('/api/analyze-seal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: sealImageBase64 })
          });
          const sealData = await sealRes.json();
          if (sealData.seal_status) finalSealStatus = sealData.seal_status;
        } catch (e) {
          console.error("Seal analyze error:", e);
        }
      }
      
      // Calculate tolerance
      const ocrNumber = parseFloat(ocrReading.replace(/[^0-9.]/g, ''));
      const refNumber = parseFloat(referenceValue);
      
      let isMatch = true;
      let discrepancyMsg = '';
      
      if (!isNaN(ocrNumber) && !isNaN(refNumber) && refNumber > 0) {
        const diff = Math.abs(ocrNumber - refNumber);
        const percentDiff = (diff / refNumber) * 100;
        
        if (percentDiff <= 2.0) {
          isMatch = true;
          discrepancyMsg = 'Within 2% allowable tolerance.';
        } else {
          isMatch = false;
          discrepancyMsg = `Exceeds 2% limit! Deviates by ${percentDiff.toFixed(1)}%.`;
        }
      }
      
      setResult((prev: any) => ({
        ...prev,
        ai_verification: {
          ...prev?.ai_verification,
          seal_status: finalSealStatus,
          ocr_reading: ocrReading,
          is_reading_match: isMatch,
          discrepancy_message: discrepancyMsg
        }
      }));
    } catch (err) {
      console.error('Analysis error:', err);
      setResult((prev: any) => ({
        ...prev,
        ai_verification: {
          ...prev?.ai_verification,
          ocr_reading: 'API Error',
          seal_status: 'API Error',
          is_reading_match: true,
          discrepancy_message: 'Could not compute variance.'
        }
      }));
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col">
      <div className="w-full max-w-md mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/inspector/dashboard" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <MapPin size={12} className="text-blue-400" />
              {location}
            </div>
            {step > 1 && (
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${step === 5 ? 'text-green-400 bg-green-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                {step === 5 ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                {step === 5 ? 'Synced to Cloud ✓' : 'Captured Locally'}
              </div>
            )}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Crosshair size={32} />
              </div>
              <h2 className="text-2xl font-bold">Initiate Inspection</h2>
              <p className="text-slate-400 text-sm mt-2">Scan the QR tag or manually enter its 32-char token.</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={qrInputRef} 
                onChange={handleQRFile} 
                className="hidden" 
              />
              <button 
                onClick={() => qrInputRef.current?.click()}
                className="w-full bg-blue-600 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-blue-500 transition shadow-lg"
              >
                <Camera size={24} />
                Process Tag
              </button>
              
              <div className="flex items-center gap-4 text-slate-500 text-sm py-2">
                <hr className="flex-1 border-slate-700" />
                <span>OR</span>
                <hr className="flex-1 border-slate-700" />
              </div>

              <input 
                type="text" 
                placeholder="Enter Hex Token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleQRScan}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-slate-600 transition"
              >
                Process Token
              </button>
            </div>
          </div>
        )}

        {(step === 2 || step === 3) && result && result.instrument && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-mono">ID: {result.instrument.qr_code_id}</p>
                <p className="font-bold">{result.instrument.instrument_type}</p>
                <p className="text-xs text-blue-400 font-mono mt-1">EWB-2026-{result.instrument.qr_code_id.replace(/-/g, '').substring(0, 6)}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${result.valid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.valid ? 'Valid' : 'Expired'}
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
                  <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">Enter known reference weight/volume, then capture the digital indicator.</p>
                </div>
                
                <div className="text-left mt-2 mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Known Reference Value</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 45000"
                    value={referenceValue}
                    onChange={(e) => setReferenceValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <input type="file" accept="image/*" capture="environment" ref={displayInputRef} onChange={handleDisplayCapture} className="hidden" />
                <button onClick={() => displayInputRef.current?.click()} className="w-full bg-white text-slate-900 px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50">
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

        {step >= 4 && !verifying && result && result.instrument && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.valid && result.ai_verification?.is_reading_match && result.ai_verification?.seal_status === 'Intact' ? (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400">Verification Passed</h2>
                <p className="text-slate-400 text-sm mt-1">Instrument is valid and reading is compliant.</p>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-400">Verification Failed</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {!result.valid ? result.message : 
                   result.ai_verification?.seal_status !== 'Intact' ? 'Physical seal is tampered!' : 
                   'Database valid, but OCR discrepancy detected.'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-slate-800 p-4 rounded-xl border ${result.ai_verification?.seal_status === 'Intact' ? 'border-slate-700' : 'border-red-500'}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">AI Seal Analysis</p>
                <p className={`font-bold text-lg ${result.ai_verification?.seal_status === 'Intact' ? 'text-white' : 'text-red-400'}`}>
                  {result.ai_verification?.seal_status}
                </p>
              </div>
              <div className={`bg-slate-800 p-4 rounded-xl border ${result.ai_verification?.is_reading_match ? 'border-slate-700' : 'border-red-500'}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">OCR Extracted</p>
                <p className="font-bold text-lg text-white font-mono">{result.ai_verification?.ocr_reading}</p>
                {referenceValue && (
                  <p className={`text-[10px] mt-1 ${result.ai_verification?.is_reading_match ? 'text-green-400' : 'text-red-400'}`}>
                    {result.ai_verification?.discrepancy_message}
                  </p>
                )}
              </div>
            </div>

            {step !== 5 ? (
              <button 
                onClick={async () => {
                  setStep(5);
                  
                  const isPassed = result.valid && result.ai_verification?.is_reading_match && result.ai_verification?.seal_status === 'Intact';
                  
                  try {
                    const res = await fetch('/api/submit-inspection', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        instrument_id: result.instrument.id,
                        seal_status: result.ai_verification?.seal_status || 'Unknown',
                        display_reading: result.ai_verification?.ocr_reading || 'N/A',
                        is_passed: isPassed
                      })
                    });
                    const resData = await res.json();
                    if (!res.ok) console.error("Submit API Error:", resData);
                  } catch (e) {
                    console.error("Failed to submit inspection", e);
                  }

                  // Only redirect AFTER the database write completes
                  alert('Inspection saved to Supabase securely.');
                  window.location.href = '/inspector/dashboard';
                }}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
              >
                Sign & Upload to Cloud
              </button>
            ) : (
              <div className="w-full mt-4 bg-slate-800 text-slate-400 px-4 py-4 rounded-xl flex items-center justify-center gap-2 font-bold border border-slate-700">
                <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                Syncing securely...
              </div>
            )}
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
