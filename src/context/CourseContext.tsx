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
  BLOGS: '10ms_shop_blogs_v2',
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

  // Fetch live courses.json from repository if available (allows true live sync with GitHub Pages!)
  useEffect(() => {
    fetch('./courses.json')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(() => {
        // silently ignore if not present
      });
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

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
      if (saved) return JSON.parse(saved);
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
    setCourses(prev => [newCourse, ...prev]);
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
    setCourses(prev => prev.map(c => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
  };

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => [post, ...prev]);
  };

  const updateBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => prev.map(b => (b.id === post.id ? post : b)));
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(b => b.id !== id));
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
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const clearAllCourses = () => {
    setCourses([]);
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
