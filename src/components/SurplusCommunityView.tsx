import React from 'react';
import { 
  communityQuestions, 
  CommunityQuestion
} from '../data/surplusData';
import { 
  Send, 
  Heart, 
  MessageSquare
} from 'lucide-react';

interface SurplusCommunityViewProps {
  initialSubTab?: 'ask';
}

export const SurplusCommunityView: React.FC<SurplusCommunityViewProps> = () => {
  const [questions, setQuestions] = React.useState<CommunityQuestion[]>(communityQuestions);
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => new Set());
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState<string>('');
  const [newQuestionText, setNewQuestionText] = React.useState('');
  const [newQuestionCategory, setNewQuestionCategory] = React.useState('Prep Waste');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleToggleLike = (qId: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(qId);
      if (isCurrentlyLiked) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      setQuestions(qs =>
        qs.map(item =>
          item.id === qId
            ? { ...item, likes: Math.max(0, item.likes + (isCurrentlyLiked ? -1 : 1)) }
            : item
        )
      );
      return next;
    });
  };

  const handleSubmitReply = (qId: string) => {
    if (!replyDraft.trim()) return;
    setQuestions(qs =>
      qs.map(item =>
        item.id === qId
          ? {
              ...item,
              answeredByDrBasu: true,
              reply: {
                author: 'Community Member',
                role: 'Supritamone Academy Chef',
                avatar: 'CM',
                date: 'Just now',
                text: replyDraft.trim(),
              },
            }
          : item
      )
    );
    setReplyDraft('');
    setReplyingToId(null);
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setIsSubmitting(true);

    const userQ: CommunityQuestion = {
      id: `q-${Date.now()}`,
      authorName: 'Chef (You)',
      authorRole: 'Executive Chef · Sustainable Kitchen Member',
      authorAvatar: 'ME',
      datePosted: 'Just now',
      category: newQuestionCategory,
      question: newQuestionText.trim(),
      likes: 1,
      answeredByDrBasu: true,
      reply: {
        author: 'Dr. Chef Supritam Basu',
        role: 'Dean of Sustainable Gastronomy · Zero Waste Academy',
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
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-xs">
            Ask Dr. Chef Supritam Basu
          </span>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Zero Waste Academy Community
        </span>
      </div>

      {/* ASK DR. CHEF BASU CHANNEL */}
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
                  Open Chef Channel
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">supritamone.academy/channel/qa-channel</span>
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
                Dr. Chef Basu responds to all verified culinary community questions.
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
                        <img
                          src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                          alt={q.reply.author}
                          className="w-7 h-7 rounded-full object-cover object-top border border-blue-500 shrink-0 bg-[#0b193d]"
                        />
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
                  <button
                    onClick={() => handleToggleLike(q.id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      likedIds.has(q.id) ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedIds.has(q.id) ? 'fill-rose-600' : ''}`} />
                    <span>{q.likes} likes</span>
                  </button>
                  <button
                    onClick={() => {
                      setReplyingToId(replyingToId === q.id ? null : q.id);
                      setReplyDraft('');
                    }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>

                {replyingToId === q.id && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSubmitReply(q.id)}
                      disabled={!replyDraft.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};
