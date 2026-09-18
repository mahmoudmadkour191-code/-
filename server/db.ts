import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Developer, SiteSettings } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  developers: Developer[];
  site_settings: SiteSettings;
}

const DEFAULT_SETTINGS: SiteSettings = {
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
  contact_phone: '',
  github_org_url: 'https://github.com',
  meta_description: 'الصفحة التعريفية الرسمية بفريق تطوير وبناء منصة حِصّتي، المنصة التعليمية الذكية لحجز المدرسين وتسجيل حضور QR.',
  meta_keywords: 'فريق تطوير حصتي, منصة حصتي, مطوري حصتي, Hassty team, Yousef Emad',
  canonical_url: 'https://hassty.vercel.app/team',
  updated_at: new Date().toISOString()
};

const DEFAULT_DEVELOPERS: Developer[] = [
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
    name: 'Mahmoud Ali',
    role: 'مهندس واجهات أمامية وتجربة مستخدم',
    bio: 'مطور واجهات مستخدم وتطبيقات تفاعلية، يركز على معايير الأداء والسرعة وسهولة الاستخدام لبناء تجربة تليق بطلاب وأولياء أمور منصة حِصّتي.',
    quote: 'البساطة والسرعة هما جوهر كل منتج تقني ناجح يُلهم مستخدميه ويجعل المهام المعقدة سهلة ومباشرة.',
    image_url: '/uploads/mahmoud-ali.jpg',
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

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.developers && parsed.site_settings) {
        return parsed;
      }
    } catch (e) {
      console.error('Error reading database file, re-initializing', e);
    }
  }

  const initial: DatabaseSchema = {
    developers: DEFAULT_DEVELOPERS,
    site_settings: DEFAULT_SETTINGS
  };

  saveDb(initial);
  return initial;
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

// Developer Queries
export function getDevelopers(onlyVisible = false): Developer[] {
  const db = initDb();
  let list = db.developers;
  if (onlyVisible) {
    list = list.filter(d => d.is_visible);
  }
  return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function getDeveloperById(id: string): Developer | undefined {
  const db = initDb();
  return db.developers.find(d => d.id === id);
}

export function createDeveloper(input: Omit<Developer, 'id' | 'created_at' | 'updated_at'>): Developer {
  const db = initDb();
  const now = new Date().toISOString();
  const newDev: Developer = {
    ...input,
    id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: now,
    updated_at: now
  };
  db.developers.push(newDev);
  saveDb(db);
  return newDev;
}

export function updateDeveloper(id: string, input: Partial<Developer>): Developer | null {
  const db = initDb();
  const index = db.developers.findIndex(d => d.id === id);
  if (index === -1) return null;

  const existing = db.developers[index];
  const updated: Developer = {
    ...existing,
    ...input,
    id: existing.id,
    updated_at: new Date().toISOString()
  };
  db.developers[index] = updated;
  saveDb(db);
  return updated;
}

export function deleteDeveloper(id: string): boolean {
  const db = initDb();
  const index = db.developers.findIndex(d => d.id === id);
  if (index === -1) return false;

  db.developers.splice(index, 1);
  saveDb(db);
  return true;
}

export function reorderDevelopers(orderedIds: string[]): Developer[] {
  const db = initDb();
  const idToOrder = new Map<string, number>();
  orderedIds.forEach((id, idx) => {
    idToOrder.set(id, idx + 1);
  });

  db.developers.forEach(d => {
    if (idToOrder.has(d.id)) {
      d.sort_order = idToOrder.get(d.id)!;
      d.updated_at = new Date().toISOString();
    }
  });

  saveDb(db);
  return getDevelopers(false);
}

// Site Settings Queries
export function getSiteSettings(): SiteSettings {
  const db = initDb();
  return db.site_settings;
}

export function updateSiteSettings(input: Partial<SiteSettings>): SiteSettings {
  const db = initDb();
  db.site_settings = {
    ...db.site_settings,
    ...input,
    id: 'settings_main',
    updated_at: new Date().toISOString()
  };
  saveDb(db);
  return db.site_settings;
}