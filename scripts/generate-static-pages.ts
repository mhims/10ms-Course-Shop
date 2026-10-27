import fs from 'fs';
import path from 'path';
import { generateStaticHtml, getAllStaticPages } from '../src/utils/staticHtmlGenerator';
import { Course, BlogPost } from '../src/types';
import { writeLlmsFiles } from './generate-llms';

export function runStaticGeneration(projectRoot: string = process.cwd()) {
  const docsDir = path.resolve(projectRoot, 'docs');
  const indexHtmlPath = path.resolve(docsDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`Error: ${indexHtmlPath} does not exist. Run vite build first.`);
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  // Load datasets
  const coursesPath = path.resolve(projectRoot, 'courses.json');
  const blogsPath = path.resolve(projectRoot, 'blogs.json');

  const courses: Course[] = fs.existsSync(coursesPath)
    ? JSON.parse(fs.readFileSync(coursesPath, 'utf-8'))
    : [];
  const blogs: BlogPost[] = fs.existsSync(blogsPath)
    ? JSON.parse(fs.readFileSync(blogsPath, 'utf-8'))
    : [];

  const pages = getAllStaticPages(courses, blogs);

  console.log(`Generating ${pages.length} static pre-rendered routes for 200 OK indexing on GitHub Pages...`);

  let count = 0;
  for (const page of pages) {
    const renderedHtml = generateStaticHtml(baseHtml, page);

    // Target 1: inside docs/ (e.g. docs/courses/index.html)
    const docsTargetDir = path.resolve(docsDir, page.route);
    if (!fs.existsSync(docsTargetDir)) {
      fs.mkdirSync(docsTargetDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(docsTargetDir, 'index.html'), renderedHtml, 'utf-8');

    // Target 2: inside root (e.g. courses/index.html)
    const rootTargetDir = path.resolve(projectRoot, page.route);
    if (!fs.existsSync(rootTargetDir)) {
      fs.mkdirSync(rootTargetDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(rootTargetDir, 'index.html'), renderedHtml, 'utf-8');

    count++;
  }

  console.log(`Successfully created ${count} static HTML index files in both docs/ and root!`);

  // Dynamically update llms.txt and llms-full.txt
  try {
    writeLlmsFiles(projectRoot);
  } catch (err) {
    console.error('Error writing llms files:', err);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-static-pages.ts')) {
  runStaticGeneration();
  process.exit(0);
}
