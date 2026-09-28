import React, { useMemo } from 'react';
import { CourseCategory } from '../types';
import { useCourseContext } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';

interface ClassCategoryPageProps {
  category: CourseCategory;
  onNavigate: (path: string) => void;
}

const categoryMeta: Record<
  string,
  { title: string; subtitle: string; description: string; seoTitle: string }
> = {
  'class-6': {
    title: '৬ষ্ঠ শ্রেণি অনলাইন ব্যাচ (নতুন শিক্ষাক্রম)',
    subtitle: 'নতুন কারিকুলাম অনুযায়ী ৬ষ্ঠ শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের কোর্স।',
    seoTitle: 'Class 6 Online Batch 10MS Course Offer | 10mscourse.shop',
  },
  'class-7': {
    title: '৭ম শ্রেণি অনলাইন ব্যাচ (নতুন শিক্ষাক্রম)',
    subtitle: 'নতুন কারিকুলাম অনুযায়ী ৭ম শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের কোর্স।',
    seoTitle: 'Class 7 Online Batch 10MS Course Offer | 10mscourse.shop',
  },
  'class-8': {
    title: '৮ম শ্রেণি অনলাইন ব্যাচ (নতুন শিক্ষাক্রম)',
    subtitle: 'নতুন কারিকুলাম অনুযায়ী ৮ম শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের কোর্স।',
    seoTitle: 'Class 8 Online Batch 10MS Course Offer | 10mscourse.shop',
  },
  'class-6-8': {
    title: 'ক্লাস ৬-৮ অনলাইন ব্যাচ (নতুন শিক্ষাক্রম)',
    subtitle: 'নতুন কারিকুলাম অনুযায়ী ৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের কোর্স।',
    seoTitle: 'Class 6-8 Online Batch 10MS Course Offer | 10mscourse.shop',
  },
  'class-9-10': {
    title: 'ক্লাস ৯-১০ ও এসএসসি ক্র্যাশ কোর্স (SSC)',
    subtitle: 'পদার্থবিজ্ঞান, রসায়ন, গণিত, জীববিজ্ঞান ও সাধারণ বিষয়ের নিশ্চিত এ+ প্রস্তুতি',
    description: 'বোর্ড প্রশ্ন সমাধান, অধ্যায়ভিত্তিক লেকচার শিট এবং মডেল টেস্ট দিয়ে সাজানো এসএসসি শিক্ষার্থীদের বিশ্বস্ত ব্যাচ।',
    seoTitle: 'SSC Online Course & Crash Course 10MS Offer | 10mscourse.shop',
  },
  'hsc': {
    title: 'এইচএসসি অনলাইন ব্যাচ (HSC)',
    subtitle: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার পূর্ণাঙ্গ সিলেবাস কোর্স',
    description: 'কলেজের পড়াশোনা ও বোর্ড পরীক্ষায় জিপিএ ৫ পাওয়ার সেরা প্রস্তুতি নিশ্চিত করুন বুয়েট ও মেডিকেল মেন্টরদের সাথে।',
    seoTitle: 'HSC Online Batch 10MS | 10mscourse.shop',
  },
  'admission': {
    title: 'বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন কোর্স',
    subtitle: 'ভার্সিটি ক, খ, গ ইউনিট, বুয়েট, মেডিকেল ও গুচ্ছ ভর্তি পরীক্ষা',
    description: 'বিগত ২০ বছরের প্রশ্নব্যাংক সল্যুশন, শর্টকাট ট্রিকস ও মেগা মডেল টেস্ট নিয়ে তৈরি এডমিশন স্পেশাল ব্যাচ।',
    seoTitle: 'Varsity & Medical Admission Preparation 10MS | 10mscourse.shop',
  },
  'skills': {
    title: 'স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং কোর্স',
    subtitle: 'ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং ও ক্যারিয়ার স্কিল',
    description: 'দেশি ও আন্তর্জাতিক মার্কেটপ্লেসে হাই-পেয়িং কাজের জন্য প্র্যাকটিক্যাল প্রজেক্ট ও সার্টিফিকেট সম্পন্ন কোর্স।',
    seoTitle: 'Skill Development & Freelancing Courses 10MS | 10mscourse.shop',
  },
  'spoken-english': {
    title: 'স্পোকেন ইংলিশ ও ভাষা শিক্ষা',
    subtitle: 'মুনজেরিন শহীদের ঘরে বসে Spoken English, IELTS ও কিডস ইংলিশ',
    description: 'সহজ নিয়মে এবং বাস্তব জীবনের কথোপকথনের মাধ্যমে অনর্গল ইংরেজিতে কথা বলার দেশসেরা কোর্স।',
    seoTitle: 'Spoken English & IELTS Munzereen Shahid 10MS | 10mscourse.shop',
  },
  'job-prep': {
    title: 'বিসিএস ও সরকারি চাকরি প্রস্তুতি',
    subtitle: '৪৭তম বিসিএস প্রিলিমিনারি, ব্যাংক জব ও প্রাইমারি শিক্ষক নিয়োগ',
    description: 'বিসিএস ক্যাডার ও শীর্ষ কর্মকর্তাদের এক্সক্লুসিভ গাইডলাইনে চাকরি পরীক্ষায় চূড়ান্ত সফলতার কোর্স।',
    seoTitle: 'BCS & Govt Job Preparation 10MS | 10mscourse.shop',
  },
};

