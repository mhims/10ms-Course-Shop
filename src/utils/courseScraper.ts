export interface ScrapedCourseData {
  title: string;
  englishTitle?: string;
  slug: string;
  imageUrl: string;
  imageAlt: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  category: string;
  targetClass?: string;
  affiliateLink: string;
  promoCode?: string;
  instructor?: string;
  instructorRole?: string;
  highlights?: string[];
  syllabus?: Array<{ title: string; count: string }>;
  regularPrice?: number;
  offerPrice?: number;
  displayTargets?: string[];
  reviewCount?: number;
  enrolledCount?: number;
}

/**
 * Intelligent category detection based on slug or course title
 */
/**
 * Generates realistic randomized review and enrolled count matching natural patterns
 */
export function getRandomReviewCount(): { reviewCount: number; enrolledCount: number; rating: number } {
  const pool = [154, 185, 230, 275, 343, 412, 538, 720, 895, 1133, 1280];
  const reviewCount = pool[Math.floor(Math.random() * pool.length)] + Math.floor(Math.random() * 12);
  const enrolledCount = reviewCount * (8 + Math.floor(Math.random() * 5));
  const rating = Number((4.8 + Math.random() * 0.2).toFixed(1));
  return { reviewCount, enrolledCount, rating: Math.min(5.0, rating) };
}

/**
 * Intelligent category detection based on slug or course title.
 * Maps BOTH main category and specific batch categories (e.g. HSC 28, HSC 27, SSC 26, Class 8 etc.)
 */
export function detectCategoryAndClass(text: string): {
  category: string;
  targetClass?: string;
  displayTargets: string[];
} {
  const lower = text.toLowerCase();

  // SSC / Class 9-10 & Specific Batches
  if (
    lower.includes('ssc') ||
    lower.includes('৯ম') ||
    lower.includes('১০ম') ||
    lower.includes('class-9') ||
    lower.includes('class-10') ||
    lower.includes('দাখিল')
  ) {
    let targetClass = '৯ম-১০ম (SSC)';
    const displayTargets = ['home', 'class-9-10'];

    if (lower.includes('27') || lower.includes('২০২৭')) {
      targetClass = 'SSC 2027';
      displayTargets.push('ssc-2027');
    } else if (lower.includes('26') || lower.includes('২০২৬')) {
      targetClass = 'SSC 2026';
      displayTargets.push('ssc-2026');
    } else if (lower.includes('25') || lower.includes('২০২৫')) {
      targetClass = 'SSC 2025';
    }

    return { category: 'class-9-10', targetClass, displayTargets };
  }

  // HSC & Specific Batches (e.g. HSC 2028, HSC 2027, HSC 2026)
  if (lower.includes('hsc') || lower.includes('এইচএসসি') || lower.includes('আলিম')) {
    let targetClass = 'এইচএসসি (HSC)';
    const displayTargets = ['home', 'hsc'];

    if (lower.includes('28') || lower.includes('২০২৮')) {
      targetClass = 'HSC 2028';
      displayTargets.push('hsc-2028');
    } else if (lower.includes('27') || lower.includes('২০২৭')) {
      targetClass = 'HSC 2027';
      displayTargets.push('hsc-2027');
    } else if (lower.includes('26') || lower.includes('২০২৬')) {
      targetClass = 'HSC 2026';
      displayTargets.push('hsc-2026');
    }

    return { category: 'hsc', targetClass, displayTargets };
  }

  // Admission
  if (
    lower.includes('admission') ||
    lower.includes('ভর্তি') ||
    lower.includes('buet') ||
    lower.includes('medical') ||
    lower.includes('varsity') ||
    lower.includes('engineering') ||
    lower.includes('বিশ্ববিদ্যালয়')
  ) {
    return {
      category: 'admission',
      targetClass: 'এডমিশন টেস্ট',
      displayTargets: ['home', 'admission'],
    };
  }

  // Class 6-8 & Specific Classes
  if (
    lower.includes('class-6') ||
    lower.includes('class-7') ||
    lower.includes('class-8') ||
    lower.includes('৬ষ্ঠ') ||
    lower.includes('৭ম') ||
    lower.includes('৮ম') ||
    lower.includes('অষ্টম') ||
    lower.includes('সপ্তম') ||
    lower.includes('ষষ্ঠ')
  ) {
    let targetClass = 'ক্লাস ৬-৮';
    const displayTargets = ['home', 'class-6-8'];

    if (lower.includes('৮ম') || lower.includes('class-8') || lower.includes('অষ্টম')) {
      targetClass = '৮ম শ্রেণি';
      displayTargets.push('class-8');
    } else if (lower.includes('৭ম') || lower.includes('class-7') || lower.includes('সপ্তম')) {
      targetClass = '৭ম শ্রেণি';
      displayTargets.push('class-7');
    } else if (lower.includes('৬ষ্ঠ') || lower.includes('class-6') || lower.includes('ষষ্ঠ')) {
      targetClass = '৬ষ্ঠ শ্রেণি';
      displayTargets.push('class-6');
    }

    return { category: 'class-6-8', targetClass, displayTargets };
  }

  // Spoken English / IELTS
  if (
    lower.includes('spoken') ||
    lower.includes('english') ||
    lower.includes('ielts') ||
    lower.includes('ইংরেজি') ||
    lower.includes('স্পোকেন')
  ) {
    return {
      category: 'spoken-english',
      targetClass: 'স্পোকেন ইংলিশ',
      displayTargets: ['home', 'spoken-english'],
    };
  }

  // Job Prep / BCS
  if (
    lower.includes('bcs') ||
    lower.includes('বিসিএস') ||
    lower.includes('bank') ||
    lower.includes('চাকরি') ||
    lower.includes('job') ||
    lower.includes('primary')
  ) {
    return {
      category: 'job-prep',
      targetClass: 'সরকারি ও ব্যাংক চাকরি',
      displayTargets: ['home', 'job-prep'],
    };
  }

  // Skills / Freelancing
  if (
    lower.includes('skill') ||
    lower.includes('freelance') ||
    lower.includes('graphic') ||
    lower.includes('programming') ||
    lower.includes('excel') ||
    lower.includes('video') ||
    lower.includes('marketing')
  ) {
    return {
      category: 'skills',
      targetClass: 'প্রফেশনাল স্কিলস',
      displayTargets: ['home', 'skills'],
    };
  }

  return {
    category: 'class-9-10',
    targetClass: '৯ম-১০ম (SSC)',
    displayTargets: ['home', 'class-9-10'],
  };
}

