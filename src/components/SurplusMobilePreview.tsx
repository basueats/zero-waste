import React from 'react';
import { 
  Home, 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  ChevronLeft, 
  Share2, 
  Play, 
  Download, 
  Check, 
  Heart, 
  MessageSquare, 
  HelpCircle,
  FileText,
  GraduationCap
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';
import { 
  surplusCourses, 
  surplusByproducts, 
  surplusRecipes, 
  communityQuestions,
  ByproductItem,
  ZeroWasteRecipe
} from '../data/surplusData';
import { surplusQuizQuestions } from '../data/quizQuestions';
import { audioNarrator } from '../utils/audioNarrator';

interface SurplusMobilePreviewProps {
  onOpenDesktop: () => void;
  onOpenCertify: () => void;
  onOpenExporter: () => void;
}

export const SurplusMobilePreview: React.FC<SurplusMobilePreviewProps> = ({
  onOpenDesktop,
  onOpenCertify,
  onOpenExporter,
}) => {
  const [mobileTab, setMobileTab] = React.useState<'courses' | 'library' | 'community' | 'search'>('courses');
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [selectedByproduct, setSelectedByproduct] = React.useState<ByproductItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = React.useState<ZeroWasteRecipe | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = React.useState(false);
  const [quizOption, setQuizOption] = React.useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = React.useState(false);

  const activeCourse = surplusCourses.find((c) => c.id === selectedCourseId) || surplusCourses[0];
  const activeQuiz = surplusQuizQuestions[0]; // matching screenshot 1 of 3

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Device Mode Switcher Banner */}
      <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs text-xs">
        <span className="font-semibold text-slate-700">📱 iPhone Mobile App Interactive Simulator</span>
        <button
          onClick={onOpenDesktop}
          className="text-blue-600 hover:text-blue-800 font-bold underline"
        >
          Switch to Desktop Web View
        </button>
      </div>

      {/* Simulated iPhone Frame */}
      <div className="relative w-[375px] h-[780px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-12 ring-slate-800 border-4 border-slate-700 overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/40" />
          </div>
        </div>

        {/* Mobile Status Bar (matching screenshot: 11:48, Wifi, 78% battery) */}
        <div className="h-9 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-800 bg-white z-40 select-none shrink-0 pt-2">
          <span>11:48</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono">5G</span>
            <div className="w-4 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
              <div className="h-full bg-slate-800 w-[78%]" />
            </div>
            <span className="text-[9px]">78%</span>
          </div>
        </div>

        {/* App Screen Content (White Canvas) */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col scrollbar-none">
          {/* Top Brand Header (matching image_35b19d98.png & image_c3f01459.png) */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-30">
            <SupritamoneLogo size="sm" />

            {/* Sub-tab pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMobileTab('courses');
                  setSelectedCourseId(null);
                  setSelectedByproduct(null);
                  setSelectedRecipe(null);
                  setIsTakingQuiz(false);
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                  mobileTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => {
                  setMobileTab('library');
                  setSelectedCourseId(null);
                  setSelectedByproduct(null);
                  setSelectedRecipe(null);
                  setIsTakingQuiz(false);
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                  mobileTab === 'library' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Library
              </button>
              <button
                onClick={() => {
                  setMobileTab('community');
                  setSelectedCourseId(null);
                  setSelectedByproduct(null);
                  setSelectedRecipe(null);
                  setIsTakingQuiz(false);
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                  mobileTab === 'community' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Q&A
              </button>
            </div>
          </div>

          {/* DYNAMIC SUB-SCREENS */}
          <div className="flex-1 p-3.5 space-y-4">
            {/* SCREEN 1: QUIZ VIEW (Matching image_35b19d98.png middle screen) */}
            {isTakingQuiz ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    onClick={() => setIsTakingQuiz(false)}
                    className="flex items-center text-xs font-semibold text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-[11px] font-bold text-slate-900">Quiz</span>
                  <button
                    onClick={() => setIsTakingQuiz(false)}
                    className="text-[11px] text-emerald-600 font-semibold"
                  >
                    Mark as complete
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    The best time to incorporate food waste prevention into the kitchen operation is when we: *
                  </h3>

                  <div className="space-y-2">
                    {activeQuiz.options.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => !isQuizSubmitted && setQuizOption(i)}
                        className={`p-2.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                          quizOption === i
                            ? isQuizSubmitted
                              ? i === activeQuiz.correctAnswerIndex
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                                : 'border-red-500 bg-red-50 text-red-900'
                              : 'border-blue-600 bg-blue-50/60 font-medium'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            quizOption === i ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>
                            {quizOption === i && <div className="w-1 h-1 bg-white rounded-full" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isQuizSubmitted && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-[10px] text-emerald-800 leading-relaxed border border-emerald-200">
                      <strong>✓ Correct!</strong> {activeQuiz.explanation}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-400 font-mono">1 of 3</span>
                    {!isQuizSubmitted ? (
                      <button
                        onClick={() => {
                          setIsQuizSubmitted(true);
                          const isCorrect = quizOption === activeQuiz.correctAnswerIndex;
                          audioNarrator.playSound(isCorrect ? 'correct' : 'wrong');
                        }}
                        disabled={quizOption === null}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg disabled:opacity-40"
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          audioNarrator.playSound('click');
                          setIsTakingQuiz(false);
                        }}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedCourseId ? (
              /* SCREEN 2: COURSE PLAYER VIEW (Matching image_35b19d98.png) */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    onClick={() => {
                      audioNarrator.stop();
                      setSelectedCourseId(null);
                    }}
                    className="flex items-center text-xs font-semibold text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Courses</span>
                  </button>
                  <span className="text-[11px] font-bold text-slate-900 truncate max-w-[160px]">
                    {activeCourse.title}
                  </span>
                  <Share2 className="w-4 h-4 text-slate-400" />
                </div>

                {/* Video Banner with Dr. Chef Supritam Basu Picture-in-picture */}
                <div 
                  onClick={() => {
                    audioNarrator.unlockOnUserGesture();
                    audioNarrator.playSound('play');
                    audioNarrator.speak(`Welcome to ${activeCourse.title}. In this masterclass lecture, we examine commercial kitchen waste reduction protocols.`, 1.0, 0.9);
                  }}
                  className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shadow-xs cursor-pointer group"
                >
                  <img
                    src={activeCourse.coverImage}
                    alt={activeCourse.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-slate-900" />
                  </div>
                  {/* PiP box */}
                  <div className="absolute top-2 right-2 w-20 h-10 bg-black rounded border border-white/20 p-1 flex flex-col justify-center items-center text-[7px] text-white">
                    <span className="font-bold">Dr. Chef Basu</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTakingQuiz(true)}
                    className="flex-1 py-1.5 text-xs font-bold text-center text-white bg-blue-600 rounded-lg shadow-xs"
                  >
                    Take Module Quiz
                  </button>
                  <button
                    onClick={onOpenCertify}
                    className="py-1.5 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    Certificate
                  </button>
                </div>

                {/* Downloadable Recipes Attachment Cards (matching image_35b19d98.png) */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-900">Download the recipes below:</p>
                  
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">Cauliflower leaf chutney.pdf</p>
                        <p className="text-[9px] text-slate-400">0.58 MB</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">Watermelon rind chutney.pdf</p>
                        <p className="text-[9px] text-slate-400">0.77 MB</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">Lessons:</p>
                  {activeCourse.lessons?.slice(0, 4).map((l, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded text-xs flex items-center justify-between text-slate-700">
                      <span className="truncate pr-2">{i + 1}. {l.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{l.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedByproduct ? (
              /* SCREEN 3: BYPRODUCT DETAIL VIEW (Matching Pineapple screen in image_c3f01459.png) */
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedByproduct(null)}
                  className="flex items-center text-xs font-semibold text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>How To Use Byproducts</span>
                </button>

                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedByproduct.name}</h3>
                  <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden bg-slate-50 p-1 border">
                    <img src={selectedByproduct.image} alt={selectedByproduct.name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-relaxed font-medium">
                  {selectedByproduct.weightWasteStatistic}
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-900 text-[11px]">Potential byproducts:</p>
                  <ul className="text-[10px] text-slate-700 space-y-1 pl-2">
                    {selectedByproduct.potentialByproducts.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-900 text-[11px]">One easy tip:</p>
                  <div className="p-2 bg-blue-50 rounded text-[10px] text-slate-800 leading-relaxed">
                    • {selectedByproduct.easyTip}
                  </div>
                </div>
              </div>
            ) : selectedRecipe ? (
              /* SCREEN 4: RECIPE DETAIL VIEW (Matching Candied Watermelon Rind in image_c3f01459.png) */
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex items-center text-xs font-semibold text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Recipes</span>
                </button>

                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedRecipe.title}</h3>
                  <div className="w-full h-32 rounded-xl overflow-hidden border">
                    <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 text-[11px]">Ingredients:</p>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{ing.item}</span>
                        <span className="font-mono font-bold">{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-[11px]">Method:</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {selectedRecipe.method[0]}
                  </p>
                </div>
              </div>
            ) : mobileTab === 'courses' ? (
              /* COURSES FEED IN MOBILE (Matching image_35b19d98.png) */
              <div className="space-y-3">
                {surplusCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="relative aspect-video bg-slate-900">
                      <img
                        src={c.coverImage}
                        alt={c.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {c.badge}
                      </span>
                      <h4 className="absolute bottom-2 left-2 right-2 text-white font-bold text-xs uppercase leading-tight">
                        {c.title}
                      </h4>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] text-slate-500 line-clamp-1">{c.subtitle}</p>
                      <div className="flex items-center justify-between text-[10px] text-blue-600 font-bold mt-1.5">
                        <span>{c.lessonCount} Lessons</span>
                        <span>Start →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mobileTab === 'library' ? (
              /* LIBRARY FEED IN MOBILE (Matching image_c3f01459.png) */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">How To Use Byproducts ({surplusByproducts.length}):</p>
                  <span className="text-[10px] text-blue-600 font-semibold">500 Total</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {surplusByproducts.slice(0, 6).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedByproduct(b)}
                      className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center cursor-pointer active:scale-95 transition-transform"
                    >
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-12 h-12 mx-auto rounded-lg object-cover mb-1"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                        }}
                      />
                      <p className="text-[10px] font-bold text-slate-900 truncate">{b.name}</p>
                      <span className="text-[8px] text-blue-600 font-semibold">View Guide</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-bold text-slate-900">Zero-Waste Recipes ({surplusRecipes.length}):</p>
                  <span className="text-[10px] text-blue-600 font-semibold">500 Total</span>
                </div>
                <div className="space-y-2">
                  {surplusRecipes.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecipe(r)}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                          }}
                        />
                        <div>
                          <p className="font-bold text-[10px] text-slate-900">{r.title}</p>
                          <p className="text-[8px] text-slate-400">Byproduct: {r.mainByproduct}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-blue-600 font-bold">Open →</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Q&A COMMUNITY FEED IN MOBILE (Matching image_be4b9ee5.png) */
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-blue-400">Ask Dr. Chef Basu</span>
                  <p className="text-xs font-bold">Have a question? Post it here!</p>
                </div>
                {communityQuestions.map((q) => (
                  <div key={q.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[10px]">
                    <p className="font-bold text-slate-900">{q.authorName}</p>
                    <p className="text-slate-700">{q.question}</p>
                    {q.reply && (
                      <div className="p-2 bg-blue-50 rounded border border-blue-100 text-slate-800">
                        <span className="font-bold text-blue-700">Dr. Chef Supritam Basu (Owner): </span>
                        <span>{q.reply.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Mobile Tab Bar (matching screenshot icons: Home, #, Search, Bell, Profile) */}
          <div className="h-14 border-t border-slate-200 bg-white flex items-center justify-around text-slate-400 shrink-0 z-30 px-2">
            <button 
              onClick={() => {
                setMobileTab('courses');
                setSelectedCourseId(null);
                setSelectedByproduct(null);
                setSelectedRecipe(null);
                setIsTakingQuiz(false);
              }}
              className={`p-1.5 flex flex-col items-center ${mobileTab === 'courses' ? 'text-blue-600' : 'hover:text-slate-700'}`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[8px] mt-0.5">Home</span>
            </button>
            <button 
              onClick={() => {
                setMobileTab('courses');
                setSelectedCourseId(null);
              }}
              className="p-1.5 flex flex-col items-center hover:text-slate-700"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[8px] mt-0.5">Zero Waste</span>
            </button>
            <a 
              href="https://foundations-of-food.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 flex flex-col items-center text-emerald-600 hover:text-emerald-700"
              title="Culinary Courses (Foundations of Food)"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[8px] mt-0.5">Culinary</span>
            </a>
            <button 
              onClick={() => {
                setMobileTab('library');
                setSelectedByproduct(null);
                setSelectedRecipe(null);
              }}
              className={`p-1.5 flex flex-col items-center ${mobileTab === 'library' ? 'text-blue-600' : 'hover:text-slate-700'}`}
            >
              <Search className="w-4 h-4" />
              <span className="text-[8px] mt-0.5">Library</span>
            </button>
            <button 
              onClick={() => setMobileTab('community')}
              className={`p-1.5 flex flex-col items-center ${mobileTab === 'community' ? 'text-blue-600' : 'hover:text-slate-700'}`}
            >
              <Bell className="w-4 h-4" />
              <span className="text-[8px] mt-0.5">Alerts</span>
            </button>
            <button 
              onClick={onOpenCertify}
              className="w-7 h-7 rounded-full overflow-hidden border border-blue-500 shrink-0"
            >
              <img
                src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                alt="Dr. Chef Supritam Basu"
                className="w-full h-full object-cover object-top"
              />
            </button>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 flex justify-center items-center bg-white z-40">
          <div className="w-32 h-1 bg-slate-900 rounded-full" />
        </div>
      </div>
    </div>
  );
};
