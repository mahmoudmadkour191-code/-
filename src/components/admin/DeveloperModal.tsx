import React, { useState } from 'react';
import type { Developer } from '../../types';
import { ImageSourcePicker } from './ImageSourcePicker';
import {
  X,
  User,
  Briefcase,
  Quote,
  FileText,
  Mail,
  Globe,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Layout
} from 'lucide-react';

interface DeveloperModalProps {
  developer?: Developer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Developer>) => Promise<void>;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  developer,
  isOpen,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(developer);

  const [name, setName] = useState(developer?.name || '');
  const [role, setRole] = useState(developer?.role || '');
  const [bio, setBio] = useState(developer?.bio || '');
  const [quote, setQuote] = useState(developer?.quote || '');
  const [imageUrl, setImageUrl] = useState(developer?.image_url || '/uploads/default-avatar.svg');
  const [githubUrl, setGithubUrl] = useState(developer?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(developer?.linkedin_url || '');
  const [facebookUrl, setFacebookUrl] = useState(developer?.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = useState(developer?.instagram_url || '');
  const [email, setEmail] = useState(developer?.email || '');
  const [websiteUrl, setWebsiteUrl] = useState(developer?.website_url || '');
  const [sortOrder, setSortOrder] = useState(developer?.sort_order || 1);
  const [isVisible, setIsVisible] = useState(developer?.is_visible !== false);

  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('الاسم والمسمى الوظيفي حقلان إلزاميان');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        quote: quote.trim(),
        image_url: imageUrl,
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        facebook_url: facebookUrl.trim(),
        instagram_url: instagramUrl.trim(),
        email: email.trim(),
        website_url: websiteUrl.trim(),
        sort_order: Number(sortOrder) || 1,
        is_visible: isVisible
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ بيانات المطور');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `تعديل بيانات المطور (${developer?.name})` : 'إضافة مطور جديد للفريق'}
              </h3>
              <p className="text-xs text-slate-500">
                تعديل الاسم، المسمى، صورة Google Drive، وبيانات التواصل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch for mobile/preview */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'form' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                البيانات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>معاينة حية</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'preview' ? (
            /* Live Card Preview Section */
            <div className="py-6 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                هكذا ستظهر بطاقة المطور تماماً للزوار على الصفحة الرئيسية:
              </p>

              <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isVisible ? 'ظاهر' : 'مخفي'}
                  </span>
                </div>

                <div className="w-24 h-24 mx-auto rounded-full ring-4 ring-blue-500/20 overflow-hidden bg-slate-100 mb-4 shadow-md">
                  <img
                    src={imageUrl || '/uploads/default-avatar.svg'}
                    alt={name || 'صورة المطور'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/default-avatar.svg';
                    }}
                  />
                </div>

                <h4 className="text-lg font-extrabold text-slate-900 mb-1">
                  {name || 'اسم المطور هنا'}
                </h4>
                <p className="text-xs font-semibold text-blue-600 mb-3">
                  {role || 'المسمى الوظيفي هنا'}
                </p>

                {bio && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-2xl text-right">
                    {bio}
                  </p>
                )}

                {quote && (
                  <div className="text-xs italic text-slate-500 mb-4 px-2">
                    &quot;{quote}&quot;
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100 text-slate-400">
                  {githubUrl && <Github className="w-4 h-4 text-slate-700" />}
                  {linkedinUrl && <Linkedin className="w-4 h-4 text-blue-600" />}
                  {email && <Mail className="w-4 h-4 text-slate-600" />}
                  {websiteUrl && <Globe className="w-4 h-4 text-emerald-600" />}
                  {facebookUrl && <Facebook className="w-4 h-4 text-blue-700" />}
                  {instagramUrl && <Instagram className="w-4 h-4 text-pink-600" />}
                  {!githubUrl && !linkedinUrl && !email && !websiteUrl && !facebookUrl && !instagramUrl && (
                    <span className="text-[11px] text-slate-400">لا توجد روابط مضافة</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Normal Form Fields */
            <div className="space-y-6">
              {/* Photo Upload Section with Google Drive */}
              <ImageSourcePicker
                label="صورة المطور الشخصية"
                helperText="يمكنك رفع الصورة من جهازك، أو وضع رابط Google Drive مباشرة، أو اختيارها من المكتبة"
                value={imageUrl}
                onChange={(newUrl) => setImageUrl(newUrl)}
                defaultFallback="/uploads/default-avatar.svg"
                shape="circle"
              />

              {/* Basic Info: Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    الاسم بالكامل *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: يوسف عماد الدين"
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    المسمى الوظيفي والمسؤولية *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="مثال: مؤسس ومطور منصة حِصّتي"
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  نبذة مختصرة عن المطور
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="نبذة تشرح خبراته ومسؤوليته في تطوير المنصة..."
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition leading-relaxed"
                  />
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  الجملة الشخصية الملهمة (تظهر أسفل البطاقة)
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 text-slate-400 absolute right-3 top-3 rotate-180" />
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={2}
                    placeholder="مثال: أؤمن أن البرمجة ليست مجرد كتابة كود، بل بناء تجارب تصنع فرقًا حقيقيًا."
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition leading-relaxed"
                  />
                </div>
              </div>

              {/* Social and Contact Links */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-800 mb-3">روابط التواصل والحسابات</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      حساب GitHub
                    </label>
                    <div className="relative">
                      <Github className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      حساب LinkedIn
                    </label>
                    <div className="relative">
                      <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      البريد الإلكتروني المهني
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="dev@hassty.com"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      الموقع الشخصي / معرض الأعمال
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://myportfolio.com"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      حساب Facebook
                    </label>
                    <div className="relative">
                      <Facebook className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/username"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      حساب Instagram
                    </label>
                    <div className="relative">
                      <Instagram className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dir-ltr text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order and Visibility */}
              <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    ترتيب الظهور في الفريق
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">الرقم الأصغر يظهر أولاً في قائمة الفريق</p>
                </div>

                <div className="flex flex-col justify-between">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    حالة الظهور في الموقع
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition shadow-2xs ${
                      isVisible
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>{isVisible ? 'معروض للزوار في الصفحة' : 'مخفي مؤقتاً'}</span>
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white shadow-2xs border border-slate-200">
                      تبديل
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'form' ? 'preview' : 'form')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            <Layout className="w-4 h-4" />
            <span>{activeTab === 'form' ? 'مشاهدة المعاينة الحية' : 'الرجوع للبيانات'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المطور'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};