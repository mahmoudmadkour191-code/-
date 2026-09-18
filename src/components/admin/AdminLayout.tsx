import React from 'react';
import type { SiteSettings } from '../../types';
import {
  LayoutDashboard,
  Users,
  Settings,
  HardDrive,
  Eye,
  LogOut,
  Shield
} from 'lucide-react';

export type AdminTab = 'overview' | 'developers' | 'settings' | 'media';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onPreviewSite: () => void;
  onLogout: () => void;
  settings: SiteSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onPreviewSite,
  onLogout,
  settings,
  children
}) => {
  const navItems = [
    { id: 'overview' as AdminTab, label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'developers' as AdminTab, label: 'إدارة المطورين', icon: Users },
    { id: 'settings' as AdminTab, label: 'إعدادات الموقع', icon: Settings },
    { id: 'media' as AdminTab, label: 'مكتبة الوسائط', icon: HardDrive }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <img
              src={settings.logo_url || '/hassty-logo.svg'}
              alt={settings.site_name}
              className="w-9 h-9 rounded-xl object-contain ring-1 ring-blue-100 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">لوحة إدارة المحتوى</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Shield className="w-2.5 h-2.5 text-blue-600" />
                  <span>حِصّتي</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                فريق تطوير منصة حِصّتي التعليمية
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onPreviewSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition"
              title="مشاهدة الصفحة كما يراها زوار الموقع"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة الموقع كزائر</span>
              <span className="sm:hidden">معاينة</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl transition"
              title="تسجيل الخروج من لوحة التحكم"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};