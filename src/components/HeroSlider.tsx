import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Course } from '../types';
import { normalizeImageUrl } from '../utils/courseHelper';

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

  return (
    <div
      className="relative w-full my-3 sm:my-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container with rounded corners and subtle shadow */}
      <div className="relative p-[2px] sm:p-[3px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-amber-400 via-rose-600 to-indigo-500 bg-[length:200%_200%] animate-gradient-x shadow-md hover:shadow-xl transition-shadow">
        
        {/* Main Slide Card (Clickable directly to 10MS affiliate URL) */}
        <div
          onClick={handleSlideClick}
          className="relative w-full bg-slate-900 rounded-[14px] sm:rounded-[22px] overflow-hidden cursor-pointer select-none group aspect-[16/9] sm:aspect-[21/9] max-h-[380px]"
          title={`${currentCourse.title} - বিস্তারিত জানতে ক্লিক করুন`}
        >
          {/* Background Image without text overlay */}
          <img
            key={currentCourse.id}
            src={normalizeImageUrl(currentCourse.imageUrl)}
            alt={currentCourse.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            onError={(e) => {
              const fallback = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />

          {/* Navigation Arrows for Manual Click */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white backdrop-blur-xs flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="আগের স্লাইড"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white backdrop-blur-xs flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all cursor-pointer border border-white/20 shadow-md"
            aria-label="পরের স্লাইড"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Indicators: Clean Dots */}
      <div className="flex items-center justify-center gap-2 mt-2 py-1">
        {sliderCourses.map((c, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-7 h-2 bg-rose-600 shadow-sm'
                  : 'w-2 h-2 bg-slate-300 hover:bg-rose-400'
              }`}
              aria-label={`স্লাইড ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