/**
 * Resolves short links (e.g. 10ms.io/xyz) to the final destination product URL
 */
async function resolveShortUrl(rawLink: string): Promise<string> {
  const cleanLink = rawLink.trim();

  // If already a full 10minuteschool.com product link, no unshortening needed!
  if (cleanLink.includes('10minuteschool.com/product/')) {
    return cleanLink;
  }

  // 1. Try local dev proxy endpoint if available
  try {
    const localRes = await fetch(`/api/unshorten?url=${encodeURIComponent(cleanLink)}`);
    if (localRes.ok) {
      const json = await localRes.json();
      if (json.resolvedUrl && json.resolvedUrl.includes('/product/')) {
        return json.resolvedUrl;
      }
    }
  } catch {
    // Ignore in static hosting
  }

  // 2. Try unshorten.me public CORS API
  try {
    const unshortenRes = await fetch(`https://unshorten.me/json/${cleanLink}`);
    if (unshortenRes.ok) {
      const data = await unshortenRes.json();
      if (data.resolved_url && data.success) {
        return data.resolved_url;
      }
    }
  } catch {
    // Fallback below
  }

  // 3. Try allorigins HTML fetch to extract redirect path
  try {
    const allOriginsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(cleanLink)}`);
    if (allOriginsRes.ok) {
      const html = await allOriginsRes.text();
      // Look for /product/xyz in Cloudflare challenge or redirect tags
      const match = html.match(/\/product\/([a-zA-Z0-9_-]+)(?:\?[^"'\s<>]*)?/);
      if (match) {
        return `https://10minuteschool.com${match[0]}`;
      }
    }
  } catch {
    // Ignore
  }

  return cleanLink;
}

