export type CourseCategory = string;

export interface CustomCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface SyllabusItem {
  title: string;
  count: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  englishTitle: string;
  category: CourseCategory;
  displayTargets: string[]; // e.g. ['home', 'class-9-10', 'admission']
  regularPrice: number;
  offerPrice: number;
  offerEndDate: string; // ISO string e.g. "2026-10-31T23:59:59"
  expiryDate?: string;  // ISO string, if course is no longer available after this
  isLifetime: boolean;  // আজীবন মেয়াদ
  status?: 'active' | 'expired' | 'archived'; // কোর্স স্ট্যাটাস: চলমান নাকি সমাপ্ত
  imageUrl: string;
  imageAlt: string;
  affiliateLink: string;
  promoCode?: string;   // প্রোমো কোড (কপি করার অপশন)
  targetClass?: string; // কোন ক্লাসের কোর্স (যেমন: ৬ষ্ঠ শ্রেণী, ৭ম শ্রেণী, ৮ম শ্রেণী, ৬ষ্ঠ-৮ম, ৯ম-১০ম, HSC)
  instructor?: string;  // শিক্ষকের নাম (ঐচ্ছিক/নট ম্যান্ডেটরি)
  instructorRole?: string;
  instructorAvatar?: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  syllabus: SyllabusItem[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  isFeatured?: boolean;
  badgeText?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  category: string;
}

export interface SiteResource {
  id: string;
  title: string;
  url: string;
  badge?: string;
}

export interface Review {
  id: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  studentName: string;
  studentInstitution: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  whatsappNumber: string;
  announcementText: string;
  defaultAffiliateCode: string;
}

export type PageRoute = 
  | '/'
  | '/class-6-8'
  | '/class-9-10'
  | '/hsc'
  | '/admission'
  | '/skills'
  | '/spoken-english'
  | '/job-prep'
  | '/blog'
  | '/review'
  | '/admin'
  | string;
