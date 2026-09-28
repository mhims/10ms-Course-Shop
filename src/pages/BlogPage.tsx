import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, User, Tag, Sparkles, BookOpen, ChevronRight, Share2 } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { BlogPost } from '../types';

interface BlogPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ slug, onNavigate }) => {
  const { blogPosts, courses } = useCourseContext();
  const [copied, setCopied] = useState(false);

  // If slug is provided, show single post
  const activePost = slug ? blogPosts.find((p) => p.slug === slug || p.id === slug) : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If reading an article
  if (activePost) {
    const recommendedCourses = courses.slice(0, 2);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল ব্লগে ফিরে যান</span>
        </button>

        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-100/80 shadow-md space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-md uppercase tracking-wider">
              {activePost.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
              {activePost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold text-slate-700">{activePost.author}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{activePost.date}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activePost.readTime} পাঠ</span>
              </span>

              <button
                onClick={handleShare}
                className="ml-auto text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={activePost.coverImage}
              alt={activePost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body Content */}
          <div
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: activePost.content }}
          />

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            {activePost.tags.map((t, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                #{t}
              </span>
            ))}
          </div>

          {/* Affiliate Recommendation Box Inside Blog */}
          <div className="p-6 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm sm:text-base">
              <Sparkles className="w-4 h-4" />
              <span>নিবন্ধ সংশ্লিষ্ট ১০ মিনিট স্কুল কোর্স অফার:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate(`/${c.slug}`)}
                  className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-rose-600 font-bold mt-0.5">
                      ফি: ৳{c.offerPrice || c.regularPrice}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Blog list view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">
          ১০ মিনিট স্কুল স্টাডি ব্লগ
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          পড়াশোনা, ক্যারিয়ার ও ভর্তি পরামর্শ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          বোর্ড পরীক্ষায় ভালো রেজাল্ট ও ক্যারিয়ার স্কিল অর্জনের এক্সক্লুসিভ গাইডলাইন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onNavigate(`/blog/${post.slug}`)}
            className="group bg-white rounded-2xl border border-rose-100 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all overflow-hidden flex flex-col cursor-pointer"
          >
            <div className="aspect-16/9 w-full bg-slate-100 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded">
                  {post.category}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{post.author}</span>
                <span>{post.readTime} পাঠ</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
