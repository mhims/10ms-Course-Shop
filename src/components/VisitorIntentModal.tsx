import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, Laptop, BookOpen, Award, CheckCircle2, X } from 'lucide-react';
import { CourseCategory } from '../types';

interface VisitorIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: CourseCategory) => void;
  availableCategoryIds?: CourseCategory[];
}

export const VisitorIntentModal: React.FC<VisitorIntentModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  availableCategoryIds,
}) => {
  if (!isOpen) return null;

  const rawCategories = [
    {
      id: 'class-9-10' as CourseCategory,
      title: 'ক্লাস ৯-১০ ও এসএসসি (SSC)',
      subtitle: 'এসএসসি ক্র্যাশ কোর্স ও বিষয়ভিত্তিক পূর্ণাঙ্গ ব্যাচ',
      icon: GraduationCap,
      color: 'from-amber-500 to-rose-500',
    },
    {
      id: 'hsc' as CourseCategory,
      title: 'এইচএসসি (HSC)',
      subtitle: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষার অনলাইন ব্যাচ',
      icon: BookOpen,
      color: 'from-rose-500 to-red-600',
    },
    {
      id: 'admission' as CourseCategory,
      title: 'বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন',
      subtitle: 'ভার্সিটি ক, মেডিকেল, বুয়েট ও গুচ্ছ ভর্তি পরীক্ষা',
      icon: Award,
      color: 'from-purple-600 to-rose-600',
    },
    {
      id: 'spoken-english' as CourseCategory,
      title: 'ঘরে বসে Spoken English',
      subtitle: 'মুনজেরিন শহীদের সাথে ফ্লুয়েন্ট ইংরেজি কথা বলার কোর্স',
      icon: Sparkles,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'skills' as CourseCategory,
      title: 'স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং',
      subtitle: 'ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন ও ডিজিটাল মার্কেটিং',
      icon: Laptop,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'class-6-8' as CourseCategory,
      title: 'ক্লাস ৬-৮ (নতুন শিক্ষাক্রম)',
      subtitle: 'গণিত, বিজ্ঞান ও ইংরেজি শিখন আনন্দদায়ক পদ্ধতিতে',
      icon: BookOpen,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'job-prep' as CourseCategory,
      title: 'বিসিএস ও সরকারি চাকরি প্রস্তুতি',
      subtitle: 'বিসিএস প্রিলিমিনারি ও ব্যাংক জব কোর্স',
      icon: CheckCircle2,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  const categories = availableCategoryIds && availableCategoryIds.length > 0
    ? rawCategories.filter((cat) => availableCategoryIds.includes(cat.id))
    : rawCategories;

  if (availableCategoryIds && categories.length === 0) {
    return null;
  }

  const handlePick = (cat: CourseCategory) => {
    onSelectCategory(cat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden transform transition-all">
        {/* Header with Red Gradient */}
        <div className="relative bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-6 pb-7">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>১০ মিনিট স্কুল কোর্স ডিরেক্টরি</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            আপনি কোন কোর্স খুঁজছেন?
          </h2>
          <p className="text-rose-100 text-sm mt-1">
            আপনার শ্রেণি বা লক্ষ্য বেছে নিন, আমরা আপনার জন্য সেরা কোর্সগুলো এক ক্লিকে সাজিয়ে দিচ্ছি:
          </p>
        </div>

        {/* Categories Grid */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handlePick(cat.id)}
                  className="group flex items-start gap-3.5 p-3.5 text-left rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all cursor-pointer"
                >
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${cat.color} text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Show all option */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => handlePick('all')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-4 cursor-pointer"
            >
              আমি নিজে সবগুলো কোর্স দেখতে চাই (সকল কোর্স ১৫০+)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
