import React, { useEffect } from 'react';
import { PublicPage } from './components/public/PublicPage';
import type { Developer, SiteSettings } from './types';

const settings: SiteSettings = {
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
  contact_phone: '',
  github_org_url: 'https://github.com',
  meta_description:
    'الصفحة التعريفية الرسمية بفريق تطوير وبناء منصة حِصّتي، المنصة التعليمية الذكية لحجز المدرسين وتسجيل حضور QR.',
  meta_keywords: 'فريق تطوير حصتي, منصة حصتي, مطوري حصتي, Hassty team',
  canonical_url: 'https://hassty.vercel.app/team',
  updated_at: '2026-09-18T21:30:00.000Z'
};

const developers: Developer[] = [
  {
    id: 'dev-1',
    name: 'يوسف عماد الدين',
    role: 'مطور ومؤسس منصة حِصّتي',
    bio: 'مهندس برمجيات متخصص في بناء المنظومات التعليمية والحلول الرقمية السحابية. قاد تصميم البنية التحتية لمنصة حِصّتي ونظام الحضور الذكي بالـ QR.',
    quote:
      'أؤمن أن البرمجة ليست مجرد كتابة كود، بل بناء تجارب تصنع فرقًا حقيقيًا وتمكّن الأجيال القادمة.',
    image_url:
      '/uploads/youssef.jpg',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    facebook_url: '',
    instagram_url: '',
    email: 'myyousef000@gmail.com',
    website_url: 'https://hassty.vercel.app',
    sort_order: 1,
    is_visible: true,
    created_at: '2026-09-12T19:07:13.081Z',
    updated_at: '2026-09-12T19:07:13.081Z'
  },
  {
    id: 'dev-2',
    name: 'Mahmoud Ali',
    role: 'مطور واجهات مستخدم وتطبيقات تفاعلية',
    bio: 'مهندس برمجيات متخصص في بناء المنظومات التعليمية والحلول الرقمية السحابية. قاد تصميم البنية التحتية لمنصة حِصّتي ونظام الحضور الذكي بالـ QR.',
    quote:
      'البساطة والسرعة هما جوهر كل منتج تقني ناجح يُلهم مستخدميه ويجعل المهام المعقدة سهلة ومباشرة.',
    image_url: 'https://raw.githubusercontent.com/mahmoudmadkour191-code/-/hastey-deploy/public/uploads/mahmoud-ali.jpg',
    github_url: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    email: 'team@hassty.com',
    website_url: 'https://hassty.site',
    sort_order: 2,
    is_visible: true,
    created_at: '2026-09-12T19:07:13.081Z',
    updated_at: '2026-09-18T21:30:00.000Z'
  }
];

export default function App() {
  useEffect(() => {
    document.title = settings.page_title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', settings.meta_description);
    const icon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement | null;
    if (icon) icon.href = settings.favicon_url;
  }, []);

  return (
    <PublicPage
      developers={developers}
      settings={settings}
      isLoading={false}
    />
  );
}
