import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  GraduationCap,
  Sparkles,
  Eye,
  Edit3,
  HelpCircle,
  Search,
  CheckCircle2,
  ExternalLink,
  X,
  FileText,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Course } from '../types';

interface CourseDescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
  courseTitle: string;
  courseSlug: string;
  seoKeywords: string[];
  allCourses?: Course[];
}

export const CourseDescriptionEditor: React.FC<CourseDescriptionEditorProps> = ({
  value,
  onChange,
  courseTitle,
  courseSlug,
  seoKeywords = [],
  allCourses = [],
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showSnippetPreview, setShowSnippetPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown/HTML at current cursor selection
  const insertAtCursor = (before: string, after: string = '', defaultInside: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + before + defaultInside + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultInside;
    const replacement = before + selectedText + after;

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 40);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let cleanUrl = linkUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const displayText = linkText.trim() || cleanUrl;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const linkHtml = `<a href="${cleanUrl}"${targetAttr} class="text-rose-600 underline font-bold hover:text-rose-700 transition-colors">${displayText}</a>`;

    insertAtCursor(linkHtml);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleInsertCourseWidget = (selectedCourse: Course) => {
    insertAtCursor(`\n\n[course-card:${selectedCourse.slug || selectedCourse.id}]\n\n`);
    setShowCoursePicker(false);
  };

  // SEO Pre-made Section Templates
  const handleInsertTemplate = (type: 'features' | 'target' | 'faq' | 'enroll') => {
    if (type === 'features') {
      insertAtCursor(
        `\n\n## 📌 এই কোর্সের প্রধান প্রধান বৈশিষ্ট্যসমূহ\n` +
        `- **অভিজ্ঞ শিক্ষক প্যানেল:** বুয়েট, ঢাবি ও মেডিকেল শিক্ষার্থী মেন্টরদের দিকনির্দেশনা।\n` +
        `- **লাইভ ক্লাস ও রেকর্ডিং:** প্রতিটি লাইভ ক্লাসের ফুল এইচডি রেকর্ডেড ক্লাস আজীবন দেখার সুযোগ।\n` +
        `- **লেকচার শিট ও নোট:** অধ্যায়ভিত্তিক গোছানো পিডিএফ নোটস ও ফর্মুলা শিট।\n` +
        `- **অধ্যায়ভিত্তিক মডেল টেস্ট:** বোর্ড স্ট্যান্ডার্ড প্রশ্ন সমাধান ও দুর্বলতা চিহ্নিতকরণ।\n` +
        `- **ডাউট সলভিং সাপোর্ট:** যেকোনো প্রশ্নের দ্রুত সমাধান সেবা।\n\n`
      );
    } else if (type === 'target') {
      insertAtCursor(
        `\n\n## 🎯 কাদের জন্য এই কোর্সটি উপযুক্ত?\n` +
        `- যারা বেসিক থেকে অ্যাডভান্স লেভেলের সম্পূর্ণ প্রস্তুতি গোছাতে চান।\n` +
        `- পরীক্ষায় সর্বোচ্চ এ-প্লাস (GPA 5) নিশ্চিত করার লক্ষ্য নিয়ে যারা পড়ছেন।\n` +
        `- সময়মতো রিভিশন শেষ করে মডেল টেস্ট দিয়ে আত্মবিশ্বাস বাড়াতে ইচ্ছুক।\n\n`
      );
    } else if (type === 'enroll') {
      insertAtCursor(
        `\n\n## 💡 কীভাবে ভর্তি হবেন এবং ডিসকাউন্ট পাবেন?\n` +
        `১. উপরের **"১০ মিনিট স্কুলে কোর্সটি কিনুন"** বাটনে ক্লিক করুন।\n` +
        `২. অফিসিয়াল ওয়েবসাইটে গিয়ে প্রোমো কোড ব্যবহার করুন।\n` +
        `৩. বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট সম্পন্ন করে সাথে সাথে ক্লাস শুরু করুন!\n\n`
      );
    } else if (type === 'faq') {
      insertAtCursor(
        `\n\n## ❓ সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)\n` +
        `### প্রশ্ন: ক্লাসগুলো কি লাইভ হবে নাকি রেকর্ডেড?\n` +
        `উত্তর: রুটিন অনুযায়ী লাইভ ক্লাস অনুষ্ঠিত হবে এবং প্রতিটি ক্লাসের রেকর্ডিং সংরক্ষিত থাকবে।\n\n` +
        `### প্রশ্ন: ক্লাস চলাকালীন কোনো প্রশ্ন করা যাবে কি?\n` +
        `উত্তর: হ্যাঁ, ক্লাসে সরাসরি শিক্ষককে প্রশ্ন করা যাবে এবং ডাউট ক্লিয়ারিং সেশন থাকবে।\n\n` +
        `### প্রশ্ন: এই কোর্সের মেয়াদ কতদিন?\n` +
        `উত্তর: অফিশিয়াল সেশন বা পরীক্ষা সম্পন্ন না হওয়া পর্যন্ত সকল ম্যাটেরিয়াল অ্যাক্সেস থাকবে।\n\n`
      );
    }
  };

  // SEO Score Calculations
  const textWords = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textWords ? textWords.split(' ').length : 0;
  const hasH1 = /#\s+|<h1/i.test(value);
  const hasH2 = /##\s+|<h2/i.test(value);
  const hasLinks = /<a\s+|\[.*\]\(.*\)/i.test(value);
  const hasBullet = /-\s+|\*\s+|<li>/i.test(value);
  const hasFAQ = /faq|প্রশ্ন|উত্তর/i.test(value);

  let seoScore = 20;
  if (hasH1 || hasH2) seoScore += 25;
  if (wordCount >= 80) seoScore += 25;
  else if (wordCount >= 30) seoScore += 15;
  if (hasLinks) seoScore += 15;
  if (hasBullet) seoScore += 15;

  return (
    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
      {/* Top Header & Tab Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <label className="block font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-rose-600" />
            <span>কোর্সের পূর্ণাঙ্গ বিবরণ (SEO ও রিচ টেক্সট এডিটর)</span>
          </label>
          <p className="text-[11px] text-slate-500">
            গুগলে র‍্যাংক করার জন্য H1, H2 হেডিং, বুলেট পয়েন্ট ও লিংক যুক্ত করুন।
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'editor'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>এডিটর</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'preview'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>লাইভ প্রিভিউ</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSnippetPreview(!showSnippetPreview)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showSnippetPreview ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="গুগল সার্চে কীভাবে দেখাবে তা দেখুন"
          >
            <Search className="w-3.5 h-3.5" />
            <span>গুগল স্নিপেট</span>
          </button>
        </div>
      </div>

      {/* Google SERP Snippet Preview Box */}
      {showSnippetPreview && (
        <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Google SERP প্রিভিউ
              </span>
              <span className="text-xs text-slate-500">গুগলে এই কোর্সটি যেমন দেখাবে:</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-lg font-bold">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2 py-0.5 rounded ${previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                মোবাইল
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2 py-0.5 rounded ${previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                পিসি
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans max-w-lg">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
              <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                10
              </div>
              <span className="font-medium text-slate-800">10mscourse.shop</span>
              <span className="text-slate-400">› course › {courseSlug || 'course-slug'}</span>
            </div>
            <div className="text-blue-700 hover:underline font-medium text-base sm:text-lg cursor-pointer line-clamp-1">
              {courseTitle ? `${courseTitle} - ১০ মিনিট স্কুল ডিসকাউন্ট ও ভর্তি` : 'কোর্সের শিরোনাম | 10mscourse.shop'}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {textWords ? textWords.slice(0, 155) + '...' : '১০ মিনিট স্কুলের অফিসিয়াল কোর্সে ভর্তি ও স্পেশাল অফার প্রমো কোড পান। অভিজ্ঞ শিক্ষকদের লাইভ ক্লাস, লেকচার শিট ও মডেল টেস্ট।'}
            </p>
          </div>
        </div>
      )}

      {/* Rich Formatting Toolbar (Active in Editor tab) */}
      {activeTab === 'editor' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1 bg-white p-2 rounded-xl border border-slate-200">
            {/* Heading 1 */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n# ', '\n', 'প্রধান শিরোনাম (H1)')}
              className="px-2.5 py-1 text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer border border-transparent hover:border-rose-200"
              title="প্রধান শিরোনাম (Heading 1)"
            >
              H1
            </button>

            {/* Heading 2 */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n## ', '\n', 'উপ-শিরোনাম (H2)')}
              className="px-2.5 py-1 text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer border border-transparent hover:border-rose-200"
              title="সাব-হেডিং (Heading 2)"
            >
              H2
            </button>

            {/* Heading 3 */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n### ', '\n', 'ছোট হেডিং (H3)')}
              className="px-2.5 py-1 text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer border border-transparent hover:border-rose-200"
              title="মাইনর হেডিং (Heading 3)"
            >
              H3
            </button>

            <span className="w-px h-4 bg-slate-200 mx-1"></span>

            {/* Bold */}
            <button
              type="button"
              onClick={() => insertAtCursor('**', '**', 'বোল্ড টেক্সট')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="বোল্ড (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => insertAtCursor('*', '*', 'ইটালিক টেক্সট')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="ইটালিক (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 mx-1"></span>

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n- ', '\n', 'পয়েন্ট বা বৈশিষ্ট্য')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="বুলেট তালিকা"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n১. ', '\n', 'ধাপ ১')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="সংখ্যাতালিকা"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Quote */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n> ', '\n', 'বিশেষ দ্রষ্টব্য বা পরামর্শ')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="উদ্ধৃতি / নোট"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <button
              type="button"
              onClick={() => insertAtCursor('\n\n---\n\n')}
              className="p-1.5 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded cursor-pointer"
              title="বিভাজক রেখা"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 mx-1"></span>

            {/* Insert Link */}
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="px-2 py-1 text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded flex items-center gap-1 cursor-pointer transition-colors"
              title="ওয়েবসাইট বা কোর্সের লিংক যোগ করুন"
            >
              <Link2 className="w-3.5 h-3.5 text-rose-500" />
              <span>লিংক</span>
            </button>

            {/* Insert Course Card Embed */}
            {allCourses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCoursePicker(true)}
                className="px-2 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="লেখার মাঝে অন্য কোর্স সাজেস্ট করুন"
              >
                <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                <span>কোর্স কার্ড</span>
              </button>
            )}
          </div>

          {/* Quick Pre-made SEO Templates Row */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-slate-100 p-2 rounded-xl">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>কুইক এসইও সেকশন:</span>
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate('features')}
              className="px-2 py-0.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded border border-slate-200 font-semibold cursor-pointer"
            >
              + কোর্সের বৈশিষ্ট্য
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('target')}
              className="px-2 py-0.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded border border-slate-200 font-semibold cursor-pointer"
            >
              + কাদের জন্য উপযুক্ত
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('enroll')}
              className="px-2 py-0.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded border border-slate-200 font-semibold cursor-pointer"
            >
              + কীভাবে ভর্তি হবেন
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('faq')}
              className="px-2 py-0.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded border border-slate-200 font-semibold cursor-pointer"
            >
              + সাধারণ প্রশ্নোত্তর (FAQ)
            </button>
          </div>
        </div>
      )}

      {/* Editor Main Content: Textarea or Live Preview */}
      {activeTab === 'editor' ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={10}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`এখানে কোর্সের বিস্তারিত তথ্য লিখুন...\n\n# প্রধান শিরোনাম (H1)\nএই কোর্সটির উদ্দেশ্য ও লক্ষ্য...\n\n## কোর্সটির বিশেষত্ব (H2)\n- ১ম সুবিধা\n- ২য় সুবিধা\n\n[কোর্স লিংক বা এফিলিয়েট লিংক দিন]`}
            className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      ) : (
        /* Live Preview Mode */
        <div className="p-5 bg-white rounded-xl border border-slate-200 min-h-[220px] max-h-[420px] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              প্রিভিউ মোড: মূল ওয়েবসাইটে যেমন দেখাবে
            </span>
            <span className="text-[11px] text-slate-400">
              {wordCount} শব্দ
            </span>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
            {value.split('\n\n').map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // H1 Heading
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={pIdx} className="text-xl sm:text-2xl font-black text-slate-900 border-b pb-2 pt-2">
                    {trimmed.replace('# ', '')}
                  </h1>
                );
              }

              // H2 Heading
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={pIdx} className="text-lg sm:text-xl font-bold text-slate-900 pt-2 text-rose-800">
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              // H3 Heading
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-slate-900 pt-1">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Quote
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={pIdx} className="p-3 bg-rose-50/70 border-l-4 border-rose-500 text-slate-800 rounded-r-xl italic">
                    {trimmed.replace('> ', '')}
                  </blockquote>
                );
              }

              // Course Card Shortcode
              const courseCardMatch = trimmed.match(/\[course-card:([^\]]+)\]/);
              if (courseCardMatch) {
                const targetSlug = courseCardMatch[1];
                const matchedCourse = allCourses.find((c) => c.slug === targetSlug || c.id === targetSlug);
                return (
                  <div key={pIdx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-rose-600" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {matchedCourse ? matchedCourse.title : `কোর্স: ${targetSlug}`}
                        </div>
                        <div className="text-[10px] text-slate-500">সুপারিশকৃত ১০ মিনিট স্কুল কোর্স</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-1 rounded">
                      বিস্তারিত
                    </span>
                  </div>
                );
              }

              // Bullet List
              if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                const items = trimmed.split('\n- ').map((s) => s.replace(/^- /, ''));
                return (
                  <ul key={pIdx} className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                );
              }

              // Normal paragraph with possible HTML
              return (
                <p key={pIdx} className="text-slate-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: trimmed }} />
              );
            })}
          </div>
        </div>
      )}

      {/* SEO Score & Content Health Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px]">
        <div className="flex flex-wrap items-center gap-3 text-slate-600">
          <span className="flex items-center gap-1 font-semibold">
            <span className="text-slate-400">শব্দ সংখ্যা:</span> <strong className="text-slate-900">{wordCount}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400">H1/H2 শিরোনাম:</span>
            {hasH1 || hasH2 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> চমৎকার
              </span>
            ) : (
              <span className="text-amber-600 font-bold">যোগ করা হয়নি</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400">বুলেট তালিকা:</span>
            {hasBullet ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> আছে
              </span>
            ) : (
              <span className="text-slate-400">নেই</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">এসইও স্কোর:</span>
          <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
            seoScore >= 70
              ? 'bg-emerald-100 text-emerald-800'
              : seoScore >= 40
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}>
            {seoScore}% {seoScore >= 70 ? '🟢 অপটিমাইজড' : seoScore >= 40 ? '🟡 মাঝারি' : '🔴 প্রাথমিক'}
          </span>
        </div>
      </div>

      {/* Modal: Insert Custom Hyperlink */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl border border-rose-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-rose-600" />
                <span>টেক্সটে লিংক যুক্ত করুন</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">লিংক টেক্সট (অ্যাঙ্কর টেক্সট)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="যেমন: ১০ মিনিট স্কুল অফিসিয়াল অফার লিংক"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ওয়েব ঠিকানা (URL)</label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://10minuteschool.com/... বা /courses"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>নতুন ট্যাবে ওপেন হবে (New Tab)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  লিংক বসান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pick another course to suggest */}
      {showCoursePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-xl border border-rose-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-600" />
                <span>লেখার মাঝে সাজেস্ট করার জন্য কোর্স বেছে নিন</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCoursePicker(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleInsertCourseWidget(c)}
                  className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">/{c.slug}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-1 rounded-lg border border-rose-200 shrink-0">
                    ইনসার্ট করুন
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
