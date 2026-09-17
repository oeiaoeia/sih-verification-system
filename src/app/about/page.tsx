import { Scale, FileText, CheckCircle, Database } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        <div className="text-center border-b pb-6">
          <Scale size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">About E-MaapTol</h1>
          <p className="text-slate-500 mt-2 text-lg">Smart India Hackathon 2026</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><Database size={20} className="text-blue-500"/> Team & Project Details</h2>
          <ul className="space-y-2 text-slate-700 ml-7 list-disc">
            <li><strong>Team Name:</strong> C-Men</li>
            <li><strong>Problem Statement:</strong> SIH26036 — Online Verification System for Weighing and Measuring Instruments</li>
            <li><strong>Theme:</strong> Transportation and Logistics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText size={20} className="text-blue-500"/> Regulatory References</h2>
          <p className="text-slate-600 mb-2">This solution is built to support enforcement under the following legal frameworks:</p>
          <ul className="space-y-2 text-slate-700 ml-7 list-disc">
            <li>Legal Metrology Act, 2009</li>
            <li>Legal Metrology (General) Rules, 2011</li>
            <li>OIML R-76 Recommendation for Non-Automatic Weighing Instruments</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><CheckCircle size={20} className="text-blue-500"/> How This Works</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            E-MaapTol replaces paper calibration stickers with a real-time, two-sided digital verification network:
          </p>
          <ol className="list-decimal ml-7 space-y-3 text-slate-700">
            <li>Every calibrated instrument (weighbridge, fuel dispenser) receives a secure QR tag tied to its cloud record.</li>
            <li><strong>Inspectors</strong> use the app to capture the physical lead seal and live display, passing them through an AI model for tamper-detection and OCR reading, logging inspections to the cloud.</li>
            <li><strong>Transporters & Public</strong> scan the same QR to instantly cross-reference e-way bills, verify calibration status, and flag suspected discrepancies (triaged via OTP).</li>
          </ol>
        </section>

      </div>
    </div>
  );
}
