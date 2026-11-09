import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Award,
  Filter
} from 'lucide-react';
import { CourseOverview, AssessmentQuestion } from '../types/course';

interface QuizLabModalProps {
  course: CourseOverview;
  isOpen: boolean;
  onClose: () => void;
  onAwardXp: (amount: number) => void;
}

export const QuizLabModal: React.FC<QuizLabModalProps> = ({
  course,
  isOpen,
  onClose,
  onAwardXp,
}) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = React.useState<number>(0); // 0 = all
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState<boolean>(false);
  const [streak, setStreak] = React.useState<number>(0);
  const [totalScore, setTotalScore] = React.useState<number>(0);

  // Extract all questions across modules
  const allQuestions = React.useMemo(() => {
    const list: { moduleNumber: number; moduleTitle: string; q: AssessmentQuestion }[] = [];
    course.modules.forEach((m) => {
      if (m.assessment) {
        m.assessment.questions.forEach((q) => {
          list.push({ moduleNumber: m.moduleNumber, moduleTitle: m.title, q });
        });
      }
      m.lessons.forEach((l) => {
        if (l.quickKnowledgeCheck) {
          list.push({ moduleNumber: m.moduleNumber, moduleTitle: m.title, q: l.quickKnowledgeCheck });
        }
      });
    });
    return list;
  }, [course]);

  const filteredQuestions = React.useMemo(() => {
    if (selectedModuleFilter === 0) return allQuestions;
    return allQuestions.filter((item) => item.moduleNumber === selectedModuleFilter);
  }, [allQuestions, selectedModuleFilter]);

  if (!isOpen) return null;

  const currentItem = filteredQuestions[currentIndex] || filteredQuestions[0];
  const q = currentItem?.q;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (q && idx === q.correctIndex) {
      setStreak((s) => s + 1);
      setTotalScore((t) => t + 20);
      onAwardXp(20);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setStreak(0);
    setTotalScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Zero Waste Interactive Quiz Arena
              </h2>
              <div className="text-[11px] text-white/80">
                Rapid-fire practice questions from all 252 newsletters
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-full text-xs font-bold text-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Streak: {streak}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Filter Topic:</span>
            <select
              value={selectedModuleFilter}
              onChange={(e) => {
                setSelectedModuleFilter(parseInt(e.target.value, 10));
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={0}>All Modules (40+ Questions)</option>
              {course.modules.map((m) => (
                <option key={m.moduleNumber} value={m.moduleNumber}>
                  Module {m.moduleNumber}: {m.title.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-mono">
            Question {currentIndex + 1} of {filteredQuestions.length}
          </div>
        </div>

        {/* Question Body */}
        {q && (
          <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Module {currentItem.moduleNumber}: {currentItem.moduleTitle}
            </div>

            <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-snug">
              {q.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === q.correctIndex;

                let optStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (isAnswered) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
                  } else {
                    optStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-medium';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between gap-3 transition-colors ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-current text-[11px] font-mono flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl text-xs space-y-1 animate-in fade-in duration-200 ${
                  selectedOption === q.correctIndex
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border border-rose-200 text-rose-950'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {selectedOption === q.correctIndex ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Brilliant! Correct answer (+20 XP).</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Incorrect. Review rationale below:</span>
                    </>
                  )}
                </div>
                <div className="text-slate-700 leading-relaxed pt-1">
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Score</span>
          </button>

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {currentIndex < filteredQuestions.length - 1 ? 'Next Question' : 'Start Over'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
