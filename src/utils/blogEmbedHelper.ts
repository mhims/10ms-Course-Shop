import { Course, BlogPost, CustomCategory } from '../types';

/**
 * Filter non-expired active courses
 */
export function getActiveCourses(courses: Course[]): Course[] {
  const now = new Date();
  return courses.filter((c) => {
    if (c.status === 'expired' || c.status === 'archived') return false;
    if (c.expiryDate) {
      const exp = new Date(c.expiryDate);
      if (exp.getTime() < now.getTime()) return false;
    }
    return true;
  });
}

/**
 * Get the latest N courses (1 to 5)
 */
export function getLatestCourses(courses: Course[], count: number = 3): Course[] {
  const active = getActiveCourses(courses);
  const safeCount = Math.max(1, Math.min(count, 5));
  return active.slice(0, safeCount);
}

/**
 * Check if a course matches a given category or batch
 */
export function courseBelongsToCategory(course: Course, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;
  const target = categoryId.toLowerCase().trim();

  // Direct match
  if (course.category && course.category.toLowerCase().trim() === target) return true;

  // Display targets (e.g. ['hsc-28', 'class-9-10'])
  if (course.displayTargets && course.displayTargets.some((t) => t.toLowerCase().trim() === target)) {
    return true;
  }

  // Target class or slug match
  if (course.targetClass && course.targetClass.toLowerCase().includes(target)) return true;
  if (course.slug && course.slug.toLowerCase().includes(target)) return true;

  return false;
}

/**
 * Get courses dynamically for a specific category
 * If new courses are added to this category in the future, they automatically show up!
 */
export function getCategoryCourses(
  courses: Course[],
  categoryId: string,
  count: number | 'all' = 'all'
): Course[] {
  const active = getActiveCourses(courses);
  const matching = active.filter((c) => courseBelongsToCategory(c, categoryId));

  if (count === 'all' || count === 0) {
    return matching;
  }

  const numericCount = typeof count === 'number' ? count : parseInt(String(count), 10) || matching.length;
  return matching.slice(0, numericCount);
}

/**
 * Resolve bottom recommended courses for a blog post based on its configuration:
 * 1. Latest courses (1-5)
 * 2. Category dynamic courses (1 to All)
 * 3. Specific manual courses
 * 4. None
 */
export function resolveBlogRecommendedCourses(
  blog: BlogPost,
  courses: Course[]
): { courses: Course[]; title: string; badge: string } {
  const active = getActiveCourses(courses);

  // Mode: None
  if (blog.courseRecommendationType === 'none') {
    return { courses: [], title: '', badge: '' };
  }

  // Mode: Latest courses (1-5)
  if (blog.courseRecommendationType === 'latest') {
    const count = typeof blog.courseRecommendationCount === 'number' ? blog.courseRecommendationCount : 3;
    const latestList = getLatestCourses(active, count);
    return {
      courses: latestList,
      title: 'সর্বশেষ ১০ মিনিট স্কুল কোর্স ও অফার',
      badge: 'লেটেস্ট কোর্স',
    };
  }

  // Mode: Category based dynamic courses
  if (blog.courseRecommendationType === 'category' && blog.courseRecommendationCategory) {
    const catId = blog.courseRecommendationCategory;
    const count = blog.courseRecommendationCount || 'all';
    const catCourses = getCategoryCourses(active, catId, count);

    return {
      courses: catCourses,
      title: `এই বিষয়ের সংশ্লিষ্ট ১০ মিনিট স্কুল কোর্স (${catCourses.length.toLocaleString('bn-BD')}টি)`,
      badge: 'ক্যাটাগরি কোর্স',
    };
  }

  // Mode: Specific manual selection or fallback
  if (blog.suggestedCourseIds && blog.suggestedCourseIds.length > 0) {
    const specific = active.filter(
      (c) => blog.suggestedCourseIds!.includes(c.id) || blog.suggestedCourseIds!.includes(c.slug)
    );
    if (specific.length > 0) {
      return {
        courses: specific,
        title: 'নিবন্ধ সংশ্লিষ্ট ১০ মিনিট স্কুল কোর্স অফার ও প্রোমো কোড',
        badge: 'স্পেশাল রেকমেন্ডেশন',
      };
    }
  }

  // Fallback: If blog has a category that matches courses, auto-suggest from that category, else latest 3
  const autoCategoryCourses = getCategoryCourses(active, blog.category, 3);
  if (autoCategoryCourses.length > 0) {
    return {
      courses: autoCategoryCourses,
      title: 'নিবন্ধের বিষয়ভিত্তিক ১০ মিনিট স্কুল কোর্সসমূহ',
      badge: 'কোর্স অফার',
    };
  }

  return {
    courses: active.slice(0, 3),
    title: 'জনপ্রিয় ১০ মিনিট স্কুল কোর্সসমূহ',
    badge: 'সেরা কোর্স',
  };
}

