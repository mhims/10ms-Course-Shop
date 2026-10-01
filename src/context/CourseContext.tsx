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
  COURSES: '10ms_shop_courses_v5_live',
  CATEGORIES: '10ms_shop_custom_categories_v4',
  RESOURCES: '10ms_shop_custom_resources_v1',
  BLOGS: '10ms_shop_blogs_v3_clean',
  REVIEWS: '10ms_shop_reviews_v2',
  SETTINGS: '10ms_shop_settings_v3',
};

const defaultSettings: SiteSettings = {
  siteName: '10mscourse.shop',
  logoUrl: 'https://res.cloudinary.com/drvyjj7td/image/upload/v1789563770/10ms_logo_f_sxbaio.png',
  whatsappNumber: '@md.me',
  announcementText: '🎉 ১০ মিনিট স্কুলের সকল কোর্সে স্পেশাল ডিসকাউন্ট ও ভর্তি অফার চলছে!',
  defaultAffiliateCode: '10mscourse_shop'
};

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

  // Fetch live courses from API or static courses.json WITHOUT wiping user edits or local storage
  useEffect(() => {
    const fetchLive = async () => {
      try {
        let res = await fetch('/api/courses');
        if (!res.ok) {
          res = await fetch('./courses.json');
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(prev => {
              // If user already has courses in state/localStorage, ALWAYS RESPECT the user's edits!
              // NEVER overwrite user's custom images, affiliate links, prices, or titles!
              if (prev && prev.length > 0) {
                const existingMap = new Map(prev.map(c => [c.id, c]));
                const existingSlugs = new Set(prev.map(c => c.slug));

                // Only append any brand-new courses from disk that user hasn't added yet
                const newlyFoundFromDisk = data.filter(
                  (remoteCourse: Course) => !existingMap.has(remoteCourse.id) && !existingSlugs.has(remoteCourse.slug)
                );

                if (newlyFoundFromDisk.length > 0) {
                  const merged = [...prev, ...newlyFoundFromDisk];
                  syncCoursesToDisk(merged);
                  return merged;
                }
                // Return prev unmodified to keep all user edits intact!
                return prev;
              }
              // If prev was empty, use data from disk
              return data;
            });
          }
        }

        // Also fetch live blogs for GitHub Pages visitors
        try {
          const bRes = await fetch('./blogs.json');
          if (bRes.ok) {
            const bData = await bRes.json();
            if (Array.isArray(bData) && bData.length > 0) {
              setBlogPosts(prev => {
                if (prev && prev.length > 0) {
                  const existingIds = new Set(prev.map(p => p.id));
                  const newFromDisk = bData.filter((b: BlogPost) => !existingIds.has(b.id));
                  if (newFromDisk.length > 0) {
                    return [...prev, ...newFromDisk];
                  }
                  return prev;
                }
                return bData;
              });
            }
          }
        } catch {
          // ignore
        }

        // Also fetch live settings for GitHub Pages visitors
        try {
          const sRes = await fetch('./settings.json');
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData && typeof sData === 'object' && sData.siteName) {
              setSiteSettings(prev => ({ ...prev, ...sData }));
            }
          }
        } catch {
          // ignore
        }
      } catch {
        // silently ignore
      }
    };
    fetchLive();
  }, []);

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
    setCategories(prev => {
      if (prev.some(c => c.id === category.id)) {
        return prev.map(c => (c.id === category.id ? category : c));
      }
      return [...prev, category];
    });
  };

  const updateCategory = (category: CustomCategory) => {
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addResource = (resource: SiteResource) => {
    setResources(prev => {
      if (prev.some(r => r.id === resource.id)) {
        return prev.map(r => (r.id === resource.id ? resource : r));
      }
      return [...prev, resource];
    });
  };

  const updateResource = (resource: SiteResource) => {
    setResources(prev => prev.map(r => (r.id === resource.id ? resource : r)));
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const addCourse = (newCourse: Course) => {
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
    setCourses(prev => {
      const updated = prev.map(c => (c.id === updatedCourse.id ? updatedCourse : c));
      syncCoursesToDisk(updated);
      return updated;
    });
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== id);
      syncCoursesToDisk(updated);
      return updated;
    });
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
  };

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => {
      const updated = [post, ...prev];
      syncBlogsToDisk(updated);
      return updated;
    });
  };

  const updateBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => {
      const updated = prev.map(b => (b.id === post.id ? post : b));
      syncBlogsToDisk(updated);
      return updated;
    });
  };

  const deleteBlogPost = (id: string) => {
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
