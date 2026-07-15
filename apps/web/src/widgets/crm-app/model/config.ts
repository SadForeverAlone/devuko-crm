import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAddressBook,
  faChartColumn,
  faChartLine,
  faFileLines,
  faGear,
  faRocket,
  faServer,
  faSquarePollVertical,
  faUsers,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import type { CallRecord, CrmLang, CrmTab, FileRecord, ReportRecord, TaskRecord } from "./types";

export { crmCopy } from "./i18n";

export const crmPlatformNavItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "users", label: { ru: "Пользователи", en: "Users" }, icon: faUsers },
  { key: "sites", label: { ru: "Сайты", en: "Sites" }, icon: faGlobe },
  { key: "logs", label: { ru: "Логи", en: "Logs" }, icon: faChartLine },
  { key: "settings", label: { ru: "Сервер", en: "Server" }, icon: faServer },
];

export const crmNavItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "dashboard", label: { ru: "Панель", en: "Dashboard" }, icon: faChartColumn },
  { key: "logs", label: { ru: "Логи", en: "Logs" }, icon: faChartLine },
  { key: "users", label: { ru: "Пользователи", en: "Users" }, icon: faUsers },
  { key: "promises", label: { ru: "Обещания", en: "Promises" }, icon: faRocket },
  { key: "pages", label: { ru: "Страницы", en: "Pages" }, icon: faFileLines },
  { key: "contacts", label: { ru: "Контакты", en: "Contact Us" }, icon: faAddressBook },
  { key: "settings", label: { ru: "Настройки", en: "Settings" }, icon: faGear },
];

export const crmShortcutItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "reports", label: { ru: "Отчёты", en: "Reports" }, icon: faSquarePollVertical },
];

export const mockTasks: TaskRecord[] = import.meta.env.DEV
  ? [
      {
        id: "TSK-1001",
        title: "Проверить обращения из Contact Us",
        description: "Разобрать новые сообщения пользователей с основного сайта и назначить ответственных.",
        status: "В Процессе",
        createdAt: "2026-04-15T09:20:00.000Z",
        owner: "Support Team",
      },
    ]
  : [];

export const mockFiles: FileRecord[] = import.meta.env.DEV
  ? [
      {
        id: "FL-301",
        title: "brand-guidelines.pdf",
        type: "PDF",
        owner: "Marketing",
        updatedAt: "2026-04-11T08:20:00.000Z",
        status: "Актуально",
      },
    ]
  : [];

export const mockReports: ReportRecord[] = [];

export const mockCalls: CallRecord[] = import.meta.env.DEV
  ? [{ id: "CALL-01", manager: "Demo", queue: "Support", handled: 0, missed: 0, avgTime: "—", status: "Offline" }]
  : [];

type CrmSettingsField = {
  key: string;
  title: Record<CrmLang, string>;
  description: Record<CrmLang, string>;
};

export const generalSettingsBlueprint: CrmSettingsField[] = [
  {
    key: "support_email",
    title: { ru: "Почта поддержки", en: "Support email" },
    description: {
      ru: "Основной email технической поддержки.",
      en: "Primary technical support email.",
    },
  },
  {
    key: "support_tg",
    title: { ru: "Telegram", en: "Telegram" },
    description: { ru: "Канал связи с технической поддержкой.", en: "Telegram support channel." },
  },
  {
    key: "support_vk",
    title: { ru: "VK", en: "VK" },
    description: { ru: "Ссылка на группу поддержки во VK.", en: "VK support community link." },
  },
  {
    key: "support_whatsapp",
    title: { ru: "WhatsApp", en: "WhatsApp" },
    description: {
      ru: "Номер или ссылка для связи через WhatsApp.",
      en: "Phone number or WhatsApp link.",
    },
  },
  {
    key: "support_instagram",
    title: { ru: "Instagram", en: "Instagram" },
    description: {
      ru: "Аккаунт для обратной связи в Instagram.",
      en: "Instagram account for feedback.",
    },
  },
  {
    key: "support_hours",
    title: { ru: "Часы работы", en: "Business hours" },
    description: {
      ru: "Часы работы, которые показываются на сайте.",
      en: "Hours shown on the public site.",
    },
  },
  {
    key: "support_priority",
    title: { ru: "Приоритет VIP", en: "VIP priority" },
    description: {
      ru: "Выделение срочных обращений в CRM.",
      en: "Highlight urgent tickets in CRM.",
    },
  },
];

