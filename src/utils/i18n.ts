export type Language = 'en' | 'ar';

export const translations = {
  en: {
    dashboard: 'Dashboard',
    members: 'Members',
    classes: 'Training Modules',
    coaches: 'Commanding Officers',
    kitchen: 'Kinetic Fuel',
    events: 'Events & Workshops',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Abort Protocol',
    login: 'Initialize Login',
    book: 'Engage',
    cancel: 'Abort',
    save: 'Save Changes',
    cancel_action: 'Cancel',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Processing...',
    welcome: 'Welcome back, Operator',

    // Admin specific
    financials: 'Financial Ledger',
    inventory: 'Arsenal Inventory',
    staff: 'Staff Management',
    library: 'Intel Archive',
    broadcast: 'Global Comms',
    policies: 'Operating Directives',
    pt_sessions: 'PT Sessions',
    pt_reports: 'PT Reports',
    session_policies: 'Session Policies',

    // User specific
    daily_schedule: 'Temporal Matrix',
    my_sessions: 'Active Deployments',
    qr_scanner: 'Identity Portal',
    attendance: 'Session Logs',
    community: 'Community',

    events_upcoming: 'Upcoming Operations',
    events_past: 'Archived Logs',

    welcome_back: 'Welcome Back',
    recovery_coach: 'Recovery Coach',
    recovery_low: 'High strain detected. Focus on active recovery.',
    recovery_mid: 'Moderate strain detected. Good day for mobility.',
    recovery_high: 'Fully recovered. Push your limits today!',
    recovery_ready: 'Ready to start?',
    recommended_action: 'Recommended Action',
    back_freeze: 'Back Freeze Request',
    click_here: 'Click Here',
    view_active_sessions: 'View Active Sessions',
    training: 'Training Hub',
    modules: 'Modules',
    booking: 'Booking',
    active: 'Active',
  },
  ar: {
    dashboard: 'لوحة القيادة',
    members: 'الأعضاء',
    classes: 'وحدات التدريب',
    coaches: 'القادة',
    kitchen: 'التغذية (Kinetic Fuel)',
    events: 'الفعاليات وورش العمل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    book: 'حجز',
    cancel: 'إلغاء',
    save: 'حفظ التغييرات',
    cancel_action: 'إلغاء',
    create: 'إنشاء',
    edit: 'تعديل',
    delete: 'حذف',
    loading: 'جاري المعالجة...',
    welcome: 'مرحباً بعودتك، أيها العامل',

    // Admin specific
    financials: 'السجل المالي',
    inventory: 'جرد المعدات',
    staff: 'إدارة الموظفين',
    library: 'أرشيف المعلومات',
    broadcast: 'البث العام',
    policies: 'توجيهات التشغيل',
    pt_sessions: 'جلسات التدريب الشخصي',
    pt_reports: 'تقارير التدريب الشخصي',
    session_policies: 'سياسات الجلسات',

    // User specific
    daily_schedule: 'الجدول اليومي',
    my_sessions: 'عملياتي النشطة',
    qr_scanner: 'بوابة الهوية',
    attendance: 'سجلات الحضور',
    community: 'المجتمع',

    events_upcoming: 'العمليات القادمة',
    events_past: 'السجلات السابقة',

    welcome_back: 'مرحباً بعودتك',
    recovery_coach: 'مدرب الاستشفاء',
    recovery_low: 'تم كشف إجهاد عالٍ. ركز على الاستشفاء النشط.',
    recovery_mid: 'تم كشف إجهاد متوسط. يوم جيد للحركة.',
    recovery_high: 'مستعد تماماً. ادفع حدودك اليوم!',
    recovery_ready: 'هل أنت مستعد للبدء؟',
    recommended_action: 'الإجراء الموصى به',
    back_freeze: 'طلب تجميد العضوية',
    click_here: 'انقر هنا',
    view_active_sessions: 'عرض الجلسات النشطة',
    training: 'مركز التدريب',
    modules: 'الوحدات',
    booking: 'الحجز',
    active: 'نشط',
  }
};

import { useState, useEffect } from 'react';

type TranslationKey = keyof typeof translations.en;

let currentLang: Language = (localStorage.getItem('app-lang') as Language) || 'en';

export const setLanguage = (lang: Language) => {
  currentLang = lang;
  localStorage.setItem('app-lang', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event('languagechange'));
};

export const getLanguage = () => currentLang;

export const initLanguage = () => {
  setLanguage(currentLang);
};

export const t = (key: TranslationKey | string): string => {
  const dict = translations[currentLang] as Record<string, string>;
  const fallbackDict = translations['en'] as Record<string, string>;
  return dict[key] || fallbackDict[key] || key;
};

export const useLanguage = () => {
  const [lang, setLangState] = useState<Language>(currentLang);

  useEffect(() => {
    const handleLangChange = () => setLangState(currentLang);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  return { lang, setLanguage, t };
};
