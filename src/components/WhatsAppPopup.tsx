import React, { useState, useEffect } from 'react';
import { Send, X, CheckCheck } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';

export const WhatsAppPopup: React.FC = () => {
  const { siteSettings } = useCourseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [currentTimeGreeting, setCurrentTimeGreeting] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Dynamic Bengali greeting based on local hour
    const hour = new Date().getHours();
    let greetingPart = 'সকাল';
    if (hour >= 4 && hour < 12) {
      greetingPart = 'সকাল';
    } else if (hour >= 12 && hour < 15) {
      greetingPart = 'দুপুর';
    } else if (hour >= 15 && hour < 18) {
      greetingPart = 'বিকাল';
    } else if (hour >= 18 && hour < 20) {
      greetingPart = 'সন্ধ্যা';
    } else {
      greetingPart = 'রাত্রি';
    }
    setCurrentTimeGreeting(greetingPart);

    // Pops up 2 seconds after arrival on site
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = userMessage.trim()
      ? userMessage
      : 'আসসালামু আলাইকুম, ১০ মিনিট স্কুল কোর্সের অফার এবং ভর্তি সংক্রান্ত তথ্য জানতে চাই।';

    const url = getWhatsAppUrl(siteSettings.whatsappNumber, textToSend);
    window.open(url, '_blank');
    setUserMessage('');
  };

  const handleQuickQuestion = (q: string) => {
    setUserMessage(q);
  };

  return (
    <div className="fixed bottom-18 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end">
      {/* Sleek, Compact WhatsApp Chatbox (Mobile-optimized) */}
      {isOpen && (
        <div className="w-[280px] sm:w-[320px] bg-[#e5ddd5] rounded-2xl shadow-xl overflow-hidden border border-slate-300 mb-2 animate-in slide-in-from-bottom-3 duration-150 flex flex-col">
          {/* Authentic WhatsApp Green Header - Compact */}
          <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={siteSettings.logoUrl}
                  alt="10MS Support"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-white p-0.5 border border-white/40"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-[#075e54] rounded-full"></span>
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-xs sm:text-sm">10MS সাপোর্ট হেল্পলাইন</h4>
                <p className="text-[10px] text-emerald-200">অনলাইন আছেন</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setHasInteracted(true);
              }}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer"
              title="মিনিমাইজ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Bubble Area with WhatsApp Pattern - Compact */}
          <div
            className="p-3 space-y-2 max-h-[220px] overflow-y-auto"
            style={{
              backgroundImage: 'radial-gradient(#075e54 0.6px, transparent 0.6px)',
              backgroundSize: '16px 16px',
              backgroundColor: '#efeae2',
            }}
          >
            {/* Automated Greeting Bubble */}
            <div className="flex items-start">
              <div className="bg-white rounded-xl rounded-tl-xs p-2.5 shadow-2xs max-w-[92%] text-slate-800 text-[11px] sm:text-xs leading-relaxed relative">
                <p className="font-bold text-slate-900">
                  আসসালামু আলাইকুম, শুভ {currentTimeGreeting}!
                </p>
                <p className="mt-0.5 text-slate-700">
                  কোর্স রিলেটেড যেকোনো প্রয়োজনে সরাসরি মেসেজ করুন।
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                  <span>এখনই</span>
                  <CheckCheck className="w-3 h-3 text-blue-500 inline" />
                </div>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                'কোর্স অফার লিংক চাই',
                'এসএসসি ক্র্যাশ কোর্স',
                'স্পোকেন ইংলিশ',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickQuestion(chip)}
                  className="text-[10px] bg-white hover:bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Message Input Form - Compact */}
          <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 border-t border-slate-200">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="মেসেজ লিখুন..."
              className="flex-1 bg-white text-slate-800 text-xs px-3 py-1.5 rounded-full border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white transition-all shadow-xs shrink-0 cursor-pointer"
              title="পাঠান"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg transition-all cursor-pointer font-bold text-xs active:scale-95"
      >
        <WhatsAppIcon className="w-4 h-4 fill-white" />
        <span className="hidden sm:inline">WhatsApp হেল্প</span>

        {!isOpen && !hasInteracted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
            ১
          </span>
        )}
      </button>
    </div>
  );
};
