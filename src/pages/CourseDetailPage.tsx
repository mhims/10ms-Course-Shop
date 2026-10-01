import React, { useEffect, useState } from 'react';
import { Star, Users, Clock, ShieldCheck, Check, ArrowLeft, BookOpen, Share2, Sparkles, CheckCircle2, ExternalLink, Copy, GraduationCap, AlertTriangle } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { getCourseClassLabel } from '../utils/courseHelper';

interface CourseDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ slug, onNavigate }) => {
  const { getCourseBySlug, courses, isOfferActive, isCourseExpired, getEffectivePrice, siteSettings } = useCourseContext();
  const [copied, setCopied] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  const course = getCourseBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (course) {
      document.title = `${course.seoTitle || course.title} | 10mscourse.shop`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', course.seoDescription || course.shortDescription);
      }

      // Dynamic JSON-LD structured data for Google Course & Product schema
      const jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.id = 'dynamic-course-schema';
      jsonLdScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': course.title,
        'description': course.shortDescription,
        'provider': {
          '@type': 'Organization',
          'name': '10 Minute School',
          'sameAs': 'https://10minuteschool.com'
        },
        'offers': {
          '@type': 'Offer',
          'price': getEffectivePrice(course),
          'priceCurrency': 'BDT',
          'category': 'Paid',
          'url': course.affiliateLink
        },
        'instructor': {
          '@type': 'Person',
          'name': course.instructor
        }
      });
      document.head.appendChild(jsonLdScript);

      return () => {
        const existing = document.getElementById('dynamic-course-schema');
        if (existing) existing.remove();
      };
    }
  }, [course, getEffectivePrice]);

  // Helper to render SEO-rich course description with H1, H2, H3, lists, links, and cross-course cards
  const renderRichCourseDescription = (fullDesc: string) => {
    if (!fullDesc) return null;

    // Split by course-card: [course-card:identifier]
    const parts = fullDesc.split(/\[course-card:([^\]]+)\]/g);

    return parts.map((part, index) => {
      // Even indexes are text / markdown / HTML
      if (index % 2 === 0) {
        if (!part.trim()) return null;

        const paragraphs = part.split('\n\n');
        return (
          <div key={index} className="space-y-4">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // H1 Heading
              if (trimmed.startsWith('# ')) {
                const headingText = trimmed.replace(/^#\s+/, '');
                return (
                  <h1 key={pIdx} className="text-xl sm:text-2xl font-black text-slate-900 border-b border-rose-100 pb-2.5 pt-3">
                    {headingText}
                  </h1>
                );
              }

              // H2 Heading
              if (trimmed.startsWith('## ')) {
                const headingText = trimmed.replace(/^##\s+/, '');
                return (
                  <h2 key={pIdx} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-3 text-rose-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                    <span>{headingText}</span>
                  </h2>
                );
              }

              // H3 Heading
              if (trimmed.startsWith('### ')) {
                const headingText = trimmed.replace(/^###\s+/, '');
                return (
                  <h3 key={pIdx} className="text-base font-bold text-slate-900 pt-2 text-slate-800">
                    {headingText}
                  </h3>
                );
              }

              // Quote / Callout
              if (trimmed.startsWith('> ')) {
                const quoteText = trimmed.replace(/^>\s+/, '');
                return (
                  <blockquote key={pIdx} className="p-4 bg-rose-50/70 border-l-4 border-rose-500 rounded-r-2xl text-slate-800 text-xs sm:text-sm font-medium italic my-2">
                    {quoteText}
                  </blockquote>
                );
              }

              // Bullet List
              if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.includes('\n* ') || trimmed.startsWith('* ')) {
                const items = trimmed
                  .split(/\n(?=[-*\s])/)
                  .map((item) => item.replace(/^[-*]\s+/, '').trim())
                  .filter(Boolean);

                return (
                  <ul key={pIdx} className="space-y-2 text-xs sm:text-sm text-slate-700 pl-1 my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered List
              if (/^\d+\.\s+/m.test(trimmed)) {
                const items = trimmed
                  .split(/\n(?=\d+\.\s+)/)
                  .map((item) => item.replace(/^\d+\.\s+/, '').trim())
                  .filter(Boolean);

                return (
                  <ol key={pIdx} className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-1 my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ol>
                );
              }

              // Normal text or HTML
              return (
                <div
                  key={pIdx}
                  className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: trimmed }}
                />
              );
            })}
          </div>
        );
      }

      // Odd indexes are course identifiers
      const courseMatch = courses.find((c) => c.slug === part || c.id === part);
      if (!courseMatch) return null;

      const hasOffer = courseMatch.offerPrice > 0 && courseMatch.offerPrice < courseMatch.regularPrice;

      return (
        <div
          key={index}
          className="my-5 p-4 sm:p-5 bg-gradient-to-r from-rose-50 to-red-50/50 rounded-2xl border-2 border-rose-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-white px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>প্রস্তাবিত বিকল্প কোর্স</span>
            </span>
            {courseMatch.promoCode && (
              <span className="text-xs font-bold text-slate-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                কুপন: <strong className="font-mono text-rose-600">{courseMatch.promoCode}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={courseMatch.imageUrl}
                alt={courseMatch.title}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-rose-100 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                  {courseMatch.title}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {courseMatch.shortDescription}
                </p>
                <div className="flex items-center gap-2 text-xs font-extrabold text-rose-600 mt-1">
                  <span>৳{courseMatch.offerPrice || courseMatch.regularPrice}</span>
                  {hasOffer && (
                    <span className="line-through text-slate-400 font-normal">
                      ৳{courseMatch.regularPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate(`/${courseMatch.slug}`)}
                className="px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                বিস্তারিত দেখুন
              </button>
              <a
                href={courseMatch.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>ভর্তি হন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      );
    });
  };

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">কোর্সটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500 mt-2">
          সম্ভবত কোর্সটির লিংক পরিবর্তন হয়েছে অথবা মেয়াদ শেষ হয়ে গেছে।
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="mt-6 px-6 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 cursor-pointer"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const isExpired = isCourseExpired(course);
  const hasOffer = isOfferActive(course) && !isExpired;
  const effectivePrice = getEffectivePrice(course);
  const discountAmount = course.regularPrice - course.offerPrice;

  const handleBuy = () => {
    if (isExpired) {
      onNavigate('/');
      return;
    }
    window.open(course.affiliateLink, '_blank');
  };

  const handleWhatsApp = () => {
    const text = isExpired 
      ? `আসসালামু আলাইকুম! "${course.title}" কোর্সটির ব্যাচ সমাপ্ত হয়েছে। এর নতুন ব্যাচ বা বিকল্প কোনো কোর্স কি চালু আছে?`
      : `আসসালামু আলাইকুম! আমি "${course.title}" কোর্সটিতে ভর্তি হতে চাই এবং অফার লিংক প্রয়োজন।`;
    window.open(getWhatsAppUrl(siteSettings.whatsappNumber, text), '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedCourses = courses
    .filter((c) => c.id !== course.id && !isCourseExpired(c) && (c.category === course.category || c.displayTargets?.includes(course.category)))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল কোর্সে ফিরে যান</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-slate-600 hover:text-rose-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'লিংক কপি হয়েছে!' : 'শেয়ার করুন'}</span>
        </button>
      </div>

      {/* SEO & User Retention: Notice when Course / Batch has Expired */}
      {isExpired && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                ⚠️ এই ব্যাচের ভর্তি / অফারের মেয়াদ ইতিমধ্যে সমাপ্ত হয়েছে
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                গুগল বা এআই সার্চের মাধ্যমে এসে থাকলে চিন্তার কিছু নেই! নিচে এই বিষয়ের চলমান নতুন ব্যাচ ও অফিসিয়াল বিকল্প কোর্সসমূহ দেওয়া হলো।
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer whitespace-nowrap"
          >
            চলমান নতুন ব্যাচ দেখুন
          </button>
        </div>
      )}

      {/* Grid: On MOBILE, Purchase Box comes FIRST (order-1), on PC it's right column (lg:order-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PURCHASE BOX: order-1 on mobile (At the very top!), order-2 on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-xl overflow-hidden p-5 sm:p-6 space-y-5">
            {/* Banner Image with SEO Alt */}
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={course.imageUrl}
                alt={course.imageAlt || course.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {hasOffer && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  ৳{discountAmount} ছাড়ের অফার চলছে!
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 space-y-1">
              <div className="text-xs text-slate-500 font-medium">কোর্স ফি ও বিশেষ অফার:</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">
                  ৳{effectivePrice.toLocaleString('bn-BD')}
                </span>
                {hasOffer && (
                  <span className="text-sm text-slate-400 line-through">
                    ৳{course.regularPrice.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {hasOffer && course.offerEndDate && (
                <p className="text-[11px] text-rose-600 font-semibold pt-1">
                  ⏳ অফার শেষ হওয়ার তারিখ: {new Date(course.offerEndDate).toLocaleDateString('bn-BD')}
                </p>
              )}
            </div>

            {/* Promo Code Box (Requirement: 1-Click Copy Promo Code) */}
            {course.promoCode && (
              <div className="p-3 bg-amber-50/80 border border-dashed border-amber-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                    কোর্স প্রোমো কোড:
                  </span>
                  <span className="font-mono font-black text-amber-950 text-sm tracking-wider">
                    {course.promoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(course.promoCode!);
                    setCopiedPromo(true);
                    setTimeout(() => setCopiedPromo(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  {copiedPromo ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কোড কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Buttons: Direct Affiliate & WhatsApp */}
            <div className="space-y-2.5">
              {isExpired ? (
                <button
                  onClick={handleBuy}
                  className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ভর্তি সমাপ্ত — চলমান অন্যান্য কোর্স দেখুন</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-rose-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>১০ মিনিট স্কুলে কোর্সটি কিনুন</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128c7e] border border-[#25D366]/40 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
                <span>WhatsApp এ অফার ও পরামর্শ নিন</span>
              </button>
            </div>

            <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>অফিসিয়াল ১০ মিনিট স্কুল এনরোলমেন্ট ও সার্টিফিকেট</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>বিকাশ, নগদ ও কার্ডে পেমেন্টের সুবিধা</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>২৪ ঘণ্টা গ্রাহক সহায়তা সেবা</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DETAILS SECTION: order-2 on mobile (below purchase box), order-1 on desktop (left column) */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                ১০ মিনিট স্কুল অফিসিয়াল
              </span>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                <span>{getCourseClassLabel(course)}</span>
              </span>
              {hasOffer && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>৳{course.regularPrice - course.offerPrice} ছাড়</span>
                </span>
              )}
              {course.badgeText && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  {course.badgeText}
                </span>
              )}
              {course.isLifetime ? (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> আজীবন মেয়াদ
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  ফুল সেশন অ্যাক্সেস
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {course.shortDescription}
            </p>

            {/* Instructor & Proof (Instructor is optional) */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  {(course.instructor || '১০').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{course.instructor || '১০ মিনিট স্কুল'}</div>
                  <div className="text-[11px] text-slate-500">{course.instructorRole || 'অফিসিয়াল কোর্স'}</div>
                </div>
              </div>

              <div className="h-4 w-px bg-slate-200"></div>

              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{course.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">
                  ({course.reviewCount.toLocaleString('bn-BD')} রিভিউ)
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200"></div>

              <div className="flex items-center gap-1 text-slate-600 font-semibold">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{course.enrolledCount.toLocaleString('bn-BD')}+ এনরোল্ড</span>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          {course.highlights && course.highlights.length > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-rose-100/80 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>এই কোর্সে যা যা পাচ্ছেন:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description with SEO Rich Headings & Markdown Support */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-100 text-rose-600">
                <BookOpen className="w-5 h-5" />
              </span>
              <span>কোর্সের পূর্ণাঙ্গ বিবরণ ও সিলেবাস গাইড</span>
            </h3>
            <div className="pt-1">
              {renderRichCourseDescription(course.fullDescription || course.shortDescription)}
            </div>
          </div>

          {/* Syllabus */}
          {course.syllabus && course.syllabus.length > 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <span>সিলেবাস ও লেকচার বিন্যাস</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {course.syllabus.map((s, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{s.title}</span>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="pt-8 border-t border-rose-100 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            সম্পর্কিত অন্যান্য কোর্সসমূহ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((c) => (
              <CourseCard key={c.id} course={c} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
