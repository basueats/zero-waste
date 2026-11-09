import React from 'react';
import { 
  X, 
  Wand2, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle, 
  PlusCircle, 
  Download, 
  BookOpen, 
  HelpCircle,
  ChefHat
} from 'lucide-react';
import { CourseModule } from '../types/course';

interface AiModuleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialIssueNumber?: number;
  onAddModuleToCourse: (newModule: CourseModule) => void;
}

export const AiModuleGeneratorModal: React.FC<AiModuleGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  initialIssueNumber,
  onAddModuleToCourse,
}) => {
  const [topic, setTopic] = React.useState(initialTopic);
  const [newsletterNumber, setNewsletterNumber] = React.useState<number | undefined>(initialIssueNumber);
  const [context, setContext] = React.useState('');
  const [targetAudience, setTargetAudience] = React.useState('Culinary students, home cooks, and hospitality chefs');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialIssueNumber) setNewsletterNumber(initialIssueNumber);
  }, [initialTopic, initialIssueNumber]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a topic or newsletter subject.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedModule(null);

    try {
      const response = await fetch('/api/ai/generate-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          newsletterNumber,
          context,
          targetAudience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate module.');
      }

      setGeneratedModule(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while contacting Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLive = () => {
    if (!generatedModule) return;

    const mod: CourseModule = {
      id: `custom-mod-${Date.now()}`,
      moduleNumber: 13, // Appended
      title: generatedModule.title || topic,
      subtitle: generatedModule.shortDescription || 'Custom AI-Synthesized Zero Waste Module',
      estimatedHours: 1.5,
      newsletterRange: newsletterNumber ? `Issue #${newsletterNumber}` : 'Special Issue Synthesis',
      learningOutcomes: generatedModule.learningOutcomes || [],
      lessons: (generatedModule.lessons || []).map((l: any, idx: number) => ({
        id: `custom-lesson-${Date.now()}-${idx}`,
        title: l.title || `Topic ${idx + 1}`,
        readTimeMinutes: l.readTimeMinutes || 7,
        sections: l.sections || [],
        scrapWasteMetrics: l.scrapWasteMetrics,
        keyTakeaways: l.keyTakeaways || [],
      })),
      assessment: generatedModule.assessment ? {
        id: `custom-assess-${Date.now()}`,
        title: generatedModule.assessment.title || 'Module Assessment',
        passingGrade: generatedModule.assessment.passingGrade || 80,
        questions: (generatedModule.assessment.questions || []).map((q: any, qIdx: number) => ({
          id: `custom-q-${qIdx}`,
          question: q.question,
          options: q.options || [],
          correctIndex: q.correctIndex || 0,
          explanation: q.explanation || '',
        })),
      } : undefined,
    };

    onAddModuleToCourse(mod);
    alert('Module successfully added to the live course!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-purple-50/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
              <Wand2 className="w-4 h-4" />
              <span>AI Course Expander (Powered by Gemini 3.8)</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Synthesize Any Newsletter into an Alison Module
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Convert raw LinkedIn newsletter excerpts or new scrap topics into accredited Alison-standard learning outcomes, lectures, and quizzes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-700">
          {!generatedModule ? (
            <>
              {/* Preset Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Select from 252 Newsletter Topics:
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { issue: 84, title: 'Citrus Peels to Oleo Saccharum & Vinegar' },
                    { issue: 128, title: 'Chickpea Aquafaba & Soluble Legume Proteins' },
                    { issue: 139, title: 'Sour Milk Ricotta & Acid Whey Brines' },
                    { issue: 184, title: 'Induction Cooking & Thermal Energy Conservation' },
                    { issue: 211, title: 'The Eat-Me-First Fridge Organization System' },
                  ].map((preset) => (
                    <button
                      key={preset.issue}
                      type="button"
                      onClick={() => {
                        setTopic(preset.title);
                        setNewsletterNumber(preset.issue);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 rounded-md border border-slate-200 transition-colors"
                    >
                      #{preset.issue}: {preset.title.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Newsletter Topic / Scrap Focus *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Banana Peels to Pulled Pork & Vinegar Extraction"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Newsletter #
                  </label>
                  <input
                    type="number"
                    value={newsletterNumber || ''}
                    onChange={(e) => setNewsletterNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 174"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Newsletter Notes or Raw LinkedIn Text:
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                  placeholder="Paste excerpt or key techniques from the newsletter (ratios, temperature thresholds, chef tips)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Generation Error:</strong> {error}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Generated Module Preview */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">
                    Alison Course Module Successfully Synthesized!
                  </span>
                </div>
                <button
                  onClick={() => setGeneratedModule(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Generate Another
                </button>
              </div>

              {/* Title & Description */}
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Generated Module
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {generatedModule.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {generatedModule.shortDescription}
                </p>
              </div>

              {/* Learning Outcomes Preview */}
              <div className="bg-[#f7fae8] border border-[#e2ebb8] rounded-xl p-4">
                <div className="text-xs font-bold text-[#3a451d] uppercase tracking-wider mb-2">
                  Alison Learning Outcomes:
                </div>
                <ul className="text-xs space-y-1.5 text-slate-800">
                  {generatedModule.learningOutcomes?.map((out: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-[#4c5b23] rounded-xs mt-1.5 shrink-0" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Topics Preview */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lessons ({generatedModule.lessons?.length || 0}):
                </div>
                {generatedModule.lessons?.map((l: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{l.title}</span>
                      <span className="text-slate-400 font-normal">({l.readTimeMinutes} min)</span>
                    </div>
                    <div className="text-slate-600 mt-1 line-clamp-2">
                      {l.sections?.[0]?.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Assessment Preview */}
              {generatedModule.assessment && (
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-purple-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>{generatedModule.assessment.title} ({generatedModule.assessment.questions?.length} Graded Questions)</span>
                  </div>
                  <div className="text-slate-600">
                    Includes Bloom-aligned scenario testing and pedagogical explanations.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>

          {!generatedModule ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Module with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Alison Module</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddLive}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add to Live Course Player</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
