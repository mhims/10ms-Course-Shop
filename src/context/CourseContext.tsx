import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, BlogPost, Review, SiteSettings, CustomCategory, SiteResource } from '../types';
import { initialCourses, generateFull150Courses } from '../data/coursesData';
import { initialBlogPosts } from '../data/blogData';
import { initialReviews } from '../data/reviewData';

export const initialDefaultCategories: CustomCategory[] = [
  { id: 'class-6-8', name: 'ক্লাস ৬-৮' },
  { id: 'class-9-10', name: 'এসএসসি' },
  { id: 'hsc', name: 'এইচএসসি' },
  { id: 'admission', name: 'ভর্তি পরীক্ষা' },
  { id: 'skills', name: 'স্কিলস ও ফ্রিল্যান্সিং' },
  { id: 'spoken-english', name: 'স্পোকেন ইংলিশ' },
  { id: 'job-prep', name: 'বিসিএস ও চাকরি প্রস্তুতি' },
];

export const initialDefaultResources: SiteResource[] = [
  { id: 'res-blog', title: 'পড়াশোনার গাইডলাইন ও ব্লগ', url: '/blog' },
  { id: 'res-review', title: 'শিক্ষার্থীদের রিভিউ ও মতামত', url: '/review' },
  { id: 'res-courses', title: 'সকল কোর্স ডিরেক্টরি', url: '/courses' },
  { id: 'res-job-prep', title: 'বিসিএস ও সরকারি চাকরি প্রস্তুতি', url: '/job-prep' },
  { id: 'res-class68', title: 'ক্লাস ৬-৮ নতুন শিক্ষাক্রম', url: '/class-6-8' },
];

