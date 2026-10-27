import React, { useRef, useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Star,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { Course } from '../types';
import { normalizeImageUrl, getCourseClassLabel, getCourseReviewCount } from '../utils/courseHelper';

interface BlogCourseCarouselProps {
  title?: string;
  badge?: string;
  courses: Course[];
  onNavigate: (path: string) => void;
}

export const BlogCourseCarousel: React.FC<BlogCourseCarouselProps> = ({
  title = 'নিবন্ধ সংশ্লিষ্ট ১০ মিনিট স্কুল কোর্স',
  badge = 'স্পেশাল অফার',
  courses,
  onNavigate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!courses || courses.length === 0) return null;

  const handleCopyCode = (e: React.MouseEvent, courseId: string, promoCode: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCode);
    setCopiedCodeId(courseId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Case 1: Exactly 1 course - Render as high-impact banner card
  if (courses.length === 1) {
    const course = courses[0];
    const hasOffer = course.offerPrice > 0 && course.offerPrice < course.regularPrice;
    const discountAmount = course.regularPrice - course.offerPrice;
    const classLabel = getCourseClassLabel(course);

    return (
      <div className="my-6 sm:my-8 p-4 sm:p-6 bg-gradient-to-r from-rose-50/90 via-red-50/70 to-amber-50/40 rounded-3xl border-2 border-rose-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-white px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>{badge || 'নিবন্ধের সুপারিশকৃত কোর্স'}</span>
          </span>
          {course.promoCode && (
            <button
              onClick={(e) => handleCopyCode(e, course.id, course.promoCode!)}
              className="text-xs font-bold text-slate-800 bg-amber-100/90 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="কপি করতে ক্লিক করুন"
            >
              <span>প্রোমো কোড:</span>
              <strong className="font-mono text-rose-600">{course.promoCode}</strong>
              {copiedCodeId === course.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500" />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={normalizeImageUrl(course.imageUrl)}
                alt={course.title}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-rose-100 shadow-xs"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                }}
              />
              {classLabel && (
                <span className="absolute -bottom-1 -left-1 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                  {classLabel}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-sm sm:text-base md:text-lg text-slate-900 line-clamp-1">
                {course.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {course.shortDescription || '১০ মিনিট স্কুলের সম্পূর্ণ অনলাইন প্রস্তুতি কোর্স।'}
              </p>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-rose-600 mt-1">
                <span>৳{(course.offerPrice || course.regularPrice).toLocaleString('bn-BD')}</span>
                {hasOffer && (
                  <span className="line-through text-slate-400 font-normal">
                    ৳{course.regularPrice.toLocaleString('bn-BD')}
                  </span>
                )}
                {hasOffer && (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ৳{discountAmount.toLocaleString('bn-BD')} ছাড়
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate(`/${course.slug}`)}
              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              বিস্তারিত
            </button>
            <a
              href={course.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>ভর্তি লিংক</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: > 1 courses - Render Facebook Ad Style Horizontal Carousel (বাম থেকে ডানের দিকে স্ক্রলযোগ্য)
  return (
    <div className="my-6 sm:my-8 p-3.5 sm:p-5 bg-gradient-to-br from-rose-50/80 via-white to-red-50/50 rounded-3xl border border-rose-200/90 shadow-xs space-y-3">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-rose-600 text-white shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
                {title}
              </h3>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                {courses.length.toLocaleString('bn-BD')}টি কোর্স
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              ফেসবুক ক্যারোজাল স্টাইলে ডানে-বামে স্ক্রল করে কোর্সগুলো দেখুন
            </p>
          </div>
        </div>

        {/* Carousel slide arrows for desktop & quick navigation */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
            aria-label="বামে স্ক্রল"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
            aria-label="ডানে স্ক্রল"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable / Scrollable Carousel Row (Left to Right) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 pt-1 px-0.5 scroll-smooth snap-x snap-mandatory scrollbar-thin"
      >
        {courses.map((course) => {
          const hasOffer = course.offerPrice > 0 && course.offerPrice < course.regularPrice;
          const discountAmount = course.regularPrice - course.offerPrice;
          const classLabel = getCourseClassLabel(course);

          return (
            <div
              key={course.id}
              className="w-[215px] sm:w-[250px] shrink-0 snap-start bg-white rounded-2xl border border-rose-100/90 shadow-2xs hover:shadow-lg hover:border-rose-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Course Thumbnail */}
              <div
                onClick={() => onNavigate(`/${course.slug}`)}
                className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={normalizeImageUrl(course.imageUrl)}
                  alt={course.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Badges on Thumbnail */}
                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-10">
                  {classLabel && (
                    <span className="bg-slate-900/90 backdrop-blur-2xs text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                      <GraduationCap className="w-2.5 h-2.5 text-amber-300" />
                      <span>{classLabel}</span>
                    </span>
                  )}
                  {hasOffer && (
                    <span className="bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      ৳{discountAmount} ছাড়
                    </span>
                  )}
                </div>
              </div>

              {/* Course Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  {/* Rating & Instructor */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-rose-700 truncate max-w-[65%]">
                      {course.instructor || '১০ মিনিট স্কুল'}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    onClick={() => onNavigate(`/${course.slug}`)}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-rose-600 transition-colors line-clamp-2 leading-snug cursor-pointer pt-0.5"
                    title={course.title}
                  >
                    {course.title}
                  </h4>

                  {/* Pricing */}
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 pt-1">
                    <span>৳{(course.offerPrice || course.regularPrice).toLocaleString('bn-BD')}</span>
                    {hasOffer && (
                      <span className="line-through text-slate-400 font-normal text-[11px]">
                        ৳{course.regularPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>

                  {/* 1-Click Copy Promo Code if available */}
                  {course.promoCode && (
                    <div
                      onClick={(e) => handleCopyCode(e, course.id, course.promoCode!)}
                      className="mt-1.5 bg-rose-50 hover:bg-rose-100 border border-dashed border-rose-300 rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold text-rose-700 transition-colors flex items-center justify-between cursor-pointer"
                      title="কোড কপি করুন"
                    >
                      <span className="truncate">কোড: {course.promoCode}</span>
                      <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-sans shrink-0 ml-1">
                        {copiedCodeId === course.id ? 'কপি!' : 'কপি'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons - Always uses course.affiliateLink! */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate(`/${course.slug}`)}
                    className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer text-center"
                  >
                    বিস্তারিত
                  </button>
                  <a
                    href={course.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>ভর্তি লিংক</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
