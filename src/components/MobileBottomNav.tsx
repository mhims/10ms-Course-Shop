import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, FileText, Search, X, Sparkles, ChevronRight, GraduationCap, Flame, ArrowRight } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { Course } from '../types';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  searchQuery = '',
  onSearchChange,
}) => {
  const { siteSettings, courses, isOfferActive, getEffectivePrice } = useCourseContext();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync local search with external searchQuery
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Auto-focus input when modal opens & lock body scroll
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchModalOpen]);

  const handleWhatsApp = () => {
    window.open(
      getWhatsAppUrl(
        siteSettings.whatsappNumber,
        'আসসালামু আলাইকুম, ১০ মিনিট স্কুলের কোর্স সংক্রান্ত তথ্যের জন্য মেসেজ দিয়েছি।'
      ),
      '_blank'
    );
  };

  const handleSelectCourse = (course: Course) => {
    setIsSearchModalOpen(false);
    onNavigate(`/${course.slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
    setIsSearchModalOpen(false);
    onNavigate('/courses');
  };

  // Filter courses based on query
  const searchResults = React.useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) {
      // If empty, show featured / offer courses as quick recommendations
      return courses.filter((c) => isOfferActive(c) || c.isFeatured).slice(0, 6);
    }
    return courses
      .filter((c) => {
        return (
          c.title.toLowerCase().includes(q) ||
          (c.englishTitle && c.englishTitle.toLowerCase().includes(q)) ||
          (c.targetClass && c.targetClass.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q) ||
          (c.promoCode && c.promoCode.toLowerCase().includes(q)) ||
          (c.seoKeywords && c.seoKeywords.some((k) => k.toLowerCase().includes(q)))
        );
      })
      .slice(0, 8);
  }, [localSearch, courses, isOfferActive]);

  // Quick preset keyword chips for 1-tap mobile search
  const quickSearchPresets = [
    { label: '🔥 স্পেশাল অফার', query: 'অফার' },
    { label: '🗣️ স্পোকেন ইংলিশ', query: 'spoken' },
    { label: '📚 এসএসসি ২০২৬', query: 'ssc' },
    { label: '🎓 এইচএসসি', query: 'hsc' },
    { label: '🩺 এডমিশন', query: 'admission' },
    { label: '💻 ফ্রিল্যান্সিং', query: 'skills' },
  ];

  const isHome = currentPath === '/';
  const isCourses = currentPath === '/courses' || currentPath === '/all-courses';
  const isBlog = currentPath.startsWith('/blog');

  return (
    <>
      {/* Native App-Style Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] safe-bottom select-none"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Home Button */}
          <button
            onClick={() => onNavigate('/')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer ${
              isHome ? 'text-rose-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative p-1">
              {isHome && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-rose-600 rounded-full"></span>
              )}
              <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[10px] tracking-tight">হোম</span>
          </button>

          {/* 2. Courses/Categories Button */}
          <button
            onClick={() => onNavigate('/courses')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer ${
              isCourses ? 'text-rose-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative p-1">
              {isCourses && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-rose-600 rounded-full"></span>
              )}
              <BookOpen className={`w-5 h-5 ${isCourses ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[10px] tracking-tight">কোর্সসমূহ</span>
          </button>

          {/* 3. Center Elevated Circular Search Button (Directly modeled on Nirapod Kroy / App style) */}
          <div className="relative flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="group -mt-6 flex flex-col items-center justify-center focus:outline-none cursor-pointer"
              aria-label="কোর্স সার্চ করুন"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 via-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/35 ring-[5px] ring-white group-active:scale-90 transition-transform duration-200">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10.5px] font-black text-rose-600 tracking-tight mt-0.5">
                সার্চ
              </span>
            </button>
          </div>

          {/* 4. Blog Button */}
          <button
            onClick={() => onNavigate('/blog')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer ${
              isBlog ? 'text-rose-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative p-1">
              {isBlog && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-rose-600 rounded-full"></span>
              )}
              <FileText className={`w-5 h-5 ${isBlog ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[10px] tracking-tight">ব্লগ</span>
          </button>

          {/* 5. Official WhatsApp Helpline Button */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer group"
          >
            <div className="relative p-1">
              <WhatsAppIcon className="w-5 h-5 fill-[#25D366] group-hover:scale-105 transition-transform" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </div>
            <span className="text-[10px] font-black text-[#128c7e] tracking-tight">সাপোর্ট</span>
          </button>
        </div>
      </nav>

      {/* Full-Screen App-Like Mobile Search Modal */}
      {isSearchModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop Tap to Close */}
          <div
            className="flex-1"
            onClick={() => setIsSearchModalOpen(false)}
          />

          {/* Search Sheet (Slides Up from Bottom) */}
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-rose-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            {/* Header Drag Notch */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0"></div>

            {/* Search Input Bar */}
            <div className="px-4 pb-3 border-b border-slate-100 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-rose-600 absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="১০ মিনিট স্কুলের কোর্স বা অফার খুঁজুন..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-100 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-white border border-transparent focus:border-rose-300 transition-all"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Quick Search Preset Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 scrollbar-none">
                {quickSearchPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setLocalSearch(preset.query)}
                    className="px-2.5 py-1 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg shrink-0 border border-rose-100/80 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header / Title */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                {localSearch.trim()
                  ? `ফলাফল (${searchResults.length}টি)`
                  : 'জনপ্রিয় ও চলতি অফারযুক্ত কোর্সসমূহ'}
              </span>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                বন্ধ করুন
              </button>
            </div>

            {/* Scrollable Course Search Results */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {searchResults.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">কোনো কোর্স পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    দয়া করে অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন (যেমন: SSC, HSC, Spoken English)।
                  </p>
                </div>
              ) : (
                searchResults.map((course) => {
                  const effectivePrice = getEffectivePrice(course);
                  const hasOffer = isOfferActive(course);
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className="p-2.5 bg-white hover:bg-rose-50/40 rounded-2xl border border-slate-200/80 hover:border-rose-300 transition-all flex items-center gap-3 cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {course.targetClass && (
                            <span className="text-[9.5px] font-extrabold bg-slate-900 text-white px-1.5 py-0.2 rounded">
                              {course.targetClass}
                            </span>
                          )}
                          {hasOffer && (
                            <span className="text-[9.5px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                              ৳{course.regularPrice - course.offerPrice} ছাড়
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 mt-1">
                          {course.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-rose-600">
                            ৳{effectivePrice}
                          </span>
                          {hasOffer && (
                            <span className="text-[10.5px] line-through text-slate-400">
                              ৳{course.regularPrice}
                            </span>
                          )}
                          {course.promoCode && (
                            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded ml-auto">
                              কোড: {course.promoCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSearchModalOpen(false);
                  onNavigate('/courses');
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <span>সকল কোর্স ডিরেক্টরি দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
