import React, { useState } from 'react';
import { Star, Users, Clock, ShieldCheck, ExternalLink, Sparkles, Copy, Check, GraduationCap } from 'lucide-react';
import { Course } from '../types';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { getCourseClassLabel } from '../utils/courseHelper';

interface CourseCardProps {
  course: Course;
  onNavigate: (path: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onNavigate }) => {
  const { isOfferActive, getEffectivePrice, siteSettings } = useCourseContext();
  const [copiedCode, setCopiedCode] = useState(false);

  const hasOffer = isOfferActive(course);
  const effectivePrice = getEffectivePrice(course);
  const discountAmount = course.regularPrice - course.offerPrice;
  const classLabel = getCourseClassLabel(course);

  // Navigate to course details on 10mscourse.shop
  const handleCardClick = () => {
    onNavigate(`/${course.slug}`);
  };

  // Direct affiliate buy button
  const handleAffiliateBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = course.affiliateLink || `https://10minuteschool.com/product/${course.slug}/?aff=${siteSettings.defaultAffiliateCode}`;
    window.open(link, '_blank');
  };

  // WhatsApp inquiry using unified getWhatsAppUrl
  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `হ্যালো! আমি ১০ মিনিট স্কুলের "${course.title}" কোর্সটি সম্পর্কে জানতে চাই ও ডিসকাউন্টে ভর্তি হতে চাই।`;
    window.open(getWhatsAppUrl(siteSettings.whatsappNumber, text), '_blank');
  };

  // 1-Click Promo Code copy
  const handleCopyPromoCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (course.promoCode) {
      navigator.clipboard.writeText(course.promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white rounded-xl sm:rounded-2xl border border-rose-100/90 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Course Banner */}
      <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-slate-100 overflow-hidden">
        <img
          src={course.imageUrl}
          alt={course.imageAlt || course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Offer Ribbon & Class Badge */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 flex flex-wrap gap-1 sm:gap-1.5 items-start max-w-[90%] z-10">
          {/* Class / Grade Badge */}
          {classLabel && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[8.5px] sm:text-[10.5px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs border border-white/20 flex items-center gap-0.5 sm:gap-1">
              <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
              <span className="truncate">{classLabel}</span>
            </span>
          )}

          {/* Discount Ribbon */}
          {hasOffer && (
            <span className="bg-rose-600 text-white text-[8.5px] sm:text-[10.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>৳{discountAmount} ছাড়</span>
            </span>
          )}

          {course.badgeText && (
            <span className="bg-amber-500 text-white text-[8px] sm:text-[9.5px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs">
              {course.badgeText}
            </span>
          )}
        </div>

        {/* Access badge */}
        <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-0.5 sm:gap-1">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span>{course.isLifetime ? 'আজীবন' : 'ফুল সেশন'}</span>
          </span>
        </div>
      </div>

      {/* Card Body - Perfectly optimized for 2-column mobile */}
      <div className="flex-1 p-2.5 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Rating & Optional Instructor (Instructor is not mandatory!) */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 mb-1 sm:mb-2">
            <span className="font-semibold text-rose-700 truncate max-w-[65%]">
              {course.instructor ? course.instructor : '১০ মিনিট স্কুল'}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Promo Code Badge if available (Requirement: 1-click copy promo code) */}
          {course.promoCode && (
            <div
              onClick={handleCopyPromoCode}
              className="mt-1.5 inline-flex items-center justify-between bg-rose-50 hover:bg-rose-100 border border-dashed border-rose-300 rounded-lg px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold text-rose-700 transition-colors cursor-pointer w-full"
              title="প্রোমো কোড কপি করতে ক্লিক করুন"
            >
              <span className="truncate">কোড: {course.promoCode}</span>
              <span className="text-[9px] sm:text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-sans shrink-0 ml-1 flex items-center gap-0.5">
                {copiedCode ? (
                  <>
                    <Check className="w-2.5 h-2.5" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>কপি</span>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Short description (visible on tablet/PC) */}
          <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {course.shortDescription}
          </p>

          {/* Highlights (visible on tablet/PC) */}
          {course.highlights && course.highlights.length > 0 && (
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-rose-50 flex-wrap gap-1.5">
              {course.highlights.slice(0, 2).map((hl, i) => (
                <span
                  key={i}
                  className="text-[11px] text-slate-600 bg-rose-50/70 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{hl}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & CTA Section */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-2xl font-black text-rose-600 tracking-tight">
                ৳{effectivePrice.toLocaleString('bn-BD')}
              </span>
              {hasOffer && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ৳{course.regularPrice.toLocaleString('bn-BD')}
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <Users className="w-3 h-3" />
              <span>{course.enrolledCount ? course.enrolledCount.toLocaleString('bn-BD') : '1000'}+</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleAffiliateBuy}
              className="col-span-3 py-1.5 sm:py-2.5 px-1 sm:px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
            >
              <span>কিনুন</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="col-span-2 py-1.5 sm:py-2.5 px-1 sm:px-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128c7e] border border-[#25D366]/40 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
              title="WhatsApp এ জানুন"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
