import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Check,
  Calendar,
  User,
  QrCode,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface SurplusCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLearnerName?: string;
  courseTitle?: string;
  completionDateDefault?: string;
  customCertId?: string;
}

export const SurplusCertificateModal: React.FC<SurplusCertificateModalProps> = ({
  isOpen,
  onClose,
  defaultLearnerName = 'Supritam Basu', // Defaulted from user login / email basueats@gmail.com
  courseTitle = 'The Food Waste & Culinary Foundation Course for chefs & Professionals',
  completionDateDefault = '11/11/2026',
  customCertId,
}) => {
  const [learnerName, setLearnerName] = useState<string>(defaultLearnerName);
  const [completionDate, setCompletionDate] = useState<string>(completionDateDefault);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync if defaultLearnerName changes
  useEffect(() => {
    if (defaultLearnerName) {
      setLearnerName(defaultLearnerName);
    }
  }, [defaultLearnerName]);

  const certCode = customCertId || 'CERT-2026-791463';
  const verificationUrl = `https://thecpdregister.com/verify/791463/${certCode}`;

  // Image source: Exact certificate template uploaded by user
  const certificateTemplateSrc = '/assets/images/certificate_official_template.png';
  const certificateFallbackSrc = '/assets/aistudio/White_and_Gold_Simple_Elegant_Appreciation_Certificate_1d955b21.png';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 2000 x 1414 PNG Download using HTML5 Canvas
  const handleDownloadHighResPng = async () => {
    setIsGeneratingDownload(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1414;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      // Load original template image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = certificateTemplateSrc;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // Try fallback
          img.src = certificateFallbackSrc;
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load certificate template'));
        };
      });

      // 1. Draw entire base template (Zero Waste, borders, logos, signature, all text)
      ctx.drawImage(img, 0, 0, 2000, 1414);

      // 2. Cover the original Name area with clean pure white patch
      // Coordinates in 2000x1414: center X = 1000, Y = 660 to 750
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(450, 650, 1100, 102);

      // 3. Draw clean gold underline underneath the recipient name
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(550, 755, 900, 3);

      // 4. Draw Dynamic Learner's Name (centered at X=1000, Y=705)
      ctx.fillStyle = '#1e242b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 56px "Times New Roman", Georgia, serif';
      ctx.fillText(learnerName || 'Supritam Basu', 1000, 705);

      // 5. Cover the original Date text with clean pure white patch
      // Coordinates: X = 360 to 700, Y = 985 to 1040
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(360, 985, 340, 56);

      // 6. Draw clean gold line under date
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(380, 1045, 300, 2);

      // 7. Draw Dynamic Completion Date
      ctx.fillStyle = '#1e242b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 28px Arial, Helvetica, sans-serif';
      ctx.fillText(completionDate || '11/11/2026', 530, 1018);

      // 8. Trigger PNG Download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = (learnerName || 'Supritam_Basu').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Certificate_${safeName}_Zero_Waste.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating high-res certificate PNG:', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* MODAL HEADER CONTROLS (Hidden on print) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Official Zero Waste Certificate of Completion
              </h3>
              <p className="text-[11px] text-slate-400">
                Accredited by The CPD Group (Provider #791463) & ISO 9001:2015 Certified
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDownloadHighResPng}
              disabled={isGeneratingDownload}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingDownload ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PNG (2000px)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUSTOMIZATION BAR: ONLY NAME AND DATE (As requested by user) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dynamic Name Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="cert-name-input" className="font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Learner Legal Name:</span>
              </label>
              <input
                id="cert-name-input"
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="Enter learner name..."
                className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 w-48 sm:w-60 shadow-2xs"
              />
            </div>

            {/* Dynamic Date Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="cert-date-input" className="font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Completion Date:</span>
              </label>
              <input
                id="cert-date-input"
                type="text"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                placeholder="11/11/2026"
                className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 w-32 shadow-2xs font-mono"
              />
            </div>
          </div>

          {/* Verification link info */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              Verified ID: {certCode}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
            </button>
          </div>
        </div>

        {/* CERTIFICATE DISPLAY BODY: EXACT UPLOADED CERTIFICATE TEMPLATE */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 flex items-center justify-center print:p-0 print:bg-white">
          <div className="relative w-full max-w-4xl aspect-[2000/1414] bg-white rounded-lg shadow-xl overflow-hidden border border-slate-300 print:shadow-none print:border-none print:rounded-none select-none">
            
            {/* 1. EXACT UPLOADED BASE CERTIFICATE IMAGE */}
            <img
              src={certificateTemplateSrc}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = certificateFallbackSrc;
              }}
              alt="Official Zero Waste Certificate of Completion"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* 2. DYNAMIC NAME OVERLAY (Pure white patch over original name + dynamic user name + gold underline) */}
            <div 
              className="absolute left-[20%] right-[20%] top-[45.8%] h-[7.5%] flex flex-col items-center justify-center bg-white z-10"
              style={{ paddingBottom: '2px' }}
            >
              <div 
                className="w-full text-center font-bold text-[#1e242b] leading-none tracking-wide"
                style={{
                  fontFamily: '"Times New Roman", Georgia, serif',
                  fontSize: 'clamp(1.2rem, 3.2vw, 2.75rem)'
                }}
              >
                {learnerName || 'Supritam Basu'}
              </div>
              {/* Subtle elegant gold line */}
              <div className="w-4/5 h-[2px] bg-[#c5a059] mt-1.5 opacity-90" />
            </div>

            {/* 3. DYNAMIC DATE OVERLAY (Pure white patch over original date text + dynamic date) */}
            <div 
              className="absolute left-[17%] w-[18%] top-[69.5%] h-[4.2%] flex items-center justify-center bg-white z-10"
            >
              <div 
                className="font-bold text-[#1e242b] tracking-wider text-center"
                style={{
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: 'clamp(0.65rem, 1.4vw, 1.15rem)'
                }}
              >
                {completionDate || '11/11/2026'}
              </div>
            </div>

            {/* 4. VERIFIABLE MICRO SERIAL PILL (Non-intrusive metadata in bottom margin) */}
            <div className="absolute bottom-2 right-4 text-[7px] sm:text-[9px] font-mono text-slate-400 z-10 print:hidden">
              Reg #791463 · ISO 9001:2015 · thecpdregister.com
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              Verifiable certificate ready for annual employer appraisal & HR records.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHighResPng}
              className="px-3.5 py-1 text-xs font-bold text-slate-800 hover:text-black bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Save PNG</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
