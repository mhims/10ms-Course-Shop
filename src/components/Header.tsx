import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ChevronRight, Menu, Home, BookOpen, GraduationCap } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { Course } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { siteSettings, courses, categories, getEffectivePrice } = useCourseContext();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const getCategoryPath = (cat: { id: string; name: string }): string => {
    const directRoutes: Record<string, string> = {
      'class-6': '/class-6',
      'class-7': '/class-7',
      'class-8': '/class-8',
      'class-6-8': '/class-6-8',
      'class-9-10': '/class-9-10',
      'hsc': '/hsc',
      'admission': '/admission',
      'skills': '/skills',
      'spoken-english': '/spoken-english',
      'job-prep': '/job-prep',
    };
    if (directRoutes[cat.id]) return directRoutes[cat.id];
    return `/courses`;
  };

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live matched search results (up to 5 instant results)
  const searchResults: Course[] = searchQuery.trim()
    ? courses
        .filter((c) => {
          const q = searchQuery.toLowerCase().trim();
          return (
            c.title.toLowerCase().includes(q) ||
            c.englishTitle.toLowerCase().includes(q) ||
            (c.instructor && c.instructor.toLowerCase().includes(q)) ||
            c.seoKeywords.some((k) => k.toLowerCase().includes(q)) ||
            c.slug.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const handleSelectSearchResult = (slug: string) => {
    onNavigate(`/${slug}`);
    setIsSearchFocused(false);
    onSearchChange('');
  };

  const navigateAndClose = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const openWhatsApp = () => {
    window.open(
      getWhatsAppUrl(siteSettings.whatsappNumber, 'আসসালামু আলাইকুম, ১০ মিনিট স্কুল কোর্সের পরামর্শ চাই।'),
      '_blank'
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo - Top Left Logo Banner */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center cursor-pointer select-none shrink-0 py-1 hover:opacity-95 transition-opacity"
          >
            <img
              src="https://res.cloudinary.com/drvyjj7td/image/upload/v1790516284/10msshop_knpcl3.png"
              alt="10MS Course Shop"
              className="h-8 sm:h-9 md:h-10 w-auto max-w-[170px] sm:max-w-[220px] object-contain"
            />
          </div>

          {/* Instant Working Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xs sm:max-w-md relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="কোর্স বা বিষয় খুঁজুন..."
                className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-2 sm:top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Matching Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-50 animate-in fade-in duration-150">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    <div className="p-2 bg-rose-50/50 text-[11px] font-bold text-rose-700 flex justify-between">
                      <span>ম্যাচিং কোর্সসমূহ ({searchResults.length}টি)</span>
                      <span>ট্যাপ করুন</span>
                    </div>
                    {searchResults.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => handleSelectSearchResult(course.slug)}
                        className="p-2.5 sm:p-3 hover:bg-rose-50/60 transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={course.imageUrl}
                            alt=""
                            className="w-9 h-7 rounded-lg object-cover shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {course.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">{course.instructor}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-black text-rose-600">
                            ৳{getEffectivePrice(course).toLocaleString('bn-BD')}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 inline ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    "{searchQuery}" এর সাথে কোনো কোর্স পাওয়া যায়নি।
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clean PC Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-rose-600 transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-rose-600 font-bold' : ''
              }`}
            >
              হোম
            </button>
            {categories.slice(0, 5).map((cat) => {
              const path = getCategoryPath(cat);
              const isActive = currentPath === path;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate(path)}
                  className={`hover:text-rose-600 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive ? 'text-rose-600 font-bold' : ''
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            <button
              onClick={() => onNavigate('/courses')}
              className={`hover:text-rose-600 transition-colors cursor-pointer ${
                currentPath === '/courses' || currentPath === '/all-courses' ? 'text-rose-600 font-bold' : ''
              }`}
            >
              সকল কোর্স
            </button>
            <button
              onClick={() => onNavigate('/blog')}
              className={`hover:text-rose-600 transition-colors cursor-pointer ${
                currentPath === '/blog' || currentPath.startsWith('/blog/') ? 'text-rose-600 font-bold' : ''
              }`}
            >
              ব্লগ
            </button>
          </nav>

          {/* Actions: WhatsApp + Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1ebd5b] rounded-full transition-colors cursor-pointer shadow-xs"
              title="হোয়াটসঅ্যাপে সাহায্য পান"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200 active:scale-95 flex items-center justify-center shrink-0"
              aria-label="মোবাইল মেনু"
              aria-expanded={isMobileMenuOpen}
              title="মেনু"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu rendered via portal into document.body to escape header backdrop-filter constraints */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] lg:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside
            className="relative w-[300px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200"
          >
            {/* Header of Drawer */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <img
                  src="https://res.cloudinary.com/drvyjj7td/image/upload/v1790516284/10msshop_knpcl3.png"
                  alt="10MS Shop"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                aria-label="মেনু বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links Section */}
            <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                মেনু ব্রাউজ করুন
              </div>

              <button
                type="button"
                onClick={() => navigateAndClose('/')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                  currentPath === '/' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-rose-500" />
                  <span>হোমপেজ</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose('/courses')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                  currentPath === '/courses' || currentPath === '/all-courses' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <span>সকল কোর্স</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigateAndClose('/blog')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                  currentPath === '/blog' || currentPath.startsWith('/blog/') ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <span>পড়াশোনার ব্লগ</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dynamic Categories (All created categories available) */}
              {categories.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    কোর্স ক্যাটাগরি
                  </p>
                  {categories.map((cat) => {
                    const path = getCategoryPath(cat);
                    const isActive = currentPath === path;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => navigateAndClose(path)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                          isActive ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-rose-600" />
                          <span>{cat.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer with WhatsApp Action */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  openWhatsApp();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1ebd5b] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>WhatsApp এ সরাসরি সহায়তা</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                ১০ মিনিট স্কুল অনুমোদিত অ্যাফিলিয়েট পার্টনার সাইট
              </p>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </header>
  );
};
