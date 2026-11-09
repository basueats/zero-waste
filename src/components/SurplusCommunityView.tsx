import React from 'react';
import { 
  communityQuestions, 
  monthlyRecordings, 
  CommunityQuestion, 
  MonthlyRecording 
} from '../data/surplusData';
import { 
  Send, 
  Heart, 
  MessageSquare, 
  Video, 
  Play, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  ExternalLink,
  Share2
} from 'lucide-react';

interface SurplusCommunityViewProps {
  initialSubTab?: 'ask' | 'recordings';
}

export const SurplusCommunityView: React.FC<SurplusCommunityViewProps> = ({ 
  initialSubTab = 'ask' 
}) => {
  const [subTab, setSubTab] = React.useState<'ask' | 'recordings'>(initialSubTab);
  const [questions, setQuestions] = React.useState<CommunityQuestion[]>(communityQuestions);
  const [newQuestionText, setNewQuestionText] = React.useState('');
  const [newQuestionCategory, setNewQuestionCategory] = React.useState('Prep Waste');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeRecording, setActiveRecording] = React.useState<MonthlyRecording | null>(null);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setIsSubmitting(true);

    const userQ: CommunityQuestion = {
      id: `q-${Date.now()}`,
      authorName: 'Author, Chef (You)',
      authorRole: 'Author, Chef · Sustainable Kitchen Member',
      authorAvatar: 'ME',
      datePosted: 'Just now',
      category: newQuestionCategory,
      question: newQuestionText.trim(),
      likes: 1,
      answeredByDrBasu: true,
      reply: {
        author: 'Dr. Chef Supritam Basu',
        role: 'Dean of Sustainable Gastronomy · Surplus Academy',
        avatar: 'SB',
        date: 'Just now',
        text: `Thanks for posting! For ${newQuestionCategory.toLowerCase()}, the most effective step is immediately separating clean trimmings into tare-weighted containers at the prep station. Don't toss them into general compost; repurpose them into stocks, dehydrated savory seasoning powders, or house-made scrap vinegars.`
      }
    };

    setTimeout(() => {
      setQuestions([userQ, ...questions]);
      setNewQuestionText('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubTab('ask')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              subTab === 'ask'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ask Dr. Chef Supritam Basu
          </button>
          <button
            onClick={() => setSubTab('recordings')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              subTab === 'recordings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Monthly Call Recordings ({monthlyRecordings.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Surplus Food Studio Community
        </span>
      </div>

      {/* SUB-VIEW 1: ASK VOJTECH CHANNEL (Matching image_be4b9ee5.png) */}
      {subTab === 'ask' && (
        <div className="space-y-6">
          {/* Channel Header Banner (matching screenshot) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-blue-500/30 text-blue-300 px-2.5 py-1 rounded">
                Direct Chef Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ASK DR. CHEF SUPRITAM BASU
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Do you have any questions about biochemical food waste prevention, circular menu engineering, or commercial audit logistics in your kitchen? Post them here and get direct guidance from Dr. Chef Supritam Basu.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Open Author, Chef Channel
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">surplus.group.app/channel/qa-channel</span>
              </div>
            </div>
          </div>

          {/* Post Question Form */}
          <form onSubmit={handlePostQuestion} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Ask a Question to Dr. Chef Supritam Basu
              </label>
              <select
                value={newQuestionCategory}
                onChange={(e) => setNewQuestionCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
              >
                <option value="Prep Waste">Prep Waste & Trims</option>
                <option value="Buffet Waste">Buffet & Banquets</option>
                <option value="Circular Recipes">Zero-Waste Recipes</option>
                <option value="Menu Engineering">Circular Menus</option>
                <option value="Kitchen Auditing">7-Day Waste Audits</option>
              </select>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. How can we utilize 20kg of stale croissants from our hotel breakfast buffet without drying out the crumb?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Dr. Chef Basu responds to all verified author, chef questions.
              </span>
              <button
                type="submit"
                disabled={!newQuestionText.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post Question'}</span>
              </button>
            </div>
          </form>

          {/* Questions Feed */}
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {q.authorAvatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                        {q.authorName}
                      </p>
                      <p className="text-[11px] text-slate-500">{q.authorRole} · {q.datePosted}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    {q.category}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {q.question}
                </p>

                {/* Dr. Chef Supritam Basu Verified Response */}
                {q.reply && (
                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {q.reply.avatar}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          {q.reply.author}
                        </span>
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Owner
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{q.reply.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pt-1 pl-8">
                      {q.reply.text}
                    </p>
                  </div>
                )}

                {/* Footer Reactions */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <button className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{q.likes} likes</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MONTHLY CALL RECORDINGS (Matching image_be4b9ee5.png) */}
      {subTab === 'recordings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Monthly Masterclass Recordings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Catch up on all recorded live coaching sessions with Dr. Chef Supritam Basu and authors, chefs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyRecordings.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Poster Thumbnail matching image_be4b9ee5.png */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden group cursor-pointer" onClick={() => setActiveRecording(rec)}>
                    <img
                      src={rec.posterImage}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-slate-900" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.duration}
                    </span>
                    <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {rec.date}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Featured Topics:
                      </p>
                      {rec.featuredQuestions.map((q, i) => (
                        <p key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{q}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => setActiveRecording(rec)}
                    className="w-full py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Recording</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Video Modal if open */}
          {activeRecording && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">{activeRecording.title}</h3>
                  <button
                    onClick={() => setActiveRecording(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                  <img
                    src={activeRecording.posterImage}
                    alt={activeRecording.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Play className="w-7 h-7 ml-1 fill-white" />
                    </div>
                    <p className="text-sm font-semibold">{activeRecording.title} (Live Session Archive)</p>
                    <p className="text-xs text-slate-300">Instructor: Dr. Chef Supritam Basu, PhD · 58 Minutes</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900">Key Takeaways:</h4>
                  <ul className="space-y-1">
                    {activeRecording.keyTakeaways.map((k, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
