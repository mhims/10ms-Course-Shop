import React from 'react';
import { Home, BookOpen, FileText, Star } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, onNavigate }) => {
  const { siteSettings } = useCourseContext();

  const handleWhatsApp = () => {
    window.open(
      getWhatsAppUrl(siteSettings.whatsappNumber, 'আসসালামু আলাইকুম, ১০ মিনিট স্কুলের কোর্সের তথ্যের জন্য মেসেজ দিয়েছি।'),
      '_blank'
    );
  };

  const navItems = [
    { label: 'হোম', path: '/', icon: Home },
    { label: 'কোর্সসমূহ', path: '/courses', icon: BookOpen },
    { label: 'ব্লগ', path: '/blog', icon: FileText },
    { label: 'রিভিউ', path: '/review', icon: Star },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl safe-bottom">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
                isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-rose-600 rounded-b-full"></span>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* 5th item: Official WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-1 text-[#25D366] hover:text-[#1ebd5b] transition-colors cursor-pointer"
        >
          <div className="relative">
            <WhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px] font-bold text-[#128c7e]">WhatsApp</span>
        </button>
      </div>
    </nav>
  );
};
