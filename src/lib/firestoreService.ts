import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Developer, SiteSettings } from '../types';

export const DEVELOPERS_COLLECTION = 'developers';
export const SITE_SETTINGS_COLLECTION = 'site_settings';
export const SETTINGS_DOC_ID = 'settings_main';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'settings_main',
  site_name: 'منصة حِصّتي',
  page_title: 'فريق تطوير منصة حِصّتي',
  page_subtitle: 'نحن الفريق المسؤول عن بناء وتطوير منصة حِصّتي، ونعمل باستمرار على تقديم تجربة تعليمية رقمية أكثر سهولة واحترافية.',
  hero_badge: 'فريق العمل والابتكار التقني',
  logo_url: '/hassty-logo.svg',
  favicon_url: '/hassty-logo.svg',
  footer_text: 'صُنعت بشغف لتطوير تجربة التعليم',
  copyright_text: 'جميع الحقوق محفوظة © منصة حِصّتي',
  contact_email: 'hasstysupport@gmail.com',
  contact_phone: '+201212281360',
  github_org_url: 'https://github.com',
  meta_description: 'الصفحة التعريفية الرسمية بفريق تطوير وبناء منصة حِصّتي، المنصة التعليمية الذكية لحجز المدرسين وتسجيل حضور QR.',
  meta_keywords: 'فريق تطوير حصتي, منصة حصتي, مطوري حصتي, Hassty team, Yousef Emad',
  canonical_url: 'https://hassty.vercel.app/team',
  updated_at: new Date().toISOString()
};

export const DEFAULT_DEVELOPERS: Developer[] = [
  {
    id: 'dev-1',
    name: 'يوسف عماد الدين',
    role: 'مطور ومؤسس منصة حِصّتي',
    bio: 'مهندس برمجيات متخصص في بناء المنظومات التعليمية والحلول الرقمية السحابية. قاد تصميم البنية التحتية لمنصة حِصّتي ونظام الحضور الذكي بالـ QR.',
    quote: 'أؤمن أن البرمجة ليست مجرد كتابة كود، بل بناء تجارب تصنع فرقًا حقيقيًا وتمكّن الأجيال القادمة.',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    facebook_url: '',
    instagram_url: '',
    email: 'myyousef000@gmail.com',
    website_url: 'https://hassty.vercel.app',
    sort_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dev-2',
    name: 'أحمد كمال الدين',
    role: 'مهندس واجهات أمامية وتجربة مستخدم',
    bio: 'مطور واجهات مستخدم وتطبيقات تفاعلية، يركز على معايير الأداء والسرعة وسهولة الاستخدام لبناء تجربة تليق بطلاب وأولياء أمور منصة حِصّتي.',
    quote: 'البساطة والسرعة هما جوهر كل منتج تقني ناجح يُلهم مستخدميه ويجعل المهام المعقدة سهلة ومباشرة.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    facebook_url: '',
    instagram_url: '',
    email: 'team@hassty.com',
    website_url: 'https://hassty.vercel.app',
    sort_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Initialize Firestore with initial records if empty
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const devCol = collection(db, DEVELOPERS_COLLECTION);
    const snap = await getDocs(devCol);
    if (snap.empty) {
      for (const dev of DEFAULT_DEVELOPERS) {
        await setDoc(doc(db, DEVELOPERS_COLLECTION, dev.id), dev);
      }
    }

    const settingsDocRef = doc(db, SITE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, DEFAULT_SITE_SETTINGS);
    }
  } catch (err) {
    console.warn('Firebase initial seed check error (fallback to local if offline):', err);
  }
}

/**
 * Fetch all developers from Firestore
 */
export async function getDevelopersFromFirestore(onlyVisible = false): Promise<Developer[]> {
  try {
    const devCol = collection(db, DEVELOPERS_COLLECTION);
    const q = query(devCol, orderBy('sort_order', 'asc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      return DEFAULT_DEVELOPERS.filter(d => (!onlyVisible || d.is_visible));
    }

    const list: Developer[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Developer);
    });

    return onlyVisible ? list.filter(d => d.is_visible) : list;
  } catch (err) {
    console.warn('Firestore fetch failed, returning default developers:', err);
    return DEFAULT_DEVELOPERS.filter(d => (!onlyVisible || d.is_visible));
  }
}

/**
 * Save/Create a developer in Firestore
 */
export async function saveDeveloperToFirestore(dev: Partial<Developer>): Promise<Developer> {
  const now = new Date().toISOString();
  const id = dev.id || `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullDev: Developer = {
    id,
    name: dev.name || '',
    role: dev.role || '',
    bio: dev.bio || '',
    quote: dev.quote || '',
    image_url: dev.image_url || '/uploads/default-avatar.svg',
    github_url: dev.github_url || '',
    linkedin_url: dev.linkedin_url || '',
    facebook_url: dev.facebook_url || '',
    instagram_url: dev.instagram_url || '',
    email: dev.email || '',
    website_url: dev.website_url || '',
    sort_order: dev.sort_order ?? 999,
    is_visible: dev.is_visible ?? true,
    created_at: dev.created_at || now,
    updated_at: now
  };

  await setDoc(doc(db, DEVELOPERS_COLLECTION, id), fullDev);
  return fullDev;
}

/**
 * Delete developer from Firestore
 */
export async function deleteDeveloperFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, DEVELOPERS_COLLECTION, id));
}

/**
 * Reorder developers in Firestore
 */
export async function reorderDevelopersInFirestore(orderedIds: string[]): Promise<void> {
  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index];
    const devDocRef = doc(db, DEVELOPERS_COLLECTION, id);
    await setDoc(devDocRef, { sort_order: index + 1, updated_at: new Date().toISOString() }, { merge: true });
  }
}

/**
 * Get Site Settings from Firestore
 */
export async function getSiteSettingsFromFirestore(): Promise<SiteSettings> {
  try {
    const settingsDocRef = doc(db, SITE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(settingsDocRef);
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (err) {
    console.warn('Firestore get settings error, fallback to defaults:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Update Site Settings in Firestore
 */
export async function updateSiteSettingsInFirestore(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettingsFromFirestore();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    id: SETTINGS_DOC_ID,
    updated_at: new Date().toISOString()
  };

  const settingsDocRef = doc(db, SITE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(settingsDocRef, updated);
  return updated;
}

/**
 * Subscribe to developers in real-time
 */
export function subscribeToDevelopers(callback: (developers: Developer[]) => void) {
  const devCol = collection(db, DEVELOPERS_COLLECTION);
  const q = query(devCol, orderBy('sort_order', 'asc'));

  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(DEFAULT_DEVELOPERS);
      return;
    }
    const devs: Developer[] = [];
    snap.forEach((docSnap) => {
      devs.push(docSnap.data() as Developer);
    });
    callback(devs);
  }, (err) => {
    console.error('Real-time developers listener error:', err);
  });
}

/**
 * Subscribe to site settings in real-time
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void) {
  const settingsDocRef = doc(db, SITE_SETTINGS_COLLECTION, SETTINGS_DOC_ID);

  return onSnapshot(settingsDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SiteSettings);
    } else {
      callback(DEFAULT_SITE_SETTINGS);
    }
  }, (err) => {
    console.error('Real-time site settings listener error:', err);
  });
}