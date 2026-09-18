import React, { useState, useEffect, useRef } from 'react';
import type { MediaItem } from '../../types';
import { fetchMedia, deleteMedia, uploadImage, importDriveImage, parseGoogleDriveUrl } from '../../lib/api';
import {
  Upload,
  Trash2,
  Copy,
  Check,
  HardDrive,
  AlertCircle,
  FileImage,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Maximize2,
  X,
  HelpCircle
} from 'lucide-react';

export const MediaManager: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Google Drive quick import drawer/modal state
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [isImportingDrive, setIsImportingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchMedia();
      setMedia(items);
    } catch (err: any) {
      setError(err.message || 'فشل جلب ملفات الوسائط');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب ألا يتجاوز 5 ميغابايت');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await uploadImage(file);
      await loadMedia();
      setSuccessMessage('تم رفع الصورة بنجاح وحفظها في التخزين!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriveImport = async () => {
    if (!driveUrlInput.trim()) {
      setDriveError('يرجى إدخال رابط Google Drive');
      return;
    }

    setIsImportingDrive(true);
    setDriveError(null);

    try {
      await importDriveImage(driveUrlInput.trim());
      await loadMedia();
      setDriveUrlInput('');
      setIsDriveOpen(false);
      setSuccessMessage('تم استيراد الصورة بنجاح من Google Drive إلى مكتبة الوسائط!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setDriveError(err.message || 'تعذر استيراد الصورة من Google Drive. تأكد من أن الرابط متاح لأي شخص.');
    } finally {
      setIsImportingDrive(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف نهائيًا من التخزين؟')) return;
    try {
      await deleteMedia(filename);
      setMedia((prev) => prev.filter((m) => m.name !== filename));
      setSuccessMessage('تم حذف الملف بنجاح');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError(err.message || 'فشل حذف الملف');
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBytes = media.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Upload & Drive action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">مكتبة الوسائط والتخزين</h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
              {media.length} ملف
            </span>
          </div>
          <p className="text-xs text-slate-500">
            إدارة كافة الصور، واستيراد مباشر من Google Drive أو رفع ملفات من الجهاز.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadMedia}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Google Drive Import Button */}
          <button
            onClick={() => setIsDriveOpen(!isDriveOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition"
          >
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>استيراد من Google Drive</span>
          </button>

          {/* Device Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'جارٍ الرفع...' : 'رفع صورة من الجهاز'}</span>
          </button>
        </div>
      </div>

      {/* Google Drive Import Box (Collapsible) */}
      {isDriveOpen && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  استيراد وحفظ صورة من Google Drive
                </h3>
                <p className="text-xs text-slate-500">
                  انسخ رابط المشاركة وسيقوم الخادم بتنزيل الصورة وتخزينها محلياً في الموقع
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDriveOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={driveUrlInput}
                onChange={(e) => {
                  setDriveUrlInput(e.target.value);
                  setDriveError(null);
                }}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dir-ltr text-right"
              />
              <button
                type="button"
                onClick={handleDriveImport}
                disabled={isImportingDrive || !driveUrlInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                {isImportingDrive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isImportingDrive ? 'جارٍ الاستيراد...' : 'تنزيل وحفظ في المكتبة'}</span>
              </button>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>تنبيه مهم:</strong> تأكد أن إذن مشاركة الملف في Google Drive هو <strong>&quot;أي شخص لديه الرابط&quot;</strong> (Anyone with the link) ليتمكن الخادم من قراءة الصورة وتنزيلها.
              </span>
            </div>

            {driveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{driveError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Info Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في أسماء ملفات الصور..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3 self-end sm:self-auto">
          <span>الحجم الإجمالي: <strong className="text-slate-800 font-mono">{formatSize(totalBytes)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>النتائج: <strong className="text-slate-800 font-mono">{filteredMedia.length}</strong></span>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-48 flex flex-col justify-between"
            >
              <div className="h-28 bg-slate-200 rounded-xl mb-2" />
              <div className="h-3 bg-slate-200 rounded w-3/4 mb-1" />
              <div className="h-2 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">
            {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد صور في التخزين حاليًا'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            {searchQuery
              ? 'جرّب البحث بكلمة أخرى'
              : 'يمكنك رفع صور من جهازك أو استيرادها مباشرة من Google Drive'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              رفع صورة الآن
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div
                className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
                onClick={() => setSelectedPreviewImage(item.url)}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 bg-white/90 rounded-full text-slate-800 shadow-xs">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>

                {item.name.startsWith('drive-') && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-2xs">
                    Google Drive
                  </span>
                )}
              </div>

              {/* Info & Action Buttons */}
              <div className="p-3.5 space-y-2">
                <p className="text-xs font-bold text-slate-800 truncate dir-ltr text-right" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{formatSize(item.size)}</span>
                  <span>{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition"
                    title="نسخ رابط الصورة المباشر"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف الصورة من التخزين"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative bg-white rounded-3xl overflow-hidden max-w-3xl max-h-[90vh] shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPreviewImage}
              alt="معاينة كاملة"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
            <div className="p-3 text-center">
              <button
                onClick={() => handleCopy(selectedPreviewImage)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط المباشر للصورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};