// Helper to clean excessive bold tags from descriptions while keeping clean structure
export function cleanMarkdownDescription(markdown: string): string {
  if (!markdown) return '';
  let text = markdown;

  // 1. Remove bold tags from bullet point prefixes:
  // "- **লাইভ ক্লাস:** বিবরণ" -> "- লাইভ ক্লাস: বিবরণ"
  text = text.replace(/^(\s*[-*]\s*)\*\*([^*]+)\*\*(:|-|\s*)/gm, '$1$2$3');

  // 2. Remove accidental bolding of entire bullet point:
  // "- **পুরো বাক্যটি বোল্ড**" -> "- পুরো বাক্যটি বোল্ড"
  text = text.replace(/^(\s*[-*]\s*)\*\*([^*]+)\*\*$/gm, '$1$2');

  // 3. Remove accidental bolding of entire line/paragraph:
  // "**১০ মিনিট স্কুলের এই কোর্সটির মাধ্যমে...**" -> "১০ মিনিট স্কুলের এই কোর্সটির মাধ্যমে..."
  text = text.replace(/^\*\*([^*]+)\*\*$/gm, '$1');

  // 4. Remove unneeded bolding around common words in descriptions
  text = text.replace(/\*\*"([^"]+)"\*\*/g, '"$1"');

  // 5. Clean up redundant empty lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Helper to extract short code from 10ms.io URLs (e.g. https://10ms.io/1L03Sn?aff=... -> 1l03sn)
 */
export function extract10msCode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/10ms\.io\/([a-zA-Z0-9_-]+)/i);
  return match && match[1] ? match[1].toLowerCase() : null;
}

/**
 * Helper to extract product slug from 10minuteschool product URLs (e.g. /product/spoken-english -> spoken-english)
 */
export function extractProductSlug(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:10minuteschool\.com\/product\/|product\/|\/courses\/)([a-zA-Z0-9_-]+)/i);
  return match && match[1] ? match[1].toLowerCase() : null;
}

/**
 * Normalizes course link for robust duplicate detection
 */
export function normalizeCourseLink(url: string): string {
  if (!url || typeof url !== 'string') return '';
  let str = url.trim();

  // Strip protocol and www
  str = str.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  // Strip trailing slashes
  str = str.replace(/\/+$/, '');

  // 10ms.io shortlinks: extract code e.g. 10ms.io/SL2sUT
  const code = extract10msCode(str);
  if (code) {
    return `10ms.io/${code}`;
  }

  // 10minuteschool.com product pages: extract slug e.g. /product/ssc-26-science
  const prodSlug = extractProductSlug(str);
  if (prodSlug) {
    return `10ms-product/${prodSlug}`;
  }

  // Fallback normalize: strip query parameters and hash
  return str.toLowerCase().split('?')[0].split('#')[0];
}

/**
 * Checks whether an affiliate link matches any existing course in the website
 */
export function findDuplicateCourse<
  T extends { id: string; title: string; slug: string; affiliateLink?: string; offerPrice?: number; regularPrice?: number }
>(
  inputLink: string,
  existingCourses: T[],
  excludeCourseId?: string
): T | undefined {
  if (!inputLink || !inputLink.trim()) return undefined;
  const rawInput = inputLink.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
  const inputCode = extract10msCode(inputLink);
  const inputProductSlug = extractProductSlug(inputLink);
  const normalizedInput = normalizeCourseLink(inputLink);

  return existingCourses.find((c) => {
    if (excludeCourseId && c.id === excludeCourseId) return false;

    // A. Check against c.affiliateLink if present
    if (c.affiliateLink) {
      const cRaw = c.affiliateLink.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
      if (cRaw === rawInput) return true;

      // 1. 10ms.io shortcode match
      if (inputCode) {
        const cCode = extract10msCode(c.affiliateLink);
        if (cCode && cCode === inputCode) return true;
      }

      // 2. Normalized match
      const normalizedAff = normalizeCourseLink(c.affiliateLink);
      if (normalizedAff && normalizedInput && normalizedAff === normalizedInput) return true;

      // 3. Extracted product slug match from c.affiliateLink
      const cProductSlug = extractProductSlug(c.affiliateLink);
      if (inputProductSlug && cProductSlug && inputProductSlug === cProductSlug) return true;
    }

    // B. Check against c.slug
    if (c.slug) {
      const cleanSlug = c.slug.toLowerCase().trim();
      if (inputProductSlug && inputProductSlug === cleanSlug) return true;
      if (cleanSlug.length >= 5 && rawInput.includes(cleanSlug)) return true;
    }

    return false;
  });
}

