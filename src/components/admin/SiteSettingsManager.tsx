import React, { useState } from 'react';
import type { SiteSettings } from '../../types';
import { ImageSourcePicker } from './ImageSourcePicker';
import {
  Save,
  RotateCcw,
  Globe,
  FileText,
  Search,
  Check,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Github
} from 'lucide-react';

interface SiteSettingsManagerProps {
  settings: SiteSettings;
  onSave: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

export const SiteSettingsManager: React.FC<SiteSettingsManagerProps> = ({
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetToOfficialLogo = () => {
    handleChange('logo_url', '/hassty-logo.svg');
    handleChange('favicon_url', '/hassty-logo.svg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(formData);
      setSuccessMessage('تم حفظ وتحديث إعدادات وهوية الموقع بنجاح!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">إعدادات وهوية الموقع</h2>
          <p className="text-xs text-slate-500">
            تعديل جميع نصوص الـ Hero، الشعار عبر Google Drive، الفوتر، وبيانات الـ SEO والاتصال.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          {isSaving ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>حفظ جميع التعديلات</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Brand & Logo Section with Google Drive Picker */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">شعار المنصة والأيقونة</h3>
          </div>

          <button
            type="button"
            onClick={resetToOfficialLogo}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5"
            title="استعادة شعار حِصّتي الأصلي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الشعار الرسمي</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Picker */}
          <div>
            <ImageSourcePicker
              label="شعار المنصة الرئيسي (Logo)"
              helperText="يدعم Google Drive، الرفع من الجهاز، أو رابط مباشر"
              value={formData.logo_url}
              onChange={(url) => handleChange('logo_url', url)}
              defaultFallback="/hassty-logo.svg"
              shape="rounded"
            />
          </div>

          {/* Favicon Picker */}
          <div>
            <ImageSourcePicker
              label="أيقونة المتصفح (Favicon)"
              helperText="الأيقونة التي تظهر في شريط لسان المتصفح"
              value={formData.favicon_url}
              onChange={(url) => handleChange('favicon_url', url)}
              defaultFallback="/hassty-logo.svg"
              shape="rounded"
            />
          </div>
        </div>
      </div>

      {/* Live Preview of Header & Hero Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">معاينة مباشرة للـ Hero والشعار</h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-14 h-14 mx-auto bg-white rounded-2xl ring-2 ring-blue-100 p-2 shadow-2xs">
            <img
              src={formData.logo_url || '/hassty-logo.svg'}
              alt={formData.site_name}
              className="w-full h-full object-contain"
            />
          </div>
          {formData.hero_badge && (
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
              {formData.hero_badge}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {formData.page_title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {formData.page_subtitle}
          </p>
        </div>
      </div>

      {/* Hero Section Texts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">نصوص قسم الـ Hero الرئيسي</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              اسم الموقع العام
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              شارة الـ Hero (Badge)
            </label>
            <input
              type="text"
              value={formData.hero_badge}
              onChange={(e) => handleChange('hero_badge', e.target.value)}
              placeholder="فريق العمل والابتكار التقني"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            العنوان الرئيسي الكبير للصفحة (H1)
          </label>
          <input
            type="text"
            value={formData.page_title}
            onChange={(e) => handleChange('page_title', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            الوصف التعريفي للـ Hero
          </label>
          <textarea
            value={formData.page_subtitle}
            onChange={(e) => handleChange('page_subtitle', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed"
          />
        </div>
      </div>

      {/* Footer & Contact Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">نصوص الفوتر وبيانات التواصل</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              البريد الإلكتروني الرسمي
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              رقم الهاتف / الواتساب
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              رابط منظمة GitHub
            </label>
            <div className="relative">
              <Github className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.github_org_url}
                onChange={(e) => handleChange('github_org_url', e.target.value)}
                placeholder="https://github.com/hassty-platform"
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              الرابط الأساسي للموقع
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.canonical_url}
                onChange={(e) => handleChange('canonical_url', e.target.value)}
                placeholder="https://hassty.com"
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            النص التعريفي في الفوتر
          </label>
          <textarea
            value={formData.footer_text}
            onChange={(e) => handleChange('footer_text', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            نص حقوق الملكية (Copyright)
          </label>
          <input
            type="text"
            value={formData.copyright_text}
            onChange={(e) => handleChange('copyright_text', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* SEO & Meta Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">محركات البحث والـ SEO</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            وصف الميتا لمحركات البحث (Meta Description)
          </label>
          <textarea
            value={formData.meta_description}
            onChange={(e) => handleChange('meta_description', e.target.value)}
            rows={2}
            placeholder="الصفحة الرسمية لفريق تطوير وبناء منصة حِصّتي التعليمية..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            الكلمات المفتاحية (Keywords مفصولة بفاصلة)
          </label>
          <input
            type="text"
            value={formData.meta_keywords}
            onChange={(e) => handleChange('meta_keywords', e.target.value)}
            placeholder="حِصّتي, منصة حِصّتي, فريق التطوير, برمجة, يوسف عماد الدين"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bottom Save Button Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          {isSaving ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>حفظ جميع التعديلات</span>
        </button>
      </div>
    </form>
  );
};