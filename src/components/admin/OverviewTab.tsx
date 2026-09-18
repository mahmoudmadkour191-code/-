import React from 'react';
import type { Developer, SiteSettings } from '../../types';
import { Users, Eye, EyeOff, Plus, Settings, ExternalLink, HardDrive, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
  developers: Developer[];
  settings: SiteSettings;
  onAddDeveloper: () => void;
  onGoToSettings: () => void;
  onGoToDevelopers: () => void;
  onPreviewSite: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  developers,
  settings,
  onAddDeveloper,
  onGoToSettings,
  onGoToDevelopers,
  onPreviewSite
}) => {
  const totalCount = developers.length;
  const visibleCount = developers.filter((d) => d.is_visible).length;
  const hiddenCount = totalCount - visibleCount;

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظام إدارة محتوى فريق تطوير منصة حِصّتي</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-xs font-semibold text-emerald-100">
              <Database className="w-3 h-3 text-emerald-300" />
              <span>قاعدة بيانات Firebase السحابية متصلة ومفعلة</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1.5">
            مرحبًا بك في لوحة تحكم المنصة
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            يمكنك من هنا إضافة المطورين، رفع صورهم، التحكم في ظهورهم وترتيبهم، وتعديل كافة نصوص وهوية الصفحة التعريفية بدون لمس الكود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onAddDeveloper}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مطور جديد</span>
          </button>
          <button
            onClick={onPreviewSite}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500/40 hover:bg-blue-500/60 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>معاينة الموقع للزوار</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">إجمالي المطورين</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{totalCount}</div>
          <p className="text-[11px] text-slate-400">مسجلين في قاعدة بيانات الفريق</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">المطورون الظاهرون</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-1">{visibleCount}</div>
          <p className="text-[11px] text-slate-400">يظهرون حالياً في الصفحة للزوار</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">المطورون المخفيون</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mb-1">{hiddenCount}</div>
          <p className="text-[11px] text-slate-400">مخفيون بدون حذف بياناتهم</p>
        </div>
      </div>

      {/* Quick summary of developers & site identity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Developers mini list */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">أعضاء الفريق المسجلون</h3>
              <p className="text-[11px] text-slate-400">ترتيب الظهور الحالي في الصفحة</p>
            </div>
            <button
              onClick={onGoToDevelopers}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              إدارة الكل ({totalCount})
            </button>
          </div>

          <div className="space-y-3">
            {developers.slice(0, 4).map((dev, idx) => (
              <div
                key={dev.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-4">#{idx + 1}</span>
                  <img
                    src={dev.image_url || '/uploads/default-avatar.svg'}
                    alt={dev.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 bg-white"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{dev.name}</h4>
                    <p className="text-[11px] text-slate-500">{dev.role}</p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      dev.is_visible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {dev.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{dev.is_visible ? 'ظاهر' : 'مخفي'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand identity overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">الهوية والشعار</h3>
              <button
                onClick={onGoToSettings}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>تعديل</span>
              </button>
            </div>

            <div className="text-center py-4">
              <img
                src={settings.logo_url || '/hassty-logo.svg'}
                alt="شعار حِصّتي"
                className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-xs ring-1 ring-blue-100 bg-white object-contain"
              />
              <h4 className="text-sm font-bold text-slate-900">{settings.site_name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 px-2">
                {settings.page_title}
              </p>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">البريد:</span>
                <span className="font-mono text-slate-700">{settings.contact_email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الهاتف:</span>
                <span className="font-mono text-slate-700" dir="ltr">{settings.contact_phone || '—'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onGoToSettings}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            تعديل إعدادات وهوية الموقع
          </button>
        </div>
      </div>
    </div>
  );
};