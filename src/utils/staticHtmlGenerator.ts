import { Course, BlogPost } from '../types';

export interface PageConfig {
  route: string;
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  schemaJson?: object;
  seoBodyHtml?: string;
}

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getInstantShellHtml(route: string): string {
  return `
      <!-- Instant App Header -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            <div class="flex items-center select-none shrink-0 py-1" style="max-height: 40px; max-width: 180px;">
              <img
                src="https://res.cloudinary.com/drvyjj7td/image/upload/v1790516284/10msshop_knpcl3.png"
                alt="10MS Course Shop"
                class="h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0"
                style="height: 34px; max-height: 38px; width: auto; max-width: 170px;"
              />
            </div>
            <div class="flex-1 max-w-xs sm:max-w-md relative">
              <div class="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full text-slate-400">
                কোর্স বা বিষয় খুঁজুন...
              </div>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <a href="https://wa.me/8801917711466" target="_blank" rel="noopener noreferrer" class="p-2 sm:px-3 sm:py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- Instant Hero Section -->
      <main class="space-y-6 pb-20">
        <section class="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-5">
          <div class="bg-gradient-to-b from-rose-50/90 via-white to-orange-50/30 rounded-2xl sm:rounded-3xl border border-rose-100 p-4 sm:p-6 shadow-xs mb-3 sm:mb-4 text-center">
            <div class="max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
              <div class="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white text-rose-700 border border-rose-200/90 shadow-2xs mb-2">
                <span>১০ মিনিট স্কুল অফিসিয়াল অ্যাফিলিয়েট প্ল্যাটফর্ম</span>
              </div>
              <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center">
                ১০ মিনিট স্কুল কোর্স শপ
              </h1>
              <p class="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl mx-auto leading-relaxed text-center">
                ১০ মিনিট স্কুলের সকল একাডেমিক (৬ষ্ঠ-১২শ), এডমিশন টেস্ট ও স্কিল কোর্সের ভেরিফাইড ডিসকাউন্ট, প্রোমো কোড ও সরাসরি ভর্তি ডিরেক্টরি।
              </p>
            </div>
          </div>
        </section>
      </main>
  `;
}

export function generateStaticHtml(baseHtml: string, config: PageConfig): string {
  let html = baseHtml;

  // 1. Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(config.title)}</title>`);

  // 2. Replace Description
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(config.description)}" />`
    );
  }

  // 2.5 Replace Keywords
  if (config.keywords && html.includes('name="keywords"')) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(config.keywords)}" />`
    );
  }

  // 3. Replace Canonical Link
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${config.canonicalUrl}" />`
    );
  }

  // 4. Replace OpenGraph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(config.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(config.description)}" />`
  );
  if (config.ogImage) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(config.ogImage)}" />`
    );
  }

  // 5. Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(config.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(config.description)}" />`
  );
  if (config.ogImage) {
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(config.ogImage)}" />`
    );
  }

  // 6. Inject Schema.org JSON-LD if provided
  if (config.schemaJson) {
    const schemaScript = `\n    <!-- Page Specific Schema.org Structured Data -->\n    <script type="application/ld+json">\n${JSON.stringify(config.schemaJson, null, 2)}\n    </script>\n  </head>`;
    html = html.replace('</head>', schemaScript);
  }

  // 7. Inject Instant Visual Shell for users + Noscript SEO HTML for search crawlers
  if (config.seoBodyHtml) {
    const rootPlaceholder = '<div id="root"></div>';
    const instantShell = getInstantShellHtml(config.route);
    const rootWithContent = `<div id="root">${instantShell}</div>\n    <noscript id="seo-crawler-content">\n      ${config.seoBodyHtml}\n    </noscript>`;
    html = html.replace(rootPlaceholder, rootWithContent);
  }

  return html;
}