// Helper to generate clean, beautiful, unbolded SEO Markdown full description template
export function generateCourseFullDescription(title: string, targetClass?: string, promoCode?: string, highlights: string[] = []): string {
  const cleanHighlights = highlights.length > 0
    ? highlights.map(h => `- ${h.replace(/\*\*/g, '').trim()}`).join('\n')
    : `- অভিজ্ঞ ও দেশের শীর্ষ মেন্টরদের পরিচালিত ক্লাস\n- সম্পূর্ণ অধ্যায়ভিত্তিক গোছানো লেকচার শিট ও পিডিএফ নোট\n- বোর্ড ও ভর্তি পরীক্ষার স্ট্যান্ডার্ড মডেল টেস্ট এবং ডাউট সলভিং\n- সার্বক্ষণিক পড়াশোনার গাইডলাইন ও বিশেষ সাপোর্ট`;

  const cleanTarget = targetClass
    ? `এই কোর্সটি মূলত ${targetClass.replace(/\*\*/g, '')}-এর শিক্ষার্থীদের জন্য বিশেষভাবে সাজানো হয়েছে, যেন খুব সহজে পূর্ণাঙ্গ সিলেবাস শেষ করে পরীক্ষায় সেরা ফলাফল অর্জন করা যায়।`
    : 'অনলাইনে সেরা শিক্ষকদের সরাসরি গাইডলাইনে পরীক্ষায় চমৎকার ফলাফল ও দৃঢ় আত্মবিশ্বাস নিশ্চিত করতে আগ্রহী যেকোনো শিক্ষার্থীর জন্য এই কোর্সটি অত্যন্ত ফলপ্রসূ।';

  const promoSection = promoCode
    ? `\n\nঅতিরিক্ত স্পেশাল ডিসকাউন্ট পাওয়ার জন্য চেকআউটের সময় প্রোমো কোড বক্সে ${promoCode} ব্যবহার করতে পারেন।`
    : '';

  return `# ${title}

১০ মিনিট স্কুলের এই কোর্সটির মাধ্যমে শিক্ষার্থীরা ঘরে বসেই যেকোনো সময় যেকোনো ডিভাইস থেকে পূর্ণাঙ্গ ও সুশৃঙ্খল প্রস্তুতি সম্পন্ন করতে পারবে।

## কোর্সের মূল সুবিধাসমূহ
${cleanHighlights}

## যা যা থাকছে এই কোর্সে
- প্রতিটি বিষয়ের বেসিক কনসেপ্ট ক্লিয়ার করার জন্য ধারাবাহিক লাইভ ও রেকর্ডেড ক্লাস
- প্রতিটি অধ্যায়ের সাথে লেকচার শিট, রিভিশন নোট ও ডিজিটাল প্র্যাকটিস ম্যাটেরিয়াল
- নিয়মিত কুইজ ও বোর্ড প্রশ্নের সমাধানের মাধ্যমে পূর্ণাঙ্গ মডেল টেস্ট অনুশীলন
- পড়াশোনায় যেকোনো সমস্যা বা প্রশ্নের দ্রুত সমাধান পেতে বিশেষ সাপোর্ট সুবিধা

## কাদের জন্য এই কোর্স?
${cleanTarget}

## কীভাবে ভর্তি হবেন?
উপরে থাকা "অফারে ভর্তি হোন" বা "কিনুন" বাটনে ক্লিক করে সরাসরি অফিসিয়াল পেজ থেকে আপনার ব্যাচ বেছে নিয়ে ভর্তি সম্পন্ন করতে পারবেন।${promoSection}`;
}

/**
 * Main scraper function: takes an affiliate link and extracts all metadata without AI
 */
