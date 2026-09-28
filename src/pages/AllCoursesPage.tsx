import React, { useState, useMemo, useEffect } from 'react';
import { useCourseContext } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { Course, CourseCategory } from '../types';
import { Search, BookOpen, PlusCircle } from 'lucide-react';

interface AllCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const AllCoursesPage: React.FC<AllCoursesPageProps> = ({ onNavigate }) => {
  const { courses, categories: customCategories, isCourseExpired } = useCourseContext();
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('all');
  const [search, setSearch] = useState('');

  // Filter valid non-expired courses
  const allActiveCourses = useMemo(() => {
    return courses.filter((c) => !isCourseExpired(c));
  }, [courses, isCourseExpired]);

  // Group active courses by their category dynamically - supports any custom category!
  const activeCategoryGroups = useMemo(() => {
    const groupMap = new Map<string, { id: string; name: string; courses: Course[] }>();

    allActiveCourses.forEach((c) => {
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
  }, [allActiveCourses, customCategories]);

  // Only display categories that actually have active courses
  const categories = useMemo(() => {
    if (allActiveCourses.length === 0 || activeCategoryGroups.length === 0) return [];

    return [
      { id: 'all' as CourseCategory, label: `সকল কোর্স (${allActiveCourses.length})`, shortLabel: 'সকল', count: allActiveCourses.length },
      ...activeCategoryGroups.map((g) => ({
        id: g.id,
        label: `${g.name} (${g.courses.length})`,
        shortLabel: g.name,
        count: g.courses.length,
      })),
    ];
  }, [allActiveCourses.length, activeCategoryGroups]);

  // If selected category has no courses, reset to all
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  // Filtered by category and search
  const filtered = useMemo(() => {
    return allActiveCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        course.category === selectedCategory ||
        course.displayTargets?.includes(selectedCategory);

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
      {/* Title & Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
            <span>১০ মিনিট স্কুলের সকল কোর্স</span>
          </h1>
          <p className="text-xs text-slate-500">
            মোট কোর্স: <strong>{allActiveCourses.length.toLocaleString('bn-BD')}টি</strong>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কোর্স খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Category Filter Pills (2-rows or swipeable) */}
      <div className="overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5 sm:gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Course Grid: 2 columns on Mobile, 3 on Tablet, 4 on Desktop */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pt-1">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-3 my-6">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {search.trim() ? 'কোনো কোর্স পাওয়া যায়নি' : 'শীঘ্রই নতুন কোর্স আসছে'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {search.trim()
              ? 'অন্য নাম দিয়ে সার্চ করে দেখুন অথবা ফিল্টার পরিবর্তন করুন।'
              : '১০ মিনিট স্কুলের সকল একাডেমিক, এডমিশন ও স্কিল কোর্সসমূহ এবং বিশেষ ডিসকাউন্ট অফার শীঘ্রই এখানে প্রকাশিত হবে।'}
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>হোমপেজে ফিরে যান</span>
          </button>
        </div>
      )}
    </div>
  );
};
