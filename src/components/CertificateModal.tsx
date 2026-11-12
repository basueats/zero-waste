import React from 'react';
import { X, Award, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CourseOverview } from '../types/course';

interface CertificateModalProps {
  course: CourseOverview;
  isOpen: boolean;
  onClose: () => void;
  xpPoints: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  isOpen,
  onClose,
  xpPoints,
}) => {
  const [studentName, setStudentName] = React.useState('Alex Morgan');
  const certificateId = React.useMemo(
    () => 'ALISON-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-2026',
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Alison Diploma Certificate</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Certificate PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Name Input Strip (no-print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <label htmlFor="studentName" className="font-semibold text-slate-700">
              Student / Graduate Name:
            </label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
              placeholder="Enter your full name"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Credential Verification: <strong className="font-mono text-slate-800">{certificateId}</strong></span>
          </div>
        </div>

        {/* The Printable Certificate Design */}
        <div className="p-8 md:p-12 bg-[#fdfcf7] relative text-center border-8 border-double border-[#d4af37]/60 m-4 rounded-lg shadow-inner">
          {/* Subtle Guilloche / Alison Crest Header */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
              A
            </div>
          </div>

          <div className="text-xs uppercase tracking-[0.25em] text-[#856d28] font-bold mb-1">
            Alison Educational Accreditation
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight mb-2 font-bold">
            Diploma of Qualification
          </h2>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-6">
            This is to certify that
          </div>

          {/* Student Name */}
          <div className="text-3xl md:text-4xl font-serif text-[#1e293b] border-b-2 border-[#d4af37]/50 pb-2 mb-6 max-w-md mx-auto italic font-bold">
            {studentName || 'Student Name'}
          </div>

          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
            has successfully completed all modules, practical assessments, and required laboratory hours for the accredited curriculum:
          </p>

          {/* Course Name */}
          <div className="text-xl md:text-2xl font-extrabold text-[#064e3b] max-w-lg mx-auto mb-4 tracking-tight">
            {course.title}
          </div>

          <div className="text-xs text-slate-500 mb-8">
            Synthesized from 252 Issues of <em>&quot;The Zero Waste Kitchen&quot;</em> · 26.0 Active Instructional Hours (Level 7 Mastery) · Distinction Grade with {xpPoints} XP
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-200 max-w-lg mx-auto text-center text-xs text-slate-600">
            <div>
              <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 mb-1">
                E. Gallagher
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Head of Culinary Arts</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] bg-amber-50 flex items-center justify-center text-[#d4af37] shadow-xs">
                <Award className="w-7 h-7" />
              </div>
              <div className="text-[9px] uppercase tracking-wider text-[#856d28] font-bold mt-1">Verified Seal</div>
            </div>

            <div>
              <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 mb-1">
                M. O’Flaherty
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Academic Director</div>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="mt-6 pt-4 text-[10px] text-slate-400 font-mono">
            Verification ID: {certificateId} · Issued: {new Date().toISOString().split('T')[0]} · Alison Standard Verification
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 no-print">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for LinkedIn certifications or employer portfolio</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold rounded-md text-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