export async function scrapeCourseFromUrl(url: string): Promise<ScrapedCourseData> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('অনুগ্রহ করে সঠিক এফিলিয়েট বা কোর্স লিংক দিন।');
  }

  // 1. Resolve redirect to find final product URL
  const resolvedUrl = await resolveShortUrl(cleanUrl);

  // 2. Extract promo code if embedded in url parameters (e.g. ?promo=ssc27smp)
  let promoCode: string | undefined = undefined;
  const promoMatch = resolvedUrl.match(/[?&]promo=([a-zA-Z0-9_-]+)/i);
  if (promoMatch && promoMatch[1]) {
    promoCode = promoMatch[1];
  }

  // 3. Extract product slug from URL (e.g. /product/ssc-27-science-final-preparation-course)
  let slug = '';
  const slugMatch = resolvedUrl.match(/\/product\/([a-zA-Z0-9_-]+)/);
  if (slugMatch && slugMatch[1]) {
    slug = slugMatch[1];
  } else {
    // If user provided another format, clean up whatever path segment exists
    try {
      const parsed = new URL(resolvedUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);
      slug = parts[parts.length - 1] || 'new-course';
    } catch {
      slug = 'new-course';
    }
  }

  // 4. Try official 10 Minute School Discovery API (Public CORS open)
  if (slug && (resolvedUrl.includes('10minuteschool.com') || cleanUrl.includes('10ms.io'))) {
    try {
      const apiUrl = `https://api.10minuteschool.com/discovery-service/api/v1/products/${slug}`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const json = await apiRes.json();
        const p = json.data;

        if (p && p.title) {
          const rawTitle = (p.title || '').trim();
          // Find primary cover image
          let imageUrl = '';
          if (Array.isArray(p.media)) {
            const imgObj = p.media.find((m: any) => m.resource_type === 'image' || m.type === 'image');
            imageUrl = imgObj?.resource_value || imgObj?.url || '';
          }

          // Category and Target Class with multi-category mapping
          const { category, targetClass, displayTargets } = detectCategoryAndClass(rawTitle + ' ' + slug);
          const reviews = getRandomReviewCount();

          // Extract highlights from pointers / features
          let highlights: string[] = [];
          if (Array.isArray(p.sections)) {
            const pointersSec = p.sections.find((s: any) => s.type === 'pointers' || s.type === 'features');
            if (pointersSec && Array.isArray(pointersSec.values)) {
              highlights = pointersSec.values
                .map((v: any) => v.text || v.title || '')
                .filter(Boolean)
                .slice(0, 5);
            }
          }

          // Extract instructors
          let instructor = '১০ মিনিট স্কুল';
          let instructorRole = 'অভিজ্ঞ শিক্ষকমণ্ডলী';
          if (Array.isArray(p.sections)) {
            const instSec = p.sections.find((s: any) => s.type === 'instructors');
            if (instSec && Array.isArray(instSec.values) && instSec.values.length > 0) {
              const names = instSec.values.map((v: any) => v.name).filter(Boolean);
              if (names.length <= 2) {
                instructor = names.join(', ');
              } else {
                instructor = `${names[0]} ও দেশের শীর্ষ শিক্ষকমণ্ডলী`;
              }
              instructorRole = instSec.values[0]?.designation || 'কোর্স ইন্সট্রাক্টর';
            }
          }

          // Extract short description
          let shortDescription = `${rawTitle} - ১০ মিনিট স্কুলের সম্পূর্ণ অনলাইন প্রস্তুতি কোর্স।`;
          if (Array.isArray(p.sections)) {
            const aboutSec = p.sections.find((s: any) => s.type === 'about');
            if (aboutSec?.description) {
              // Strip html tags
              const cleanAbout = aboutSec.description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
              if (cleanAbout.length > 20) {
                shortDescription = cleanAbout.slice(0, 220) + (cleanAbout.length > 220 ? '...' : '');
              }
            }
          }

          const resolvedHighlights = highlights.length > 0 ? highlights : ['লাইভ ক্লাস', 'লেকচার শিট ও নোট', 'মডেল টেস্ট'];
          const imageAlt = `${rawTitle} কভার ছবি ১০ মিনিট স্কুল`;
          const seoTitle = `${rawTitle} | 10 Minute School Discount & Admission - 10mscourse.shop`;
          const seoDescription = `১০ মিনিট স্কুলের ${rawTitle} কোর্সের সম্পূর্ণ সিলেবাস, ক্লাস ও স্পেশাল ডিসকাউন্ট অফার। ঘরে বসেই সম্পূর্ণ অনলাইন প্রস্তুতি নিন।`;
          const seoKeywords = [
            '১০ মিনিট স্কুল',
            rawTitle,
            `${rawTitle} কোর্স`,
            'অনলাইন কোর্স',
            category,
            targetClass,
            '10 Minute School',
            'কোর্স ফি ও ভর্তি',
          ].filter(Boolean) as string[];

          const fullDescription = generateCourseFullDescription(rawTitle, targetClass, promoCode, resolvedHighlights);

          return {
            title: rawTitle,
            englishTitle: p.slug ? p.slug.replace(/-/g, ' ').toUpperCase() : undefined,
            slug: slug,
            imageUrl: imageUrl,
            imageAlt,
            shortDescription,
            fullDescription,
            seoTitle,
            seoDescription,
            seoKeywords,
            category: category,
            targetClass: targetClass,
            displayTargets: displayTargets,
            reviewCount: reviews.reviewCount,
            enrolledCount: reviews.enrolledCount,
            affiliateLink: cleanUrl,
            promoCode: promoCode,
            instructor: instructor,
            instructorRole: instructorRole,
            highlights: resolvedHighlights,
          };
        }
      }
    } catch (apiErr) {
      console.warn('10MS public API fetch failed, trying HTML fallback:', apiErr);
    }
  }

  // 5. Fallback Strategy: Scrape OpenGraph HTML meta tags via public proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(resolvedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      const html = data.contents || '';

      const getMeta = (prop: string): string => {
        const regex = new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:)?${prop}["'][^>]*content=["']([^"']+)["']`, 'i');
        const match = html.match(regex);
        return match ? match[1].trim() : '';
      };

      const title = getMeta('title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
      const cleanTitle = title.replace(/\s*\|\s*10 Minute School.*$/i, '').trim() || 'নতুন কোর্স';
      const imageUrl = getMeta('image');
      const description = getMeta('description');

      const { category, targetClass, displayTargets } = detectCategoryAndClass(cleanTitle + ' ' + slug);
      const reviews = getRandomReviewCount();
      const imageAlt = `${cleanTitle} কভার ছবি ১০ মিনিট স্কুল`;
      const seoTitle = `${cleanTitle} | 10 Minute School Discount & Admission - 10mscourse.shop`;
      const seoDescription = description || `১০ মিনিট স্কুলের ${cleanTitle} কোর্সের সম্পূর্ণ সিলেবাস, ক্লাস ও স্পেশাল ডিসকাউন্ট অফার। ঘরে বসেই সম্পূর্ণ অনলাইন প্রস্তুতি নিন।`;
      const seoKeywords = ['১০ মিনিট স্কুল', cleanTitle, 'অনলাইন কোর্স', category, targetClass].filter(Boolean) as string[];
      const fullDescription = generateCourseFullDescription(cleanTitle, targetClass, promoCode, ['লাইভ ক্লাস', 'লেকচার শিট ও নোট', 'মডেল টেস্ট']);

      return {
        title: cleanTitle,
        slug: slug || 'new-course',
        imageUrl: imageUrl,
        imageAlt,
        shortDescription: description || `${cleanTitle} - সম্পূর্ণ অনলাইন কোর্স।`,
        fullDescription,
        seoTitle,
        seoDescription,
        seoKeywords,
        category: category,
        targetClass: targetClass,
        displayTargets: displayTargets,
        reviewCount: reviews.reviewCount,
        enrolledCount: reviews.enrolledCount,
        affiliateLink: cleanUrl,
        promoCode: promoCode,
        instructor: '১০ মিনিট স্কুল',
        instructorRole: 'অভিজ্ঞ শিক্ষকমণ্ডলী',
      };
    }
  } catch (htmlErr) {
    console.error('All scraper fallbacks failed:', htmlErr);
  }

  // Minimum safe object if network proxies were unreachable
  const cleanTitle = slug.replace(/-/g, ' ');
  const { category, targetClass, displayTargets } = detectCategoryAndClass(slug);
  const reviews = getRandomReviewCount();
  const imageAlt = `${cleanTitle} কভার ছবি ১০ মিনিট স্কুল`;
  const seoTitle = `${cleanTitle} | 10 Minute School Discount & Admission - 10mscourse.shop`;
  const seoDescription = `১০ মিনিট স্কুলের ${cleanTitle} কোর্সের সম্পূর্ণ সিলেবাস, ক্লাস ও স্পেশাল ডিসকাউন্ট অফার। ঘরে বসেই সম্পূর্ণ অনলাইন প্রস্তুতি নিন।`;
  const seoKeywords = ['১০ মিনিট স্কুল', cleanTitle, 'অনলাইন কোর্স', category, targetClass].filter(Boolean) as string[];
  const fullDescription = generateCourseFullDescription(cleanTitle, targetClass, promoCode, ['লাইভ ক্লাস', 'লেকচার শিট ও নোট', 'মডেল টেস্ট']);

  return {
    title: cleanTitle,
    slug: slug || `course-${Date.now().toString().slice(-4)}`,
    imageUrl: '',
    imageAlt,
    shortDescription: 'কোর্সের বিস্তারিত প্রস্তুতি ও বিশেষ অফার।',
    fullDescription,
    seoTitle,
    seoDescription,
    seoKeywords,
    category: category,
    targetClass: targetClass,
    displayTargets: displayTargets,
    reviewCount: reviews.reviewCount,
    enrolledCount: reviews.enrolledCount,
    affiliateLink: cleanUrl,
    promoCode: promoCode,
    instructor: '১০ মিনিট স্কুল',
    instructorRole: 'অভিজ্ঞ শিক্ষকমণ্ডলী',
  };
}
