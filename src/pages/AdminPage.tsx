import React, { useState, useEffect, useMemo } from 'react';
import { Shield, KeyRound, Plus, Edit3, Trash2, Download, Upload, RefreshCw, Save, X, ExternalLink, Check, AlertCircle, FileText, Phone, Settings, Search, BookOpen, GraduationCap, FolderPlus, Tag, Newspaper, Link2, GitBranch, Github } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { Course, CourseCategory, BlogPost, SiteResource } from '../types';
import { getCourseClassLabel } from '../utils/courseHelper';

export const AdminPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  // Disallow indexing by Google or search engines for the admin panel
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
      created = true;
    }
    const previous = robotsMeta.getAttribute('content');
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (created && robotsMeta) {
        robotsMeta.remove();
      } else if (robotsMeta && previous) {
        robotsMeta.setAttribute('content', previous);
      }
    };
  }, []);
  const {
    courses,
    categories,
    resources,
    blogPosts,
    addCategory,
    updateCategory,
    deleteCategory,
    addResource,
    deleteResource,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addCourse,
    updateCourse,
    deleteCourse,
    exportCoursesJSON,
    importCoursesJSON,
    clearAllCourses,
    resetToDefaults,
    siteSettings,
    updateSiteSettings,
    isCourseExpired,
  } = useCourseContext();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('10ms_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Course management states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [activeTab, setActiveTab] = useState<'courses' | 'categories' | 'blogs-resources' | 'settings' | 'export'>('courses');
  const [notification, setNotification] = useState('');
  const [seoKeywordsRaw, setSeoKeywordsRaw] = useState('');

  // Custom Category Creation State
  const [newCatName, setNewCatName] = useState('');
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState(false);

  // Blog and Resource states
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isNewBlog, setIsNewBlog] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // All available categories derived from context and courses
  const allAvailableCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    categories.forEach((c) => map.set(c.id, { id: c.id, name: c.name }));
    courses.forEach((c) => {
      const key = (c.category || '').trim();
      if (key && !map.has(key)) {
        map.set(key, { id: key, name: key });
      }
    });
    return Array.from(map.values());
  }, [categories, courses]);

  // Site settings state
  const [settingsForm, setSettingsForm] = useState(siteSettings);

  // GitHub Access Token Sync State
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('10ms_gh_pat') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('10ms_gh_repo') || 'mhims/mhims.github.io');
  const [isPushingToGithub, setIsPushingToGithub] = useState(false);
  const [githubPushStatus, setGithubPushStatus] = useState<string | null>(null);

  // Authentication handler
  // Required credentials: accepts both mdadilah and mdadilahnaffahim
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputUser = username.trim().toLowerCase();
    const VALID_PASS = '@@10mscoursedotshop11223300@@';

    if ((inputUser === 'mdadilah' || inputUser === 'mdadilahnaffahim') && password === VALID_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('10ms_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('10ms_admin_auth');
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Open add new course modal
  const handleStartAddCourse = () => {
    const defaultCat = allAvailableCategories[0]?.id || '';
    const freshCourse: Course = {
      id: `c-custom-${Date.now()}`,
      slug: `new-course-${Date.now().toString().slice(-4)}`,
      title: '',
      englishTitle: '',
      category: defaultCat,
      displayTargets: ['home'],
      targetClass: '',
      regularPrice: 2000,
      offerPrice: 1500,
      offerEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isLifetime: true,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      imageAlt: '',
      affiliateLink: 'https://10minuteschool.com/?aff=10mscourse_shop',
      promoCode: '',
      instructor: '',
      instructorRole: '',
      rating: 5.0,
      reviewCount: 150,
      enrolledCount: 1500,
      shortDescription: '',
      fullDescription: '',
      highlights: ['লাইভ ক্লাস', 'লেকচার শিট ও নোট', 'মডেল টেস্ট'],
      syllabus: [
        { title: 'অধ্যায় ১: সূচনা ও মূল ভিত্তি', count: '১০ লাইভ ক্লাস ও নোট' },
        { title: 'অধ্যায় ২: পূর্ণাঙ্গ সিলেবাস অনুশীলন', count: '১২ লাইভ ক্লাস ও ৫ পরীক্ষা' },
      ],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ['১০ মিনিট স্কুল কোর্স', 'অনলাইন কোর্স'],
      badgeText: '',
    };
    setEditingCourse(freshCourse);
    setSeoKeywordsRaw('১০ মিনিট স্কুল কোর্স, অনলাইন কোর্স');
    setIsNewCourse(true);
    setIsCustomCategoryInput(!defaultCat);
  };

  // Open edit existing course modal
  const handleStartEditCourse = (course: Course) => {
    setEditingCourse({
      ...course,
      displayTargets: course.displayTargets || [],
      syllabus: course.syllabus || [],
      highlights: course.highlights || [],
      targetClass: course.targetClass || getCourseClassLabel(course),
    });
    setSeoKeywordsRaw((course.seoKeywords || []).join(', '));
    setIsNewCourse(false);
    setIsCustomCategoryInput(false);
  };

  // Create custom category handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catName = newCatName.trim();
    const catId = catName.toLowerCase().replace(/\s+/g, '-');
    addCategory({ id: catId, name: catName });
    setNewCatName('');
    showToast(`"${catName}" ক্যাটাগরি সফলভাবে তৈরি হয়েছে!`);
  };

  // Blog handlers
  const handleStartAddBlog = () => {
    const freshBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      slug: `guideline-${Date.now().toString().slice(-4)}`,
      title: '',
      excerpt: '',
      content: '',
      author: '১০ মিনিট স্কুল টিম',
      date: new Date().toISOString().split('T')[0],
      readTime: '৪ মিনিট',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      tags: ['১০ মিনিট স্কুল', 'পড়াশোনার গাইডলাইন'],
      category: 'পড়াশোনার টিপস',
    };
    setEditingBlog(freshBlog);
    setIsNewBlog(true);
  };

  const handleStartEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsNewBlog(false);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !editingBlog.title.trim()) return;
    const cleanSlug = editingBlog.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const blogToSave = { ...editingBlog, slug: cleanSlug };
    if (isNewBlog) {
      addBlogPost(blogToSave);
      showToast('নতুন ব্লগ সফলভাবে যুক্ত হয়েছে এবং ফুটার ও ব্লগে দেখানো হচ্ছে!');
    } else {
      updateBlogPost(blogToSave);
      showToast('ব্লগ সফলভাবে আপডেট করা হয়েছে!');
    }
    setEditingBlog(null);
  };

  // Resource handlers
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    addResource({
      id: `res-${Date.now()}`,
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
    });
    setNewResourceTitle('');
    setNewResourceUrl('');
    showToast('নতুন রিসোর্স সফলভাবে যুক্ত হয়েছে এবং ফুটারে অটো যুক্ত হয়েছে!');
  };

  // Syllabus management handlers
  const handleAddSyllabusItem = () => {
    if (!editingCourse) return;
    const currentSyllabus = editingCourse.syllabus || [];
    setEditingCourse({
      ...editingCourse,
      syllabus: [
        ...currentSyllabus,
        { title: `অধ্যায়/মডিউল ${currentSyllabus.length + 1}`, count: '১০ লাইভ ক্লাস ও নোট' },
      ],
    });
  };

  const handleUpdateSyllabusItem = (index: number, field: 'title' | 'count', value: string) => {
    if (!editingCourse) return;
    const currentSyllabus = [...(editingCourse.syllabus || [])];
    currentSyllabus[index] = {
      ...currentSyllabus[index],
      [field]: value,
    };
    setEditingCourse({ ...editingCourse, syllabus: currentSyllabus });
  };

  const handleRemoveSyllabusItem = (index: number) => {
    if (!editingCourse) return;
    const currentSyllabus = (editingCourse.syllabus || []).filter((_, i) => i !== index);
    setEditingCourse({ ...editingCourse, syllabus: currentSyllabus });
  };

  // Save course (Add or Edit)
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (!editingCourse.title.trim() || !editingCourse.slug.trim()) {
      alert('দয়া করে কোর্সের নাম এবং স্লাগ (slug) লিখুন!');
      return;
    }

    if (!editingCourse.category || !editingCourse.category.trim()) {
      alert('দয়া করে কোর্সের ক্যাটাগরি লিখুন বা নির্বাচন করুন!');
      return;
    }

    // Clean slug
    const cleanSlug = editingCourse.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const catTrimmed = editingCourse.category.trim();

    // Auto-save category into customCategories if not present
    if (!categories.some((c) => c.id === catTrimmed || c.name === catTrimmed)) {
      addCategory({ id: catTrimmed, name: catTrimmed });
    }
    
    // Parse SEO keywords from raw text (supports commas smoothly without getting eaten!)
    const parsedKeywords = seoKeywordsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const courseToSave: Course = {
      ...editingCourse,
      category: catTrimmed,
      slug: cleanSlug,
      seoKeywords: parsedKeywords.length > 0 ? parsedKeywords : ['১০ মিনিট স্কুল কোর্স', 'অনলাইন কোর্স'],
      seoTitle: editingCourse.seoTitle?.trim() || `${editingCourse.title} | 10mscourse.shop`,
      seoDescription: editingCourse.seoDescription?.trim() || editingCourse.shortDescription,
      targetClass: editingCourse.targetClass?.trim() || undefined,
      syllabus: editingCourse.syllabus || [],
      highlights: editingCourse.highlights || [],
    };

    if (isNewCourse) {
      addCourse(courseToSave);
      showToast('নতুন কোর্স সফলভাবে যুক্ত হয়েছে!');
    } else {
      updateCourse(courseToSave);
      showToast('কোর্স সফলভাবে আপডেট করা হয়েছে!');
    }

    setEditingCourse(null);
  };

  // Toggle display target pages
  const handleToggleTarget = (target: string) => {
    if (!editingCourse) return;
    const exists = editingCourse.displayTargets.includes(target);
    const updated = exists
      ? editingCourse.displayTargets.filter((t) => t !== target)
      : [...editingCourse.displayTargets, target];
    setEditingCourse({ ...editingCourse, displayTargets: updated });
  };

  // Direct GitHub API Sync using Personal Access Token
  const handleDirectGithubSync = async () => {
    if (!githubToken.trim()) {
      alert('দয়া করে আপনার GitHub Personal Access Token দিন!');
      return;
    }
    const cleanRepo = githubRepo.trim();
    if (!cleanRepo || !cleanRepo.includes('/')) {
      alert('দয়া করে সঠিক রিপোজিটরি দিন (যেমন: username/repo-name)');
      return;
    }

    setIsPushingToGithub(true);
    setGithubPushStatus('গিটহাবে সরাসরি ডেটা পাঠানো হচ্ছে...');
    localStorage.setItem('10ms_gh_pat', githubToken.trim());
    localStorage.setItem('10ms_gh_repo', cleanRepo);

    try {
      const jsonContent = exportCoursesJSON();
      // Put file in docs/courses.json (which GitHub Pages serves!) and public/courses.json
      const paths = ['docs/courses.json', 'public/courses.json', 'courses.json'];
      
      const utf8Bytes = new TextEncoder().encode(jsonContent);
      let binaryStr = '';
      utf8Bytes.forEach((b) => (binaryStr += String.fromCharCode(b)));
      const base64Content = btoa(binaryStr);

      for (const p of paths) {
        const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${p}`;
        let sha: string | undefined = undefined;
        try {
          const getRes = await fetch(apiUrl, {
            headers: {
              Authorization: `token ${githubToken.trim()}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
          }
        } catch {
          // ignore
        }

        await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${githubToken.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update courses catalog from 10MS Admin Panel [skip ci]`,
            content: base64Content,
            sha: sha,
          }),
        });
      }

      setGithubPushStatus('অভিনন্দন! সরাসরি গিটহাবে আপডেট হয়ে গেছে!');
      showToast('গিটহাবে সরাসরি আপডেট সম্পন্ন হয়েছে!');
      setTimeout(() => setGithubPushStatus(null), 5000);
    } catch (err: any) {
      console.error('GitHub Push error:', err);
      setGithubPushStatus(`ব্যর্থ হয়েছে: ${err.message || 'টোকেনের পারমিশন চেক করুন'}`);
    } finally {
      setIsPushingToGithub(false);
    }
  };

  // Export JSON
  const handleDownloadJSON = () => {
    const jsonStr = exportCoursesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('courses.json ফাইল ডাউনলোড হয়েছে!');
  };

  // Import JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importCoursesJSON(content);
        if (success) {
          showToast('JSON থেকে কোর্স সফলভাবে ইমপোর্ট হয়েছে!');
        } else {
          alert('ভুল JSON ফরম্যাট! দয়া করে সঠিক ফাইল দিন।');
        }
      }
    };
    reader.readAsText(file);
  };

  // Save Site Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(settingsForm);
    showToast('সাইট সেটিংস সংরক্ষিত হয়েছে!');
  };

  // Calculate active and expired course counts
  const activeCoursesCount = courses.filter((c) => !isCourseExpired(c)).length;
  const expiredCoursesCount = courses.length - activeCoursesCount;

  // Filter courses for admin table
  const filteredCourses = courses.filter((c) => {
    const expired = isCourseExpired(c);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !expired) ||
      (filterStatus === 'expired' && expired);

    const matchesCat =
      filterCategory === 'all' ||
      c.category === filterCategory ||
      (c.displayTargets && c.displayTargets.includes(filterCategory)) ||
      (filterCategory === 'class-6-8' &&
        (c.category === 'class-6' ||
          c.category === 'class-7' ||
          c.category === 'class-8' ||
          c.displayTargets?.includes('class-6') ||
          c.displayTargets?.includes('class-7') ||
          c.displayTargets?.includes('class-8')));
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.instructor && c.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.targetClass && c.targetClass.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesCat && matchesSearch;
  });

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-rose-200 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">অ্যাডমিন লগইন</h2>
            <p className="text-xs text-slate-500">10mscourse.shop অ্যাডমিন ম্যানেজমেন্ট পোর্টাল</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ইউজারনেম</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ইউজারনেম লিখুন"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              নিরাপদ লগইন
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border-t-4 border-rose-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-600 text-white">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">অ্যাডমিন ম্যানেজমেন্ট পোর্টাল</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            মোট কোর্স: <strong className="text-white">{courses.length}টি</strong> | এক জায়গা থেকে সব কোর্সের তথ্য ও দাম নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            সাইট ভিউ
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-bold bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-rose-100 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-rose-50'
          }`}
        >
          কোর্স তালিকা ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-rose-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>ক্যাটাগরি সমূহ ({allAvailableCategories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('blogs-resources')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'blogs-resources'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-rose-50'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>ব্লগ ও রিসোর্স ({blogPosts.length + resources.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-rose-50'
          }`}
        >
          সাইট ও WhatsApp সেটিংস
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'export'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-rose-50'
          }`}
        >
          GitHub ব্যাকআপ ও ইমপোর্ট
        </button>
      </div>

      {/* TAB 1: Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="কোর্সের নাম বা স্লাগ লিখে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  {allAvailableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('আপনি কি নিশ্চিত যে সকল কোর্স মুছে ফেলে শূন্য থেকে নিজের মতো করে কোর্স অ্যাড করতে চান?')) {
                      clearAllCourses();
                      showToast('সকল কোর্স সফলভাবে মুছে ফেলা হয়েছে! এখন আপনি নতুন কোর্স এড করতে পারেন।');
                    }
                  }}
                  className="w-full md:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  title="সকল ডেমো কোর্স মুছে শূন্য তালিকা করুন"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>সব ডেমো মুছুন</span>
                </button>

                <button
                  onClick={handleStartAddCourse}
                  className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন কোর্স যুক্ত করুন</span>
                </button>
              </div>
            </div>

            {/* Quick Status Filter Tabs: All, Active, Expired */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500 mr-1">কোর্স স্ট্যাটাস:</span>
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সকল কোর্স ({courses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  🟢 চলমান ({activeCoursesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('expired')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'expired'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  🔴 সমাপ্ত / ভর্তি বন্ধ ({expiredCoursesCount})
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                * সমাপ্ত কোর্সগুলো স্বয়ংক্রিয়ভাবে হোমপেজ থেকে বাদ থাকে
              </span>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">কোর্স ও শিক্ষক</th>
                    <th className="p-3">ক্যাটাগরি ও স্লাগ (URL)</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">রেগুলার ফি</th>
                    <th className="p-3">অফার ফি</th>
                    <th className="p-3">অফার শেষ</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCourses.map((c) => {
                    const expired = isCourseExpired(c);
                    return (
                      <tr key={c.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="w-10 h-8 rounded object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-xs">{c.title}</div>
                              <div className="text-[10px] text-slate-400">{c.instructor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{getCourseClassLabel(c)}</span>
                          </div>
                          <div className="text-[11px] text-rose-600 font-mono">/{c.slug}</div>
                        </td>
                        <td className="p-3">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap">
                              🔴 সমাপ্ত / ভর্তি বন্ধ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                              🟢 চলমান
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-500">৳{c.regularPrice}</td>
                        <td className="p-3 font-black text-rose-600">৳{c.offerPrice}</td>
                        <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {c.offerEndDate ? new Date(c.offerEndDate).toLocaleDateString('bn-BD') : 'অবিরাম'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {expired && (
                              <button
                                onClick={() => {
                                  updateCourse({
                                    ...c,
                                    status: 'active',
                                    isLifetime: true,
                                    expiryDate: '',
                                  });
                                  showToast(`"${c.title}" পুনরায় চালু করা হয়েছে!`);
                                }}
                                title="পুনরায় চালু করুন"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                চালু করুন
                              </button>
                            )}
                            <button
                              onClick={() => onNavigate(`/${c.slug}`)}
                              title="ভিউ পেজ"
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEditCourse(c)}
                              title="এডিট করুন"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি "${c.title}" কোর্সটি ডিলিট করতে চান?`)) {
                                  deleteCourse(c.id);
                                  showToast('কোর্সটি মুছে ফেলা হয়েছে');
                                }
                              }}
                              title="মুছে ফেলুন"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Custom Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-rose-600" />
                <span>নতুন কাস্টম ক্যাটাগরি তৈরি করুন</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ভবিষ্যতে যেসব নতুন নতুন কোর্স বা ক্যাটাগরি আসবে (যেমন: IELTS, কোরআন শিক্ষা, ভিডিও এডিটিং, বিসিএস, স্পোকেন ইত্যাদি) তা এখানে যুক্ত করুন। ক্যাটাগরিতে কোর্স যোগ করলেই তা হোমপেজে দেখা যাবে।
              </p>
            </div>

            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  ক্যাটাগরির নাম লিখুন (বাংলা বা ইংরেজি)
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="যেমন: IELTS প্রিপারেশন, কোরআন শিক্ষা, অ্যানিমেশন, এসএসসি..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ক্যাটাগরি যোগ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of categories */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" />
                <span>বর্তমান সকল ক্যাটাগরি ({allAvailableCategories.length}টি)</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                * যেসব ক্যাটাগরিতে অন্তত ১টি কোর্স থাকবে সেগুলোই শুধু হোমপেজে প্রদর্শিত হবে
              </span>
            </div>

            {allAvailableCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                এখনো কোনো ক্যাটাগরি তৈরি করা হয়নি। উপরের ফর্ম থেকে নতুন ক্যাটাগরি তৈরি করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allAvailableCategories.map((cat) => {
                  const courseCount = courses.filter((c) => c.category === cat.id || c.category === cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50/30 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-slate-900 truncate">{cat.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          কোর্স সংখ্যা: <strong className={courseCount > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>{courseCount}টি {courseCount > 0 ? '(হোমপেজে সক্রিয়)' : '(হোমপেজে লুকানো)'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি "${cat.name}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
                              deleteCategory(cat.id);
                              showToast(`"${cat.name}" ক্যাটাগরি মুছে ফেলা হয়েছে`);
                            }
                          }}
                          title="মুছে ফেলুন"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Blogs & Resources Management (Auto-updates Footer!) */}
      {activeTab === 'blogs-resources' && (
        <div className="space-y-6">
          {/* Header Explanation */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-rose-600" />
                <span>ব্লগ ও রিসোর্স লিংক ম্যানেজমেন্ট</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                এখানে নতুন কোনো ব্লগ পোস্ট বা রিসোর্স যোগ করলে তা ওয়েবসাইট এবং ফুটারের "রিসোর্স ও পেজ" তালিকায় স্বয়ংক্রিয়ভাবে সরাসরি যুক্ত হয়ে যাবে।
              </p>
            </div>
            <button
              onClick={handleStartAddBlog}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্লগ পোস্ট লিখুন</span>
            </button>
          </div>

          {/* Section 1: Blog Posts List */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>প্রকাশিত সকল ব্লগ ({blogPosts.length}টি)</span>
            </h4>

            {blogPosts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                কোনো ব্লগ পোস্ট পাওয়া যায়নি। উপরের বাটনে ক্লিক করে নতুন ব্লগ যুক্ত করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50/20 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex gap-3">
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-20 h-16 object-cover rounded-xl shrink-0 bg-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          {post.category}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mt-1">
                          {post.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          লেখক: {post.author} • পড়ার সময়: {post.readTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 mt-1 text-xs">
                      <button
                        onClick={() => onNavigate(`/blog/${post.slug}`)}
                        className="text-slate-500 hover:text-rose-600 font-semibold inline-flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>ব্লগটি দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditBlog(post)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${post.title}" ব্লগটি মুছে ফেলতে চান?`)) {
                              deleteBlogPost(post.id);
                              showToast('ব্লগটি মুছে ফেলা হয়েছে');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Custom Resources & Links (Auto-synced to Footer!) */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-rose-600" />
                <span>ফুটার রিসোর্স ও প্রয়োজনীয় পেজ লিঙ্ক ({resources.length}টি)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                এখানে যেকোনো গাইডলাইন, সিলেবাস বা পেজের লিংক যোগ করুন। এটি স্বয়ংক্রিয়ভাবে ফুটারের "রিসোর্স ও পেজ" তালিকায় যোগ হয়ে যাবে।
              </p>
            </div>

            {/* Add Resource Form */}
            <form onSubmit={handleAddResource} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">রিসোর্সের নাম / টাইটেল</label>
                <input
                  type="text"
                  required
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="যেমন: ভর্তি গাইডলাইন PDF, বিসিএস স্পেশাল রুটিন..."
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">লিংক বা ইউআরএল (URL)</label>
                <input
                  type="text"
                  required
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  placeholder="যেমন: /admission অথবা https://drive.google.com/..."
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>রিসোর্স যুক্ত করুন</span>
                </button>
              </div>
            </form>

            {/* Resources List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{res.title}</p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{res.url}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি "${res.title}" রিসোর্সটি মুছে ফেলতে চান?`)) {
                        deleteResource(res.id);
                        showToast('রিসোর্স মুছে ফেলা হয়েছে');
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="রিসোর্স মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Site Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs max-w-2xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900">সাইট ও যোগাযোগ সেটিংস</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp হেল্পলাইন নম্বর</label>
              <input
                type="text"
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                placeholder="যেমন: 8801700000000"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                দেশীয় কোডসহ নম্বর দিন (যেমন: 88017XXXXXXXX)। ওয়েবসাইটে গ্রাহক মেসেজ দিলে এই নম্বরে যাবে।
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">টপ অ্যানাউন্সমেন্ট টেক্সট</label>
              <input
                type="text"
                value={settingsForm.announcementText}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ডিফল্ট ১০ মিনিট স্কুল অ্যাফিলিয়েট কোড</label>
              <input
                type="text"
                value={settingsForm.defaultAffiliateCode}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultAffiliateCode: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Export & Import for GitHub */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-rose-600" />
              <span>GitHub-এ সিঙ্ক ও ব্যাকআপ (Sync & Export)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি অ্যাডমিন প্যানেল থেকে যেসব কোর্স যোগ বা এডিট করবেন, তা সরাসরি JSON হিসেবে কপি বা ডাউনলোড করতে পারবেন। গিটহাবে পুশ করলে মূল ওয়েবসাইটে সবার জন্য তা সাথে সাথে লাইভ হয়ে যাবে।
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>courses.json ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = exportCoursesJSON();
                  navigator.clipboard.writeText(jsonStr);
                  showToast('কোর্স ডেটা ক্লিপবোর্ডে কপি করা হয়েছে!');
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>কোর্স ডেটা কপি করুন</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>JSON ফাইল থেকে রিস্টোর (Import)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার পূর্বের সংরক্ষিত courses.json ফাইল আপলোড করে সকল কোর্স ও অফার এক ক্লিকে রিস্টোর করুন।
            </p>
            <label className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md">
              <Upload className="w-4 h-4" />
              <span>JSON ফাইল আপলোড করুন</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Direct GitHub Token Sync Card */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Github className="w-5 h-5 text-rose-400" />
                  <span>সরাসরি GitHub-এ লাইভ আপডেট (Personal Access Token দিয়ে)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  এখানে একবার আপনার গিটহাবের টোকেন দিলে অ্যাডমিন প্যানেল থেকেই সরাসরি গিটহাবে পুশ হয়ে মূল ওয়েবসাইটে সব কোর্স লাইভ হয়ে যাবে!
                </p>
              </div>
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-xl font-bold flex items-center gap-1 shrink-0"
              >
                <span>টোকেন তৈরি করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">GitHub Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  GitHub ➔ Settings ➔ Developer Settings ➔ Personal access tokens (classic) থেকে <code className="text-rose-400 font-mono">repo</code> পারমিশনসহ টোকেন দিন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">GitHub Repository (ইউজারনেম/রিপো-নাম)</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="যেমন: mhims/mhims.github.io"
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  আপনার গিটহাব রিপোজিটরির নাম।
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={isPushingToGithub}
                onClick={handleDirectGithubSync}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all"
              >
                {isPushingToGithub ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>গিটহাবে পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    <span>এক ক্লিকে মূল ওয়েবসাইটে পাঠান (Push to GitHub)</span>
                  </>
                )}
              </button>

              {githubPushStatus && (
                <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${githubPushStatus.includes('ব্যর্থ') ? 'bg-red-900/50 text-red-200' : 'bg-emerald-900/50 text-emerald-200'}`}>
                  {githubPushStatus}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-rose-50/50 rounded-2xl p-6 border border-rose-200 space-y-3">
            <h4 className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>ডিফল্ট ডেটায় রিসেট করুন</span>
            </h4>
            <p className="text-xs text-rose-700">
              সাইটের ভেরিফাইড কোর্সগুলোর প্রাথমিক সেটে ফিরে যেতে চাইলে নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={() => {
                if (confirm('আপনি কি নিশ্চিত যে সকল কোর্স ডিফল্ট অবস্থায় রিসেট করতে চান?')) {
                  resetToDefaults();
                  showToast('সকল কোর্স সফলভাবে ডিফল্ট অবস্থায় রিসেট হয়েছে!');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              রিসেট টু ডিফল্ট (Reset)
            </button>
          </div>
        </div>
      )}

      {/* Course Edit/Create Modal (Satisfies requirement 1, 2, 11) */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isNewCourse ? 'নতুন কোর্স যুক্ত করুন' : 'কোর্সের তথ্য ও দাম এডিট করুন'}
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs sm:text-sm">
              {/* Title & Slug (Requirement 2: Custom URL slug) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কোর্সের নাম (বাংলায়)</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    placeholder="যেমন: SSC 2026 ক্র্যাশ কোর্স"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    কাস্টম লিঙ্ক স্লাগ (10mscourse.shop/...)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCourse.slug}
                    onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                    placeholder="যেমন: ssc-2026-crash-course"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Prices & Offer Dates (Requirement 1: Centralized price & automatic fallback) */}
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
                <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider">
                  মূল্য ও অফার সেটিংস (অফার শেষ হলে অটোমেটিক রেগুলার দাম দেখাবে)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">আগের/রেগুলার দাম (৳)</label>
                    <input
                      type="number"
                      required
                      value={editingCourse.regularPrice}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, regularPrice: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">বর্তমান অফার দাম (৳)</label>
                    <input
                      type="number"
                      required
                      value={editingCourse.offerPrice}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, offerPrice: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">অফার শেষ হওয়ার তারিখ</label>
                    <input
                      type="date"
                      value={editingCourse.offerEndDate ? editingCourse.offerEndDate.split('T')[0] : ''}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, offerEndDate: e.target.value })
                      }
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Course Lifecycle, Status & Expiry Setting */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    কোর্স সক্রিয়তা ও সমাপ্তি সেটিংস (Course Status & Expiry)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    * সমাপ্ত হলে অটোমেটিক হোমপেজ থেকে বাদ পড়বে
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">কোর্স স্ট্যাটাস</label>
                    <select
                      value={editingCourse.status || 'active'}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          status: e.target.value as 'active' | 'expired',
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="active">🟢 চলমান (Active - ওয়েবসাইটে দেখাবে)</option>
                      <option value="expired">🔴 মেয়াদ সমাপ্ত / ভর্তি বন্ধ (Expired - হোমপেজ থেকে লুকানো)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">কোর্স সমাপ্তির তারিখ</label>
                    <input
                      type="date"
                      disabled={editingCourse.isLifetime}
                      value={editingCourse.expiryDate ? editingCourse.expiryDate.split('T')[0] : ''}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, expiryDate: e.target.value })
                      }
                      className={`w-full p-2.5 bg-white border border-slate-300 rounded-xl ${
                        editingCourse.isLifetime ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs">
                    <input
                      type="checkbox"
                      checked={editingCourse.isLifetime}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          isLifetime: e.target.checked,
                          expiryDate: e.target.checked ? '' : editingCourse.expiryDate,
                        })
                      }
                      className="rounded text-rose-600"
                    />
                    <span>আজীবন মেয়াদ (Lifetime Access - কখনো মেয়াদ শেষ হবে না)</span>
                  </label>

                  {!editingCourse.isLifetime && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500">কুইক মেয়াদ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          setEditingCourse({ ...editingCourse, expiryDate: d.toISOString().split('T')[0] });
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-rose-50 text-slate-700 cursor-pointer"
                      >
                        +১ মাস
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 3);
                          setEditingCourse({ ...editingCourse, expiryDate: d.toISOString().split('T')[0] });
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-rose-50 text-slate-700 cursor-pointer"
                      >
                        +৩ মাস
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 6);
                          setEditingCourse({ ...editingCourse, expiryDate: d.toISOString().split('T')[0] });
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-rose-50 text-slate-700 cursor-pointer"
                      >
                        +৬ মাস
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirement 2: Select which pages this course will display on */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    কোন কোন পেজে এই কোর্সটি দেখাবে? (Select Target Pages)
                  </label>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    * একাধিক ক্যাটাগরি ও পেজ সিলেক্ট করতে পারেন
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'home', label: 'হোম পেজ' },
                    ...allAvailableCategories.map((c) => ({ id: c.id, label: c.name })),
                  ].map((p) => {
                    const isSelected = editingCourse.displayTargets.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleToggleTarget(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-300 hover:border-rose-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category, Class Badge, Optional Instructor & Promo Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      মূল ক্যাটাগরি <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryInput(!isCustomCategoryInput)}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      {isCustomCategoryInput ? 'ড্রপডাউন' : '+ নতুন লিখুন'}
                    </button>
                  </div>

                  {isCustomCategoryInput || allAvailableCategories.length === 0 ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={editingCourse.category}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                        placeholder="ক্যাটাগরির নাম লিখুন..."
                        className="w-full p-2.5 bg-white border-2 border-rose-400 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  ) : (
                    <select
                      value={editingCourse.category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCategoryInput(true);
                          setEditingCourse({ ...editingCourse, category: '' });
                        } else {
                          setEditingCourse({ ...editingCourse, category: e.target.value });
                        }
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
                    >
                      <option value="">-- ক্যাটাগরি বেছে নিন --</option>
                      {allAvailableCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__NEW__" className="text-rose-600 font-bold">
                        ➕ নতুন কাস্টম ক্যাটাগরি লিখুন...
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কোর্সের ক্লাস ব্যাজ <span className="text-rose-600 font-bold">(ছবির উপর দেখাবে)</span>
                  </label>
                  <input
                    type="text"
                    value={editingCourse.targetClass || ''}
                    placeholder="যেমন: ৬ষ্ঠ শ্রেণী, ৭ম শ্রেণী, HSC"
                    onChange={(e) => setEditingCourse({ ...editingCourse, targetClass: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['৬ষ্ঠ শ্রেণী', '৭ম শ্রেণী', '৮ম শ্রেণী', '৬ষ্ঠ-৮ম', '৯ম-১০ম (SSC)', 'HSC'].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setEditingCourse({ ...editingCourse, targetClass: preset })}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded border border-slate-200 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    শিক্ষক / মেন্টর নাম <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={editingCourse.instructor || ''}
                    placeholder="না দিলেও সমস্যা নেই"
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    প্রোমো কোড <span className="text-rose-600 font-bold">(কপি করার কুপন)</span>
                  </label>
                  <input
                    type="text"
                    value={editingCourse.promoCode || ''}
                    placeholder="যেমন: 10MSOFFER, PROMO26"
                    onChange={(e) => setEditingCourse({ ...editingCourse, promoCode: e.target.value.trim() })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono uppercase font-bold text-xs"
                  />
                </div>
              </div>

              {/* Requirement 12: Direct 10MS affiliate link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ১০ মিনিট স্কুল অফিসিয়াল অ্যাফিলিয়েট লিংক
                </label>
                <input
                  type="url"
                  required
                  value={editingCourse.affiliateLink}
                  onChange={(e) => setEditingCourse({ ...editingCourse, affiliateLink: e.target.value })}
                  placeholder="https://10minuteschool.com/product/xyz/?aff=yourcode"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Requirement 11: Image URL & Alt text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইমেজ লিংক (Image URL)</label>
                  <input
                    type="url"
                    value={editingCourse.imageUrl}
                    onChange={(e) => setEditingCourse({ ...editingCourse, imageUrl: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইমেজ অল্টার টেক্সট (SEO Alt)</label>
                  <input
                    type="text"
                    value={editingCourse.imageAlt}
                    onChange={(e) => setEditingCourse({ ...editingCourse, imageAlt: e.target.value })}
                    placeholder="যেমন: SSC 2026 ক্র্যাশ কোর্স ১০ মিনিট স্কুল"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <input
                  type="text"
                  value={editingCourse.shortDescription}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পূর্ণ বিবরণ (Full Details)</label>
                <textarea
                  rows={3}
                  value={editingCourse.fullDescription}
                  onChange={(e) => setEditingCourse({ ...editingCourse, fullDescription: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Syllabus & Lecture Breakdown (সিলেবাস ও লেকচার বিন্যাস) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      <span>সিলেবাস ও লেকচার বিন্যাস (Syllabus & Modules)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      কোর্স ডিটেইল পেজে প্রদর্শনের জন্য অধ্যায়/মডিউল ও ক্লাসের তালিকা দিন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSyllabusItem}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ নতুন মডিউল যোগ করুন</span>
                  </button>
                </div>

                {(!editingCourse.syllabus || editingCourse.syllabus.length === 0) ? (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-400">বর্তমানে কোনো সিলেবাস যুক্ত নেই।</p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourse({
                          ...editingCourse,
                          syllabus: [
                            { title: 'অধ্যায় ১: বেসিক ধারণা ও প্রস্তুতি', count: '৮ লাইভ ক্লাস ও নোট' },
                            { title: 'অধ্যায় ২: মূল সিলেবাস অনুশীলন', count: '১২ লাইভ ক্লাস ও মডেল টেস্ট' },
                            { title: 'অধ্যায় ৩: ফাইনাল রিভিশন ও সল্ভিং', count: '৬ সল্ভ ক্লাস ও এক্সাম' },
                          ],
                        });
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      + নমুনা সিলেবাস টেমপ্লেট দিয়ে শুরু করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {editingCourse.syllabus.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={s.title}
                            onChange={(e) => handleUpdateSyllabusItem(idx, 'title', e.target.value)}
                            placeholder="মডিউল / অধ্যায়ের নাম (যেমন: ১ম অধ্যায় - গতিবিদ্যা)"
                            className="p-1.5 text-xs border border-slate-300 rounded-lg w-full"
                          />
                          <input
                            type="text"
                            value={s.count}
                            onChange={(e) => handleUpdateSyllabusItem(idx, 'count', e.target.value)}
                            placeholder="ক্লাস ও নোটের তথ্য (যেমন: ১০ ক্লাস, ৫ নোট)"
                            className="p-1.5 text-xs border border-slate-300 rounded-lg w-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSyllabusItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Requirement 2: Full SEO Settings with Comma-Safe Keywords */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>এসইও সেটিংস (গুগল ও সার্চ ইঞ্জিন মেটাডাটা)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">এসইও টাইটেল (SEO Title)</label>
                    <input
                      type="text"
                      value={editingCourse.seoTitle || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, seoTitle: e.target.value })}
                      placeholder="যেমন: SSC 2026 Crash Course 10MS | 10mscourse.shop"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">এসইও বিবরণ (SEO Meta Description)</label>
                    <input
                      type="text"
                      value={editingCourse.seoDescription || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, seoDescription: e.target.value })}
                      placeholder="যেমন: ১০ মিনিট স্কুলের সেরা ক্র্যাশ কোর্স অফার ও প্রোমো কোড"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    গুগলে কী কী সার্চ করলে আসবে? (SEO Keywords, কমা দিয়ে ইচ্ছেমতো লিখুন)
                  </label>
                  <input
                    type="text"
                    value={seoKeywordsRaw}
                    onChange={(e) => setSeoKeywordsRaw(e.target.value)}
                    placeholder="যেমন: SSC 2026, এসএসসি ক্র্যাশ কোর্স, 10 Minute School SSC, গণিত কোর্স"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    টিপস: যেকোনো কি-ওয়ার্ড লিখে কমা (,) দিয়ে আলাদা করুন। যেমন: ক্লাস ৬, class 6 math, ১০ মিনিট স্কুল
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isNewCourse ? 'কোর্স প্রকাশ করুন' : 'আপডেট সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Post Add/Edit Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 border border-rose-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-rose-600" />
                <span>{isNewBlog ? 'নতুন ব্লগ পোস্ট তৈরি করুন' : 'ব্লগ পোস্ট সম্পাদনা করুন'}</span>
              </h3>
              <button
                onClick={() => setEditingBlog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্লগের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    placeholder="যেমন: এসএসসি ২০২৬ প্রস্তুতি গাইডলাইন..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ইউআরএল স্লাগ (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    placeholder="যেমন: ssc-2026-guideline"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেখক</label>
                  <input
                    type="text"
                    value={editingBlog.author}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    placeholder="যেমন: এসএসসি, এডমিশন..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পড়ার সময়</label>
                  <input
                    type="text"
                    value={editingBlog.readTime}
                    onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                    placeholder="যেমন: ৫ মিনিট"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">কভার ইমেজের লিঙ্ক (Cover Image URL)</label>
                <input
                  type="text"
                  value={editingBlog.coverImage}
                  onChange={(e) => setEditingBlog({ ...editingBlog, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Excerpt) *</label>
                <textarea
                  required
                  rows={2}
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  placeholder="কার্ডে প্রদর্শনের জন্য ২-৩ লাইনের সংক্ষিপ্ত বর্ণনা..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সম্পূর্ণ মূল কন্টেন্ট (HTML বা টেক্সট) *</label>
                <textarea
                  required
                  rows={6}
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  placeholder="ব্লগের বিস্তারিত বিষয়বস্তু লিখুন..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
