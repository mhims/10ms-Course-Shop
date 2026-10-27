import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  Sparkles,
  BookOpen,
  ChevronRight,
  Share2,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  Check,
  Search,
  PlusCircle
} from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { BlogPost, Course } from '../types';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { BlogCourseCarousel } from '../components/BlogCourseCarousel';
import { parseRichBlogContent, resolveBlogRecommendedCourses } from '../utils/blogEmbedHelper';

interface BlogPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ slug, onNavigate }) => {
  const { blogPosts, courses, categories: customCategories, siteSettings } = useCourseContext();
  const [copied, setCopied] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('all');

  // If slug is provided, find single post
  const activePost = slug
    ? blogPosts.find((p) => p.slug === slug || p.id === slug)
    : null;

  // Sync SEO Title, Meta tags, and Schema.org BlogPosting for search engine ranking
  useEffect(() => {
    if (activePost) {
      const pageTitle = activePost.seoTitle || `${activePost.title} | 10MS Blog`;
      document.title = pageTitle;

      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', activePost.seoDescription || activePost.excerpt);
      }

      // Canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', `https://10mscourse.shop/blog/${activePost.slug}`);
      }

      // Schema.org BlogPosting Structured Data
      const schemaScriptId = 'blog-post-schema-jsonld';
      let existingSchema = document.getElementById(schemaScriptId);
      if (!existingSchema) {
        existingSchema = document.createElement('script');
        existingSchema.id = schemaScriptId;
        existingSchema.setAttribute('type', 'application/ld+json');
        document.head.appendChild(existingSchema);
      }

      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': activePost.title,
        'description': activePost.seoDescription || activePost.excerpt,
        'image': [activePost.coverImage],
        'datePublished': activePost.date,
        'dateModified': activePost.date,
        'author': {
          '@type': 'Person',
          'name': activePost.author,
        },
        'publisher': {
          '@type': 'Organization',
          'name': '10MS Course Shop',
          'url': 'https://10mscourse.shop',
          'logo': {
            '@type': 'ImageObject',
            'url': siteSettings.logoUrl,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://10mscourse.shop/blog/${activePost.slug}`,
        },
        'keywords': (activePost.seoKeywords || activePost.tags || []).join(', '),
      };

      existingSchema.textContent = JSON.stringify(schemaData);

      return () => {
        document.title = '10MS Course Shop - ১০ মিনিট স্কুল কোর্স ও অফার';
        const s = document.getElementById(schemaScriptId);
        if (s) s.remove();
      };
    } else {
      document.title = '১০ মিনিট স্কুল স্টাডি গাইডলাইন ও ব্লগ | 10mscourse.shop';
    }
  }, [activePost, siteSettings]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render article content with rich embed shortcodes (cards & carousels)
  const renderRichContent = (contentString: string) => {
    const parts = parseRichBlogContent(contentString, courses, customCategories);

    return parts.map((part, index) => {
      if (part.type === 'html') {
        return (
          <div
            key={index}
            className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 pt-1"
            dangerouslySetInnerHTML={{ __html: part.content || '' }}
          />
        );
      }

      // Course card, latest carousel, or category carousel
      return (
        <BlogCourseCarousel
          key={index}
          title={part.title}
          badge={part.badge}
          courses={part.courses || []}
          onNavigate={onNavigate}
        />
      );
    });
  };

  // 1. Single Blog View
  if (activePost) {
    // Resolve dynamic recommended courses (latest, category-synced, or manual)
    const { courses: recommendedCourses, title: recommendedTitle, badge: recommendedBadge } =
      resolveBlogRecommendedCourses(activePost, courses);

    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${activePost.title}\n\nপড়ুন 10MS Course Shop ব্লগে:\nhttps://10mscourse.shop/blog/${activePost.slug}`
    )}`;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
        {/* Breadcrumb / Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/blog')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল আর্টিকেলে ফিরে যান</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            10mscourse.shop/blog/{activePost.slug}
          </span>
        </div>

        <article className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-rose-100/90 shadow-md space-y-8">
          {/* Article Header */}
          <div className="space-y-4">
            <span className="inline-block text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-rose-100">
              {activePost.category}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug tracking-tight">
              {activePost.title}
            </h1>

            {/* Author, Date, Reading Time & Social Share */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-bold text-slate-700">{activePost.author}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePost.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePost.readTime} পাঠ</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>শেয়ার</span>
                </a>

                <button
                  onClick={handleShare}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'লিঙ্ক কপি হয়েছে' : 'কপি লিঙ্ক'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Cover Image */}
          {activePost.coverImage && (
            <div className="aspect-16/9 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={activePost.coverImage}
                alt={activePost.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          )}

          {/* Main Content with Course Embedding & Hyperlinks */}
          <div className="pt-2">
            {renderRichContent(activePost.content)}
          </div>

          {/* Tags */}
          {activePost.tags && activePost.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              {activePost.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-default"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Dynamic Recommended 10MS Courses Carousel at Bottom */}
          {recommendedCourses.length > 0 && (
            <BlogCourseCarousel
              title={recommendedTitle}
              badge={recommendedBadge}
              courses={recommendedCourses}
              onNavigate={onNavigate}
            />
          )}
        </article>
      </div>
    );
  }

  // 2. Blog List View (/blog)
  const filteredBlogs = blogPosts.filter((post) => {
    const matchesSearch =
      blogSearch === '' ||
      post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(blogSearch.toLowerCase())));

    const matchesCategory =
      selectedBlogCategory === 'all' || post.category === selectedBlogCategory;

    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(new Set(blogPosts.map((b) => b.category).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Blog Directory Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3.5 py-1 rounded-full border border-rose-100">
          ১০ মিনিট স্কুল স্টাডি ব্লগ ও গাইডলাইন
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          পড়াশোনা, ক্যারিয়ার ও ভর্তি পরামর্শ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          বোর্ড পরীক্ষায় গোল্ডেন এ+ অর্জন, ভর্তি পরীক্ষা এবং ক্যারিয়ার স্কিল শেখার এক্সক্লুসিভ গাইডলাইন ও কোর্স অফার
        </p>
      </div>

      {/* Filter and Search Bar if blogs exist */}
      {blogPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={blogSearch}
              onChange={(e) => setBlogSearch(e.target.value)}
              placeholder="আর্টিকেল সার্চ করুন..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            />
          </div>

          {allCategories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedBlogCategory('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  selectedBlogCategory === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300'
                }`}
              >
                সকল
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedBlogCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedBlogCategory === cat
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blog Cards Grid or Clean Empty State */}
      {blogPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-16 text-center shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            শীঘ্রই নতুন স্টাডি গাইডলাইন আসছে
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            ১০ মিনিট স্কুলের সকল কোর্সের প্রস্তুতি কৌশল ও ক্যারিয়ার পরামর্শমূলক আর্টিকেল শীঘ্রই প্রকাশিত হবে।
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/courses')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              সকল কোর্স দেখুন
            </button>
            <button
              onClick={() => onNavigate('/adminpanelofficial')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>এডমিন প্যানেলে ব্লগ লিখুন</span>
            </button>
          </div>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          কোনো আর্টিকেল পাওয়া যায়নি। অন্য কোনো শব্দ দিয়ে সার্চ করে দেখুন।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="group bg-white rounded-3xl border border-rose-100 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="aspect-16/9 w-full bg-slate-100 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-rose-100">
                    {post.category}
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <User className="w-3 h-3 text-rose-500" />
                    <span>{post.author}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
