import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Search, PlusCircle, BookOpen, Sparkles, ChevronRight, ChevronLeft, Flame, GraduationCap, Award, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Course, CourseCategory } from '../types';
import { useCourseContext } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { VisitorIntentModal } from '../components/VisitorIntentModal';

interface HomePageProps {
  onNavigate: (path: string) => void;
  searchQuery: string;
}

// Reusable Horizontally Scrollable Category Row Component
interface CategoryScrollRowProps {
  title: string;
  badge?: string;
  icon: React.ReactNode;
  viewAllPath?: string;
  onSelectCategory?: () => void;
  courses: Course[];
  onNavigate: (path: string) => void;
}

const CategoryScrollRow: React.FC<CategoryScrollRowProps> = ({
  title,
  badge,
  icon,
  viewAllPath,
  onSelectCategory,
  courses,
  onNavigate,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (courses.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white/70 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-rose-100/80 p-3 sm:p-5 shadow-xs space-y-3">
      {/* Category Header: Title on Top */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shadow-2xs">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              ডানদিকে স্ক্রল করে এই ক্যাটাগরির সকল কোর্স দেখুন
            </p>
          </div>
        </div>

        {/* Right side controls: View All link + Desktop scroll buttons */}
        <div className="flex items-center gap-2">
          {(onSelectCategory || viewAllPath) && (
            <button
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory();
                } else if (viewAllPath) {
                  onNavigate(viewAllPath);
                }
              }}
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer pr-1"
            >
              <span>সব দেখুন ({courses.length.toLocaleString('bn-BD')}টি)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 sm:p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
              aria-label="বামে স্ক্রল করুন"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 sm:p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
              aria-label="ডানে স্ক্রল করুন"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Underneath: Horizontally scrollable row to the right */}
      <div
        ref={rowRef}
        className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin"
      >
        {courses.map((course) => (
          <div
            key={course.id}
            className="w-[245px] sm:w-[270px] md:w-[285px] shrink-0 snap-start flex flex-col"
          >
            <CourseCard course={course} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </section>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, searchQuery }) => {
  const { courses, categories: customCategories, isOfferActive, isCourseExpired } = useCourseContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showIntentModal, setShowIntentModal] = useState<boolean>(() => {
    return !sessionStorage.getItem('10ms_intent_selected');
  });

  // Active non-expired courses (Expired courses are automatically excluded from homepage!)
  const activeCourses = useMemo(() => {
    return courses.filter((c) => !isCourseExpired(c));
  }, [courses, isCourseExpired]);

  // Featured courses with active special offers
  const offerCourses = useMemo(() => {
    return activeCourses.filter((c) => isOfferActive(c));
  }, [activeCourses, isOfferActive]);

  // STRICT RULE: No hardcoded pre-existing categories!
  // Only categories that currently have active courses will appear!
  const activeCategoryGroups = useMemo(() => {
    const groupMap = new Map<string, { id: string; name: string; courses: Course[] }>();

    activeCourses.forEach((c) => {
      const catKey = (c.category || '').trim();
      if (!catKey) return;

      if (!groupMap.has(catKey)) {
        const found = customCategories.find((cat) => cat.id === catKey || cat.name === catKey);
        groupMap.set(catKey, {
          id: catKey,
          name: found?.name || catKey,
          courses: [],
        });
      }
      groupMap.get(catKey)!.courses.push(c);
    });

    return Array.from(groupMap.values());
  }, [activeCourses, customCategories]);

  // Dynamic category pills for filter buttons
  const categories = useMemo(() => {
    if (activeCourses.length === 0 || activeCategoryGroups.length === 0) return [];

    return [
      { id: 'all' as CourseCategory, label: 'সকল কোর্স', shortLabel: 'সকল', count: activeCourses.length },
      ...activeCategoryGroups.map((g) => ({
        id: g.id,
        label: g.name,
        shortLabel: g.name,
        count: g.courses.length,
      })),
    ];
  }, [activeCourses.length, activeCategoryGroups]);

  // If currently selected category no longer exists, reset to 'all'
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  // Main filtered courses (Used for search & specific category tab)
  const filteredCourses = useMemo(() => {
    return activeCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        course.category === selectedCategory ||
        course.displayTargets?.includes(selectedCategory);

      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        course.title.toLowerCase().includes(q) ||
        course.englishTitle.toLowerCase().includes(q) ||
        (course.instructor && course.instructor.toLowerCase().includes(q)) ||
        course.slug.toLowerCase().includes(q) ||
        course.seoKeywords.some((k) => k.toLowerCase().includes(q)) ||
        course.shortDescription.toLowerCase().includes(q);

      return selectedCategory === 'all' ? matchesSearch : matchesCategory && matchesSearch;
    });
  }, [activeCourses, selectedCategory, searchQuery]);

  const handleIntentCategorySelect = (cat: CourseCategory) => {
    setSelectedCategory(cat);
    sessionStorage.setItem('10ms_intent_selected', 'true');
    setShowIntentModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Visitor Intent Input Modal (Prompts only on first visit if active courses exist) */}
      {activeCourses.length > 0 && categories.length > 1 && (
        <VisitorIntentModal
          isOpen={showIntentModal}
          availableCategoryIds={categories.filter(c => c.id !== 'all').map(c => c.id)}
          onClose={() => {
            setShowIntentModal(false);
            sessionStorage.setItem('10ms_intent_selected', 'true');
          }}
          onSelectCategory={handleIntentCategorySelect}
        />
      )}

      {/* FILTER & INTRO SECTION: Brand Banner, Affiliate Disclosure & Category Navigation */}
      <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-5">
        
        {/* Banner with Title, 1-2 Line Description, and Affiliate Disclosure - CENTER ALIGNED */}
        <div className="bg-gradient-to-b from-rose-50/90 via-white to-orange-50/30 rounded-2xl sm:rounded-3xl border border-rose-100 p-4 sm:p-6 shadow-xs mb-3 sm:mb-4 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
            {/* Affiliate Disclosure Badge (Center Aligned) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white text-rose-700 border border-rose-200/90 shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>১০ মিনিট স্কুল অফিসিয়াল অ্যাফিলিয়েট প্ল্যাটফর্ম</span>
            </div>

            {/* Main Heading requested by user - Centered */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center">
              ১০ মিনিট স্কুল কোর্স শপ
            </h1>

            {/* 1-2 Line Description - Centered */}
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl mx-auto leading-relaxed text-center">
              ১০ মিনিট স্কুলের সকল একাডেমিক (৬ষ্ঠ-১২শ), এডমিশন টেস্ট ও স্কিল কোর্সের ভেরিফাইড ডিসকাউন্ট, প্রোমো কোড ও সরাসরি ভর্তি ডিরেক্টরি।
            </p>

            {/* Target change button centered (Only shown if categories exist) */}
            {categories.length > 1 && (
              <div className="mt-3 flex items-center justify-center">
                <button
                  onClick={() => setShowIntentModal(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5 text-rose-600" />
                  <span>লক্ষ্য পরিবর্তন করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View: High-Visibility Dynamic Quick Filter Grid (ONLY categories with active courses) */}
        {categories.length > 1 && (
          <div className="block sm:hidden bg-white/95 backdrop-blur-xs p-2.5 rounded-2xl border border-rose-100 shadow-xs mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
              <span className="flex items-center gap-1 text-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                <span>কোর্স ক্যাটাগরি বেছে নিন:</span>
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-rose-600 text-[10px] font-bold"
                >
                  সকল ক্যাটাগরি
                </button>
              )}
            </div>

            <div className={`grid ${categories.length > 4 ? 'grid-cols-4' : categories.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 text-center`}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs scale-98'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200/80 active:bg-rose-100'
                    }`}
                  >
                    <span>{cat.shortLabel}</span>
                    {cat.count !== undefined && (
                      <span className="text-[10px] opacity-75 ml-1">({cat.count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop View: Clean Dynamic Category Filter Row (ONLY categories with active courses) */}
        {categories.length > 1 && (
          <div className="hidden sm:block mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-slate-800">
                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-pulse"></span>
                <span>কোর্স ক্যাটাগরি বেছে নিন:</span>
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-rose-600 hover:underline text-xs font-bold cursor-pointer"
                >
                  সকল ক্যাটাগরি রো ভিউতে ফিরে যান
                </button>
              )}
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.count !== undefined && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Active Search Results Banner Indicator if searching */}
      {searchQuery.trim() && (
        <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-slate-800">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-600" />
              <span>
                "<strong>{searchQuery}</strong>" এর জন্য <strong>{filteredCourses.length}টি</strong> কোর্স পাওয়া গেছে
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
            >
              রিসেট
            </button>
          </div>
        </section>
      )}

      {/* VIEW MODE 1: SEARCH ACTIVE OR SINGLE CATEGORY SELECTED */}
      {(searchQuery.trim() || selectedCategory !== 'all') ? (
        <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1 font-bold">
            <span>
              {selectedCategory !== 'all'
                ? `${categories.find((c) => c.id === selectedCategory)?.label || 'ক্যাটাগরি'} (${filteredCourses.length}টি কোর্স)`
                : `অনুসন্ধানের ফলাফল (${filteredCourses.length}টি)`}
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                সব ক্যাটাগরি রো ভিউ
              </button>
            )}
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto space-y-3">
              <BookOpen className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">কোনো কোর্স পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">অন্যান্য ক্যাটাগরি থেকে পছন্দের কোর্স বেছে নিন।</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                সকল কোর্স দেখুন
              </button>
            </div>
          )}
        </section>
      ) : (
        /* VIEW MODE 2: FULL HOMEPAGE ORGANIZED BY CATEGORIES IN HORIZONTAL SCROLLABLE ROWS */
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          
          {/* Empty Catalog Notice: If no active courses exist yet */}
          {activeCourses.length === 0 && (
            <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-12 text-center shadow-xs max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                শীঘ্রই নতুন কোর্স আসছে
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                ১০ মিনিট স্কুলের সকল একাডেমিক, এডমিশন ও স্কিল কোর্স এবং এক্সক্লুসিভ অফারসমূহ শীঘ্রই যুক্ত হচ্ছে।
              </p>
            </div>
          )}

          {/* 1. Hot Special Offers Row */}
          {offerCourses.length > 0 && (
            <CategoryScrollRow
              title="চলতি স্পেশাল অফার ও হট ডিসকাউন্ট"
              badge="হট ডিল"
              icon={<Flame className="w-5 h-5 text-rose-600" />}
              courses={offerCourses}
              onNavigate={onNavigate}
            />
          )}

          {/* Dynamically Render Rows for EACH Category that has active courses */}
          {activeCategoryGroups.map((group) => (
            <CategoryScrollRow
              key={group.id}
              title={group.name}
              badge="কোর্স তালিকা"
              icon={<GraduationCap className="w-5 h-5 text-rose-600" />}
              onSelectCategory={() => setSelectedCategory(group.id)}
              courses={group.courses}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* SEO & AI SEARCH CITATION GROUNDING SECTION: High Quality FAQ & Bengali Knowledge Hub */}
      <section className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>সহায়তা ও প্রশ্নোত্তর</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              ১০ মিনিট স্কুল কোর্স ভর্তি ও ডিসকাউন্ট সম্পর্কিত তথ্য (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              গুগল বা এআই থেকে সেরা তথ্যের জন্য সর্বাধিক জিজ্ঞাসিত প্রশ্ন ও সঠিক উত্তর
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০ মিনিট স্কুলের কোর্সে ছাড় বা প্রোমো কোড কীভাবে ব্যবহার করব?</span>
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                আমাদের সাইটে প্রতিটি কোর্সের সাথে ভেরিফাইড প্রোমো কোড উল্লেখ থাকে। কোর্সের বিস্তারিত পেজে গিয়ে "প্রোমো কোড কপি করুন" বাটনে ক্লিক করে চেকআউট পেজে কোডটি বসালেই নির্ধারিত ছাড় পাওয়া যাবে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০ মিনিট স্কুলের ক্লাসগুলো কি যেকোনো ডিভাইস থেকে করা যায়?</span>
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                হ্যাঁ, আপনার পছন্দ অনুযায়ী স্মার্টফোন, ট্যাব বা ল্যাপটপ/কম্পিউটার—যেকোনো ডিভাইস থেকে ১০ মিনিট স্কুলের ওয়েবসাইট বা অ্যাপে লগইন করে সকল লাইভ ও রেকর্ডেড ক্লাস উপভোগ করতে পারবেন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ক্লাস ও লেকচার শিট কীভাবে পাওয়া যায়?</span>
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                ১০ মিনিট স্কুলের অফিসিয়াল অ্যাপ বা ওয়েবসাইটে লগইন করে আপনার কেনা কোর্সের সকল লাইভ ক্লাস, রেকর্ডেড ক্লাস ও লেকচার শিট যেকোনো সময় মোবাইল বা কম্পিউটার থেকে দেখতে পারবেন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>পেমেন্ট পদ্ধতি কী কী রয়েছে?</span>
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                বিকাশ, নগদ, রকেট, যেকোনো ডেবিট বা ক্রেডিট কার্ড এবং অনলাইন ব্যাংকিংয়ের মাধ্যমে সম্পূর্ণ নিরাপদে তাৎক্ষণিকভাবে কোর্স ফি পরিশোধ করে এনরোলমেন্ট সম্পন্ন করা যায়।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
