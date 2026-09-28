import React from 'react';
import { BookOpen, Sparkles, Award } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { CustomCategory, SiteResource, BlogPost } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { siteSettings, categories, resources, blogPosts } = useCourseContext();

  const openWhatsApp = () => {
    window.open(
      getWhatsAppUrl(siteSettings.whatsappNumber, 'আসসালামু আলাইকুম, ১০ মিনিট স্কুল কোর্সের পরামর্শ চাই।'),
      '_blank'
    );
  };

  const getCategoryPath = (cat: CustomCategory): string => {
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

  const handleResourceClick = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(url);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t-2 border-rose-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
              <img
                src={siteSettings.logoUrl}
                alt="10MS Course Shop"
                className="h-10 w-auto bg-white p-1 rounded-lg"
              />
              <span className="font-extrabold text-xl text-white">
                10ms<span className="text-rose-500">course</span>.shop
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ১০ মিনিট স্কুলের সকল একাডেমিক, ভর্তি ও স্কিল কোর্সের অফিসিয়াল ডিসকাউন্ট অফার, স্পেশাল প্রোমো কোড ও দ্রুততম এনরোলমেন্টের নির্ভরযোগ্য ডিরেক্টরি।
            </p>
            <div className="pt-1">
              <button
                onClick={openWhatsApp}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#1ebd5b] text-white rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>WhatsApp হেল্পলাইন</span>
              </button>
            </div>
          </div>

          {/* Dynamic Categories: Auto-syncs whenever user adds, edits or removes categories! */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>ক্যাটাগরি</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories.map((cat: CustomCategory) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(getCategoryPath(cat))}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-left block"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Resources & Blogs: Auto-syncs whenever user adds blogs or resources! */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>রিসোর্স ও পেজ</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {/* Dynamic Resources */}
              {resources.map((res: SiteResource) => (
                <li key={res.id}>
                  <button
                    onClick={() => handleResourceClick(res.url)}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-left block"
                  >
                    {res.title}
                  </button>
                </li>
              ))}

              {/* Dynamic Recent Blogs */}
              {blogPosts.slice(0, 3).map((post: BlogPost) => (
                <li key={post.id}>
                  <button
                    onClick={() => onNavigate(`/blog/${post.slug}`)}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-left block line-clamp-1 text-slate-300 hover:text-rose-400"
                    title={post.title}
                  >
                    📝 {post.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" />
              <span>ডিসক্লেমার</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              10mscourse.shop একটি স্বাধীন অ্যাফিলিয়েট পার্টনার প্ল্যাটফর্ম। "কোর্স কিনুন" বাটনে ক্লিক করলে সরাসরি 10 Minute School-এর অফিশিয়াল সিস্টেমে নিয়ে যাওয়া হবে।
            </p>
          </div>
        </div>

        {/* Bottom copyright row with hidden admin dot */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} 10mscourse.shop — সর্বস্বত্ব সংরক্ষিত।</p>
          
          {/* Secret tiny dot for Admin Panel */}
          <button
            onClick={() => onNavigate('/adminpanelofficial')}
            className="w-2.5 h-2.5 rounded-full bg-slate-800 hover:bg-slate-600 transition-colors cursor-pointer"
            title=""
            aria-label=""
          ></button>
        </div>
      </div>
    </footer>
  );
};
