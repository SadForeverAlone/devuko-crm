import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAddressBook,
  faChartColumn,
  faChartLine,
  faFileLines,
  faFolderOpen,
  faGear,
  faListCheck,
  faPhone,
  faRocket,
  faSquarePollVertical,
  faUsers,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import type { CallRecord, CrmLang, CrmTab, FileRecord, PageRecord, ReportRecord, TaskRecord } from "./types";

export { crmCopy } from "./i18n";

export const crmPlatformNavItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "sites", label: { ru: "Сайты", en: "Sites" }, icon: faGlobe },
];

export const crmNavItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "dashboard", label: { ru: "Панель", en: "Dashboard" }, icon: faChartColumn },
  { key: "logs", label: { ru: "Логи", en: "Logs" }, icon: faChartLine },
  { key: "users", label: { ru: "Пользователи", en: "Users" }, icon: faUsers },
  { key: "promises", label: { ru: "Обещания", en: "Promises" }, icon: faRocket },
  { key: "settings", label: { ru: "Настройки", en: "Settings" }, icon: faGear },
  { key: "contacts", label: { ru: "Контакты", en: "Contact Us" }, icon: faAddressBook },
];

export const crmShortcutItems: Array<{ key: CrmTab; label: Record<CrmLang, string>; icon: IconDefinition }> = [
  { key: "pages", label: { ru: "Страницы", en: "Pages" }, icon: faFileLines },
  { key: "files", label: { ru: "Файлы", en: "Files" }, icon: faFolderOpen },
  { key: "tasks", label: { ru: "Задачи", en: "Tasks" }, icon: faListCheck },
  { key: "reports", label: { ru: "Отчёты", en: "Reports" }, icon: faSquarePollVertical },
  { key: "call-tracker", label: { ru: "Звонки", en: "Call Tracker" }, icon: faPhone },
];

export const mockTasks: TaskRecord[] = [
  {
    id: "TSK-1001",
    title: "Проверить обращения из Contact Us",
    description: "Разобрать новые сообщения пользователей с основного сайта и назначить ответственных.",
    status: "В Процессе",
    createdAt: "2026-04-15T09:20:00.000Z",
    owner: "Support Team",
  },
  {
    id: "TSK-1002",
    title: "Обновить welcome-сценарий для CRM",
    description: "Согласовать новый текст onboarding для админов и менеджеров.",
    status: "Новая",
    createdAt: "2026-04-14T12:10:00.000Z",
    owner: "Product Ops",
  },
  {
    id: "TSK-1003",
    title: "Закрыть баг с невалидными proof",
    description: "Проверить загрузки доказательств и отметить обещания без файлов.",
    status: "Выполнена",
    createdAt: "2026-04-12T18:45:00.000Z",
    owner: "Moderation",
  },
];

export const mockPages: PageRecord[] = [
  { id: "PG-01", page: "/", views: 6824, uniqueUsers: 4911, conversion: "12.4%" },
  { id: "PG-02", page: "/auth", views: 3142, uniqueUsers: 2804, conversion: "26.8%" },
  { id: "PG-03", page: "/profile", views: 2241, uniqueUsers: 1682, conversion: "44.2%" },
  { id: "PG-04", page: "/create-action", views: 1935, uniqueUsers: 1406, conversion: "38.0%" },
  { id: "PG-05", page: "/proof-submit", views: 1288, uniqueUsers: 914, conversion: "57.6%" },
  { id: "PG-06", page: "/help", views: 803, uniqueUsers: 694, conversion: "18.3%" },
];

export const mockFiles: FileRecord[] = [
  { id: "FL-301", title: "brand-guidelines.pdf", type: "PDF", owner: "Marketing", updatedAt: "2026-04-11T08:20:00.000Z", status: "Актуально" },
  { id: "FL-302", title: "support-replies.docx", type: "DOCX", owner: "Support", updatedAt: "2026-04-14T10:00:00.000Z", status: "На согласовании" },
  { id: "FL-303", title: "promises-export.xlsx", type: "XLSX", owner: "Analytics", updatedAt: "2026-04-16T07:40:00.000Z", status: "Обновлено" },
  { id: "FL-304", title: "faq-v2.txt", type: "TXT", owner: "Content", updatedAt: "2026-04-10T18:35:00.000Z", status: "Черновик" },
];

export const mockReports: ReportRecord[] = [
  {
    id: "REP-01",
    title: "Ошибка при отправке доказательств",
    severity: "High",
    channel: "Основной сайт",
    createdAt: "2026-04-16T09:35:00.000Z",
    status: "Открыт",
    description: "Пользователь видит таймаут после загрузки proof в форме обещания.",
  },
  {
    id: "REP-02",
    title: "Не приходит письмо подтверждения",
    severity: "Medium",
    channel: "Основной сайт",
    createdAt: "2026-04-15T18:20:00.000Z",
    status: "В работе",
    description: "Часть новых пользователей не получает welcome email после регистрации.",
  },
  {
    id: "REP-03",
    title: "Сломан фильтр на мобильном",
    severity: "Low",
    channel: "Landing",
    createdAt: "2026-04-14T14:10:00.000Z",
    status: "Подтвержден",
    description: "Фильтр категорий не закрывается после выбора на экранах меньше 390px.",
  },
];

export const mockCalls: CallRecord[] = [
  { id: "CALL-01", manager: "Анна К.", queue: "Sales", handled: 28, missed: 2, avgTime: "03:42", status: "Онлайн" },
  { id: "CALL-02", manager: "Илья Р.", queue: "Support", handled: 31, missed: 5, avgTime: "05:10", status: "Онлайн" },
  { id: "CALL-03", manager: "Мария Д.", queue: "VIP", handled: 12, missed: 0, avgTime: "07:18", status: "Перерыв" },
];

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

