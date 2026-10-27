import React, { useState, useMemo, useEffect } from 'react';
import { useCourseContext } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { Course, CourseCategory } from '../types';
import { Search, BookOpen, Layers, LayoutGrid, Sparkles } from 'lucide-react';

interface AllCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const AllCoursesPage: React.FC<AllCoursesPageProps> = ({ onNavigate }) => {
  const { courses, categories: customCategories, isCourseExpired } = useCourseContext();
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('all');
  const [viewMode, setViewMode] = useState<'categories' | 'grid'>('categories');
  const [search, setSearch] = useState('');

  // Filter valid non-expired courses
  const allActiveCourses = useMemo(() => {
    return courses.filter((c) => !isCourseExpired(c));
  }, [courses, isCourseExpired]);

  // Group active courses by their category dynamically
  const activeCategoryGroups = useMemo(() => {
    const groups: { id: string; name: string; courses: Course[] }[] = [];
    const seenCatIds = new Set<string>();

    // 1. First follow order from customCategories
    customCategories.forEach((cat) => {
      const matching = allActiveCourses.filter(
        (c) => c.category === cat.id || c.displayTargets?.includes(cat.id as any)
      );
      if (matching.length > 0) {
        groups.push({
          id: cat.id,
          name: cat.name,
          courses: matching,
        });
        seenCatIds.add(cat.id);
      }
    });

    // 2. Any additional categories found in courses
    allActiveCourses.forEach((c) => {
      const catKey = (c.category || '').trim();
      if (catKey && !seenCatIds.has(catKey)) {
        const matching = allActiveCourses.filter((ac) => ac.category === catKey);
        if (matching.length > 0) {
          groups.push({
            id: catKey,
            name: catKey,
            courses: matching,
          });
          seenCatIds.add(catKey);
        }
      }
    });

    return groups;
  }, [allActiveCourses, customCategories]);

  // Dynamic category pills (clean, no unnecessary emojis)
  const categories = useMemo(() => {
    if (allActiveCourses.length === 0 || activeCategoryGroups.length === 0) return [];

    return [
      { id: 'all' as CourseCategory, label: 'সকল কোর্স', count: allActiveCourses.length },
      ...activeCategoryGroups.map((g) => ({
        id: g.id as CourseCategory,
        label: g.name,
        count: g.courses.length,
      })),
    ];
  }, [allActiveCourses.length, activeCategoryGroups]);

  // Reset to 'all' if selected category is missing
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  // Set document title and meta description for SEO
  useEffect(() => {
    document.title = '১০ মিনিট স্কুলের সকল কোর্স ও অনলাইন ব্যাচ | 10MS Course Shop';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        '১০ মিনিট স্কুলের সকল অনলাইন কোর্স, অনলাইন ব্যাচ, ক্র্যাশ কোর্স ও ডিসকাউন্ট অফার এক প্ল্যাটফর্মে। ঘরে বসে স্পোকেন ইংলিশ, এইচএসসি, এসএসসি ও এডমিশন প্রস্তুতি।'
      );
    }
  }, []);

  // Filtered courses when searching or a specific category is chosen
  const filteredCourses = useMemo(() => {
    return allActiveCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        course.category === selectedCategory ||
        course.displayTargets?.includes(selectedCategory as any);

      if (!search.trim()) return matchesCategory;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        course.title.toLowerCase().includes(q) ||
        course.englishTitle.toLowerCase().includes(q) ||
        (course.instructor && course.instructor.toLowerCase().includes(q)) ||
        course.slug.toLowerCase().includes(q) ||
        course.seoKeywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allActiveCourses, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-20">
      {/* Title & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-pulse"></span>
            <span>১০ মিনিট স্কুলের সকল কোর্স ও অনলাইন ব্যাচ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট লাইভ কোর্স: <strong>{allActiveCourses.length.toLocaleString('bn-BD')}টি</strong> • ক্যাটাগরিভিত্তিক তালিকা
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কোর্স বা শিক্ষকের নাম খুঁজুন..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              মুছুন
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills: Visible directly in front of eyes on mobile, NO horizontal swiping */}
      {categories.length > 1 && (
        <div className="bg-white/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border border-rose-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
            <span>ক্যাটাগরি বেছে নিন:</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                সব ক্যাটাগরি ভিউ
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-200'
                      : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-200 active:bg-rose-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* View Switcher: Category Rows vs Grid (only applicable when viewing all & not searching) */}
      {selectedCategory === 'all' && !search.trim() && (
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-rose-600" />
            <span>
              {viewMode === 'categories' ? 'ক্যাটাগরিভিত্তিক ভিউ (ডিফল্ট)' : 'সকল কোর্স গ্রিড ভিউ'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'categories' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ক্যাটাগরিভিত্তিক</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>একসাথে সব</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {/* CASE 1: Single category selected or user searching */}
      {selectedCategory !== 'all' || search.trim() ? (
        <div>
          {filteredCourses.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                <span>
                  {search.trim()
                    ? `অনুসন্ধানের ফলাফল: "${search}" (${filteredCourses.length}টি)`
                    : `${categories.find((c) => c.id === selectedCategory)?.label || 'ক্যাটাগরি'} (${filteredCourses.length}টি কোর্স)`}
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearch('');
                  }}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  সব দেখুন
                </button>
              </div>
              {/* 2 columns on Mobile, 3 on Tablet, 4 on Desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto space-y-3 my-6">
              <BookOpen className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">কোনো কোর্স পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">অন্য কোনো নাম দিয়ে সার্চ করুন অথবা ফিল্টার পরিবর্তন করুন।</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearch('');
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                সকল কোর্স দেখুন
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'categories' ? (
        /* CASE 2: DEFAULT VIEW - CATEGORY BY CATEGORY SECTIONS */
        <div className="space-y-6 sm:space-y-8">
          {activeCategoryGroups.map((group) => (
            <section
              key={group.id}
              className="bg-white/80 rounded-2xl sm:rounded-3xl border border-rose-100/80 p-3.5 sm:p-5 shadow-xs space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                    {group.name}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {group.courses.length}টি কোর্স
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategory(group.id as CourseCategory)}
                  className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  শুধু এই ক্যাটাগরি
                </button>
              </div>

              {/* Course Grid inside category: 2 columns on Mobile, 3 on Tablet, 4 on Desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pt-1">
                {group.courses.map((course) => (
                  <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* CASE 3: Optional flat grid view of all courses */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pt-1">
          {allActiveCourses.map((course) => (
            <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
