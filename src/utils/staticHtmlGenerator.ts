import { Course, BlogPost } from '../types';

export interface PageConfig {
  route: string;
  title: string;
  description: string;
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

  // 7. Inject Crawler-friendly SEO HTML into #root if provided
  if (config.seoBodyHtml) {
    const rootPlaceholder = '<div id="root"></div>';
    const rootWithContent = `<div id="root">${config.seoBodyHtml}</div>`;
    html = html.replace(rootPlaceholder, rootWithContent);
  }

  return html;
}

export function getAllStaticPages(courses: Course[], blogs: BlogPost[]): PageConfig[] {
  const pages: PageConfig[] = [];

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
    { slug: 'class-6-8', title: 'ক্লাস ৬-৮ অনলাইন ব্যাচ কোর্স ও ভর্তি | 10MS Course Shop', desc: '১০ মিনিট স্কুলের ষষ্ঠ, সপ্তম ও অষ্টম শ্রেণির শিক্ষার্থীদের জন্য সম্পূর্ণ অনলাইন ব্যাচ ও লাইভ ক্লাস।' },
    { slug: 'class-6', title: '৬ষ্ঠ শ্রেণি অনলাইন ব্যাচ | 10MS Course Shop', desc: 'ষষ্ঠ শ্রেণির নতুন কারিকুলাম অনুযায়ী ১০ মিনিট স্কুলের লাইভ ক্লাস ও পূর্ণাঙ্গ কোর্স প্রস্তুতি।' },
    { slug: 'class-7', title: '৭ম শ্রেণি অনলাইন ব্যাচ | 10MS Course Shop', desc: 'সপ্তম শ্রেণির শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের নিয়মিত লাইভ ক্লাস ও মডেল টেস্ট।' },
    { slug: 'class-8', title: '৮ম শ্রেণি অনলাইন ব্যাচ | 10MS Course Shop', desc: 'অষ্টম শ্রেণির বার্ষিক মূল্যায়ন ও ভিত্তি গড়ার জন্য ১০ মিনিট স্কুলের অনলাইন ব্যাচ।' },
    { slug: 'class-9-10', title: 'এসএসসি ও নবম-দশম শ্রেণির অনলাইন কোর্স | 10MS Course Shop', desc: 'এসএসসি পরীক্ষার সম্পূর্ণ প্রস্তুতি ও ক্র্যাশ কোর্সের সেরা ডিসকাউন্ট অফার।' },
    { slug: 'hsc', title: 'এইচএসসি অনলাইন কোর্স ও ক্র্যাশ ব্যাচ | 10MS Course Shop', desc: 'এইচএসসি বিজ্ঞান, মানবিক ও বাণিজ্য বিভাগের সকল কোর্সের বিশেষ ছাড় ও ভর্তি লিংক।' },
    { slug: 'admission', title: 'ভার্সিটি, মেডিকেল ও বুয়েট এডমিশন কোর্স | 10MS Course Shop', desc: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সেরা প্রস্তুতি ও প্রশ্নব্যাংক সমাধানের পূর্ণাঙ্গ কোর্সসমূহ।' },
    { slug: 'skills', title: 'স্কিল ডেভেলপমেন্ট ও ফ্রিল্যান্সিং কোর্স | 10MS Course Shop', desc: 'ইংরেজি শেখা, মাইক্রোসফট অফিস, গ্রাফিক্স ডিজাইন ও ডিজিটাল মার্কেটিংয়ের সেরা স্কিল কোর্স।' },
    { slug: 'spoken-english', title: 'স্পোকেন ইংলিশ কোর্স ও অফার | 10MS Course Shop', desc: 'মুনজেরিন শহীদের ঘরে বসে স্পোকেন ইংলিশ এবং কিডস ইংলিশ কোর্সের সর্বোচ্চ ডিসকাউন্ট লিংক।' },
    { slug: 'job-prep', title: 'বিসিএস ও সরকারি চাকরি প্রস্তুতি কোর্স | 10MS Course Shop', desc: 'বিসিএস প্রিলিমিনারি ও ব্যাংক জব প্রস্তুতির পূর্ণাঙ্গ অনলাইন কোর্স।' },
    // Batch Dedicated Routes
    { slug: 'hsc-28', title: 'HSC 2028 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এইচএসসি ২০২৮ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের সম্পূর্ণ অনলাইন ব্যাচ ও ভর্তি লিংক।' },
    { slug: 'ssc-28', title: 'SSC 2028 অনলাইন ব্যাচ ও পূর্ণাঙ্গ প্রস্তুতি | 10MS Course Shop', desc: 'এসএসসি ২০২৮ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের সেরা শিক্ষকদের লাইভ ক্লাস ও অফার।' },
    { slug: 'hsc-27', title: 'HSC 2027 অনলাইন ব্যাচ ও কোর্স অফার | 10MS Course Shop', desc: 'এইচএসসি ২০২৭ ব্যাচের সকল বিভাগের জন্য ১০ মিনিট স্কুলের অনলাইন ক্লাস ও স্পেশাল ছাড়।' },
    { slug: 'ssc-27', title: 'SSC 2027 অনলাইন ব্যাচ ও ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এসএসসি ২০২৭ ব্যাচের শিক্ষার্থীদের জন্য ১০ মিনিট স্কুলের লাইভ ক্লাস ও মডেল টেস্ট।' },
    { slug: 'hsc-26', title: 'HSC 2026 ক্র্যাশ কোর্স ও ফাইনাল রিভিশন | 10MS Course Shop', desc: 'এইচএসসি ২০২৬ ক্র্যাশ কোর্সে ভর্তি হয়ে এ+ নিশ্চিত করার পূর্ণাঙ্গ প্রস্তুতি নিন।' },
    { slug: 'ssc-26', title: 'SSC 2026 ক্র্যাশ কোর্স ও টেস্ট পেপার সলভ | 10MS Course Shop', desc: 'এসএসসি ২০২৬ ক্র্যাশ কোর্সে এ+ নিশ্চিত করতে ১০ মিনিট স্কুলের সেরা কোর্সসমূহ।' },
    { slug: 'hsc-2028', title: 'HSC 2028 অনলাইন ব্যাচ | 10MS Course Shop', desc: 'এইচএসসি ২০২৮ অনলাইন ব্যাচ।' },
    { slug: 'ssc-2028', title: 'SSC 2028 অনলাইন ব্যাচ | 10MS Course Shop', desc: 'এসএসসি ২০২৮ অনলাইন ব্যাচ।' },
    { slug: 'hsc-2027', title: 'HSC 2027 অনলাইন ব্যাচ | 10MS Course Shop', desc: 'এইচএসসি ২০২৭ অনলাইন ব্যাচ।' },
    { slug: 'ssc-2027', title: 'SSC 2027 অনলাইন ব্যাচ | 10MS Course Shop', desc: 'এসএসসি ২০২৭ অনলাইন ব্যাচ।' },
    { slug: 'hsc-2026', title: 'HSC 2026 ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এইচএসসি ২০২৬ ক্র্যাশ কোর্স।' },
    { slug: 'ssc-2026', title: 'SSC 2026 ক্র্যাশ কোর্স | 10MS Course Shop', desc: 'এসএসসি ২০২৬ ক্র্যাশ কোর্স।' }
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