export interface ParsedBlogContentPart {
  type: 'html' | 'course-card' | 'course-latest' | 'course-category';
  content?: string;
  courses?: Course[];
  title?: string;
  badge?: string;
}

/**
 * Parse rich blog content with support for:
 * 1. [course-card:slug] (existing single card)
 * 2. [courses-latest count="X"] or [course-embed:latest count="X"]
 * 3. [courses-category category="CAT" count="X"] or [course-embed:category category="CAT" count="X"]
 */
export function parseRichBlogContent(
  rawContent: string,
  allCourses: Course[],
  customCategories: CustomCategory[] = []
): ParsedBlogContentPart[] {
  if (!rawContent) return [];

  // Master regex matching all course embed shortcodes:
  // 1: [course-card:identifier]
  // 2: [course-embed:latest:count] or [courses-latest count="N"]
  // 3: [course-embed:category:catId:count] or [courses-category category="CAT" count="N"]
  const tokenRegex = /(\[course-card:[^\]]+\]|\[courses-latest\s+count="?\d+"?\]|\[course-embed:latest:\d+\]|\[courses-category\s+category="?[^"\s\]]+"?\s*(?:count="?[^"\s\]]+"?)*\]|\[course-embed:category:[^:\]]+:[^\]]+\])/gi;

  const parts = rawContent.split(tokenRegex);
  const result: ParsedBlogContentPart[] = [];

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i];
    if (!segment) continue;

    // Check if segment is a shortcode
    if (segment.startsWith('[') && segment.endsWith(']')) {
      // 1. Single card: [course-card:identifier]
      const cardMatch = segment.match(/\[course-card:([^\]]+)\]/i);
      if (cardMatch) {
        const idOrSlug = cardMatch[1].trim();
        const found = allCourses.find((c) => c.slug === idOrSlug || c.id === idOrSlug);
        if (found) {
          result.push({
            type: 'course-card',
            courses: [found],
            title: found.title,
            badge: 'সুপারিশকৃত কোর্স',
          });
        }
        continue;
      }

      // 2. Latest courses: [courses-latest count="3"] or [course-embed:latest:3]
      const latestMatch1 = segment.match(/\[courses-latest\s+count="?(\d+)"?\]/i);
      const latestMatch2 = segment.match(/\[course-embed:latest:(\d+)\]/i);
      const latestCount = parseInt(latestMatch1?.[1] || latestMatch2?.[1] || '3', 10);

      if (latestMatch1 || latestMatch2) {
        const latestCourses = getLatestCourses(allCourses, latestCount);
        result.push({
          type: 'course-latest',
          courses: latestCourses,
          title: `লেটেস্ট ১০ মিনিট স্কুল কোর্স (${latestCourses.length.toLocaleString('bn-BD')}টি)`,
          badge: 'সর্বশেষ কোর্স',
        });
        continue;
      }

      // 3. Category courses: [courses-category category="hsc" count="all"] or [course-embed:category:hsc:all]
      const catMatch1 = segment.match(/\[courses-category\s+category="?([^"\s\]]+)"?(?:\s+count="?([^"\s\]]+)"?)?\]/i);
      const catMatch2 = segment.match(/\[course-embed:category:([^:\]]+):([^\]]+)\]/i);

      if (catMatch1 || catMatch2) {
        const catId = (catMatch1?.[1] || catMatch2?.[1] || '').trim();
        const countRaw = (catMatch1?.[2] || catMatch2?.[2] || 'all').trim();
        const count = countRaw === 'all' ? 'all' : parseInt(countRaw, 10) || 'all';

        const catName = customCategories.find((c) => c.id === catId)?.name || catId;
        const matchingCourses = getCategoryCourses(allCourses, catId, count);

        result.push({
          type: 'course-category',
          courses: matchingCourses,
          title: `${catName} কোর্সসমূহ (${matchingCourses.length.toLocaleString('bn-BD')}টি)`,
          badge: `${catName} ব্যাচ`,
        });
        continue;
      }
    }

    // Otherwise standard HTML/text
    result.push({
      type: 'html',
      content: segment,
    });
  }

  return result;
}