export function getAllStaticPages(courses: Course[], blogs: BlogPost[]): PageConfig[] {
  const pages: PageConfig[] = [];

  const allTargetKeywords =
    '10ms, 10 minute school, 10ms course, 10 ms, 10ms course discount, 10ms course hsc, 10 ms course hsc, 10ms course ssc, 10 ms course ssc, ১০ মিনিট স্কুল, ১০ মিনিট স্কুল কোর্স, ১০ মিনিট স্কুল কোর্স ডিসকাউন্ট, ১০ মিনিট স্কুল কোর্স ডিস্কাউন্ট, ১০ মিনিট স্কুল এইচএসসি কোর্স, ১০ মিনিট স্কুল এসএসসি কোর্স, 10ms course offer, 10ms course promo, 10 minute school course discount, 10 minute school kors, 10ms kors, 10ms shop, 10ms course shop, ১০ মিনিট স্কুল ভর্তি লিংক, ten minute school, spoken english 10ms, মুনজেরিন শহীদ স্পোকেন ইংলিশ';

  // 0. Homepage (route: '') with Comprehensive Content for Search Engines
  pages.push({
    route: '',
    title: '10MS Course Shop | ১০ মিনিট স্কুল কোর্স, অফার ও ডিসকাউন্ট প্রোমো কোড (10 Minute School)',
    description: '১০ মিনিট স্কুল (10 Minute School)-এর সকল কোর্স, HSC, SSC, Spoken English ডিসকাউন্ট অফার, ভর্তি ও ভেরিফাইড প্রোমো কোড। 10ms course offer, promo & discount.',
    keywords: allTargetKeywords,
    canonicalUrl: 'https://10mscourse.shop/',
    ogImage: 'https://10mscourse.shop/favicon-512x512.png',
    schemaJson: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://10mscourse.shop/#website',
          'url': 'https://10mscourse.shop/',
          'name': '10MS Course Shop',
          'alternateName': [
            '10ms',
            '10 minute school',
            '10ms course',
            '10 ms',
            '১০ মিনিট স্কুল',
            '১০ মিনিট স্কুল কোর্স শপ',
            '10ms kors',
            '10 minute school kors',
            '10ms course hsc',
            '10 ms course hsc',
            '10ms course ssc',
            '10 ms course ssc',
            '10ms course discount',
            '10ms course offer',
            '10ms course promo'
          ],
          'keywords': allTargetKeywords,
          'description': '১০ মিনিট স্কুল (10 Minute School)-এর সকল কোর্স, ডিসকাউন্ট অফার, কুপন কোড ও সরাসরি ভর্তি লিংক।',
          'publisher': {
            '@id': 'https://10mscourse.shop/#organization'
          },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://10mscourse.shop/courses?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'EducationalOrganization',
          '@id': 'https://10mscourse.shop/#organization',
          'name': '10MS Course Shop',
          'url': 'https://10mscourse.shop/',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://10mscourse.shop/favicon-192x192.png',
            'width': 192,
            'height': 192
          },
          'description': '১০ মিনিট স্কুল (10 Minute School)-এর সকল অনলাইন কোর্সের অফিসিয়াল অ্যাফিলিয়েট প্ল্যাটফর্ম ও সর্বোচ্চ ডিসকাউন্ট পোর্টাল।'
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://10mscourse.shop/#faq',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': '১০ মিনিট স্কুল কোর্স ডিসকাউন্ট ও 10ms promo code কোথায় পাব?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': '10mscourse.shop ওয়েবসাইটে প্রতিটি কোর্সের সাথে ভেরিফাইড প্রোমো কোড ও সর্বোচ্চ ছাড়ের লিংক দেওয়া রয়েছে। যেকোনো কোর্সে ক্লিক করে সরাসরি ১০ মিনিট স্কুলের অফিসিয়াল পেমেন্ট গেটওয়েতে ডিসকাউন্টসহ ভর্তি হওয়া যায়।'
              }
            },
            {
              '@type': 'Question',
              'name': '10ms course hsc ও ssc কোর্সে কীভাবে সর্বোচ্চ ডিসকাউন্ট পাওয়া যাবে?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': '10mscourse.shop-এ HSC (10ms course hsc) ও SSC (10ms course ssc) ব্যাচ অনুযায়ী আলাদা ক্যাটাগরি ও প্রোমো কোড রয়েছে। সেখানে গিয়ে সরাসরি কোর্স সিলেক্ট করে ডিসকাউন্ট মূল্যে ভর্তি হওয়া যায়।'
              }
            },
            {
              '@type': 'Question',
              'name': '10 minute school kors বা ১০ মিনিট স্কুল কোর্সে ভর্তির সরাসরি লিংক কোনটি?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': '10mscourse.shop-এ সকল ১০ মিনিট স্কুল কোর্সের (10 minute school kors / 10ms kors) অফিসিয়াল ভর্তি লিংক ও প্রোমো কোড একত্রিত করা আছে।'
              }
            },
            {
              '@type': 'Question',
              'name': 'ঘরে বসে Spoken English কোর্সের ভর্তি লিংক ও ডিসকাউন্ট কোড কী?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'মুনজেরিন শহীদের ঘরে বসে Spoken English কোর্সে ভর্তির লিংক https://10mscourse.shop/courses/ghore-boshe-spoken-english এবং ভেরিফাইড প্রোমো কোড affgbse1690।'
              }
            }
          ]
        }
      ]
    },
    seoBodyHtml: `
      <header style="background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%); padding: 36px 20px; border-bottom: 1px solid #ffe4e6; text-align: center;">
        <h1 style="font-size: 28px; font-weight: 800; color: #e11d48; margin: 0 0 12px 0;">১০ মিনিট স্কুল কোর্স শপ - 10MS Course Discount, Offer & Promo Code ২০২৬</h1>
        <p style="font-size: 15px; color: #475569; max-width: 850px; margin: 0 auto; line-height: 1.7;">
          ১০ মিনিট স্কুল (10 Minute School)-এর অফিসিয়াল অ্যাফিলিয়েট প্ল্যাটফর্ম <strong>10mscourse.shop</strong>-এ আপনাকে স্বাগতম। এখানে 10ms course hsc, 10ms course ssc, ক্লাস ৬-১২ এর সম্পূর্ণ অনলাইন ব্যাচ, এসএসসি ও এইচএসসি ক্র্যাশ কোর্স, বিশ্ববিদ্যালয় ভর্তি পরীক্ষা, মুনজেরিন শহীদের ঘরে বসে স্পোকেন ইংলিশ এবং স্কিল কোর্সের সর্বোচ্চ ছাড়, ডিসকাউন্ট অফার, ভেরিফাইড প্রোমো কোড ও সরাসরি ভর্তি লিংক পাওয়া যাবে।
        </p>
      </header>

      <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #334155;">
        <!-- Popular Keywords Direct Directory -->
        <section style="margin-bottom: 32px; background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #ffe4e6;">
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
            জনপ্রিয় সার্চ কোয়েরি ও কোর্স ডিরেক্টরি (10MS Search Topics):
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <a href="/hsc" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10ms course hsc (১০ মিনিট স্কুল এইচএসসি কোর্স)</a>
            <a href="/class-9-10" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10ms course ssc (১০ মিনিট স্কুল এসএসসি কোর্স)</a>
            <a href="/spoken-english" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10ms course offer - ঘরে বসে Spoken English</a>
            <a href="/courses" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10 minute school course discount (কোর্স ডিসকাউন্ট ও কুপন)</a>
            <a href="/admission" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10ms kors - ভার্সিটি ও মেডিকেল এডমিশন</a>
            <a href="/courses" style="background: #fff1f2; color: #e11d48; padding: 6px 12px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 600;">10ms course promo - প্রোমো কোড ও ভর্তি</a>
          </div>
        </section>

        <section style="margin-bottom: 36px;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 16px; border-left: 4px solid #e11d48; padding-left: 12px;">
            চলতি জনপ্রিয় কোর্স ও এক্সক্লুসিভ ডিসকাউন্ট অফার (10 Minute School Courses)
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${courses.map(c => `
              <div style="background: #ffffff; border: 1px solid #ffe4e6; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                ${c.imageUrl ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.title)}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 6px 0;"><a href="/courses/${escapeHtml(c.slug)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(c.title)}</a></h3>
                <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">ইন্সট্রাক্টর: ${escapeHtml(c.instructor || '১০ মিনিট স্কুল এক্সপার্ট প্যানেল')}</p>
                <div style="font-size: 15px; font-weight: bold; color: #e11d48; margin-bottom: 8px;">
                  ৳${c.offerPrice} <span style="font-size: 12px; color: #94a3b8; text-decoration: line-through;">৳${c.regularPrice}</span>
                </div>
                ${c.promoCode ? `<div style="font-size: 12px; background: #fff1f2; color: #e11d48; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 10px;">প্রোমো কোড: <strong>${escapeHtml(c.promoCode)}</strong></div>` : ''}
                <div>
                  <a href="${escapeHtml(c.affiliateLink || `https://10mscourse.shop/courses/${c.slug}`)}" target="_blank" rel="noopener noreferrer" style="background: #e11d48; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">ভর্তি লিংক</a>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section style="margin-bottom: 36px; background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
            সকল ক্যাটাগরি ও ব্যাচভিত্তিক অনলাইন কোর্স
          </h2>
          <p style="margin-bottom: 12px;">আপনার প্রয়োজনীয় কোর্স বেছে নিন:</p>
          <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; list-style: none; padding: 0; margin: 0;">
            <li><a href="/hsc-28" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ HSC 2028 অনলাইন ব্যাচ</a></li>
            <li><a href="/hsc-27" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ HSC 2027 শেষ মুহূর্তের প্রস্তুতি</a></li>
            <li><a href="/ssc-27" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ SSC 2027 শেষ মুহূর্তের প্রস্তুতি</a></li>
            <li><a href="/spoken-english" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ ঘরে বসে Spoken English</a></li>
            <li><a href="/admission" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ ভার্সিটি ও মেডিকেল এডমিশন</a></li>
            <li><a href="/class-6-8" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ ক্লাস ৬-৮ অনলাইন ব্যাচ</a></li>
            <li><a href="/skills" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং</a></li>
            <li><a href="/job-prep" style="color: #e11d48; font-weight: 600; text-decoration: none;">✓ বিসিএস ও সরকারি চাকরি প্রস্তুতি</a></li>
          </ul>
        </section>

        <section style="margin-bottom: 36px; line-height: 1.8;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
            কেন 10mscourse.shop থেকে ভর্তি হবেন?
          </h2>
          <p>
            ১০ মিনিট স্কুল হলো বাংলাদেশের শীর্ষ এডটেক প্ল্যাটফর্ম, যেখানে অভিজ্ঞ শিক্ষক এবং সেরা ক্লাস ম্যাটেরিয়ালের মাধ্যমে লাখ লাখ শিক্ষার্থী তাদের একাডেমিক ও ক্যারিয়ার লক্ষ্য অর্জন করছে। <strong>10mscourse.shop</strong> হলো ১০ মিনিট স্কুলের একটি ভেরিফাইড অ্যাফিলিয়েট অংশীদার।
          </p>
          <ul style="padding-left: 20px;">
            <li><strong>সর্বোচ্চ ডিসকাউন্ট নিশ্চিত:</strong> প্রতিটি কোর্সের সাথে ভেরিফাইড প্রোমো কোড দেওয়া থাকে যা ব্যবহারে কোর্স ফিতে সর্বোচ্চ ছাড় নিশ্চিত হয়।</li>
            <li><strong>১০০% অফিসিয়াল পেমেন্ট গেটওয়ে:</strong> ভর্তি হতে ক্লিক করলে সরাসরি ১০ মিনিট স্কুলের অফিসিয়াল পেমেন্ট সিস্টেমে নিয়ে যাওয়া হয় (বিকাশ, নগদ, কার্ডে নিরাপদ পেমেন্ট)।</li>
            <li><strong>২৪/৭ ফ্রি স্টাডি সাপোর্ট:</strong> ভর্তি সংক্রান্ত যেকোনো সমস্যায় সরাসরি হোয়াটসঅ্যাপে বিশেষজ্ঞ পরামর্শ পাওয়ার সুবিধা।</li>
          </ul>
        </section>

        <section style="margin-bottom: 36px; background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h2>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">১০ মিনিট স্কুলের কোর্সে প্রোমো কোড কীভাবে ব্যবহার করব?</h3>
            <p style="font-size: 14px; color: #64748b; margin-top: 4px;">যেকোনো কোর্সে 'ভর্তি লিংক' বা 'কিনুন' বাটনে ক্লিক করে ১০ মিনিট স্কুলের পেমেন্ট পেজে যান। এরপর প্রোমো কোড ঘরে আমাদের সাইটে দেওয়া কোডটি বসিয়ে 'Apply' করলেই সাথে সাথে কোর্স ফি কমে যাবে।</p>
          </div>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">ঘরে বসে Spoken English কোর্সটি কার জন্য উপযুক্ত?</h3>
            <p style="font-size: 14px; color: #64748b; margin-top: 4px;">স্কুল, কলেজ, বিশ্ববিদ্যালয় শিক্ষার্থী কিংবা চাকরিপ্রার্থী—যেকোনো বয়সের মানুষের জন্য মুনজেরিন শহীদের এই কোর্সটি ঘরে বসে ফ্লুয়েন্টলি ইংরেজি বলার জন্য সম্পূর্ণ প্রস্তুত করা হয়েছে।</p>
          </div>
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">10ms course hsc ও ssc কোর্সে কীভাবে সর্বোচ্চ ডিসকাউন্ট পাওয়া যাবে?</h3>
            <p style="font-size: 14px; color: #64748b; margin-top: 4px;">10mscourse.shop-এ HSC ও SSC ব্যাচ অনুযায়ী আলাদা ক্যাটাগরি ও বিশেষ কুপন কোড রয়েছে। সেখানে সরাসরি কোর্স সিলেক্ট করে ডিসকাউন্ট মূল্যে ভর্তি হওয়া যায়।</p>
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">HSC 2028 এবং SSC 2027 অনলাইন ব্যাচে কী কী সুবিধা পাওয়া যাবে?</h3>
            <p style="font-size: 14px; color: #64748b; margin-top: 4px;">লাইভ ইন্টারঅ্যাক্টিভ ক্লাস, প্রতিটি ক্লাসের পর লেকচার শিট ও পিডিএফ নোট, বোর্ড স্ট্যান্ডার্ড মডেল টেস্ট ও সার্বক্ষণিক ডাউট সলভ প্ল্যাটফর্ম সুবিধা পাওয়া যাবে।</p>
          </div>
        </section>
      </main>
    `
  });

  // 1. All Courses Page (/courses)
  pages.push({
    route: 'courses',
    title: '১০ মিনিট স্কুলের সকল কোর্স ও সেরা ডিসকাউন্ট অফার | 10MS Course Shop',
    description: '১০ মিনিট স্কুলের সকল অনলাইন কোর্স, ডিসকাউন্ট অফার, কুপন কোড ও ভর্তি লিংক এক প্ল্যাটফর্মে। ঘরে বসে স্পোকেন ইংলিশ, এইচএসসি ক্র্যাশ কোর্স, এসএসসি ও স্কিল কোর্স।',
    canonicalUrl: 'https://10mscourse.shop/courses',
    ogImage: 'https://10mscourse.shop/favicon-512x512.png',
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': '১০ মিনিট স্কুলের সকল কোর্স ও ডিসকাউন্ট অফার',
      'url': 'https://10mscourse.shop/courses',
      'description': '১০ মিনিট স্কুলের সকল একাডেমিক, এডমিশন ও স্কিল কোর্সের প্রোমো অফার ও ভর্তি লিংক।',
      'itemListElement': courses.slice(0, 15).map((c, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'item': {
          '@type': 'Course',
          'name': c.title,
          'url': `https://10mscourse.shop/courses/${c.slug}`,
          'description': c.shortDescription || c.title,
          'provider': { '@type': 'Organization', 'name': '10 Minute School' }
        }
      }))
    },
    seoBodyHtml: `
      <header style="padding: 24px; text-align: center; background: #fff;">
        <h1>১০ মিনিট স্কুলের সকল কোর্স ও সেরা ডিসকাউন্ট অফার</h1>
        <p>১০ মিনিট স্কুলের সকল অনলাইন কোর্স, ক্র্যাশ কোর্স, স্পোকেন ইংলিশ ও স্কিল কোর্সের তালিকা ও ভর্তি লিংক।</p>
      </header>
      <main style="padding: 24px; max-width: 1200px; margin: 0 auto;">
        <h2>জনপ্রিয় কোর্সসমূহ:</h2>
        <ul>
          ${courses.map(c => `<li><a href="/courses/${escapeHtml(c.slug)}"><strong>${escapeHtml(c.title)}</strong></a> - ৳${c.offerPrice} (প্রোমো কোড: ${escapeHtml(c.promoCode || 'aff10ms')})</li>`).join('')}
        </ul>
      </main>
    `
  });

  // 2. Blog Page (/blog)
  pages.push({
    route: 'blog',
    title: 'ব্লগ ও পড়াশোনার পূর্ণাঙ্গ গাইডলাইন | 10MS Course Shop',
    description: 'এসএসসি, এইচএসসি, এডমিশন ও ক্যারিয়ার প্রস্তুতি বিষয়ক প্রয়োজনীয় স্টাডি প্ল্যান, টিপস এবং ১০ মিনিট স্কুলের কোর্সের বিস্তারিত তথ্য।',
    canonicalUrl: 'https://10mscourse.shop/blog',
    ogImage: 'https://10mscourse.shop/favicon-512x512.png',
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': '10MS Course Shop ব্লগ',
      'url': 'https://10mscourse.shop/blog',
      'description': '১০ মিনিট স্কুলের শিক্ষার্থীদের জন্য পরামর্শ ও গাইডলাইন।'
    },
    seoBodyHtml: `
      <header style="padding: 24px; text-align: center; background: #fff;">
        <h1>ব্লগ ও পড়াশোনার পূর্ণাঙ্গ গাইডলাইন</h1>
        <p>এসএসসি, এইচএসসি ও বিভিন্ন স্কিল ডেভেলপমেন্টের সেরা স্টাডি টিপস ও গাইডলাইন।</p>
      </header>
      <main style="padding: 24px; max-width: 1000px; margin: 0 auto;">
        <ul>
          ${blogs.map(b => `<li><a href="/blog/${escapeHtml(b.slug)}"><h3>${escapeHtml(b.title)}</h3></a><p>${escapeHtml(b.excerpt)}</p></li>`).join('')}
        </ul>
      </main>
    `
  });

  // 3. Review Page (/review)
  pages.push({
    route: 'review',
    title: 'কোর্স রিভিউ ও শিক্ষার্থীদের মতামত | 10MS Course Shop',
    description: '১০ মিনিট স্কুলের কোর্সগুলো করে শিক্ষার্থীদের বাস্তব অভিজ্ঞতা ও মতামত জানুন। ভর্তি হওয়ার পূর্বে বিস্তারিত রিভিউ দেখে নিন।',
    canonicalUrl: 'https://10mscourse.shop/review',
    ogImage: 'https://10mscourse.shop/favicon-512x512.png'
  });

  // 4. Category Pages
  const categoryConfigs: Array<{ slug: string; title: string; desc: string }> = [
    { slug: 'class-6-8', title: '১০ মিনিট স্কুল ক্লাস ৬-৮ অনলাইন ব্যাচ কোর্স ও ভর্তি | 10MS Course Shop', desc: '১০ মিনিট স্কুলের ষষ্ঠ, সপ্তম ও অষ্টম শ্রেণির শিক্ষার্থীদের জন্য সম্পূর্ণ অনলাইন ব্যাচ ও লাইভ ক্লাস।' },
    { slug: 'class-6', title: '১০ মিনিট স্কুল ৬ষ্ঠ শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10MS Course Shop', desc: 'ষষ্ঠ শ্রেণির নতুন কারিকুলাম অনুযায়ী ১০ মিনিট স্কুলের লাইভ ক্লাস ও পূর্ণাঙ্গ অনলাইন ব্যাচ প্রস্তুতি।' },
    { slug: 'class-7', title: '১০ মিনিট স্কুল ৭ম শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10MS Course Shop', desc: 'সপ্তম শ্রেণির শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের নিয়মিত লাইভ ক্লাস ও অনলাইন ব্যাচ প্রস্তুতি।' },
    { slug: 'class-8', title: '১০ মিনিট স্কুল ৮ম শ্রেণি অনলাইন ব্যাচ কোর্স ও ভর্তি | 10MS Course Shop', desc: 'অষ্টম শ্রেণির বার্ষিক মূল্যায়ন ও ভিত্তি গড়ার জন্য ১০ মিনিট স্কুলের অনলাইন ব্যাচ।' },
    { slug: 'class-9-10', title: '১০ মিনিট স্কুল এসএসসি অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এসএসসি অনলাইন ব্যাচ ও ক্র্যাশ কোর্সের সেরা প্রস্তুতি ও ডিসকাউন্ট অফার।' },
    { slug: 'hsc', title: '১০ মিনিট স্কুল এইচএসসি অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এইচএসসি অনলাইন ব্যাচ: বিজ্ঞান, মানবিক ও বাণিজ্য বিভাগের সকল কোর্সের বিশেষ ছাড়।' },
    { slug: 'admission', title: '১০ মিনিট স্কুল বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন অনলাইন কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি পরীক্ষার সেরা প্রস্তুতি ও এডমিশন অনলাইন ব্যাচ।' },
    { slug: 'skills', title: '১০ মিনিট স্কুল স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং অনলাইন কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের ইংরেজি শেখা, মাইক্রোসফট অফিস, গ্রাফিক্স ডিজাইন ও ডিজিটাল মার্কেটিংয়ের সেরা স্কিল অনলাইন কোর্স।' },
    { slug: 'spoken-english', title: '১০ মিনিট স্কুল স্পোকেন ইংলিশ অনলাইন কোর্স ও অফার | 10MS Course Shop', desc: '১০ মিনিট স্কুলের মুনজেরিন শহীদের ঘরে বসে স্পোকেন ইংলিশ এবং কিডস ইংলিশ অনলাইন কোর্সের সর্বোচ্চ ডিসকাউন্ট লিংক।' },
    { slug: 'job-prep', title: '১০ মিনিট স্কুল বিসিএস ও সরকারি চাকরি প্রস্তুতি অনলাইন ব্যাচ | 10MS Course Shop', desc: '১০ মিনিট স্কুলের বিসিএস প্রিলিমিনারি ও ব্যাংক জব প্রস্তুতির পূর্ণাঙ্গ অনলাইন ব্যাচ ও কোর্স।' },
    // Batch Dedicated Routes
    { slug: 'hsc-28', title: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এইচএসসি ২০২৮ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের সম্পূর্ণ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'ssc-28', title: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ ও পূর্ণাঙ্গ প্রস্তুতি | 10MS Course Shop', desc: 'এসএসসি ২০২৮ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের সেরা শিক্ষকদের অনলাইন ব্যাচ লাইভ ক্লাস ও অফার।' },
    { slug: 'hsc-27', title: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ ও কোর্স অফার | 10MS Course Shop', desc: 'এইচএসসি ২০২৭ ব্যাচের সকল বিভাগের জন্য ১০ মিনিট স্কুলের অনলাইন ব্যাচ ক্লাস ও স্পেশাল ছাড়।' },
    { slug: 'ssc-27', title: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এসএসসি ২০২৭ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের অনলাইন ব্যাচ লাইভ ক্লাস ও মডেল টেস্ট।' },
    { slug: 'hsc-26', title: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ অনলাইন ব্যাচ ও ক্র্যাশ কোর্সে ভর্তি হয়ে এ+ নিশ্চিত করার পূর্ণাঙ্গ প্রস্তুতি নিন।' },
    { slug: 'ssc-26', title: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও টেস্ট পেপার সলভ | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এসএসসি ২০২৬ অনলাইন ব্যাচ ও ক্র্যাশ কোর্সে এ+ নিশ্চিত করতে সেরা কোর্সসমূহ।' },
    { slug: 'hsc-2028', title: '১০ মিনিট স্কুল HSC 2028 অনলাইন ব্যাচ ও কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এইচএসসি ২০২৮ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'ssc-2028', title: '১০ মিনিট স্কুল SSC 2028 অনলাইন ব্যাচ ও কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এসএসসি ২০২৮ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'hsc-2027', title: '১০ মিনিট স্কুল HSC 2027 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এইচএসসি ২০২৭ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'ssc-2027', title: '১০ মিনিট স্কুল SSC 2027 অনলাইন ব্যাচ ও শেষ মুহূর্তের প্রস্তুতি | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এসএসসি ২০২৭ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'hsc-2026', title: '১০ মিনিট স্কুল HSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এইচএসসি ২০২৬ অনলাইন ব্যাচ ও ক্র্যাশ কোর্স।' },
    { slug: 'ssc-2026', title: '১০ মিনিট স্কুল SSC 2026 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: '১০ মিনিট স্কুলের এসএসসি ২০২৬ অনলাইন ব্যাচ ও ক্র্যাশ কোর্স।' }
  ];

  for (const cat of categoryConfigs) {
    pages.push({
      route: cat.slug,
      title: cat.title,
      description: cat.desc,
      canonicalUrl: `https://10mscourse.shop/${cat.slug}`,
      ogImage: 'https://10mscourse.shop/favicon-512x512.png',
      schemaJson: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': cat.title,
        'url': `https://10mscourse.shop/${cat.slug}`,
        'description': cat.desc
      },
      seoBodyHtml: `
        <header style="padding: 24px; text-align: center; background: #fff;">
          <h1>${escapeHtml(cat.title)}</h1>
          <p>${escapeHtml(cat.desc)}</p>
        </header>
        <main style="padding: 24px; max-width: 1000px; margin: 0 auto;">
          <p><a href="/courses">← সকল কোর্স দেখুন</a> | <a href="/">হোমপেজ</a></p>
        </main>
      `
    });
  }

  // 5. Individual Course Pages
  for (const c of courses) {
    if (!c.slug) continue;

    const pageTitle = c.seoTitle || `${c.title} | 10 Minute School Discount & Admission - 10mscourse.shop`;
    const pageDesc = c.seoDescription || c.shortDescription || `${c.title} কোর্সের বিস্তারিত তথ্য ও ভর্তি লিংক।`;
    const courseImage = c.imageUrl || 'https://10mscourse.shop/favicon-512x512.png';

    const courseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': c.title,
      'description': c.shortDescription || c.title,
      'image': courseImage,
      'provider': {
        '@type': 'Organization',
        'name': '10 Minute School',
        'sameAs': 'https://10minuteschool.com'
      },
      'offers': {
        '@type': 'Offer',
        'price': c.offerPrice || c.regularPrice,
        'priceCurrency': 'BDT',
        'url': c.affiliateLink || `https://10mscourse.shop/courses/${c.slug}`,
        'category': 'Paid'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': (c.rating || 5).toString(),
        'bestRating': '5',
        'ratingCount': (c.reviewCount || 45).toString()
      }
    };

    const courseBodyHtml = `
      <article style="max-width: 800px; margin: 0 auto; padding: 24px; font-family: sans-serif;">
        <p><a href="/courses">← সকল কোর্সে ফিরে যান</a></p>
        <h1>${escapeHtml(c.title)}</h1>
        <p><strong>ইন্সট্রাক্টর:</strong> ${escapeHtml(c.instructor || '১০ মিনিট স্কুল এক্সপার্ট প্যানেল')}</p>
        <p><strong>অফার ফি:</strong> ৳${c.offerPrice} (নিয়মিত ফি: ৳${c.regularPrice})</p>
        ${c.promoCode ? `<p><strong>ডিসকাউন্ট প্রোমো কোড:</strong> <code>${escapeHtml(c.promoCode)}</code></p>` : ''}
        ${c.imageUrl ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.title)}" style="max-width: 100%; border-radius: 12px; margin: 16px 0;" />` : ''}
        <p>${escapeHtml(c.shortDescription || '')}</p>
        <div style="margin: 20px 0;">
          <a href="${escapeHtml(c.affiliateLink || 'https://10minuteschool.com')}" target="_blank" rel="noopener noreferrer" style="background: #e11d48; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">এখনই ভর্তি হোন</a>
        </div>
      </article>
    `;

    // A: /courses/:slug
    pages.push({
      route: `courses/${c.slug}`,
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: `https://10mscourse.shop/courses/${c.slug}`,
      ogImage: courseImage,
      schemaJson: courseSchema,
      seoBodyHtml: courseBodyHtml
    });

    // B: /:slug (short link)
    pages.push({
      route: c.slug,
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: `https://10mscourse.shop/courses/${c.slug}`,
      ogImage: courseImage,
      schemaJson: courseSchema,
      seoBodyHtml: courseBodyHtml
    });
  }

  // 6. Individual Blog Post Pages
  for (const b of blogs) {
    if (!b.slug) continue;

    const blogTitle = `${b.title} | 10MS Course Shop ব্লগ`;
    const blogDesc = b.excerpt || b.title;
    const blogImage = b.coverImage || 'https://10mscourse.shop/favicon-512x512.png';

    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': b.title,
      'description': b.excerpt,
      'image': blogImage,
      'datePublished': b.date || new Date().toISOString().split('T')[0],
      'author': {
        '@type': 'Person',
        'name': b.author || '10MS Course Shop টিম'
      },
      'publisher': {
        '@type': 'Organization',
        'name': '10MS Course Shop',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://10mscourse.shop/favicon-192x192.png'
        }
      }
    };

    pages.push({
      route: `blog/${b.slug}`,
      title: blogTitle,
      description: blogDesc,
      canonicalUrl: `https://10mscourse.shop/blog/${b.slug}`,
      ogImage: blogImage,
      schemaJson: blogSchema,
      seoBodyHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 24px;">
          <p><a href="/blog">← সকল ব্লগে ফিরে যান</a></p>
          <h1>${escapeHtml(b.title)}</h1>
          <p><em>তারিখ: ${escapeHtml(b.date || '')} | লেখক: ${escapeHtml(b.author || '10MS টিম')}</em></p>
          ${b.coverImage ? `<img src="${escapeHtml(b.coverImage)}" alt="${escapeHtml(b.title)}" style="max-width: 100%; border-radius: 12px; margin: 16px 0;" />` : ''}
          <p>${escapeHtml(b.excerpt)}</p>
        </article>
      `
    });
  }

  return pages;
}
