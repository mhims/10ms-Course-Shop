import React, { useState } from 'react';
import { Bot, Send, X, ExternalLink, Sparkles, User, RefreshCw } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { Course } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedCourses?: Course[];
}

export const CourseChatAssistant: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { courses, getEffectivePrice, siteSettings } = useCourseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! আমি 10MS কোর্স হেল্পার। আপনি কোন ক্লাসে পড়েন বা কোন বিষয়ে শিখতে চাচ্ছেন লিখে জানান (যেমন: "স্পোকেন ইংলিশ", "এসএসসি ফিজিক্স", "এইচএসসি ২০২৬", "ওয়েব ডেভেলপমেন্ট")।',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const query = inputQuery.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Rule-based smart matching across courses
    setTimeout(() => {
      const qLower = query.toLowerCase();
      
      // Match courses by title, keywords, category, instructor
      const matched = courses.filter((c) => {
        return (
          c.title.toLowerCase().includes(qLower) ||
          c.englishTitle.toLowerCase().includes(qLower) ||
          (c.instructor && c.instructor.toLowerCase().includes(qLower)) ||
          c.seoKeywords.some((k) => k.toLowerCase().includes(qLower)) ||
          c.shortDescription.toLowerCase().includes(qLower)
        );
      }).slice(0, 3);

      let botReply = '';
      if (matched.length > 0) {
        botReply = `আপনার জন্য ১০ মিনিট স্কুলের সেরা ${matched.length}টি কোর্স খুঁজে পেয়েছি:`;
      } else if (qLower.includes('অফার') || qLower.includes('ডিসকাউন্ট') || qLower.includes('প্রমো')) {
        botReply = '১০ মিনিট স্কুলের সকল চলতি অফার ও ছাড়যুক্ত কোর্স দেখতে আমাদের হোমপেজে ফিল্টার অপশন ব্যবহার করুন অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন!';
      } else if (qLower.includes('কিনব') || qLower.includes('ভর্তি') || qLower.includes('পেমেন্ট')) {
        botReply = 'কোর্সের নামের পাশে থাকা "কোর্স কিনুন" বাটনে ক্লিক করলেই সরাসরি বিকাশ, নগদ বা কার্ড দিয়ে ১০ মিনিট স্কুলের সাইটে ভর্তি হতে পারবেন।';
      } else {
        botReply = `আপনার সার্চ "${query}" এর সাথে সরাসরি মেলা কোর্স না পেলেও আপনি নিচের জনপ্রিয় কোর্সগুলো দেখতে পারেন:`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        recommendedCourses: matched.length > 0 ? matched : courses.slice(0, 2),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <>
      {/* Floating Bot Button */}
      <div className="fixed bottom-36 md:bottom-20 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer font-semibold text-xs border border-rose-400 active:scale-95"
          title="কোর্স হেল্পার বট"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">কোর্স খুঁজুন</span>
        </button>
      </div>

      {/* Bot Chat Window */}
      {isOpen && (
        <div className="fixed bottom-48 md:bottom-32 right-4 sm:right-6 w-[320px] sm:w-[360px] max-h-[460px] bg-white rounded-2xl shadow-2xl border border-rose-200 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-bold">10MS কোর্স হেল্পার (ফ্রি)</h4>
                <p className="text-[10px] text-rose-100">ইনস্ট্যান্ট কোর্স ফাইন্ডার</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Course Cards Carousel in Chat */}
                  {m.recommendedCourses && m.recommendedCourses.length > 0 && (
                    <div className="mt-2 space-y-2 pt-1 border-t border-slate-100">
                      {m.recommendedCourses.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 bg-rose-50/70 rounded-lg border border-rose-100 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <h5 className="font-bold text-[11px] text-slate-900 truncate">
                              {c.title}
                            </h5>
                            <p className="text-[10px] text-rose-600 font-semibold">
                              ফি: ৳{getEffectivePrice(c).toLocaleString('bn-BD')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                onNavigate(`/${c.slug}`);
                                setIsOpen(false);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-white text-rose-600 border border-rose-300 rounded hover:bg-rose-100"
                            >
                              ভিউ
                            </button>
                            <a
                              href={c.affiliateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                            >
                              কিনুন
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex gap-1.5">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="আপনার প্রশ্ন বা বিষয়ের নাম..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
