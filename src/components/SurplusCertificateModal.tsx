import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';

interface SurplusCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLearnerName?: string;
  courseTitle?: string;
}

export const SurplusCertificateModal: React.FC<SurplusCertificateModalProps> = ({
  isOpen,
  onClose,
  defaultLearnerName = 'Author, Chef Alex Vance',
  courseTitle = 'Food Waste Prevention Course for Chefs',
}) => {
  const [learnerName, setLearnerName] = React.useState(defaultLearnerName);
  const [issueDate, setIssueDate] = React.useState(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });
  const [certCode] = React.useState(() => `SA-CPD-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const certText = `======================================================
SUPRITAMONE ACADEMY
CONTINUING PROFESSIONAL DEVELOPMENT (CPD) ACCREDITED
======================================================

CERTIFICATE OF PROFESSIONAL MASTERY
This official diploma certifies that:

${learnerName.toUpperCase()}

Has successfully mastered and completed the comprehensive 18-hour professional kitchen curriculum:

${courseTitle}

Core Competencies Mastered:
1. Commercial 7-Day Kitchen Waste Audit & Tare Logging
2. Root-to-Stem Vegetable Butchery & Yield Testing
3. Circular Menu Engineering & Input/Output Pairing
4. Buffet Overproduction Mitigation & Shallow GN Pan Protocols
5. Ancient Preservation & Scrap Fermentation Systems
6. Day-Old Bakery Upcycling & Emulsion Chemistry

Verification Code: ${certCode}
Issued: ${issueDate}
Accredited CPD Hours: 18.0 CPD Credits

Signed:
Dr. Chef Supritam Basu, PhD, CEC
Dean & Founder, Supritamone Academy
Author & Lead Researcher, The Zero-Waste Kitchen Masterclass (252 Issues)

Dr. Aris Thorne
Director of Culinary Accreditation, Global Sustainability Board
======================================================`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Supritamone-CPD-Certificate-${learnerName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Toolbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Supritamone Academy CPD Diploma Generator</h3>
              <p className="text-[11px] text-slate-400">Official Continuing Professional Development Credential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Certificate</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Name Customizer Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="font-semibold text-slate-700 shrink-0">Learner Name:</span>
            <input
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-900 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your name or head chef's name"
            />
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Code: <strong className="font-mono text-slate-800">{certCode}</strong></span>
            <span>·</span>
            <span>Date: <strong className="text-slate-800">{issueDate}</strong></span>
          </div>
        </div>

        {/* Certificate Display Parchment */}
        <div className="p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-3xl border-8 border-double border-slate-900 p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-6">
            {/* Subtle Watermark seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-slate-900" />
            </div>

            {/* Header Lockup */}
            <div className="space-y-1 relative z-10 flex flex-col items-center justify-center">
              <SupritamoneLogo variant="seal" size="md" className="mb-1" />
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Continuing Professional Development (CPD) Certified
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Culinary Mastery
              </h1>
              <p className="text-xs text-slate-500 italic">
                This certifies that the candidate has satisfied all technical standards in food waste reduction
              </p>
            </div>

            {/* Candidate Name */}
            <div className="py-2 border-b-2 border-slate-900 max-w-md mx-auto">
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 tracking-wide">
                {learnerName}
              </span>
            </div>

            {/* Program details */}
            <div className="max-w-xl mx-auto space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                has successfully completed the accredited curriculum and practical laboratory requirements for
              </p>
              <p className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                {courseTitle}
              </p>
              <p className="text-[11px] text-slate-500">
                18.0 Accredited CPD Units · Root-to-Stem Science · Circular Menu Systems · Commercial Kitchen Auditing
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 grid grid-cols-3 items-end gap-4 text-center border-t border-slate-200 mt-6">
              {/* Signature 1: Dr. Chef Supritam Basu */}
              <div className="space-y-1">
                <div className="font-serif italic text-base sm:text-lg text-slate-800 border-b border-slate-300 pb-1">
                  Dr. Chef Supritam Basu
                </div>
                <p className="font-bold text-[11px] text-slate-900">Dr. Chef Supritam Basu</p>
                <p className="text-[9px] text-slate-500">PhD, CEC · Dean, Supritamone Academy</p>
              </div>

              {/* Gold Verification Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 text-slate-950 p-1 flex items-center justify-center shadow-md">
                  <div className="w-full h-full rounded-full border border-amber-900/40 flex flex-col items-center justify-center p-1 text-[8px] font-bold text-center leading-tight">
                    <ShieldCheck className="w-4 h-4 text-amber-900" />
                    <span>CPD ACCREDITED</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1">{certCode}</span>
              </div>

              {/* Signature 2: Academic Director */}
              <div className="space-y-1">
                <div className="font-serif italic text-base sm:text-lg text-slate-800 border-b border-slate-300 pb-1">
                  Dr. Aris Thorne
                </div>
                <p className="font-bold text-[11px] text-slate-900">Dr. Aris Thorne</p>
                <p className="text-[9px] text-slate-500">Global Sustainability Board</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital verification valid across international hospitality employers & Alison LMS.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
