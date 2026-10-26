import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://10mscourse.shop';
const TODAY = new Date().toISOString().split('T')[0];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateSitemap() {
  const coursesPath = path.resolve('courses.json');
  const blogsPath = path.resolve('blogs.json');
  const categoriesPath = path.resolve('categories.json');

  let courses = [];
  let blogs = [];
  let categories = [];

  try {
    if (fs.existsSync(coursesPath)) {
      courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading courses:', e);
  }

  try {
    if (fs.existsSync(blogsPath)) {
      blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading blogs:', e);
  }

  try {
    if (fs.existsSync(categoriesPath)) {
      categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading categories:', e);
  }

  const urls = [];

  // 1. Core pages
  urls.push({
    loc: `${SITE_URL}/`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '1.0'
  });

  urls.push({
    loc: `${SITE_URL}/courses`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.9'
  });

  urls.push({
    loc: `${SITE_URL}/blog`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.8'
  });

  urls.push({
    loc: `${SITE_URL}/review`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.8'
  });

  // 2. Category pages
  for (const cat of categories) {
    if (cat.id) {
      urls.push({
        loc: `${SITE_URL}/${encodeURIComponent(cat.id)}`,
        lastmod: TODAY,
        changefreq: 'weekly',
        priority: '0.9'
      });
    }
  }

  // 3. Courses
  for (const course of courses) {
    if (course.slug && course.status !== 'inactive') {
      const entry = {
        loc: `${SITE_URL}/courses/${encodeURIComponent(course.slug)}`,
        lastmod: TODAY,
        changefreq: 'daily',
        priority: '0.85'
      };
      if (course.imageUrl) {
        entry.image = {
          loc: course.imageUrl,
          title: course.title || course.imageAlt || ''
        };
      }
      urls.push(entry);
    }
  }

  // 4. Blog Posts
  for (const blog of blogs) {
    if (blog.slug) {
      const entry = {
        loc: `${SITE_URL}/blog/${encodeURIComponent(blog.slug)}`,
        lastmod: blog.date || TODAY,
        changefreq: 'weekly',
        priority: '0.7'
      };
      if (blog.coverImage) {
        entry.image = {
          loc: blog.coverImage,
          title: blog.title || ''
        };
      }
      urls.push(entry);
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    if (u.image && u.image.loc) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(u.image.loc)}</image:loc>\n`;
      if (u.image.title) {
        xml += `      <image:title>${escapeXml(u.image.title)}</image:title>\n`;
      }
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  // Write to public/sitemap.xml, docs/sitemap.xml, and root sitemap.xml
  const targets = [
    path.resolve('public/sitemap.xml'),
    path.resolve('docs/sitemap.xml'),
    path.resolve('sitemap.xml')
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, xml, 'utf-8');
  }

  console.log(`Generated sitemap.xml with ${urls.length} URLs across all target locations.`);
}

generateSitemap();
