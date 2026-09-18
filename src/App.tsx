import React, { useState, useEffect, useCallback } from 'react';
import type { Developer, SiteSettings } from './types';
import {
  fetchDevelopers,
  fetchSiteSettings,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
  reorderDevelopers,
  updateSiteSettings,
  checkAuth,
  setAuthToken
} from './lib/api';

import { PublicPage } from './components/public/PublicPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, type AdminTab } from './components/admin/AdminLayout';
import { OverviewTab } from './components/admin/OverviewTab';
import { DevelopersManager } from './components/admin/DevelopersManager';
import { SiteSettingsManager } from './components/admin/SiteSettingsManager';
import { MediaManager } from './components/admin/MediaManager';
import { DeveloperModal } from './components/admin/DeveloperModal';

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'settings_main',
  site_name: 'منصة حِصّتي',
  page_title: 'فريق تطوير منصة حِصّتي',
  page_subtitle:
    'نحن الفريق المسؤول عن بناء وتطوير منصة حِصّتي، ونعمل باستمرار على تقديم تجربة تعليمية رقمية أكثر سهولة واحترافية.',
  hero_badge: 'فريق العمل والابتكار التقني',
  logo_url: '/hassty-logo.svg',
  favicon_url: '/hassty-logo.svg',
  footer_text: 'صُنعت بشغف لتطوير تجربة التعليم',
  copyright_text: 'جميع الحقوق محفوظة © منصة حِصّتي',
  contact_email: 'hasstysupport@gmail.com',
  contact_phone: '+201212281360',
  github_org_url: 'https://github.com',
  meta_description:
    'الصفحة التعريفية الرسمية بفريق تطوير وبناء منصة حِصّتي، المنصة التعليمية الذكية لحجز المدرسين وتسجيل حضور QR.',
  meta_keywords: 'فريق تطوير حصتي, منصة حصتي, مطوري حصتي, Hassty team',
  canonical_url: 'https://hassty.vercel.app/team',
  updated_at: new Date().toISOString()
};

export default function App() {
  const [view, setView] = useState<'public' | 'admin' | 'login'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);

  // Initial Data Load
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [devsData, settingsData] = await Promise.all([
        fetchDevelopers().catch(() => []),
        fetchSiteSettings().catch(() => DEFAULT_SETTINGS)
      ]);
      setDevelopers(devsData);
      setSettings(settingsData);
    } catch (e) {
      console.error('Error loading initial app data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth and initial route on mount & hash changes
  useEffect(() => {
    async function initAuth() {
      const authenticated = await checkAuth();
      setIsAdminLoggedIn(authenticated);

      // Check if URL specifies admin mode
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setView(authenticated ? 'admin' : 'login');
      }
    }

    const handleHashChange = async () => {
      const authenticated = await checkAuth();
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setView(authenticated ? 'admin' : 'login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    initAuth();
    loadData();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadData]);

  // Sync title and favicon dynamically with settings
  useEffect(() => {
    if (settings.page_title) {
      document.title = settings.page_title;
    }
    if (settings.favicon_url) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = settings.favicon_url;
      }
    }
    if (settings.meta_description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', settings.meta_description);
      }
    }
  }, [settings]);

  // Keyboard shortcut: Ctrl + Alt + A to toggle admin login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminLoggedIn) {
          setView((prev) => (prev === 'admin' ? 'public' : 'admin'));
        } else {
          setView((prev) => (prev === 'login' ? 'public' : 'login'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminLoggedIn]);

  // Handlers for Developers
  const handleAddDeveloper = () => {
    setEditingDeveloper(null);
    setIsModalOpen(true);
  };

  const handleEditDeveloper = (dev: Developer) => {
    setEditingDeveloper(dev);
    setIsModalOpen(true);
  };

  const handleSaveDeveloper = async (data: Partial<Developer>) => {
    if (editingDeveloper) {
      const updated = await updateDeveloper(editingDeveloper.id, data);
      setDevelopers((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
    } else {
      const created = await createDeveloper(data);
      setDevelopers((prev) => [...prev, created]);
    }
  };

  const handleDeleteDeveloper = async (id: string) => {
    await deleteDeveloper(id);
    setDevelopers((prev) => prev.filter((d) => d.id !== id));
  };

  const handleToggleVisibility = async (dev: Developer) => {
    const updated = await updateDeveloper(dev.id, { is_visible: !dev.is_visible });
    setDevelopers((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleReorder = async (orderedIds: string[]) => {
    // Optimistically update
    const idToDev = new Map<string, Developer>(developers.map((d) => [d.id, d]));
    const reordered: Developer[] = [];
    orderedIds.forEach((id, idx) => {
      const found = idToDev.get(id);
      if (found) {
        reordered.push({ ...found, sort_order: idx + 1 });
      }
    });
    setDevelopers(reordered);
    await reorderDevelopers(orderedIds);
  };

  // Handlers for Settings
  const handleSaveSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = await updateSiteSettings(newSettings);
    setSettings(updated);
  };

  // Handlers for Authentication
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setView('admin');
    loadData(); // Re-fetch to get all developers including hidden ones
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAdminLoggedIn(false);
    setView('public');
    loadData(); // Re-fetch only public developers
  };

  const handleOpenAdminFromPublic = () => {
    if (isAdminLoggedIn) {
      setView('admin');
    } else {
      setView('login');
    }
  };

  // Render Login View
  if (view === 'login') {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onCancel={() => setView('public')}
      />
    );
  }

  // Render Admin Dashboard View
  if (view === 'admin') {
    return (
      <>
        <AdminLayout
          currentTab={adminTab}
          onTabChange={setAdminTab}
          onPreviewSite={() => setView('public')}
          onLogout={handleLogout}
          settings={settings}
        >
          {adminTab === 'overview' && (
            <OverviewTab
              developers={developers}
              settings={settings}
              onAddDeveloper={handleAddDeveloper}
              onGoToSettings={() => setAdminTab('settings')}
              onGoToDevelopers={() => setAdminTab('developers')}
              onPreviewSite={() => setView('public')}
            />
          )}

          {adminTab === 'developers' && (
            <DevelopersManager
              developers={developers}
              onAdd={handleAddDeveloper}
              onEdit={handleEditDeveloper}
              onDelete={handleDeleteDeveloper}
              onToggleVisibility={handleToggleVisibility}
              onReorder={handleReorder}
            />
          )}

          {adminTab === 'settings' && (
            <SiteSettingsManager
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}

          {adminTab === 'media' && <MediaManager />}
        </AdminLayout>

        <DeveloperModal
          developer={editingDeveloper}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDeveloper}
        />
      </>
    );
  }

  // Render Public Visitor View
  return (
    <>
      <PublicPage
        developers={developers}
        settings={settings}
        isLoading={isLoading}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdmin={handleOpenAdminFromPublic}
        onRefresh={loadData}
      />

      {/* Admin Developer Modal if triggered */}
      {isModalOpen && (
        <DeveloperModal
          developer={editingDeveloper}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDeveloper}
        />
      )}
    </>
  );
}