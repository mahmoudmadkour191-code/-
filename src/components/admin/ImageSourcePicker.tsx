import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  HardDrive,
  Link as LinkIcon,
  Check,
  AlertCircle,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { uploadImage, importDriveImage, parseGoogleDriveUrl, fetchMedia } from '../../lib/api';
import type { MediaItem } from '../../types';

interface ImageSourcePickerProps {
  label: string;
  helperText?: string;
  value: string;
  onChange: (url: string) => void;
  defaultFallback?: string;
  shape?: 'circle' | 'rounded';
}

type TabType = 'drive' | 'device' | 'url' | 'library';

export const ImageSourcePicker: React.FC<ImageSourcePickerProps> = ({
  label,
  helperText,
  value,
  onChange,
  defaultFallback = '/uploads/default-avatar.svg',
  shape = 'circle'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('drive');

  // Google Drive tab state
  const [driveInput, setDriveInput] = useState('');
  const [isImportingDrive, setIsImportingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSuccess, setDriveSuccess] = useState<string | null>(null);
  const [showDriveHelp, setShowDriveHelp] = useState(false);

  // Device upload state
  const [isUploadingDevice, setIsUploadingDevice] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL state
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Media Library state
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Parse Drive URL in real-time
  const parsedDrive = parseGoogleDriveUrl(driveInput);

  // Load library when switching to library tab
  useEffect(() => {
    if (activeTab === 'library' && libraryItems.length === 0) {
      loadLibrary();
    }
  }, [activeTab]);

  const loadLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const items = await fetchMedia();
      setLibraryItems(items);
    } catch {
      // Ignore
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // 1. Google Drive Handlers
  const handleImportDriveToServer = async () => {
    if (!driveInput.trim()) {
      setDriveError('يرجى لصق رابط Google Drive أولاً');
      return;
    }

    if (!parsedDrive.fileId) {
      setDriveError('الرابط لا يبدو رابط Google Drive صالح. تأكد من نسخ رابط المشاركة.');
      return;
    }

    setIsImportingDrive(true);
    setDriveError(null);
    setDriveSuccess(null);

    try {
      const result = await importDriveImage(driveInput.trim());
      onChange(result.url);
      setDriveSuccess('تم استيراد الصورة وحفظها في التخزين الدائم بنجاح!');
      setTimeout(() => setDriveSuccess(null), 3500);
    } catch (err: any) {
      // If server download fails, offer direct CDN link
      if (parsedDrive.directUrl) {
        setDriveError(`${err.message || 'فشل التنزيل'}. يمكنك الضغط على "استخدام كرابط مباشر" بالأسفل.`);
      } else {
        setDriveError(err.message || 'فشل استيراد الصورة من Google Drive');
      }
    } finally {
      setIsImportingDrive(false);
    }
  };

  const handleUseDriveDirectLink = () => {
    if (!parsedDrive.directUrl) {
      setDriveError('يرجى إدخال رابط Google Drive صالح أولاً');
      return;
    }
    onChange(parsedDrive.directUrl);
    setDriveSuccess('تم تفعيل رابط العرض المباشر من Google Drive!');
    setDriveError(null);
    setTimeout(() => setDriveSuccess(null), 3000);
  };

  // 2. Device Upload Handler
  const handleDeviceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setDeviceError('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDeviceError('حجم الصورة يجب ألا يتجاوز 5 ميغابايت');
      return;
    }

    setIsUploadingDevice(true);
    setDeviceError(null);

    try {
      const res = await uploadImage(file);
      onChange(res.url);
    } catch (err: any) {
      setDeviceError(err.message || 'فشل رفع الصورة إلى الخادم');
    } finally {
      setIsUploadingDevice(false);
    }
  };

  // 3. Custom URL Handler
  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    onChange(customUrlInput.trim());
  };

  // Identify source type
  const isDriveSource = value.includes('googleusercontent.com') || value.includes('drive.google.com');
  const isLocalSource = value.startsWith('/uploads/');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">{label}</label>
          {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
        </div>

        {defaultFallback && value !== defaultFallback && (
          <button
            type="button"
            onClick={() => onChange(defaultFallback)}
            className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline transition"
          >
            إعادة تعيين للأصل
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
        {/* Top: Current Image Preview Box */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
          <div
            className={`relative overflow-hidden shrink-0 ring-2 ring-blue-100 bg-slate-100 ${
              shape === 'circle' ? 'w-16 h-16 rounded-full' : 'w-20 h-16 rounded-xl'
            }`}
          >
            <img
              src={value || defaultFallback}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultFallback;
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900">الصورة الحالية</span>
              {isDriveSource ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Google Drive
                </span>
              ) : isLocalSource ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  مخزنة بالسيرفر
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                  رابط خارجي
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate dir-ltr text-right">
              {value || 'لم يتم تحديد صورة'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'drive'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Google Drive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'device'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع من الجهاز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'url'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>رابط مباشر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'library'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>المكتبة</span>
          </button>
        </div>

        {/* Tab 1: Google Drive */}
        {activeTab === 'drive' && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  الصق رابط صورة Google Drive
                </label>
                <button
                  type="button"
                  onClick={() => setShowDriveHelp(!showDriveHelp)}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>طريقة مشاركة الرابط</span>
                </button>
              </div>

              {showDriveHelp && (
                <div className="mb-3 p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    خطوات سريعة لنسخ الرابط من Google Drive:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800 pr-1">
                    <li>افتح الصورة داخل Google Drive.</li>
                    <li>اضغط على زر <strong>مشاركة (Share)</strong> بالأعلى.</li>
                    <li>
                      تحت &quot;الوصول العام&quot; اختر: <strong>&quot;أي شخص لديه الرابط&quot;</strong> (Anyone with the link).
                    </li>
                    <li>اضغط <strong>&quot;نسخ الرابط&quot;</strong> والصقه في المربع أدناه.</li>
                  </ol>
                </div>
              )}

              <input
                type="text"
                value={driveInput}
                onChange={(e) => {
                  setDriveInput(e.target.value);
                  setDriveError(null);
                  setDriveSuccess(null);
                }}
                placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-right dir-ltr transition"
              />
            </div>

            {parsedDrive.fileId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={parsedDrive.directUrl || ''}
                    alt="معاينة سريعة"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">تم التعرف على معرّف درايف</p>
                  <p className="text-[10px] text-slate-500 truncate font-mono">
                    ID: {parsedDrive.fileId}
                  </p>
                </div>
              </div>
            )}

            {driveError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{driveError}</span>
              </div>
            )}

            {driveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{driveSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleImportDriveToServer}
                disabled={isImportingDrive || !parsedDrive.fileId}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                {isImportingDrive ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {isImportingDrive ? 'جارٍ الاستيراد والحفظ...' : 'استيراد وحفظ دائم بالسيرفر (موصى به)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleUseDriveDirectLink}
                disabled={!parsedDrive.directUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition"
                title="استخدام رابط العرض المباشر بدون تخزين محلي"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>استخدام كرابط مباشر</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Upload from Device */}
        {activeTab === 'device' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeviceFileSelect}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploadingDevice ? 'جارٍ رفع الصورة إلى السيرفر...' : 'اضغط لاختيار صورة من جهازك'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  يدعم WebP, JPG, PNG, SVG بحجم أقصى 5 ميغابايت
                </p>
              </div>
            </div>

            {deviceError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deviceError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رابط صورة مباشر من الإنترنت
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-right dir-ltr"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition"
                >
                  تطبيق
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              يمكنك استخدام روابط صور من أي خادم خارجي موثوق (مثل Unsplash, Imgur, Cloudinary وغيرها).
            </p>
          </div>
        )}

        {/* Tab 4: Media Library */}
        {activeTab === 'library' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">الصور المرفوعة مسبقاً</span>
              <button
                type="button"
                onClick={loadLibrary}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingLibrary ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            {isLoadingLibrary ? (
              <div className="py-8 text-center text-xs text-slate-400">جارٍ تحميل مكتبة الوسائط...</div>
            ) : libraryItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                لا توجد صور مرفوعة في مكتبة الوسائط بعد.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                {libraryItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onChange(item.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      value === item.url
                        ? 'border-blue-600 ring-2 ring-blue-300'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {value === item.url && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};