export const ClassCategoryPage: React.FC<ClassCategoryPageProps> = ({ category, onNavigate }) => {
  const { courses, isCourseExpired } = useCourseContext();

  const meta = categoryMeta[category] || {
    title: '১০ মিনিট স্কুল কোর্সসমূহ',
    subtitle: 'সকল একাডেমিক ও স্কিল কোর্স',
    description: '১০ মিনিট স্কুলের সেরা অফার ও ডিসকাউন্ট লিংক।',
    seoTitle: '10MS Courses | 10mscourse.shop',
  };

  const isClass6to8 = ['class-6-8', 'class-6', 'class-7', 'class-8'].includes(category);

  const categoryCourses = useMemo(() => {
    return courses.filter((c) => {
      if (isCourseExpired(c)) return false;
      if (category === 'class-6-8') {
        return (
          c.category === 'class-6-8' ||
          c.category === 'class-6' ||
          c.category === 'class-7' ||
          c.category === 'class-8' ||
          c.displayTargets?.includes('class-6-8') ||
          c.displayTargets?.includes('class-6') ||
          c.displayTargets?.includes('class-7') ||
          c.displayTargets?.includes('class-8') ||
          c.title.includes('৬ষ্ঠ') ||
          c.title.includes('৭ম') ||
          c.title.includes('৮ম')
        );
      }
      if (category === 'class-6') {
        return (
          c.category === 'class-6' ||
          c.displayTargets?.includes('class-6') ||
          c.targetClass?.includes('৬ষ্ঠ') ||
          c.title.includes('৬ষ্ঠ') ||
          c.title.toLowerCase().includes('class 6')
        );
      }
      if (category === 'class-7') {
        return (
          c.category === 'class-7' ||
          c.displayTargets?.includes('class-7') ||
          c.targetClass?.includes('৭ম') ||
          c.title.includes('৭ম') ||
          c.title.toLowerCase().includes('class 7')
        );
      }
      if (category === 'class-8') {
        return (
          c.category === 'class-8' ||
          c.displayTargets?.includes('class-8') ||
          c.targetClass?.includes('৮ম') ||
          c.title.includes('৮ম') ||
          c.title.toLowerCase().includes('class 8')
        );
      }
      return c.category === category || c.displayTargets?.includes(category);
    });
  }, [courses, category, isCourseExpired]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-6 sm:p-10 shadow-xl border border-rose-400/30">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-rose-100 hover:text-white font-semibold mb-4 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল ক্যাটাগরিতে ফিরে যান</span>
        </button>

        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অফিসিয়াল কোর্স লিস্ট</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">{meta.title}</h1>
          <p className="text-rose-100 text-sm sm:text-base font-medium">{meta.subtitle}</p>
          <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed pt-1">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-600" />
            <span>উপলব্ধ কোর্সসমূহ ({categoryCourses.length.toLocaleString('bn-BD')}টি)</span>
          </h2>

          {/* Sub-class navigation for Class 6-8 */}
          {isClass6to8 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {[
                { id: 'class-6-8', path: '/class-6-8', label: 'সকল ৬-৮' },
                { id: 'class-6', path: '/class-6', label: '৬ষ্ঠ শ্রেণি' },
                { id: 'class-7', path: '/class-7', label: '৭ম শ্রেণি' },
                { id: 'class-8', path: '/class-8', label: '৮ম শ্রেণি' },
              ].map((sub) => {
                const isActive = category === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onNavigate(sub.path)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {categoryCourses.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {categoryCourses.map((c) => (
              <CourseCard key={c.id} course={c} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-rose-100">
            <p className="text-slate-500 text-sm">এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় কোর্স নেই।</p>
            <button
              onClick={() => onNavigate('/')}
              className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg"
            >
              হোমপেজে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
