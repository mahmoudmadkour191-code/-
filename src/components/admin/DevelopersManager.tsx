import React, { useState } from 'react';
import type { Developer } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Github,
  Linkedin,
  Mail,
  Globe,
  Facebook,
  Instagram,
  AlertTriangle,
  Sparkles,
  Search,
  HardDrive
} from 'lucide-react';

interface DevelopersManagerProps {
  developers: Developer[];
  onAdd: () => void;
  onEdit: (dev: Developer) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleVisibility: (dev: Developer) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export const DevelopersManager: React.FC<DevelopersManagerProps> = ({
  developers,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReorder
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= developers.length) return;

    const newOrder = [...developers];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map((d) => d.id);
    await onReorder(orderedIds);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDevelopers = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dev.bio && dev.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'visible') return dev.is_visible;
    if (filterStatus === 'hidden') return !dev.is_visible;
    return true;
  });

  const visibleCount = developers.filter((d) => d.is_visible).length;
  const hiddenCount = developers.length - visibleCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">إدارة فريق المطورين</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
              {developers.length} مطور
            </span>
          </div>
          <p className="text-xs text-slate-500">
            أضف المطورين، عدّل الأسماء والمعلومات، وارفع الصور عبر Google Drive أو من جهازك.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مطور جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو المسمى الوظيفي..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({developers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('visible')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'visible'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الظاهرون ({visibleCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'hidden'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المخفيون ({hiddenCount})
          </button>
        </div>
      </div>

      {/* Developers List */}
      {developers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">لم يتم تسجيل أي مطورين بعد.</p>
          <p className="text-xs text-slate-400 mb-4">
            ابدأ بإضافة أول مطور لفريق منصة حِصّتي التعليمية
          </p>
          <button
            onClick={onAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            إضافة أول مطور الآن
          </button>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-2xs text-xs text-slate-500">
          لا توجد نتائج تطابق بحثك الحالي.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDevelopers.map((dev, index) => (
            <div
              key={dev.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                dev.is_visible
                  ? 'border-slate-200 hover:border-blue-200'
                  : 'border-amber-200/80 bg-amber-50/20'
              }`}
            >
              {/* Order buttons + Avatar + Basic Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* Reorder Up/Down */}
                <div className="flex flex-col gap-1 items-center">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition"
                    title="تحريك لأعلى"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === developers.length - 1}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition"
                    title="تحريك لأسفل"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar with status */}
                <div className="relative shrink-0">
                  <img
                    src={dev.image_url || '/uploads/default-avatar.svg'}
                    alt={dev.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100 bg-white shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/default-avatar.svg';
                    }}
                  />
                  {(dev.image_url.includes('googleusercontent.com') ||
                    dev.image_url.includes('drive.google.com')) && (
                    <span
                      className="absolute -bottom-1 -left-1 p-1 rounded-full bg-emerald-600 text-white shadow-2xs"
                      title="الصورة مرتبطة بـ Google Drive"
                    >
                      <HardDrive className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {dev.name}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        dev.is_visible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {dev.is_visible ? 'معروض للزوار' : 'مخفي مؤقتاً'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">{dev.role}</p>
                  {dev.bio && (
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">{dev.bio}</p>
                  )}

                  {/* Social badges mini */}
                  <div className="flex items-center gap-2.5 mt-2 text-slate-400">
                    {dev.github_url && <Github className="w-3.5 h-3.5 hover:text-slate-700" />}
                    {dev.linkedin_url && <Linkedin className="w-3.5 h-3.5 hover:text-blue-600" />}
                    {dev.email && <Mail className="w-3.5 h-3.5 hover:text-slate-600" />}
                    {dev.website_url && <Globe className="w-3.5 h-3.5 hover:text-emerald-600" />}
                    {dev.facebook_url && <Facebook className="w-3.5 h-3.5 hover:text-blue-700" />}
                    {dev.instagram_url && <Instagram className="w-3.5 h-3.5 hover:text-pink-600" />}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                {/* Toggle Visibility */}
                <button
                  onClick={() => onToggleVisibility(dev)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition ${
                    dev.is_visible
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}
                  title={dev.is_visible ? 'إخفاء من الصفحة للزوار' : 'إظهار في الصفحة للزوار'}
                >
                  {dev.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(dev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition"
                  title="تعديل الاسم والبيانات والصورة"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteTargetId(dev.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="حذف المطور"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                تأكيد حذف المطور من الفريق
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف بيانات هذا المطور نهائيًا؟ لن تظهر بطاقته بعد الآن في الموقع.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                {isDeleting ? 'جارٍ الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};