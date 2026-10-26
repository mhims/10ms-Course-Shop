import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, ChevronLeft, ChevronRight, Tag, Flame } from 'lucide-react';
import { Course } from '../types';
import { normalizeImageUrl, getCourseClassLabel } from '../utils/courseHelper';

interface HeroSliderProps {
  courses: Course[];
  onNavigate?: (path: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ courses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Filter courses marked for hero slider or featured courses
  const sliderCourses = React.useMemo(() => {
    // 1. Explicitly marked for slider
    let selected = courses.filter((c) => c.inHeroSlider && c.imageUrl);

    // 2. If none or few selected in admin, intelligently pick 1-2 top courses from key categories
    if (selected.length === 0) {
      const categoriesPriority = ['hsc', 'class-9-10', 'admission', 'class-6-8', 'spoken-english', 'skills'];
      const picked: Course[] = [];
      categoriesPriority.forEach((cat) => {
        const match = courses.find((c) => (c.category === cat || c.displayTargets?.includes(cat)) && c.imageUrl && !picked.includes(c));
        if (match) picked.push(match);
      });
      // Add any additional active courses with images up to 6
      if (picked.length < 4) {
        courses.forEach((c) => {
          if (c.imageUrl && !picked.includes(c) && picked.length < 6) {
            picked.push(c);
          }
        });
      }
      selected = picked;
    }

    return selected;
  }, [courses]);

  const total = sliderCourses.length;

  // Auto-slide every 1.8 seconds (1800ms) as requested by user
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 1800);

    return () => clearInterval(timer);
  }, [total, isPaused]);

  if (total === 0) return null;

  const currentCourse = sliderCourses[currentIndex] || sliderCourses[0];

  const handleSlideClick = () => {
    if (currentCourse && currentCourse.affiliateLink) {
      window.open(currentCourse.affiliateLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % total);
      } else {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
      }
    }
    touchStartX.current = null;
  };

  const hasOffer = currentCourse.offerPrice > 0 && currentCourse.offerPrice < currentCourse.regularPrice;
  const discountAmount = hasOffer ? currentCourse.regularPrice - currentCourse.offerPrice : 0;

  return (
    <div
      className="relative w-full my-3 sm:my-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated glowing border wrapping the slider container */}
      <div className="relative p-[3px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-amber-400 via-rose-600 to-indigo-500 bg-[length:200%_200%] animate-gradient-x shadow-lg shadow-rose-500/20">
        
        {/* Main Slide Card (Clickable to 10MS affiliate URL) */}
        <div
          onClick={handleSlideClick}
          className="relative w-full bg-slate-950 rounded-[14px] sm:rounded-[22px] overflow-hidden cursor-pointer select-none group aspect-[16/9] sm:aspect-[21/9] max-h-[360px]"
        >
          {/* Background Image with smooth crossfade */}
          <img
            key={currentCourse.id}
            src={normalizeImageUrl(currentCourse.imageUrl)}
            alt={currentCourse.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const fallback = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />

          {/* Dark gradient overlay for crystal clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />

          {/* Top badging: Category & Live Switcher Speed Indicator */}
          <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black bg-rose-600 text-white shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                <span>{getCourseClassLabel(currentCourse)}</span>
              </span>

              {hasOffer && (
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black bg-amber-400 text-slate-950 shadow-md flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>৳{discountAmount.toLocaleString('bn-BD')} ছাড়!</span>
                </span>
              )}
            </div>

            {/* Live 1.8s Pulse Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/85 backdrop-blur-md text-slate-200 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>সরাসরি ১০ মিনিট স্কুল ভর্তি লিংক</span>
            </div>
          </div>

          {/* Bottom Content Information Bar */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-end justify-between gap-3 pointer-events-none">
            <div className="min-w-0 max-w-xl text-left space-y-1">
              <h3 className="text-sm sm:text-lg md:text-xl font-black text-white drop-shadow-md line-clamp-1 sm:line-clamp-2">
                {currentCourse.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <span className="font-extrabold text-white text-sm sm:text-base">
                  ৳{(currentCourse.offerPrice || currentCourse.regularPrice).toLocaleString('bn-BD')}
                </span>
                {hasOffer && (
                  <span className="line-through text-slate-400 text-xs">
                    ৳{currentCourse.regularPrice.toLocaleString('bn-BD')}
                  </span>
                )}
                {currentCourse.promoCode && (
                  <span className="text-[10px] sm:text-xs bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-mono font-bold">
                    কুপন: {currentCourse.promoCode}
                  </span>
                )}
              </div>
            </div>

            {/* Direct Action Affiliate Button */}
            <div className="shrink-0">
              <button
                type="button"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-rose-900/50 flex items-center gap-1.5 transition-transform group-hover:scale-105"
              >
                <span>কোর্স কিনুন</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows for Manual Click (Hover Visible) */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="আগের ছবি"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="পরের ছবি"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Indicators: Category Badges & Dots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto py-1 scrollbar-none px-2">
        {sliderCourses.map((c, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs scale-105'
                  : 'bg-white hover:bg-rose-50 text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-rose-500'}`} />
              <span>{getCourseClassLabel(c)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
