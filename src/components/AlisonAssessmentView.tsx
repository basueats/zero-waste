import React from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Sparkles,
  Info
} from 'lucide-react';
import { ModuleAssessment, CourseModule } from '../types/course';

interface AlisonAssessmentViewProps {
  module: CourseModule;
  assessment: ModuleAssessment;
  onAssessmentPassed: (score: number) => void;
  onNextModule: () => void;
}

export const AlisonAssessmentView: React.FC<AlisonAssessmentViewProps> = ({
  module,
  assessment,
  onAssessmentPassed,
  onNextModule,
}) => {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [scorePercentage, setScorePercentage] = React.useState(0);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    assessment.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    setScorePercentage(score);
    setIsSubmitted(true);

    if (score >= assessment.passingGrade) {
      onAssessmentPassed(score);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScorePercentage(0);
  };

  const isPassed = scorePercentage >= assessment.passingGrade;
  const allAnswered = Object.keys(selectedAnswers).length === assessment.questions.length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Module {module.moduleNumber} Assessment
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {assessment.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Passing Grade Required: <strong>{assessment.passingGrade}%</strong> · {assessment.questions.length} Questions
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-md text-xs font-semibold border border-amber-200/60">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Earn +50 XP upon passing</span>
        </div>
      </div>

      {/* Result Callout if submitted */}
      {isSubmitted && (
        <div
          className={`p-6 rounded-xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs ${
            isPassed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {isPassed ? (
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <XCircle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="text-lg font-bold">
                {isPassed ? 'Congratulations! You Passed!' : 'Assessment Not Passed'}
              </div>
              <div className="text-xs opacity-90">
                You scored <strong className="font-mono">{scorePercentage}%</strong> (Passing requirement: {assessment.passingGrade}%).
                {isPassed ? ' Your diploma credential has been updated with honors.' : ' Review the rationales below and retry.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>

            {isPassed && (
              <button
                onClick={onNextModule}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <span>Next Module</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-6">
        {assessment.questions.map((q, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-xl border transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-sm">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pl-8">
                {q.options.map((opt, oIdx) => {
                  const isThisSelected = selected === oIdx;
                  const isThisCorrect = oIdx === q.correctIndex;

                  let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (isSubmitted) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-emerald-100/90 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                    } else if (isThisSelected && !isCorrect) {
                      optionStyle = 'bg-rose-100/90 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'bg-blue-50 border-blue-600 text-blue-950 font-medium ring-1 ring-blue-600';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm flex items-center justify-between gap-3 transition-colors ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-current text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isSubmitted && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation / Rationale */}
              {isSubmitted && (
                <div className="mt-4 ml-8 p-3 bg-white/80 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Pedagogical Explanation:</strong> {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!isSubmitted && (
        <div className="mt-8 flex items-center justify-between p-4 bg-slate-100 rounded-xl">
          <div className="text-xs text-slate-600">
            {allAnswered
              ? 'All questions answered! Click submit to calculate your score.'
              : `Answered ${Object.keys(selectedAnswers).length} of ${assessment.questions.length} questions.`}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-6 py-2.5 font-bold text-xs rounded-lg shadow-xs transition-colors ${
              allAnswered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
};
