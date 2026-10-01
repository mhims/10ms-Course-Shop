/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CourseProvider, useCourseContext } from './context/CourseContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppPopup } from './components/WhatsAppPopup';
import { CourseChatAssistant } from './components/CourseChatAssistant';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ClassCategoryPage } from './pages/ClassCategoryPage';
import { BlogPage } from './pages/BlogPage';
import { ReviewPage } from './pages/ReviewPage';
import { AdminPage } from './pages/AdminPage';
import { AllCoursesPage } from './pages/AllCoursesPage';
import { CourseCategory } from './types';

function AppContent() {
  const { courses } = useCourseContext();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // 1. Check for query redirect like /?/adminpanelofficial or /?p=/adminpanelofficial
    const search = window.location.search;
    if (search.startsWith('?/')) {
      return '/' + search.slice(2).split('&')[0].replace(/^\/+/, '');
    }
    const params = new URLSearchParams(search);
    const pParam = params.get('p');
    if (pParam) return pParam.startsWith('/') ? pParam : '/' + pParam;

    // 2. Read from window.location.pathname or hash
    const p = window.location.pathname.replace(/\/+$/, '');
    if (p && p !== '') return p;
    if (window.location.hash) {
      const h = window.location.hash.replace(/^#\/?/, '/');
      return h || '/';
    }
    return '/';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const search = window.location.search;
      if (search.startsWith('?/')) {
        setCurrentPath('/' + search.slice(2).split('&')[0].replace(/^\/+/, ''));
        return;
      }
      const params = new URLSearchParams(search);
      const pParam = params.get('p');
      if (pParam) {
        setCurrentPath(pParam.startsWith('/') ? pParam : '/' + pParam);
        return;
      }

      if (window.location.hash) {
        const h = window.location.hash.replace(/^#\/?/, '/');
        setCurrentPath(h || '/');
      } else {
        const p = window.location.pathname.replace(/\/+$/, '');
        setCurrentPath(p || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', path);
    } catch {
      window.location.hash = path;
    }
  };

  // Determine which page to render based on path
  const renderCurrentView = () => {
    // All Courses route
    if (currentPath === '/courses' || currentPath === '/all-courses') {
      return <AllCoursesPage onNavigate={handleNavigate} />;
    }

    // 1. Static dedicated class category pages
    if (currentPath === '/class-6') {
      return <ClassCategoryPage category="class-6" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/class-7') {
      return <ClassCategoryPage category="class-7" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/class-8') {
      return <ClassCategoryPage category="class-8" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/class-6-8') {
      return <ClassCategoryPage category="class-6-8" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/class-9-10') {
      return <ClassCategoryPage category="class-9-10" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/hsc') {
      return <ClassCategoryPage category="hsc" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admission') {
      return <ClassCategoryPage category="admission" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/skills') {
      return <ClassCategoryPage category="skills" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/spoken-english') {
      return <ClassCategoryPage category="spoken-english" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/job-prep') {
      return <ClassCategoryPage category="job-prep" onNavigate={handleNavigate} />;
    }

    // 2. Blog page & single blog post
    if (currentPath === '/blog') {
      return <BlogPage onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return <BlogPage slug={slug} onNavigate={handleNavigate} />;
    }

    // 3. Review page
    if (currentPath === '/review') {
      return <ReviewPage onNavigate={handleNavigate} />;
    }

    // 4. Admin portal (Strictly hidden route)
    if (currentPath === '/adminpanelofficial') {
      return <AdminPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin') {
      // Disallow standard /admin route as requested
      return <HomePage onNavigate={handleNavigate} searchQuery={searchQuery} />;
    }

    // 5. Individual Course Slug: e.g. 10mscourse.shop/ghore-boshe-spoken-english-munzereen
    const potentialSlug = currentPath.replace(/^\/+/, '');
    if (potentialSlug) {
      const isCourseMatch = courses.some((c) => c.slug === potentialSlug || c.id === potentialSlug);
      if (isCourseMatch) {
        return <CourseDetailPage slug={potentialSlug} onNavigate={handleNavigate} />;
      }
    }

    // Default: Home Page
    return <HomePage onNavigate={handleNavigate} searchQuery={searchQuery} />;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Pinned Sticky Header */}
      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* WhatsApp Time-Based Dynamic Popup (pops up after 2s) */}
      <WhatsAppPopup />

      {/* Free Offline AI/Smart Knowledge Assistant */}
      <CourseChatAssistant onNavigate={handleNavigate} />

      {/* Mobile App-like Bottom Navigation */}
      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}

export default function App() {
  return (
    <CourseProvider>
      <AppContent />
    </CourseProvider>
  );
}
