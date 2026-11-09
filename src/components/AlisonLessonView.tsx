import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ChefHat, 
  ShieldCheck, 
  Percent, 
  TrendingUp, 
  Volume2, 
  VolumeX,
  PlayCircle,
  HelpCircle,
  XCircle,
  Layers,
  BookOpen
} from 'lucide-react';
import { Lesson, CourseModule } from '../types/course';
import { InteractiveVideoPlayer } from './InteractiveVideoPlayer';
import { audioNarrator } from '../utils/audioNarrator';

interface AlisonLessonViewProps {
  module: CourseModule;
  lesson: Lesson;
  lessonIndex: number;
  totalLessonsInModule: number;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAwardXp: (amount: number) => void;
}

export const AlisonLessonView: React.FC<AlisonLessonViewProps> = ({
  module,
  lesson,
  lessonIndex,
  totalLessonsInModule,
  isCompleted,
  onMarkComplete,
  onNext,
  onPrev,
  onAwardXp,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [activeReadingSection, setActiveReadingSection] = React.useState<number | null>(null);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = React.useState<number | null>(null);
  const [quickSubmitted, setQuickSubmitted] = React.useState(false);

  // Reset quick check and speech when lesson changes
  React.useEffect(() => {
    setSelectedQuickAnswer(null);
    setQuickSubmitted(false);
    audioNarrator.stop();
    setIsPlayingAudio(false);
    setActiveReadingSection(null);
  }, [lesson.id]);

  const readSection = (secIdx: number) => {
    if (secIdx >= lesson.sections.length) {
      setIsPlayingAudio(false);
      setActiveReadingSection(null);
      audioNarrator.playSound('correct');
      return;
    }

    setActiveReadingSection(secIdx);
    const sec = lesson.sections[secIdx];
    const textToRead = `${sec.heading}. ${sec.content}`;

    audioNarrator.speak({
      text: textToRead,
      rate: 1.0,
      volume: 0.9,
      onEnd: () => {
        readSection(secIdx + 1);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setActiveReadingSection(null);
      }
    });
  };

  const toggleSpeech = () => {
    if (isPlayingAudio) {
      audioNarrator.stop();
      setIsPlayingAudio(false);
      setActiveReadingSection(null);
    } else {
      audioNarrator.getAudioContext();
      setIsPlayingAudio(true);
      audioNarrator.speak({
        text: `Topic lecture: ${lesson.title}`,
        rate: 1.0,
        volume: 0.9,
        onEnd: () => {
          readSection(0);
        },
        onError: () => {
          readSection(0);
        }
      });
    }
  };

  React.useEffect(() => {
    return () => {
      audioNarrator.stop();
    };
  }, [lesson.id]);

  const handleQuickSubmit = (optIndex: number) => {
    if (quickSubmitted) return;
    setSelectedQuickAnswer(optIndex);
    setQuickSubmitted(true);
    if (lesson.quickKnowledgeCheck && optIndex === lesson.quickKnowledgeCheck.correctIndex) {
      onAwardXp(20);
    }
  };

  return (
    <article className="max-w-4xl mx-auto py-6 px-4 md:px-8">
      {/* Breadcrumb & Topic Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Module {module.moduleNumber} · Topic {lessonIndex + 1} of {totalLessonsInModule}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Time */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{lesson.readTimeMinutes} min lecture</span>
          </div>

          {/* Audio Reader Toggle */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
              isPlayingAudio
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Read lecture aloud"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Listen Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Newsletter Attribution */}
      {lesson.newsletterRef && lesson.newsletterRef.length > 0 && (
        <div className="mb-6 px-3.5 py-2 bg-amber-50/70 border border-amber-200/60 rounded-lg flex items-center gap-2 text-xs text-amber-900">
          <ChefHat className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Synthesized from <strong>The Zero Waste Kitchen</strong> Issues:{' '}
            {lesson.newsletterRef.map((n) => `#${n}`).join(', ')}
          </span>
        </div>
      )}

      {/* Interactive Video Masterclass (If available) */}
      {lesson.video && (
        <InteractiveVideoPlayer
          video={lesson.video}
          onAwardXp={onAwardXp}
        />
      )}

      {/* High-Resolution Culinary Image (If available) */}
      {lesson.heroImage && (
        <figure className="my-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
          <img
            src={lesson.heroImage}
            alt={lesson.title}
            referrerPolicy="no-referrer"
            className="w-full h-72 md:h-96 object-cover"
          />
          {lesson.imageCaption && (
            <figcaption className="p-3 bg-white text-xs text-slate-600 border-t border-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>{lesson.imageCaption}</span>
            </figcaption>
          )}
        </figure>
      )}

      {/* Main Instructional Sections */}
      <div className="space-y-8 text-slate-800 leading-relaxed mt-6">
        {lesson.sections.map((section, sIdx) => {
          const isReadingThis = isPlayingAudio && activeReadingSection === sIdx;

          return (
            <section
              key={sIdx}
              className={`space-y-3 p-4 rounded-xl transition-all ${
                isReadingThis
                  ? 'bg-emerald-50/70 border-2 border-emerald-500 shadow-xs'
                  : 'border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  {section.heading}
                </h2>
                {isReadingThis && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3 h-3" />
                    Reading Now
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-normal">
                {section.content}
              </p>

            {/* Formula / Culinary Action Blueprint Box */}
            {section.formulaBox && (
              <div className="my-4 bg-emerald-50/90 border border-emerald-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                  <ChefHat className="w-4 h-4 text-emerald-600" />
                  <span>{section.formulaBox.title}</span>
                </div>
                <div className="text-sm font-semibold text-emerald-950 font-mono bg-white/70 p-3 rounded-lg border border-emerald-200/50 mb-2">
                  {section.formulaBox.ratioOrStep}
                </div>
                {section.formulaBox.safetyNote && (
                  <div className="flex items-start gap-2 text-xs text-emerald-900 mt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Safety & Hygiene Protocol:</strong> {section.formulaBox.safetyNote}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
      </div>

      {/* Quick In-Lesson Knowledge Check Quiz */}
      {lesson.quickKnowledgeCheck && (
        <div className="my-8 bg-amber-50/80 border border-amber-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Quick Knowledge Check</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
              +20 XP on correct answer
            </div>
          </div>

          <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3">
            {lesson.quickKnowledgeCheck.question}
          </h3>

          <div className="space-y-2">
            {lesson.quickKnowledgeCheck.options.map((opt, oIdx) => {
              const isSelected = selectedQuickAnswer === oIdx;
              const isCorrect = oIdx === lesson.quickKnowledgeCheck?.correctIndex;

              let btnStyle = 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50';
              if (quickSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                } else {
                  btnStyle = 'bg-white/60 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-amber-200 border-amber-500 text-amber-950 font-semibold';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  disabled={quickSubmitted}
                  onClick={() => handleQuickSubmit(oIdx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs md:text-sm flex items-center justify-between gap-3 transition-colors ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-current text-[11px] font-mono flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {quickSubmitted && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {quickSubmitted && (
            <div className="mt-3.5 p-3 bg-white rounded-lg border border-amber-200 text-xs text-slate-700">
              <strong>Rationale:</strong> {lesson.quickKnowledgeCheck.explanation}
            </div>
          )}
        </div>
      )}

      {/* Waste Diversion & Financial Impact KPI Cards */}
      {lesson.scrapWasteMetrics && (
        <div className="my-8 bg-slate-900 text-white rounded-xl p-6 shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Demonstrated Scrap Diversion Value</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Waste Diverted</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {lesson.scrapWasteMetrics.wasteDivertedPercentage}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Average kitchen recovery</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Annual Cost Captured</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
                {lesson.scrapWasteMetrics.householdAnnualSavingsUSD}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Direct raw ingredient savings</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Avoided CO2e</div>
              <div className="text-2xl font-extrabold text-sky-400 font-mono mt-0.5">
                {lesson.scrapWasteMetrics.co2ReductionKg}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Landfill methane diverted</div>
            </div>
          </div>
        </div>
      )}

      {/* Key Takeaways Box */}
      <div className="my-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Core Takeaways & Operational Rules</span>
        </h3>
        <ul className="space-y-2">
          {lesson.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Topic Completion & Navigation Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Topic</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onMarkComplete}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${isCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`}
            />
            <span>{isCompleted ? 'Completed (+15 XP)' : 'Mark Topic Complete'}</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
          >
            <span>Continue Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
