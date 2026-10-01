import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Eye,
  Edit3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  FileText,
  Tag,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { BlogPost, Course } from '../types';

interface WordPressBlogEditorProps {
  initialBlog: BlogPost;
  isNew: boolean;
  courses: Course[];
  onSave: (blog: BlogPost) => void;
  onClose: () => void;
}

export const WordPressBlogEditor: React.FC<WordPressBlogEditorProps> = ({
  initialBlog,
  isNew,
  courses,
  onSave,
  onClose,
}) => {
  const [blog, setBlog] = useState<BlogPost>({
    ...initialBlog,
    tags: initialBlog.tags || [],
    suggestedCourseIds: initialBlog.suggestedCourseIds || [],
    seoKeywords: initialBlog.seoKeywords || [],
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [tagsRaw, setTagsRaw] = useState((initialBlog.tags || []).join(', '));
  const [seoKeywordsRaw, setSeoKeywordsRaw] = useState((initialBlog.seoKeywords || []).join(', '));
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-calculate read time based on word count
  useEffect(() => {
    const textOnly = blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly ? textOnly.split(' ').length : 0;
    // Average reading speed: 180 words/min
    const minutes = Math.max(1, Math.ceil(words / 180));
    setBlog((prev) => ({
      ...prev,
      readTime: `${minutes} মিনিট`,
    }));
  }, [blog.content]);

  // Auto-generate clean slug from Bengali or English title
  const handleAutoSlug = () => {
    if (!blog.title) return;
    const clean = blog.title
      .trim()
      .toLowerCase()
      .replace(/[\/\?#&+=]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setBlog((prev) => ({ ...prev, slug: clean }));
  };

  // Helper to insert text at current cursor position in textarea
  const insertAtCursor = (before: string, after: string = '', defaultInside: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBlog((prev) => ({ ...prev, content: prev.content + before + defaultInside + after }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultInside;
    const replacement = before + selectedText + after;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    setBlog((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // Insert a Course Suggestion Card shortcode at cursor
  const handleInsertCourse = (course: Course) => {
    insertAtCursor(
      `\n\n<!-- COURSE_SUGGESTION_START -->\n[course-card:${course.slug || course.id}]\n<!-- COURSE_SUGGESTION_END -->\n\n`
    );
    setShowCoursePicker(false);
  };

  // Insert a custom Hyperlink
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let cleanUrl = linkUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const displayText = linkText.trim() || cleanUrl;
    const linkHtml = `<a href="${cleanUrl}"${targetAttr} class="text-rose-600 underline font-bold hover:text-rose-700 transition-colors">${displayText}</a>`;

    insertAtCursor(linkHtml);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Prepare and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!blog.title.trim()) {
      alert('দয়া করে ব্লগের শিরোনাম লিখুন!');
      return;
    }
    if (!blog.slug.trim()) {
      alert('দয়া করে ব্লগের কাস্টম ইউআরএল স্লাগ (slug) লিখুন!');
      return;
    }
    if (!blog.content.trim()) {
      alert('দয়া করে ব্লগের মূল কন্টেন্ট লিখুন!');
      return;
    }

    const parsedTags = tagsRaw
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const parsedKeywords = seoKeywordsRaw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const cleanSlug = blog.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0980-\u09FF-]/g, '-')
      .replace(/-+/g, '-');

    const blogToSave: BlogPost = {
      ...blog,
      slug: cleanSlug,
      tags: parsedTags.length > 0 ? parsedTags : ['১০ মিনিট স্কুল', 'পড়াশোনা'],
      seoKeywords: parsedKeywords.length > 0 ? parsedKeywords : [blog.title, '১০ মিনিট স্কুল কোর্স'],
      seoTitle: blog.seoTitle?.trim() || `${blog.title} | 10MS Blog`,
      seoDescription: blog.seoDescription?.trim() || blog.excerpt || blog.title,
      coverImage:
        blog.coverImage?.trim() ||
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      date: blog.date || new Date().toISOString().split('T')[0],
      author: blog.author?.trim() || '১০ মিনিট স্কুল টিম',
      category: blog.category?.trim() || 'পড়াশোনার গাইডলাইন',
    };

    onSave(blogToSave);
  };

  // Render course preview embed card inside editor preview
  const renderPreviewContent = (rawContent: string) => {
    // Split by course-card shortcode: [course-card:identifier]
    const parts = rawContent.split(/\[course-card:([^\]]+)\]/g);

    return parts.map((part, index) => {
      // Even indexes are normal HTML
      if (index % 2 === 0) {
        return (
          <div
            key={index}
            className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }

      // Odd indexes are course slugs or IDs
      const courseMatch = courses.find((c) => c.slug === part || c.id === part);
      if (!courseMatch) {
        return (
          <div
            key={index}
            className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>সাজেস্টেড কোর্স পাওয়া যায়নি: <strong>{part}</strong></span>
          </div>
        );
      }

      return (
        <div
          key={index}
          className="my-6 p-4 sm:p-5 bg-gradient-to-r from-rose-50/90 to-red-50/90 rounded-2xl border-2 border-rose-200/80 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>নিবন্ধের সুপারিশকৃত কোর্স</span>
            </span>
            {courseMatch.promoCode && (
              <span className="text-xs font-bold text-slate-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                প্রোমো কোড: <strong className="font-mono text-rose-600">{courseMatch.promoCode}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <img
                src={courseMatch.imageUrl}
                alt={courseMatch.title}
                className="w-16 h-16 rounded-xl object-cover border border-rose-100 shadow-2xs shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                  {courseMatch.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {courseMatch.shortDescription}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 mt-1">
                  <span>৳{courseMatch.offerPrice || courseMatch.regularPrice}</span>
                  {courseMatch.offerPrice > 0 && courseMatch.offerPrice < courseMatch.regularPrice && (
                    <span className="line-through text-slate-400 font-normal">৳{courseMatch.regularPrice}</span>
                  )}
                </div>
              </div>
            </div>

            <a
              href={courseMatch.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>১০ মিনিট স্কুলে ভর্তি হন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full my-4 border border-rose-100 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top WordPress-Style Header Bar */}
        <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isNew ? 'নতুন আর্টিকেল ও গাইডলাইন প্রকাশ' : 'আর্টিকেল সম্পাদনা ও এসইও অপটিমাইজেশন'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>ওয়ার্ডপ্রেস স্টাইল রিচ এডিটর</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">10mscourse.shop/blog/</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'editor' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>এডিটর</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>লাইভ প্রিভিউ</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isNew ? 'প্রকাশ করুন' : 'আপডেট করুন'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Body: Left Content Area + Right WordPress Settings Sidebar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Writing Canvas (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeTab === 'editor' ? (
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    required
                    value={blog.title}
                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                    placeholder="ব্লগের শিরোনাম লিখুন (যেমন: ঘরে বসে Spoken English শেখার সহজ নিয়ম)..."
                    className="w-full text-xl sm:text-2xl font-black text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 px-1 py-1"
                  />
                </div>

                {/* Custom Permalink (URL Slug) Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 font-mono text-slate-600 overflow-hidden">
                    <span className="text-slate-400 shrink-0">10mscourse.shop/blog/</span>
                    <input
                      type="text"
                      required
                      value={blog.slug}
                      onChange={(e) => setBlog({ ...blog, slug: e.target.value })}
                      placeholder="custom-slug"
                      className="bg-white px-2 py-1 border border-slate-300 rounded-lg text-rose-600 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 w-full max-w-[240px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    টাইটেল থেকে লিঙ্ক জেনারেট
                  </button>
                </div>

                {/* WordPress-like Rich Visual Toolbar */}
                <div className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-xs p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1 shadow-2xs">
                  {/* Headings */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<h2>', '</h2>', 'এখানে মূল শিরোনাম লিখুন')}
                      className="px-2 py-1 text-xs font-black text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<h3>', '</h3>', 'উপ-শিরোনাম')}
                      className="px-2 py-1 text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<h4>', '</h4>', 'ছোট শিরোনাম')}
                      className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 4"
                    >
                      H4
                    </button>
                  </div>

                  {/* Formatting: Bold, Italic, Strikethrough */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<strong>', '</strong>', 'বোল্ড টেক্সট')}
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="বোল্ড (Bold)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<em>', '</em>', 'ইটালিক টেক্সট')}
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="ইটালিক (Italic)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        insertAtCursor(
                          '<ul>\n  <li>',
                          '</li>\n  <li>২য় পয়েন্ট</li>\n  <li>৩য় পয়েন্ট</li>\n</ul>',
                          '১ম পয়েন্ট'
                        )
                      }
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="বুলেট পয়েন্ট তালিকা"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertAtCursor(
                          '<ol>\n  <li>',
                          '</li>\n  <li>২য় ধাপ</li>\n  <li>৩য় ধাপ</li>\n</ol>',
                          '১ম ধাপ'
                        )
                      }
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="নম্বর তালিকা"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quotes & Divider */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        insertAtCursor(
                          '<blockquote class="border-l-4 border-rose-500 pl-4 py-1 italic text-slate-700 bg-rose-50/50 rounded-r-xl">\n  ',
                          '\n</blockquote>',
                          'গুরুত্বপূর্ণ উক্তি বা পরামর্শ এখানে লিখুন'
                        )
                      }
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="কোটেশন ব্লক"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n<hr class="my-6 border-slate-200" />\n')}
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="ডিভাইডার দাগ"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Link Insertion */}
                  <button
                    type="button"
                    onClick={() => {
                      const sel = textareaRef.current
                        ? textareaRef.current.value.substring(
                            textareaRef.current.selectionStart,
                            textareaRef.current.selectionEnd
                          )
                        : '';
                      setLinkText(sel);
                      setShowLinkModal(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="টেক্সটে লিঙ্ক যুক্ত করুন"
                  >
                    <Link2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>লিঙ্ক যুক্ত করুন</span>
                  </button>

                  {/* Course Suggestion Card Embedder */}
                  <button
                    type="button"
                    onClick={() => setShowCoursePicker(true)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="লেখার মাঝে কোর্স কার্ড সাজেস্ট করুন"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>কোর্স কার্ড সাজেস্ট করুন</span>
                  </button>

                  {/* Highlight Callout Box */}
                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor(
                        '<div class="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-slate-800 text-sm font-medium">\n  <strong class="text-rose-600">বিশেষ টিপস:</strong> ',
                        '\n</div>',
                        'এখানে আপনার বিশেষ কোনো উপদেশ বা ঘোষণা লিখুন...'
                      )
                    }
                    className="px-2 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="হাইলাইট বক্স"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>টিপস বক্স</span>
                  </button>
                </div>

                {/* Content Textarea */}
                <div>
                  <textarea
                    ref={textareaRef}
                    required
                    rows={16}
                    value={blog.content}
                    onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                    placeholder="এখানে আপনার ব্লগের সম্পূর্ণ বিষয়বস্তু লিখুন... আপনি প্যারাগ্রাফ, হেডিং, বুলেট পয়েন্ট এবং কোর্স লিঙ্ক স্বাধীনভাবে ব্যবহার করতে পারেন।"
                    className="w-full p-4 border border-slate-200 rounded-2xl font-sans text-sm sm:text-base leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                    <span>শব্দ সংখ্যা: {blog.content ? blog.content.split(/\s+/).filter(Boolean).length : 0}টি</span>
                    <span>পাঠের আনুমানিক সময়: {blog.readTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Preview Canvas */
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-md uppercase tracking-wider">
                    {blog.category || 'ক্যাটাগরি'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                    {blog.title || 'শিরোনামহীন আর্টিকেল'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold text-slate-700">{blog.author || '১০ মিনিট স্কুল টিম'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{blog.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{blog.readTime} পাঠ</span>
                    </span>
                  </div>
                </div>

                {blog.coverImage && (
                  <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="pt-2">
                  {renderPreviewContent(blog.content)}
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {blog.tags.map((t, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right WordPress Settings Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Article Essentials (লেখক, ক্যাটাগরি, তারিখ) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>আর্টিকেল তথ্য ও পাবলিশ সেটিংস</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি *</label>
                <input
                  type="text"
                  required
                  value={blog.category}
                  onChange={(e) => setBlog({ ...blog, category: e.target.value })}
                  placeholder="যেমন: পড়াশোনার গাইডলাইন, স্পোকেন ইংলিশ, এসএসসি..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">লেখক / মেন্টর নাম</label>
                <input
                  type="text"
                  value={blog.author}
                  onChange={(e) => setBlog({ ...blog, author: e.target.value })}
                  placeholder="১০ মিনিট স্কুল টিম"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রকাশের তারিখ</label>
                <input
                  type="date"
                  value={blog.date}
                  onChange={(e) => setBlog({ ...blog, date: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Excerpt) *</label>
                <textarea
                  rows={2}
                  required
                  value={blog.excerpt}
                  onChange={(e) => setBlog({ ...blog, excerpt: e.target.value })}
                  placeholder="ব্লগ কার্ডে প্রদর্শনের জন্য ২-৩ লাইনের আকর্ষণীয় সারসংক্ষেপ..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Featured Cover Image */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <ImageIcon className="w-4 h-4 text-rose-600" />
                <span>ফিচার্ড কভার ইমেজ</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইমেজ লিঙ্ক (Image URL)</label>
                <input
                  type="text"
                  value={blog.coverImage}
                  onChange={(e) => setBlog({ ...blog, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              {blog.coverImage && (
                <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={blog.coverImage}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              )}
            </div>

            {/* 3. Tags (ট্যাগ দেওয়ার অপশন) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Tag className="w-4 h-4 text-rose-600" />
                <span>ট্যাগসমূহ (Tags)</span>
              </h4>

              <div>
                <input
                  type="text"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="কমা দিয়ে লিখুন: SSC 2026, স্পোকেন ইংলিশ, টিপস..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  কমা (,) দিয়ে আলাদা করুন। যেমন: SSC 2026, 10MS, মুনজেরিন শহীদ
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsRaw
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10.5px] font-bold border border-rose-100"
                    >
                      #{t}
                    </span>
                  ))}
              </div>
            </div>

            {/* 4. Google Search & SEO Grounding (গুগল সার্চ ও এসইও অপটিমাইজেশন) */}
            <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-5 border-2 border-rose-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-rose-600" />
                  <span>গুগল সার্চ ও এসইও (Google SEO)</span>
                </h4>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google Grounded
                </span>
              </div>

              {/* Google SERP Snippet Preview */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  গুগল সার্চে যেমন দেখাবে:
                </span>
                <p className="text-xs text-emerald-700 font-mono truncate">
                  https://10mscourse.shop/blog/{blog.slug || 'custom-slug'}
                </p>
                <h5 className="text-sm font-bold text-blue-800 line-clamp-1 hover:underline cursor-pointer">
                  {blog.seoTitle || blog.title || 'ব্লগের এসইও টাইটেল'}
                </h5>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {blog.seoDescription || blog.excerpt || 'গুগল সার্চ রেজাল্টে প্রদর্শিত বিবরণ...'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">এসইও টাইটেল (SEO Title)</label>
                  <span className="text-[10px] text-slate-400">
                    {(blog.seoTitle || blog.title).length}/60 অক্ষর
                  </span>
                </div>
                <input
                  type="text"
                  value={blog.seoTitle || ''}
                  onChange={(e) => setBlog({ ...blog, seoTitle: e.target.value })}
                  placeholder={blog.title || 'গুগল রেজাল্টের শিরোনাম...'}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">মেটা ডেসক্রিপশন (SEO Snippet)</label>
                  <span className="text-[10px] text-slate-400">
                    {(blog.seoDescription || blog.excerpt).length}/160 অক্ষর
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={blog.seoDescription || ''}
                  onChange={(e) => setBlog({ ...blog, seoDescription: e.target.value })}
                  placeholder={blog.excerpt || 'গুগল সার্চে যে ১-২ লাইনের বিবরণ দেখাবে...'}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গুগলে কী কী সার্চ করলে এই আর্টিকেল আসবে? (SEO Keywords)
                </label>
                <input
                  type="text"
                  value={seoKeywordsRaw}
                  onChange={(e) => setSeoKeywordsRaw(e.target.value)}
                  placeholder="যেমন: এসএসসি প্রস্তুতি, 10MS ক্র্যাশ কোর্স, ঘরে বসে ইংরেজি, মুনজেরিন শহীদ..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl"
                />
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  কমা (,) দিয়ে কি-ওয়ার্ডগুলো লিখুন। গুগল ও এআই সার্চ ইঞ্জিনগুলো এই শব্দগুলো দিয়ে সাইট র‍্যাঙ্ক করবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Course Suggestion Picker */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-rose-200 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  লেখার মাঝখানে কোর্স কার্ড সাজেস্ট করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCoursePicker(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              নিচের যে কোর্সটি সিলেক্ট করবেন, সেটি রিডারদের পড়ার সুবিধার জন্য আর্টিকেলের ঠিক বর্তমান স্থানে সুন্দর কার্ড আকারে প্রদর্শিত হবে:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleInsertCourse(c)}
                  className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 truncate">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                        ফি: ৳{c.offerPrice || c.regularPrice} {c.promoCode && `• কোড: ${c.promoCode}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-xl border border-rose-200 shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    + যোগ করুন
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCoursePicker(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Modal: Hyperlink Inserter */}
      {showLinkModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleInsertLink}
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  টেক্সটে লিঙ্ক যুক্ত করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  যে লেখার উপর ক্লিক করা যাবে (Display Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="যেমন: ১০ মিনিট স্কুল কোর্স লিঙ্কে ক্লিক করুন"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  গন্তব্য লিঙ্ক / ইউআরএল (Target URL) *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://10minuteschool.com/... বা /courses"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>নতুন ট্যাবে ওপেন হবে (Open in new tab)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer text-xs"
              >
                লিঙ্ক যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