interface CourseContextType {
  courses: Course[];
  categories: CustomCategory[];
  resources: SiteResource[];
  blogPosts: BlogPost[];
  reviews: Review[];
  siteSettings: SiteSettings;
  hasUnpushedChanges: boolean;
  refreshFromLive: () => Promise<void>;
  markChangesPushed: () => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  addCategory: (category: CustomCategory) => void;
  updateCategory: (category: CustomCategory) => void;
  deleteCategory: (id: string) => void;
  addResource: (resource: SiteResource) => void;
  updateResource: (resource: SiteResource) => void;
  deleteResource: (id: string) => void;
  getCourseBySlug: (slug: string) => Course | undefined;
  getEffectivePrice: (course: Course) => number;
  isOfferActive: (course: Course) => boolean;
  isCourseExpired: (course: Course) => boolean;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  addReview: (review: Review) => void;
  exportCoursesJSON: () => string;
  importCoursesJSON: (jsonString: string) => boolean;
  clearAllCourses: () => void;
  resetToDefaults: () => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

const STORAGE_KEYS = {
  COURSES: '10ms_shop_courses_v6_live',
  CATEGORIES: '10ms_shop_custom_categories_v4',
  RESOURCES: '10ms_shop_custom_resources_v1',
  BLOGS: '10ms_shop_blogs_v3_clean',
  REVIEWS: '10ms_shop_reviews_v2',
  SETTINGS: '10ms_shop_settings_v3',
  LOCAL_MODIFIED: '10ms_shop_local_modified_at',
  REMOTE_LAST_UPDATED: '10ms_shop_remote_last_updated',
};

const defaultSettings: SiteSettings = {
  siteName: '10mscourse.shop',
  logoUrl: 'https://res.cloudinary.com/drvyjj7td/image/upload/v1789563770/10ms_logo_f_sxbaio.png',
  whatsappNumber: '@md.me',
  announcementText: '🎉 ১০ মিনিট স্কুলের সকল কোর্সে স্পেশাল ডিসকাউন্ট ও ভর্তি অফার চলছে!',
  defaultAffiliateCode: '10mscourse_shop'
};

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/mhims/10ms-Course-Shop/main';

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialCourses;
  });

  const [hasUnpushedChanges, setHasUnpushedChanges] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEYS.LOCAL_MODIFIED));
    } catch {
      return false;
    }
  });

  const markLocalChange = () => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEYS.LOCAL_MODIFIED, now.toString());
    } catch {}
    setHasUnpushedChanges(true);
  };

  const markChangesPushed = () => {
    const now = Date.now();
    try {
      localStorage.removeItem(STORAGE_KEYS.LOCAL_MODIFIED);
      localStorage.setItem(STORAGE_KEYS.REMOTE_LAST_UPDATED, now.toString());
    } catch {}
    setHasUnpushedChanges(false);
  };

  // Helper to persist courses to backend API (in AI Studio / Vite dev server)
  const syncCoursesToDisk = (updatedCourses: Course[]) => {
    try {
      fetch('/api/save-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: updatedCourses })
      }).catch(() => {
        // silent in static hosting
      });
    } catch {
      // ignore
    }
  };

  // Core live data fetcher with instant GitHub Raw bypass and local modification protection
  const fetchLive = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const cacheBust = `?t=${Date.now()}`;
      let localModifiedTime = 0;
      try {
        const localModStr = localStorage.getItem(STORAGE_KEYS.LOCAL_MODIFIED);
        if (localModStr) localModifiedTime = parseInt(localModStr, 10) || 0;
      } catch {}

      // 1. Fetch live settings to detect timestamps
      let originSettings: SiteSettings | null = null;
      let rawSettings: SiteSettings | null = null;

      // Check local dev backend or domain origin settings.json (always root absolute!)
      try {
        const res = await fetch(`/api/settings${cacheBust}`);
        if (res.ok) {
          originSettings = await res.json();
        } else {
          const sRes = await fetch(`${origin}/settings.json${cacheBust}`, { cache: 'no-store' });
          if (sRes.ok) originSettings = await sRes.json();
        }
      } catch {}

      // Check GitHub raw settings (updates instantly upon push, bypassing Fastly's 10-min cache)
      try {
        const rawRes = await fetch(`${GITHUB_RAW_BASE}/settings.json${cacheBust}`, { cache: 'no-store' });
        if (rawRes.ok) {
          rawSettings = await rawRes.json();
        }
      } catch {}

      const originTs = originSettings?.lastUpdated || 0;
      const rawTs = rawSettings?.lastUpdated || 0;

      // Select freshest remote source
      const preferRaw = rawTs > originTs;
      const effectiveRemoteSettings = preferRaw ? rawSettings : (originSettings || rawSettings);
      const effectiveRemoteTs = Math.max(originTs, rawTs);

      // If user made local edits in Admin Panel that are newer than remote server deployment:
      // DO NOT overwrite user's local edits!
      if (localModifiedTime > 0 && localModifiedTime > effectiveRemoteTs) {
        setHasUnpushedChanges(true);
        if (effectiveRemoteSettings && effectiveRemoteSettings.siteName) {
          setSiteSettings(prev => ({ ...prev, ...effectiveRemoteSettings, lastUpdated: localModifiedTime }));
        }
        return;
      }

      // If remote has newer or synchronized data, update local state
      setHasUnpushedChanges(false);
      try {
        localStorage.removeItem(STORAGE_KEYS.LOCAL_MODIFIED);
      } catch {}

      if (effectiveRemoteSettings && effectiveRemoteSettings.siteName) {
        setSiteSettings(prev => ({ ...prev, ...effectiveRemoteSettings }));
      }

      const activeBase = preferRaw ? GITHUB_RAW_BASE : origin;

      // Fetch Courses (always root absolute!)
      try {
        let cRes = await fetch(`${activeBase}/courses.json${cacheBust}`, { cache: 'no-store' });
        if (!cRes.ok && preferRaw) {
          cRes = await fetch(`${origin}/courses.json${cacheBust}`, { cache: 'no-store' });
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setCourses(cData);
          }
        }
      } catch (err) {
        console.warn('Courses live fetch error:', err);
      }

      // Fetch Blogs
      try {
        let bRes = await fetch(`${activeBase}/blogs.json${cacheBust}`, { cache: 'no-store' });
        if (!bRes.ok && preferRaw) {
          bRes = await fetch(`${origin}/blogs.json${cacheBust}`, { cache: 'no-store' });
        }
        if (bRes.ok) {
          const bData = await bRes.json();
          if (Array.isArray(bData) && bData.length > 0) {
            setBlogPosts(bData);
          }
        }
      } catch {}

      // Fetch Categories
      try {
        let catRes = await fetch(`${activeBase}/categories.json${cacheBust}`, { cache: 'no-store' });
        if (!catRes.ok && preferRaw) {
          catRes = await fetch(`${origin}/categories.json${cacheBust}`, { cache: 'no-store' });
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategories(catData);
          }
        }
      } catch {}

      // Fetch Resources
      try {
        let rRes = await fetch(`${activeBase}/resources.json${cacheBust}`, { cache: 'no-store' });
        if (!rRes.ok && preferRaw) {
          rRes = await fetch(`${origin}/resources.json${cacheBust}`, { cache: 'no-store' });
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          if (Array.isArray(rData) && rData.length > 0) {
            setResources(rData);
          }
        }
      } catch {}

    } catch (e) {
      console.warn('Live fetch error:', e);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  const refreshFromLive = async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOCAL_MODIFIED);
    } catch {}
    setHasUnpushedChanges(false);
    await fetchLive();
  };

  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialDefaultCategories;
  });

  const [resources, setResources] = useState<SiteResource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialDefaultResources;
  });

  const syncBlogsToDisk = (updatedBlogs: BlogPost[]) => {
    try {
      fetch('/api/save-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogs: updatedBlogs })
      }).catch(() => {
        // silent in static hosting
      });
    } catch {
      // ignore
    }
  };

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      // Clean out any legacy demo blog keys from visitor browsers
      localStorage.removeItem('10ms_shop_blogs_v2');
      localStorage.removeItem('10ms_shop_blogs_v1');

      const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(b => b.id !== 'blog-1' && b.id !== 'blog-2' && b.id !== 'blog-3');
        }
      }
    } catch {
      // fallback
    }
    return initialBlogPosts;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialReviews;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return defaultSettings;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (err) {
      console.error('Failed saving courses to storage', err);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (err) {
      console.error('Failed saving categories to storage', err);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (err) {
      console.error('Failed saving resources to storage', err);
    }
  }, [resources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogPosts));
    } catch (err) {
      console.error('Failed saving blogs to storage', err);
    }
  }, [blogPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (err) {
      console.error('Failed saving reviews to storage', err);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(siteSettings));
    } catch (err) {
      console.error('Failed saving settings to storage', err);
    }
  }, [siteSettings]);

  // Check if an offer is currently valid and active
  const isOfferActive = (course: Course): boolean => {
    if (!course.offerEndDate) return false;
    const now = new Date().getTime();
    const expiry = new Date(course.offerEndDate).getTime();
    return !isNaN(expiry) && expiry > now && course.offerPrice > 0 && course.offerPrice < course.regularPrice;
  };

  // If offer is active, return offerPrice, else automatically fallback to regularPrice!
  const getEffectivePrice = (course: Course): number => {
    return isOfferActive(course) ? course.offerPrice : course.regularPrice;
  };

  // Check if course itself has expired
  const isCourseExpired = (course: Course): boolean => {
    if (course.status === 'expired') return true;
    if (course.isLifetime) return false;
    if (!course.expiryDate) return false;
    const now = new Date().getTime();
    const expiry = new Date(course.expiryDate).getTime();
    return !isNaN(expiry) && now > expiry;
  };

  const getCourseBySlug = (slug: string): Course | undefined => {
    const cleanSlug = slug.replace(/^\/+/, '');
    return courses.find(c => c.slug === cleanSlug || c.slug === slug || c.id === slug);
  };

  const addCategory = (category: CustomCategory) => {
    markLocalChange();
    setCategories(prev => {
      if (prev.some(c => c.id === category.id)) {
        return prev.map(c => (c.id === category.id ? category : c));
      }
      return [...prev, category];
    });
  };

  const updateCategory = (category: CustomCategory) => {
    markLocalChange();
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
  };

  const deleteCategory = (id: string) => {
    markLocalChange();
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addResource = (resource: SiteResource) => {
    markLocalChange();
    setResources(prev => {
      if (prev.some(r => r.id === resource.id)) {
        return prev.map(r => (r.id === resource.id ? resource : r));
      }
      return [...prev, resource];
    });
  };

  const updateResource = (resource: SiteResource) => {
    markLocalChange();
    setResources(prev => prev.map(r => (r.id === resource.id ? resource : r)));
  };

  const deleteResource = (id: string) => {
    markLocalChange();
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const addCourse = (newCourse: Course) => {
    markLocalChange();
    setCourses(prev => {
      const exists = prev.some(c => c.id === newCourse.id);
      const updated = exists ? prev.map(c => (c.id === newCourse.id ? newCourse : c)) : [newCourse, ...prev];
      syncCoursesToDisk(updated);
      return updated;
    });
    if (newCourse.category && newCourse.category.trim()) {
      const catTrimmed = newCourse.category.trim();
      setCategories(prev => {
        if (!prev.some(c => c.id === catTrimmed || c.name === catTrimmed)) {
          return [...prev, { id: catTrimmed, name: catTrimmed }];
        }
        return prev;
      });
    }
  };

  const updateCourse = (updatedCourse: Course) => {
    markLocalChange();
    setCourses(prev => {
      const updated = prev.map(c => (c.id === updatedCourse.id ? updatedCourse : c));
      syncCoursesToDisk(updated);
      return updated;
    });
  };

  const deleteCourse = (id: string) => {
    markLocalChange();
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== id);
      syncCoursesToDisk(updated);
      return updated;
    });
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    markLocalChange();
    setSiteSettings(prev => ({ ...prev, ...settings }));
  };

  const addBlogPost = (post: BlogPost) => {
    markLocalChange();
    setBlogPosts(prev => {
      const updated = [post, ...prev];
      syncBlogsToDisk(updated);
      return updated;
    });
  };

  const updateBlogPost = (post: BlogPost) => {
    markLocalChange();
    setBlogPosts(prev => {
      const updated = prev.map(b => (b.id === post.id ? post : b));
      syncBlogsToDisk(updated);
      return updated;
    });
  };

  const deleteBlogPost = (id: string) => {
    markLocalChange();
    setBlogPosts(prev => {
      const updated = prev.filter(b => b.id !== id);
      syncBlogsToDisk(updated);
      return updated;
    });
  };

  const addReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };

  const exportCoursesJSON = (): string => {
    return JSON.stringify(courses, null, 2);
  };

  const importCoursesJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        markLocalChange();
        setCourses(parsed);
        syncCoursesToDisk(parsed);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const clearAllCourses = () => {
    markLocalChange();
    setCourses([]);
    syncCoursesToDisk([]);
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDefaults = () => {
    const fresh = generateFull150Courses();
    setCourses(fresh);
    setCategories(initialDefaultCategories);
    setResources(initialDefaultResources);
    setBlogPosts(initialBlogPosts);
    setReviews(initialReviews);
    setSiteSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.BLOGS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_MODIFIED);
    localStorage.removeItem(STORAGE_KEYS.REMOTE_LAST_UPDATED);
    setHasUnpushedChanges(false);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        categories,
        resources,
        blogPosts,
        reviews,
        siteSettings,
        hasUnpushedChanges,
        refreshFromLive,
        markChangesPushed,
        addCourse,
        updateCourse,
        deleteCourse,
        addCategory,
        updateCategory,
        deleteCategory,
        addResource,
        updateResource,
        deleteResource,
        getCourseBySlug,
        getEffectivePrice,
        isOfferActive,
        isCourseExpired,
        updateSiteSettings,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addReview,
        exportCoursesJSON,
        importCoursesJSON,
        clearAllCourses,
        resetToDefaults,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};
