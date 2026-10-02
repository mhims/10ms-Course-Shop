import { Course, CourseCategory } from '../types';

export const getCourseClassLabel = (course: Course): string => {
  if (course.targetClass && course.targetClass.trim()) {
    return course.targetClass.trim();
  }

  // Check specific class in displayTargets
  if (course.displayTargets?.includes('class-6')) return '৬ষ্ঠ শ্রেণী';
  if (course.displayTargets?.includes('class-7')) return '৭ম শ্রেণী';
  if (course.displayTargets?.includes('class-8')) return '৮ম শ্রেণী';

  // Check category
  if (course.category === 'class-6') return '৬ষ্ঠ শ্রেণী';
  if (course.category === 'class-7') return '৭ম শ্রেণী';
  if (course.category === 'class-8') return '৮ম শ্রেণী';
  if (course.category === 'class-6-8' || course.displayTargets?.includes('class-6-8')) {
    // Check if title mentions specific class
    if (course.title.includes('৬ষ্ঠ') || course.title.toLowerCase().includes('class 6')) return '৬ষ্ঠ শ্রেণী';
    if (course.title.includes('৭ম') || course.title.toLowerCase().includes('class 7')) return '৭ম শ্রেণী';
    if (course.title.includes('৮ম') || course.title.toLowerCase().includes('class 8')) return '৮ম শ্রেণী';
    return '৬ষ্ঠ-৮ম শ্রেণী';
  }

  if (course.category === 'class-9-10' || course.displayTargets?.includes('class-9-10')) {
    if (course.title.includes('৯ম') || course.title.toLowerCase().includes('class 9')) return '৯ম শ্রেণী';
    if (course.title.includes('১০ম') || course.title.toLowerCase().includes('class 10')) return '১০ম শ্রেণী';
    return '৯ম-১০ম (SSC)';
  }

  if (course.category === 'hsc' || course.displayTargets?.includes('hsc')) return 'এইচএসসি (HSC)';
  if (course.category === 'admission' || course.displayTargets?.includes('admission')) return 'এডমিশন টেস্ট';
  if (course.category === 'spoken-english' || course.displayTargets?.includes('spoken-english')) return 'স্পোকেন ইংলিশ';
  if (course.category === 'skills' || course.displayTargets?.includes('skills')) return 'স্কিলস';
  if (course.category === 'job-prep' || course.displayTargets?.includes('job-prep')) return 'চাকরি প্রস্তুতি';

  return 'একাডেমিক';
};

export const CLASS_CATEGORY_OPTIONS = [
  { id: 'class-6' as CourseCategory, label: '৬ষ্ঠ শ্রেণী', shortLabel: '৬ষ্ঠ' },
  { id: 'class-7' as CourseCategory, label: '৭ম শ্রেণী', shortLabel: '৭ম' },
  { id: 'class-8' as CourseCategory, label: '৮ম শ্রেণী', shortLabel: '৮ম' },
  { id: 'class-6-8' as CourseCategory, label: 'ক্লাস ৬-৮ (সকল)', shortLabel: '৬ষ্ঠ-৮ম' },
  { id: 'class-9-10' as CourseCategory, label: 'ক্লাস ৯-১০ (SSC)', shortLabel: 'এসএসসি' },
  { id: 'hsc' as CourseCategory, label: 'এইচএসসি (HSC)', shortLabel: 'এইচএসসি' },
  { id: 'admission' as CourseCategory, label: 'এডমিশন টেস্ট', shortLabel: 'এডমিশন' },
  { id: 'spoken-english' as CourseCategory, label: 'স্পোকেন ইংলিশ', shortLabel: 'স্পোকেন' },
  { id: 'skills' as CourseCategory, label: 'স্কিল ও ফ্রিল্যান্সিং', shortLabel: 'স্কিলস' },
  { id: 'job-prep' as CourseCategory, label: 'বিসিএস ও চাকরি', shortLabel: 'চাকরি' },
];

export const normalizeImageUrl = (rawUrl?: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Google Drive sharing link conversion:
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
  }

  // Dropbox direct link
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
};

