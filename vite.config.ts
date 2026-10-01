import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function coursesBackendPlugin(): Plugin {
  return {
    name: 'courses-backend-api',
    configureServer(server) {
      // GET /api/courses: return current courses from disk
      server.middlewares.use('/api/courses', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const coursesPath = path.resolve(process.cwd(), 'courses.json');
            if (fs.existsSync(coursesPath)) {
              const data = fs.readFileSync(coursesPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(data);
              return;
            }
          } catch (e: any) {
            console.error('Error reading courses.json:', e);
          }
        }
        next();
      });

      // POST /api/save-courses: write courses directly to workspace disk files
      server.middlewares.use('/api/save-courses', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const courses = parsed.courses;
              if (Array.isArray(courses)) {
                // 1. Root courses.json
                fs.writeFileSync(path.resolve(process.cwd(), 'courses.json'), JSON.stringify(courses, null, 2), 'utf-8');

                // 2. public/courses.json
                const publicDir = path.resolve(process.cwd(), 'public');
                if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
                fs.writeFileSync(path.resolve(publicDir, 'courses.json'), JSON.stringify(courses, null, 2), 'utf-8');

                // 3. docs/courses.json
                const docsDir = path.resolve(process.cwd(), 'docs');
                if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
                fs.writeFileSync(path.resolve(docsDir, 'courses.json'), JSON.stringify(courses, null, 2), 'utf-8');

                // 4. dist/courses.json
                const distDir = path.resolve(process.cwd(), 'dist');
                if (fs.existsSync(distDir)) {
                  fs.writeFileSync(path.resolve(distDir, 'courses.json'), JSON.stringify(courses, null, 2), 'utf-8');
                }

                // 5. src/data/coursesData.ts
                const tsContent = `import { Course } from '../types';\n\nexport const initialCourses: Course[] = ${JSON.stringify(courses, null, 2)};\n\nexport function generateFull150Courses(): Course[] {\n  return initialCourses;\n}\n`;
                fs.writeFileSync(path.resolve(process.cwd(), 'src/data/coursesData.ts'), tsContent, 'utf-8');
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: courses?.length || 0 }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });

      // POST /api/save-blogs: write blogs directly to workspace disk files
      server.middlewares.use('/api/save-blogs', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const blogs = parsed.blogs;
              if (Array.isArray(blogs)) {
                // 1. Root blogs.json
                fs.writeFileSync(path.resolve(process.cwd(), 'blogs.json'), JSON.stringify(blogs, null, 2), 'utf-8');

                // 2. public/blogs.json
                const publicDir = path.resolve(process.cwd(), 'public');
                if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
                fs.writeFileSync(path.resolve(publicDir, 'blogs.json'), JSON.stringify(blogs, null, 2), 'utf-8');

                // 3. docs/blogs.json
                const docsDir = path.resolve(process.cwd(), 'docs');
                if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
                fs.writeFileSync(path.resolve(docsDir, 'blogs.json'), JSON.stringify(blogs, null, 2), 'utf-8');

                // 4. dist/blogs.json
                const distDir = path.resolve(process.cwd(), 'dist');
                if (fs.existsSync(distDir)) {
                  fs.writeFileSync(path.resolve(distDir, 'blogs.json'), JSON.stringify(blogs, null, 2), 'utf-8');
                }

                // 5. src/data/blogData.ts
                const tsContent = `import { BlogPost } from '../types';\n\nexport const initialBlogPosts: BlogPost[] = ${JSON.stringify(blogs, null, 2)};\n`;
                fs.writeFileSync(path.resolve(process.cwd(), 'src/data/blogData.ts'), tsContent, 'utf-8');
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: blogs?.length || 0 }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

function htmlEntryPointPlugin(): Plugin {
  return {
    name: 'html-entry-point-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let clean = html
          .replace(/<script\s+type="module"\s+crossorigin\s+src="\.?\/?assets\/index-[^"]+\.js"><\/script>/gi, '')
          .replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="\.?\/?assets\/index-[^"]+\.css">/gi, '');
        if (!clean.includes('/src/main.tsx')) {
          clean = clean.replace('</body>', '    <script type="module" src="/src/main.tsx"></script>\n  </body>');
        }
        return clean;
      },
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), htmlEntryPointPlugin(), coursesBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
