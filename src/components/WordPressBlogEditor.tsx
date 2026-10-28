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
  Zap,
  Rocket,
  FileText,
  Tag,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  FolderPlus,
  Clipboard,
  Wand2,
} from 'lucide-react';
import { BlogPost, Course, CustomCategory } from '../types';
import { convertHtmlToFormattedMarkdown } from '../utils/formatConverter';
import { BlogCourseCarousel } from './BlogCourseCarousel';
import { parseRichBlogContent, resolveBlogRecommendedCourses } from '../utils/blogEmbedHelper';
import { formatBlogContentToHtml, beautifyBlogEditorContent } from '../utils/blogFormatter';

interface WordPressBlogEditorProps {
  initialBlog: BlogPost;
  isNew: boolean;
  courses: Course[];
  categories?: CustomCategory[];
  onSave: (blog: BlogPost, pushDirectly?: boolean) => void;
  onClose: () => void;
}

export const WordPressBlogEditor: React.FC<WordPressBlogEditorProps> = ({
  initialBlog,
  isNew,
  courses,
  categories = [],
  onSave,
  onClose,
}) => {
  const [blog, setBlog] = useState<BlogPost>({
    ...initialBlog,
    tags: initialBlog.tags || [],
    suggestedCourseIds: initialBlog.suggestedCourseIds || [],
    seoKeywords: initialBlog.seoKeywords || [],
    courseRecommendationType: initialBlog.courseRecommendationType || 'latest',
    courseRecommendationCount: initialBlog.courseRecommendationCount || 3,
    courseRecommendationCategory: initialBlog.courseRecommendationCategory || categories[0]?.id || '',
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [tagsRaw, setTagsRaw] = useState((initialBlog.tags || []).join(', '));
  const [seoKeywordsRaw, setSeoKeywordsRaw] = useState((initialBlog.seoKeywords || []).join(', '));
  
  // Course Embed Picker Modal State
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [coursePickerTab, setCoursePickerTab] = useState<'latest' | 'category' | 'specific'>('latest');
  const [embedLatestCount, setEmbedLatestCount] = useState<number>(3);
  const [embedCategory, setEmbedCategory] = useState<string>(categories[0]?.id || 'hsc');
  const [embedCategoryCount, setEmbedCategoryCount] = useState<number | 'all'>('all');
  const [courseSearch, setCourseSearch] = useState('');

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

  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Auto-preserve headings (H1, H2, H3), bold, lists, and links on paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    const plainData = e.clipboardData.getData('text/plain');

    if (
      htmlData &&
      (/<h[1-6]/i.test(htmlData) ||
        /<strong|<b\b/i.test(htmlData) ||
        /<ul|<ol|<li/i.test(htmlData) ||
        /<blockquote/i.test(htmlData) ||
        /msoheading|heading/i.test(htmlData) ||
        /<a\s+href/i.test(htmlData) ||
        /font-size:\s*(1[6-9]|2\d|3\d)p[xt]/i.test(htmlData))
    ) {
      e.preventDefault();
      const formatted = convertHtmlToFormattedMarkdown(htmlData, plainData);
      insertAtCursor(formatted);

      setPasteNotice('✨ কপি করা হেডার (H1, H2), বোল্ড ও লিস্ট ফরম্যাটসহ স্বয়ংক্রিয়ভাবে পেস্ট হয়েছে!');
      setTimeout(() => setPasteNotice(null), 4000);
      return;
    }
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

  // 1. Insert a Single Course Suggestion Card shortcode at cursor
  const handleInsertCourse = (course: Course) => {
    insertAtCursor(
      `\n\n<!-- COURSE_SUGGESTION_START -->\n[course-card:${course.slug || course.id}]\n<!-- COURSE_SUGGESTION_END -->\n\n`
    );
    setShowCoursePicker(false);
  };

  // 2. Insert Latest Courses (1-5) carousel shortcode at cursor
  const handleInsertLatestCourses = (count: number) => {
    insertAtCursor(
      `\n\n<!-- LATEST_COURSES_CAROUSEL_START -->\n[courses-latest count="${count}"]\n<!-- LATEST_COURSES_CAROUSEL_END -->\n\n`
    );
    setShowCoursePicker(false);
  };

  // 3. Insert Category Dynamic Courses carousel shortcode at cursor
  const handleInsertCategoryCourses = (categoryId: string, count: number | 'all') => {
    insertAtCursor(
      `\n\n<!-- CATEGORY_COURSES_CAROUSEL_START -->\n[courses-category category="${categoryId}" count="${count}"]\n<!-- CATEGORY_COURSES_CAROUSEL_END -->\n\n`
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

  // 1-Click Auto SEO and Metadata Optimizer for Blogs
  const handleAutoOptimizeBlog = () => {
    const textOnly = blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Title detection / polish
    let newTitle = blog.title.trim();
    if (!newTitle && textOnly) {
      const firstLine = textOnly.split(/[।\.\n]/)[0]?.trim();
      newTitle = firstLine ? firstLine.slice(0, 80) : 'নতুন ব্লগ আর্টিকেল';
    } else if (!newTitle) {
      newTitle = '১০ মিনিট স্কুল স্টাডি গাইডলাইন ও কোর্স অফার';
    }

    // 2. Clean URL slug
    const cleanSlug = newTitle
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // 3. Excerpt and Meta Description (150-160 chars Google optimal)
    let autoDesc = '';
    if (textOnly && textOnly.length > 25) {
      autoDesc = textOnly.slice(0, 155).trim();
      if (textOnly.length > 155) autoDesc += '...';
    } else {
      autoDesc = `${newTitle} সম্পর্কে গুরুত্বপূর্ণ দিকনির্দেশনা ও পড়াশোনার সহায়ক টিপস। এখনই সম্পূর্ণ লেখাটি পড়ুন ১০ মিনিট স্কুল ব্লগে।`;
    }

    // 4. Image Alt text
    const autoImageAlt = `${newTitle} - ১০ মিনিট স্কুল ব্লগ`;

    // 5. SEO Title
    const autoSeoTitle = `${newTitle} | 10 Minute School Blog - 10mscourse.shop`;

    // 6. Relevant Tags and Keywords
    const defaultTags = ['১০ মিনিট স্কুল', 'পড়াশোনা', 'পরীক্ষার প্রস্তুতি', 'স্টাডি টিপস', newTitle];
    const defaultKeywords = ['১০ মিনিট স্কুল', newTitle, 'অনলাইন শিক্ষা', 'গাইডলাইন', 'পড়াশোনার কৌশল'];

    // 7. Calculate Read Time
    const words = textOnly ? textOnly.split(' ').length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    const autoReadTime = `${minutes} মিনিট`;

    setBlog((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug || cleanSlug,
      excerpt: autoDesc,
      seoDescription: autoDesc,
      seoTitle: autoSeoTitle,
      coverImageAlt: autoImageAlt,
      tags: defaultTags,
      seoKeywords: defaultKeywords,
      readTime: autoReadTime,
      category: prev.category || 'পড়াশোনার গাইডলাইন',
    }));

    setTagsRaw(defaultTags.join(', '));
    setSeoKeywordsRaw(defaultKeywords.join(', '));

    setPasteNotice('⚡ আলহামদুলিল্লাহ! ব্লগের মেটা ডেসক্রিপশন, ইমেজ অল্টার টেক্সট, এসইও টাইটেল ও ট্যাগ স্বয়ংক্রিয়ভাবে তৈরি হয়ে গেছে। নিচে সব ঘর চেক করে নিন।');
    setTimeout(() => setPasteNotice(null), 6000);
  };

  const handleSubmit = (pushDirectly: boolean = false) => {
    if (!blog.title.trim()) {
      alert('দয়া করে ব্লগের একটি শিরোনাম (Title) দিন!');
      return;
    }

    const parsedTags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedKeywords = seoKeywordsRaw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const cleanSlug = blog.slug
      ? blog.slug.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF-]/g, '-').replace(/-+/g, '-')
      : blog.title.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF-]/g, '-').replace(/-+/g, '-');

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
      coverImageAlt: blog.coverImageAlt?.trim() || `${blog.title} - ১০ মিনিট স্কুল ব্লগ`,
      date: blog.date || new Date().toISOString().split('T')[0],
      author: blog.author?.trim() || '১০ মিনিট স্কুল টিম',
      category: blog.category?.trim() || 'পড়াশোনার গাইডলাইন',
    };

    onSave(blogToSave, pushDirectly);
  };

  // 1-Click Beautifier for raw text in editor
  const handleBeautifyContent = () => {
    if (!blog.content.trim()) return;
    const beautified = beautifyBlogEditorContent(blog.content);
    setBlog((prev) => ({ ...prev, content: beautified }));
    setPasteNotice('✨ লেখার প্যারাগ্রাফ ও লাইনগুলো সুন্দরভাবে গোছানো হয়েছে!');
    setTimeout(() => setPasteNotice(null), 4000);
  };

  // Render course preview embed card & carousel inside editor preview
  const renderPreviewContent = (rawContent: string) => {
    const parts = parseRichBlogContent(rawContent, courses, categories);

    return parts.map((part, index) => {
      if (part.type === 'html') {
        const formatted = formatBlogContentToHtml(part.content || '');
        return (
          <div
            key={index}
            className="blog-article-content pt-1"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }

      return (
        <BlogCourseCarousel
          key={index}
          title={part.title}
          badge={part.badge}
          courses={part.courses || []}
          onNavigate={() => {}}
        />
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
              onClick={() => handleSubmit(false)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>{isNew ? 'ড্রাফট সেভ' : 'সেভ করুন'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="পোস্ট করুন ও সরাসরি গিটহাবে পুশ করে মেইন সাইটে লাইভ করুন"
            >
              <Rocket className="w-4 h-4 fill-white text-white" />
              <span>পোস্ট ও সরাসরি লাইভ করুন 🚀</span>
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
                {/* 1-Click Auto SEO & Metadata Optimizer Banner */}
                <div className="p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-2xl border-2 border-rose-200/90 shadow-2xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Zap className="w-4 h-4 fill-white text-white" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <span>১-ক্লিকে অটো এসইও ও মেটা অপটিমাইজেশন</span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Auto SEO
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          লেখা ও ছবির লিংক দিয়ে এই বাটনে চাপলেই টাইটেল, মেটা ডেসক্রিপশন, ইমেজ অল্টার টেক্সট ও ট্যাগ একা একাই বসে যাবে!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoOptimizeBlog}
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>অটো এসইও করুন ⚡</span>
                    </button>
                  </div>
                </div>

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
                      onClick={() => insertAtCursor('\n\n<h2>', '</h2>\n\n', 'এখানে মূল শিরোনাম লিখুন')}
                      className="px-2 py-1 text-xs font-black text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n\n<h3>', '</h3>\n\n', 'উপ-শিরোনাম')}
                      className="px-2 py-1 text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n\n<h4>', '</h4>\n\n', 'ছোট শিরোনাম')}
                      className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Heading 4"
                    >
                      H4
                    </button>
                  </div>

                  {/* Formatting: Bold, Italic */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<strong>', '</strong>', 'বোল্ড টেক্সট')}
                      className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="নির্দিষ্ট কিছু শব্দ বোল্ড করুন"
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
                          '\n\n<ul>\n  <li>',
                          '</li>\n  <li>২য় পয়েন্ট</li>\n  <li>৩য় পয়েন্ট</li>\n</ul>\n\n',
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
                          '\n\n<ol>\n  <li>',
                          '</li>\n  <li>২য় ধাপ</li>\n  <li>৩য় ধাপ</li>\n</ol>\n\n',
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
                          '\n\n<blockquote class="border-l-4 border-rose-500 pl-4 py-2 italic text-slate-700 bg-rose-50/50 rounded-r-xl">\n  <p>',
                          '</p>\n</blockquote>\n\n',
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
                      onClick={() => insertAtCursor('\n\n<hr class="my-6 border-slate-200" />\n\n')}
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
                    <span>লিঙ্ক</span>
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
                        '\n\n<div class="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-slate-800 text-sm font-medium my-4">\n  <strong class="text-rose-600">বিশেষ টিপস:</strong> ',
                        '\n</div>\n\n',
                        'এখানে আপনার বিশেষ কোনো উপদেশ বা ঘোষণা লিখুন...'
                      )
                    }
                    className="px-2 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="টিপস বক্স"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>টিপস বক্স</span>
                  </button>

                  {/* 1-Click Auto Format & Beautify */}
                  <button
                    type="button"
                    onClick={handleBeautifyContent}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ml-auto"
                    title="প্যারাগ্রাফ ও লাইনগুলো সুন্দরভাবে সাজান (Anti-Clutter)"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>লেখা গোছান (Beautify)</span>
                  </button>
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  {pasteNotice && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pasteNotice}</span>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    required
                    rows={16}
                    value={blog.content}
                    onPaste={handlePaste}
                    onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                    placeholder="এখানে আপনার ব্লগের সম্পূর্ণ বিষয়বস্তু লিখুন বা কপি করে পেস্ট করুন...\n\n💡 Google Docs, Word বা অন্য ওয়েবসাইট থেকে কপি করা হেডার ১, ২ ও বোল্ড লেখা এখানে পেস্ট করলেই স্বয়ংক্রিয়ভাবে ফরম্যাট বজায় থাকবে।"
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

                {/* Bottom Course Recommendations Live Preview */}
                {(() => {
                  const { courses: bottomRecCourses, title: bottomTitle, badge: bottomBadge } =
                    resolveBlogRecommendedCourses(blog, courses);
                  if (bottomRecCourses.length === 0) return null;
                  return (
                    <div className="pt-6 border-t border-slate-100">
                      <BlogCourseCarousel
                        title={bottomTitle}
                        badge={bottomBadge}
                        courses={bottomRecCourses}
                        onNavigate={() => {}}
                      />
                    </div>
                  );
                })()}

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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইমেজ অল্টার টেক্সট (Image Alt Text)</label>
                <input
                  type="text"
                  value={blog.coverImageAlt || ''}
                  onChange={(e) => setBlog({ ...blog, coverImageAlt: e.target.value })}
                  placeholder="যেমন: আর্টিকেল কভার ছবি ১০ মিনিট স্কুল"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {blog.coverImage && (
                <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={blog.coverImage}
                    alt={blog.coverImageAlt || blog.title || ''}
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

            {/* 5. Bottom Course Recommendations Setting */}
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-200/90 shadow-xs space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-rose-100">
                <GraduationCap className="w-4 h-4 text-rose-600" />
                <span>আর্টিকেলের নিচে কোর্স রেকমেন্ডেশন</span>
              </h4>

              <div className="space-y-2 text-xs">
                {/* Option 1: Latest Courses */}
                <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="courseRecType"
                    checked={blog.courseRecommendationType === 'latest'}
                    onChange={() => setBlog({ ...blog, courseRecommendationType: 'latest' })}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">লেটেস্ট কোর্স (সর্বশেষ প্রকাশিত)</span>
                    <span className="text-[11px] text-slate-500">সবচেয়ে নতুন ১-৫টি কোর্স স্বয়ংক্রিয় ক্যারোজাল আকারে দেখাবে</span>
                  </div>
                </label>

                {blog.courseRecommendationType === 'latest' && (
                  <div className="pl-6 pt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-bold">কোর্সের সংখ্যা:</span>
                    {[1, 2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setBlog({ ...blog, courseRecommendationCount: cnt })}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          (blog.courseRecommendationCount || 3) === cnt
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Option 2: Category Based Dynamic Sync */}
                <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="courseRecType"
                    checked={blog.courseRecommendationType === 'category'}
                    onChange={() => setBlog({ ...blog, courseRecommendationType: 'category' })}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">ক্যাটাগরি / ব্যাচ অনুযায়ী (অটো-আপডেট)</span>
                    <span className="text-[11px] text-slate-500">ভবিষ্যতে নতুন কোর্স যোগ হলেও অটোমেটিক চলে আসবে</span>
                  </div>
                </label>

                {blog.courseRecommendationType === 'category' && (
                  <div className="pl-6 pt-1 space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ক্যাটাগরি বেছে নিন:</label>
                      <select
                        value={blog.courseRecommendationCategory || categories[0]?.id || ''}
                        onChange={(e) => setBlog({ ...blog, courseRecommendationCategory: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রদর্শন সংখ্যা:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: 1, label: '১টি' },
                          { val: 2, label: '২টি' },
                          { val: 3, label: '৩টি' },
                          { val: 4, label: '৪টি' },
                          { val: 5, label: '৫টি' },
                          { val: 'all', label: 'সকল কোর্স' },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            type="button"
                            onClick={() => setBlog({ ...blog, courseRecommendationCount: opt.val as any })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              (blog.courseRecommendationCount || 'all') === opt.val
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 3: Specific Manual Selection */}
                <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="courseRecType"
                    checked={blog.courseRecommendationType === 'specific'}
                    onChange={() => setBlog({ ...blog, courseRecommendationType: 'specific' })}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">ম্যানুয়ালি নির্দিষ্ট কোর্স নির্বাচন</span>
                    <span className="text-[11px] text-slate-500">নিচের তালিকা থেকে টিকচিহ্ন দিন</span>
                  </div>
                </label>

                {blog.courseRecommendationType === 'specific' && (
                  <div className="pl-6 pt-1 max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {courses.map((c) => {
                      const isChecked = (blog.suggestedCourseIds || []).includes(c.id) || (blog.suggestedCourseIds || []).includes(c.slug);
                      return (
                        <label key={c.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer hover:text-rose-600">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = blog.suggestedCourseIds || [];
                              const updated = e.target.checked
                                ? [...current, c.slug]
                                : current.filter((id) => id !== c.id && id !== c.slug);
                              setBlog({ ...blog, suggestedCourseIds: updated });
                            }}
                            className="rounded text-rose-600"
                          />
                          <span className="truncate">{c.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Option 4: None */}
                <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="courseRecType"
                    checked={blog.courseRecommendationType === 'none'}
                    onChange={() => setBlog({ ...blog, courseRecommendationType: 'none' })}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">কোনো কোর্স দেখাবেন না</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Course & Carousel Inserter with 3 Tabs */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-rose-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  লেখার মধ্যে কোর্স বা ক্যারোজাল যোগ করুন
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

            {/* Modal Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setCoursePickerTab('latest')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coursePickerTab === 'latest' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ১. লেটেস্ট কোর্স (১-৫টি)
              </button>
              <button
                type="button"
                onClick={() => setCoursePickerTab('category')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coursePickerTab === 'category' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ২. ক্যাটাগরি ভিত্তিক
              </button>
              <button
                type="button"
                onClick={() => setCoursePickerTab('specific')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coursePickerTab === 'specific' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ৩. নির্দিষ্ট কোর্স
              </button>
            </div>

            {/* TAB 1: LATEST COURSES (1-5) */}
            {coursePickerTab === 'latest' && (
              <div className="space-y-4 py-2 flex-1">
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-rose-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>লেটেস্ট কোর্স শর্টকোড (অটো-আপডেট ও ক্যারোজাল)</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    এই অপশনটি ব্যবহার করলে ব্লগে সবসময় <strong>সর্বশেষ প্রকাশিত ১-৫টি কোর্স</strong> দেখাবে। ১টির বেশি যুক্ত করলে ফেসবুক অ্যাডসের মতো <strong>বাম থেকে ডানে স্ক্রলেবল ক্যারোজাল</strong> আকারে দেখা যাবে।
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    কয়টি লেটেস্ট কোর্স দেখাতে চান? (১ থেকে ৫টি)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setEmbedLatestCount(cnt)}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer border ${
                          embedLatestCount === cnt
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {cnt}টি {cnt > 1 ? '(ক্যারোজাল)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => handleInsertLatestCourses(embedLatestCount)}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    + আর্টিকেলের এই স্থানে {embedLatestCount}টি লেটেস্ট কোর্স যোগ করুন
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CATEGORY / BATCH DYNAMIC COURSES */}
            {coursePickerTab === 'category' && (
              <div className="space-y-4 py-2 flex-1">
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>ক্যাটাগরি / ব্যাচ ভিত্তিক ডায়নামিক কোর্স</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    নির্দিষ্ট কোনো ব্যাচ বা ক্যাটাগরি বেছে নিন। <strong>ভবিষ্যতে ওই ক্যাটাগরিতে নতুন কোর্স যুক্ত হলেও এখানে আর হাত দিতে হবে না</strong>, স্বয়ংক্রিয়ভাবে ব্লগে চলে আসবে!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কোর্স ক্যাটাগরি / ব্যাচ বেছে নিন:
                  </label>
                  <select
                    value={embedCategory}
                    onChange={(e) => setEmbedCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কয়টি কোর্স দেখাতে চান?
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { val: 1, label: '১টি' },
                      { val: 2, label: '২টি' },
                      { val: 3, label: '৩টি' },
                      { val: 4, label: '৪টি' },
                      { val: 5, label: '৫টি' },
                      { val: 'all', label: 'সকল কোর্স' },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setEmbedCategoryCount(opt.val as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          embedCategoryCount === opt.val
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleInsertCategoryCourses(embedCategory, embedCategoryCount)}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    + এই ক্যাটাগরির কোর্স যোগ করুন ({embedCategoryCount === 'all' ? 'সবগুলো' : `${embedCategoryCount}টি`})
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SPECIFIC MANUAL COURSE SELECTION */}
            {coursePickerTab === 'specific' && (
              <div className="flex-1 overflow-hidden flex flex-col space-y-2">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="কোর্স বা কোড খুঁজুন..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[45vh]">
                  {courses
                    .filter(
                      (c) =>
                        !courseSearch.trim() ||
                        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
                        c.slug.toLowerCase().includes(courseSearch.toLowerCase())
                    )
                    .map((c) => (
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
              </div>
            )}

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
