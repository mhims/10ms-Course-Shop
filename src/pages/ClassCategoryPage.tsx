import React, { useMemo, useEffect } from 'react';
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
    title: '১০ মিনিট স্কুল ৬ষ্ঠ শ্রেণি অনলাইন ব্যাচ',
    subtitle: '১০ মিনিট স্কুলের নতুন শিক্ষাক্রম অনুযায়ী ৬ষ্ঠ শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি প্রস্তুতি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের অনলাইন ব্যাচ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল ৬ষ্ঠ শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10mscourse.shop',
  },
  'class-7': {
    title: '১০ মিনিট স্কুল ৭ম শ্রেণি অনলাইন ব্যাচ',
    subtitle: '১০ মিনিট স্কুলের নতুন শিক্ষাক্রম অনুযায়ী ৭ম শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি প্রস্তুতি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের অনলাইন ব্যাচ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল ৭ম শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10mscourse.shop',
  },
  'class-8': {
    title: '১০ মিনিট স্কুল ৮ম শ্রেণি অনলাইন ব্যাচ',
    subtitle: '১০ মিনিট স্কুলের নতুন শিক্ষাক্রম অনুযায়ী ৮ম শ্রেণির গণিত, বিজ্ঞান ও ইংরেজি প্রস্তুতি',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের অনলাইন ব্যাচ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল ৮ম শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10mscourse.shop',
  },
  'class-6-8': {
    title: '১০ মিনিট স্কুল ক্লাস ৬-৮ অনলাইন ব্যাচ',
    subtitle: '১০ মিনিট স্কুলের নতুন শিক্ষাক্রম অনুযায়ী ৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির লাইভ ক্লাস ও কোর্সসমূহ',
    description: '১০ মিনিট স্কুলের বিশেষজ্ঞ শিক্ষকদের পরিচালনায় আনন্দদায়ক পদ্ধতিতে স্কুলের মূল্যায়নে সর্বোচ্চ ফলাফলের অনলাইন ব্যাচ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল ক্লাস ৬-৮ অনলাইন ব্যাচ কোর্স ও ভর্তি | 10mscourse.shop',
  },
  'class-9-10': {
    title: '১০ মিনিট স্কুল এসএসসি অনলাইন ব্যাচ ও ক্র্যাশ কোর্স (SSC)',
    subtitle: '১০ মিনিট স্কুলের পদার্থবিজ্ঞান, রসায়ন, গণিত, জীববিজ্ঞান ও সাধারণ বিষয়ের নিশ্চিত এ+ প্রস্তুতি',
    description: '১০ মিনিট স্কুলের অভিজ্ঞ শিক্ষকদের লাইভ ক্লাস, লেকচার শিট এবং মডেল টেস্ট দিয়ে সাজানো এসএসসি অনলাইন ব্যাচ।',
    seoTitle: '১০ মিনিট স্কুল এসএসসি অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10mscourse.shop',
  },
  'hsc': {
    title: '১০ মিনিট স্কুল এইচএসসি অনলাইন ব্যাচ (HSC)',
    subtitle: '১০ মিনিট স্কুলের বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার পূর্ণাঙ্গ সিলেবাস লাইভ কোর্স',
    description: 'কলেজের পড়াশোনা ও বোর্ড পরীক্ষায় জিপিএ ৫ পাওয়ার সেরা প্রস্তুতি নিশ্চিত করুন ১০ মিনিট স্কুলের বুয়েট ও মেডিকেল মেন্টরদের সাথে।',
    seoTitle: '১০ মিনিট স্কুল এইচএসসি অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'admission': {
    title: '১০ মিনিট স্কুল বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন কোর্স',
    subtitle: '১০ মিনিট স্কুলের ভার্সিটি ক, খ, গ ইউনিট, বুয়েট, মেডিকেল ও গুচ্ছ ভর্তি পরীক্ষা প্রস্তুতি',
    description: '১০ মিনিট স্কুলের বিগত ২০ বছরের প্রশ্নব্যাংক সল্যুশন, শর্টকাট ট্রিকস ও মেগা মডেল টেস্ট নিয়ে তৈরি এডমিশন স্পেশাল কোর্স।',
    seoTitle: '১০ মিনিট স্কুল বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন কোর্স | 10mscourse.shop',
  },
  'skills': {
    title: '১০ মিনিট স্কুল স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং কোর্স',
    subtitle: '১০ মিনিট স্কুলের ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং ও ক্যারিয়ার স্কিল',
    description: '১০ মিনিট স্কুলের দেশি ও আন্তর্জাতিক মার্কেটপ্লেসে হাই-পেয়িং কাজের জন্য প্র্যাকটিক্যাল প্রজেক্ট ও সার্টিফিকেট সম্পন্ন কোর্স।',
    seoTitle: '১০ মিনিট স্কুল স্কিলস ও ফ্রিল্যান্সিং কোর্স | 10mscourse.shop',
  },
  'spoken-english': {
    title: '১০ মিনিট স্কুল স্পোকেন ইংলিশ ও ভাষা শিক্ষা',
    subtitle: '১০ মিনিট স্কুলে মুনজেরিন শহীদের ঘরে বসে Spoken English, IELTS ও কিডস ইংলিশ কোর্স',
    description: '১০ মিনিট স্কুলের সহজ নিয়মে বাস্তব জীবনের কথোপকথনের মাধ্যমে অনর্গল ইংরেজিতে কথা বলার দেশসেরা কোর্স।',
    seoTitle: '১০ মিনিট স্কুল স্পোকেন ইংলিশ ও IELTS কোর্স | 10mscourse.shop',
  },
  'job-prep': {
    title: '১০ মিনিট স্কুল বিসিএস ও সরকারি চাকরি প্রস্তুতি কোর্স',
    subtitle: '১০ মিনিট স্কুলের ৪৭তম বিসিএস প্রিলিমিনারি, ব্যাংক জব ও প্রাইমারি শিক্ষক নিয়োগ কোর্স',
    description: '১০ মিনিট স্কুলের বিসিএস ক্যাডার ও শীর্ষ কর্মকর্তাদের এক্সক্লুসিভ গাইডলাইনে চাকরি পরীক্ষায় চূড়ান্ত সফলতার কোর্স।',
    seoTitle: '১০ মিনিট স্কুল বিসিএস ও সরকারি চাকরি প্রস্তুতি | 10mscourse.shop',
  },
  'hsc-28': {
    title: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ (HSC 28)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৮ ব্যাচের বিজ্ঞান, মানবিক ও ব্যবসা শিক্ষার পূর্ণাঙ্গ প্রস্তুতি',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৮ অনলাইন ব্যাচ: বাংলা, ইংরেজি, আইসিটি ও গ্রুপ সাবজেক্টের লাইভ ক্লাস ও স্পেশাল ডিসকাউন্ট অফার।',
    seoTitle: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'hsc-2028': {
    title: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ (HSC 28)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৮ ব্যাচের বিজ্ঞান, মানবিক ও ব্যবসা শিক্ষার পূর্ণাঙ্গ প্রস্তুতি',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৮ অনলাইন ব্যাচ: বাংলা, ইংরেজি, আইসিটি ও গ্রুপ সাবজেক্টের লাইভ ক্লাস ও স্পেশাল ডিসকাউন্ট অফার।',
    seoTitle: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'hsc-27': {
    title: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স (HSC 27)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৭ ব্যাচের সকল বিভাগের পূর্ণাঙ্গ প্রস্তুতি ও টেস্ট পেপার সমাধান',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৭ অনলাইন ব্যাচের লাইভ ক্লাস, লেকচার শিট ও বোর্ড পরীক্ষার নিশ্চিত এ+ প্রস্তুতি।',
    seoTitle: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'hsc-2027': {
    title: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স (HSC 27)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৭ ব্যাচের সকল বিভাগের পূর্ণাঙ্গ প্রস্তুতি ও টেস্ট পেপার সমাধান',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৭ অনলাইন ব্যাচের লাইভ ক্লাস, লেকচার শিট ও বোর্ড পরীক্ষার নিশ্চিত এ+ প্রস্তুতি।',
    seoTitle: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'hsc-26': {
    title: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি (HSC 26)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ পরীক্ষার্থীদের জন্য শেষ মুহূর্তের রিভিশন ও মডেল টেস্ট',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ পরীক্ষার্থীদের পূর্ণাঙ্গ রিভিশন ও বোর্ড পরীক্ষায় জিপিএ ৫ অর্জনের এক্সক্লুসিভ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10mscourse.shop',
  },
  'hsc-2026': {
    title: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি (HSC 26)',
    subtitle: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ পরীক্ষার্থীদের জন্য শেষ মুহূর্তের রিভিশন ও মডেল টেস্ট',
    description: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ পরীক্ষার্থীদের পূর্ণাঙ্গ রিভিশন ও বোর্ড পরীক্ষায় জিপিএ ৫ অর্জনের এক্সক্লুসিভ কোর্স।',
    seoTitle: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10mscourse.shop',
  },
  'ssc-28': {
    title: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ (৯ম শ্রেণি / SSC 28)',
    subtitle: '১০ মিনিট স্কুলের নতুন কারিকুলাম ও এসএসসি ২০২৮ এর গণিত, বিজ্ঞান ও ইংরেজির শক্তিশালী ভিত্তি',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৮ অনলাইন ব্যাচ: অভিজ্ঞ শিক্ষকদের লাইভ ক্লাসের মাধ্যমে স্কুলের মূল্যায়ন ও এসএসসির পূর্ণাঙ্গ প্রস্তুতি।',
    seoTitle: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'ssc-2028': {
    title: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ (৯ম শ্রেণি / SSC 28)',
    subtitle: '১০ মিনিট স্কুলের নতুন কারিকুলাম ও এসএসসি ২০২৮ এর গণিত, বিজ্ঞান ও ইংরেজির শক্তিশালী ভিত্তি',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৮ অনলাইন ব্যাচ: অভিজ্ঞ শিক্ষকদের লাইভ ক্লাসের মাধ্যমে স্কুলের মূল্যায়ন ও এসএসসির পূর্ণাঙ্গ প্রস্তুতি।',
    seoTitle: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ কোর্স ও অফার | 10mscourse.shop',
  },
  'ssc-27': {
    title: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি (SSC 27)',
    subtitle: '১০ মিনিট স্কুলের এসএসসি ২০২৭ বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষার নিশ্চিত এ+ কোর্স',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৭ শেষ মুহূর্তের প্রস্তুতি কোর্স (SMP Bundle): ১১টি বিষয়ে লাইভ ক্লাস, লেকচার শিট ও বোর্ড প্রশ্ন সমাধান।',
    seoTitle: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি | 10mscourse.shop',
  },
  'ssc-2027': {
    title: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি (SSC 27)',
    subtitle: '১০ মিনিট স্কুলের এসএসসি ২০২৭ বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষার নিশ্চিত এ+ কোর্স',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৭ শেষ মুহূর্তের প্রস্তুতি কোর্স (SMP Bundle): ১১টি বিষয়ে লাইভ ক্লাস, লেকচার শিট ও বোর্ড প্রশ্ন সমাধান।',
    seoTitle: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি | 10mscourse.shop',
  },
  'ssc-26': {
    title: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও টেস্ট পেপার সলভ (SSC 26)',
    subtitle: '১০ মিনিট স্কুলের এসএসসি ২০২৬ পরীক্ষার্থীদের জন্য চূড়ান্ত রিভিশন ও মেগা মডেল টেস্ট',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৬ পরীক্ষার্থীদের বোর্ড পরীক্ষায় সেরা সাফল্যের নিশ্চিত কোর্স।',
    seoTitle: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10mscourse.shop',
  },
  'ssc-2026': {
    title: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও টেস্ট পেপার সলভ (SSC 26)',
    subtitle: '১০ মিনিট স্কুলের এসএসসি ২০২৬ পরীক্ষার্থীদের জন্য চূড়ান্ত রিভিশন ও মেগা মডেল টেস্ট',
    description: '১০ মিনিট স্কুলের এসএসসি ২০২৬ পরীক্ষার্থীদের বোর্ড পরীক্ষায় সেরা সাফল্যের নিশ্চিত কোর্স।',
    seoTitle: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10mscourse.shop',
  },
};

export const ClassCategoryPage: React.FC<ClassCategoryPageProps> = ({ category, onNavigate }) => {
  const { courses, isCourseExpired } = useCourseContext();

  const meta = categoryMeta[category] || {
    title: `১০ মিনিট স্কুল ${category.toUpperCase().replace('-', ' ')} অনলাইন ব্যাচ ও কোর্স`,
    subtitle: '১০ মিনিট স্কুলের ব্যাচভিত্তিক স্পেশাল অফার ও ডিসকাউন্ট',
    description: '১০ মিনিট স্কুলের সেরা ডিসকাউন্ট ও কুপন কোড দিয়ে সহজেই কোর্সে ভর্তি হোন।',
    seoTitle: `১০ মিনিট স্কুল ${category.toUpperCase()} অনলাইন ব্যাচ ও কোর্স | 10mscourse.shop`,
  };

  // Sync page title and meta description for SEO
  useEffect(() => {
    document.title = meta.seoTitle || `${meta.title} | 10mscourse.shop`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', meta.description);
    }
  }, [meta]);

  const isClass6to8 = ['class-6-8', 'class-6', 'class-7', 'class-8'].includes(category);
  const isSsc = ['class-9-10', 'ssc', 'ssc-26', 'ssc-2026', 'ssc-27', 'ssc-2027', 'ssc-28', 'ssc-2028'].includes(category);
  const isHsc = ['hsc', 'hsc-26', 'hsc-2026', 'hsc-27', 'hsc-2027', 'hsc-28', 'hsc-2028'].includes(category);

  const categoryCourses = useMemo(() => {
    return courses.filter((c) => {
      if (isCourseExpired(c)) return false;

      // Batch specific filters e.g. hsc-28, ssc-27, hsc-27, ssc-28, etc.
      const isBatchMatch = (batchNum: string, level: 'hsc' | 'ssc') => {
        const text = `${c.title} ${c.slug} ${c.targetClass || ''} ${c.shortDescription || ''}`.toLowerCase();
        const matchesBatch = text.includes(batchNum) || text.includes(`২০${batchNum}`) || text.includes(`20${batchNum}`);
        const matchesLevel = text.includes(level) || c.category === level || (level === 'ssc' && c.category === 'class-9-10');
        return matchesBatch && matchesLevel;
      };

      if (category === 'hsc-28' || category === 'hsc-2028') {
        return isBatchMatch('28', 'hsc');
      }
      if (category === 'hsc-27' || category === 'hsc-2027') {
        return isBatchMatch('27', 'hsc');
      }
      if (category === 'hsc-26' || category === 'hsc-2026') {
        return isBatchMatch('26', 'hsc');
      }
      if (category === 'ssc-28' || category === 'ssc-2028') {
        return isBatchMatch('28', 'ssc');
      }
      if (category === 'ssc-27' || category === 'ssc-2027') {
        return isBatchMatch('27', 'ssc');
      }
      if (category === 'ssc-26' || category === 'ssc-2026') {
        return isBatchMatch('26', 'ssc');
      }

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
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
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

          {/* Sub-batch navigation for SSC */}
          {isSsc && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {[
                { id: 'class-9-10', path: '/class-9-10', label: 'সকল এসএসসি' },
                { id: 'ssc-2026', path: '/ssc-2026', label: 'SSC ২০২৬' },
                { id: 'ssc-2027', path: '/ssc-2027', label: 'SSC ২০২৭' },
                { id: 'ssc-2028', path: '/ssc-2028', label: 'SSC ২০২৮' },
              ].map((sub) => {
                const isActive =
                  category === sub.id ||
                  (sub.id === 'ssc-2026' && category === 'ssc-26') ||
                  (sub.id === 'ssc-2027' && category === 'ssc-27') ||
                  (sub.id === 'ssc-2028' && category === 'ssc-28');
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

          {/* Sub-batch navigation for HSC */}
          {isHsc && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {[
                { id: 'hsc', path: '/hsc', label: 'সকল এইচএসসি' },
                { id: 'hsc-2026', path: '/hsc-2026', label: 'HSC ২০২৬' },
                { id: 'hsc-2027', path: '/hsc-2027', label: 'HSC ২০২৭' },
                { id: 'hsc-2028', path: '/hsc-2028', label: 'HSC ২০২৮' },
              ].map((sub) => {
                const isActive =
                  category === sub.id ||
                  (sub.id === 'hsc-2026' && category === 'hsc-26') ||
                  (sub.id === 'hsc-2027' && category === 'hsc-27') ||
                  (sub.id === 'hsc-2028' && category === 'hsc-28');
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