export const seoSettingsBlueprint: CrmSettingsField[] = [
  {
    key: "site_public_url",
    title: { ru: "Публичный URL сайта", en: "Public site URL" },
    description: {
      ru: "Корень сайта для canonical и JSON-LD (https://…, без слэша в конце). Пример: https://selfpact.app",
      en: "Site origin for canonical & JSON-LD (https://…, no trailing slash). Example: https://selfpact.app",
    },
  },
  {
    key: "seo_og_image_url",
    title: { ru: "OG / Twitter изображение", en: "OG / Twitter image URL" },
    description: {
      ru: "Абсолютный URL картинки 1200×630 (https). Если пусто — используется favicon.",
      en: "Absolute image URL for social cards (https, ideally 1200×630). If empty, favicon is used.",
    },
  },
  {
    key: "seo_default_title_ru",
    title: { ru: "SEO: заголовок (RU)", en: "SEO: default title (RU)" },
    description: {
      ru: "Для страниц входа и юридических разделов, если задано — подменяет встроенный title.",
      en: "For login & legal pages: overrides built-in title when non-empty.",
    },
  },
  {
    key: "seo_default_title_en",
    title: { ru: "SEO: заголовок (EN)", en: "SEO: default title (EN)" },
    description: {
      ru: "Для страниц входа и юридических разделов (английская локаль).",
      en: "For login & legal pages when UI locale is English.",
    },
  },
  {
    key: "seo_default_description_ru",
    title: { ru: "SEO: описание (RU)", en: "SEO: default description (RU)" },
    description: {
      ru: "Meta / OG description для входа и юридических страниц (RU).",
      en: "Meta / OG description for login & legal (RU locale).",
    },
  },
  {
    key: "seo_default_description_en",
    title: { ru: "SEO: описание (EN)", en: "SEO: default description (EN)" },
    description: {
      ru: "Meta / OG description для входа и юридических страниц (EN).",
      en: "Meta / OG description for login & legal (EN locale).",
    },
  },
  {
    key: "seo_keywords_ru",
    title: { ru: "SEO: keywords (RU)", en: "SEO: keywords (RU)" },
    description: {
      ru: "Через запятую. Если задано — подставляется при русской локали вместо встроенного списка.",
      en: "Comma-separated. When set, used for Russian locale instead of built-in keywords.",
    },
  },
  {
    key: "seo_keywords_en",
    title: { ru: "SEO: keywords (EN)", en: "SEO: keywords (EN)" },
    description: {
      ru: "Keywords для английской локали.",
      en: "Comma-separated keywords for English locale.",
    },
  },
  {
    key: "seo_author_ru",
    title: { ru: "SEO: author (RU)", en: "SEO: meta author (RU)" },
    description: { ru: "Мета author при русской локали.", en: "Meta author when locale is Russian." },
  },
  {
    key: "seo_author_en",
    title: { ru: "SEO: author (EN)", en: "SEO: meta author (EN)" },
    description: { ru: "Мета author при английской локали.", en: "Meta author when locale is English." },
  },
  {
    key: "seo_publisher_ru",
    title: { ru: "SEO: publisher (RU)", en: "SEO: meta publisher (RU)" },
    description: { ru: "Мета publisher (RU).", en: "Meta publisher (Russian)." },
  },
  {
    key: "seo_publisher_en",
    title: { ru: "SEO: publisher (EN)", en: "SEO: meta publisher (EN)" },
    description: { ru: "Мета publisher (EN).", en: "Meta publisher (English)." },
  },
];

export const settingsBlueprint: CrmSettingsField[] = [...generalSettingsBlueprint, ...seoSettingsBlueprint];

