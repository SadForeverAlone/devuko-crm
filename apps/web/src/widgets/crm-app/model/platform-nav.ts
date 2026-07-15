import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faChartColumn,
  faChartLine,
  faFolderTree,
  faGear,
  faGlobe,
  faRocket,
  faServer,
  faUsers,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmLang, CrmTab } from "./types";

export type PlatformNavItem = {
  key: CrmTab;
  label: Record<CrmLang, string>;
  icon: IconDefinition;
  group?: "primary" | "operations" | "system";
};

export const platformNavItems: PlatformNavItem[] = [
  {
    key: "dashboard",
    label: { ru: "Панель", en: "Dashboard" },
    icon: faChartColumn,
    group: "primary",
  },
  {
    key: "projects",
    label: { ru: "Проекты", en: "Projects" },
    icon: faFolderTree,
    group: "primary",
  },
  {
    key: "infrastructure",
    label: { ru: "Инфраструктура", en: "Infrastructure" },
    icon: faServer,
    group: "primary",
  },
  {
    key: "deployments",
    label: { ru: "Деплои", en: "Deployments" },
    icon: faRocket,
    group: "operations",
  },
  {
    key: "monitoring",
    label: { ru: "Мониторинг", en: "Monitoring" },
    icon: faChartLine,
    group: "operations",
  },
  {
    key: "automation",
    label: { ru: "Автоматизация", en: "Automation" },
    icon: faWandMagicSparkles,
    group: "operations",
  },
  {
    key: "logs",
    label: { ru: "Логи", en: "Logs" },
    icon: faChartLine,
    group: "system",
  },
  {
    key: "team",
    label: { ru: "Команда", en: "Team" },
    icon: faUsers,
    group: "system",
  },
  {
    key: "notifications",
    label: { ru: "Уведомления", en: "Notifications" },
    icon: faBell,
    group: "system",
  },
  {
    key: "settings",
    label: { ru: "Настройки", en: "Settings" },
    icon: faGear,
    group: "system",
  },
];

export const platformLegacyNavItems: PlatformNavItem[] = [
  { key: "logs", label: { ru: "Логи", en: "Logs" }, icon: faChartLine, group: "system" },
  { key: "sites", label: { ru: "Сайты", en: "Sites" }, icon: faGlobe, group: "primary" },
];

export type InfrastructureSection =
  | "overview"
  | "servers"
  | "containers"
  | "volumes"
  | "networks"
  | "images"
  | "storage"
  | "databases"
  | "domains"
  | "ssl";

export type ProjectDetailTab =
  | "overview"
  | "deployments"
  | "services"
  | "containers"
  | "domains"
  | "ssl"
  | "environment"
  | "secrets"
  | "storage"
  | "database"
  | "logs"
  | "monitoring"
  | "backups"
  | "settings";

export const projectDetailTabs: Array<{ key: ProjectDetailTab; label: Record<CrmLang, string> }> = [
  { key: "overview", label: { ru: "Обзор", en: "Overview" } },
  { key: "deployments", label: { ru: "Деплои", en: "Deployments" } },
  { key: "services", label: { ru: "Сервисы", en: "Services" } },
  { key: "containers", label: { ru: "Контейнеры", en: "Containers" } },
  { key: "domains", label: { ru: "Домены", en: "Domains" } },
  { key: "ssl", label: { ru: "SSL", en: "SSL" } },
  { key: "environment", label: { ru: "Окружение", en: "Environment" } },
  { key: "secrets", label: { ru: "Секреты", en: "Secrets" } },
  { key: "storage", label: { ru: "Хранилище", en: "Storage" } },
  { key: "database", label: { ru: "База данных", en: "Database" } },
  { key: "logs", label: { ru: "Логи", en: "Logs" } },
  { key: "monitoring", label: { ru: "Мониторинг", en: "Monitoring" } },
  { key: "backups", label: { ru: "Бэкапы", en: "Backups" } },
  { key: "settings", label: { ru: "Настройки", en: "Settings" } },
];

export const projectDetailTabGroups: Array<{
  id: string;
  label: Record<CrmLang, string>;
  tabs: ProjectDetailTab[];
}> = [
  {
    id: "core",
    label: { ru: "Основное", en: "General" },
    tabs: ["overview", "deployments", "services", "containers"],
  },
  {
    id: "network",
    label: { ru: "Сеть", en: "Network" },
    tabs: ["domains", "ssl", "environment"],
  },
  {
    id: "data",
    label: { ru: "Данные", en: "Data" },
    tabs: ["secrets", "storage", "database", "backups"],
  },
  {
    id: "ops",
    label: { ru: "Операции", en: "Operations" },
    tabs: ["logs", "monitoring"],
  },
  {
    id: "settings",
    label: { ru: "Проект", en: "Project" },
    tabs: ["settings"],
  },
];

export function projectDetailTabLabel(key: ProjectDetailTab, crmLang: CrmLang) {
  return projectDetailTabs.find((item) => item.key === key)?.label[crmLang] ?? key;
}

export const infrastructureSections: Array<{ key: InfrastructureSection; label: Record<CrmLang, string> }> = [
  { key: "overview", label: { ru: "Обзор", en: "Overview" } },
  { key: "servers", label: { ru: "Серверы", en: "Servers" } },
  { key: "containers", label: { ru: "Контейнеры", en: "Containers" } },
  { key: "volumes", label: { ru: "Тома", en: "Volumes" } },
  { key: "networks", label: { ru: "Сети", en: "Networks" } },
  { key: "images", label: { ru: "Образы", en: "Images" } },
  { key: "storage", label: { ru: "Хранилище", en: "Storage" } },
  { key: "databases", label: { ru: "Базы данных", en: "Databases" } },
  { key: "domains", label: { ru: "Домены", en: "Domains" } },
  { key: "ssl", label: { ru: "SSL", en: "SSL" } },
];

export const infrastructureSectionGroups: Array<{
  id: string;
  label: Record<CrmLang, string>;
  tabs: InfrastructureSection[];
}> = [
  {
    id: "platform",
    label: { ru: "Платформа", en: "Platform" },
    tabs: ["overview", "servers"],
  },
  {
    id: "docker",
    label: { ru: "Docker", en: "Docker" },
    tabs: ["containers", "volumes", "networks", "images"],
  },
  {
    id: "data",
    label: { ru: "Данные", en: "Data" },
    tabs: ["storage", "databases"],
  },
  {
    id: "network",
    label: { ru: "Сеть", en: "Network" },
    tabs: ["domains", "ssl"],
  },
];

export function infrastructureSectionLabel(key: InfrastructureSection, crmLang: CrmLang) {
  return infrastructureSections.find((item) => item.key === key)?.label[crmLang] ?? key;
}

export type CommandPaletteItem = {
  id: string;
  label: Record<CrmLang, string>;
  path: string;
  group: Record<CrmLang, string>;
  keywords?: string[];
};

export function buildCommandPaletteItems(isPlatform: boolean): CommandPaletteItem[] {
  if (isPlatform) {
    return [
      { id: "nav-dashboard", label: { ru: "Панель", en: "Dashboard" }, path: "/crm", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-projects", label: { ru: "Проекты", en: "Projects" }, path: "/crm/projects", group: { ru: "Навигация", en: "Navigation" }, keywords: ["sites"] },
      { id: "nav-infra", label: { ru: "Инфраструктура", en: "Infrastructure" }, path: "/crm/infrastructure", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-deployments", label: { ru: "Деплои", en: "Deployments" }, path: "/crm/deployments", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-monitoring", label: { ru: "Мониторинг", en: "Monitoring" }, path: "/crm/monitoring", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-automation", label: { ru: "Автоматизация", en: "Automation" }, path: "/crm/automation", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-team", label: { ru: "Команда", en: "Team" }, path: "/crm/team", group: { ru: "Навигация", en: "Navigation" }, keywords: ["users", "admins"] },
      { id: "nav-logs", label: { ru: "Логи платформы", en: "Platform logs" }, path: "/crm/logs", group: { ru: "Навигация", en: "Navigation" } },
      { id: "nav-settings", label: { ru: "Настройки", en: "Settings" }, path: "/crm/settings", group: { ru: "Навигация", en: "Navigation" } },
      { id: "action-create-project", label: { ru: "Создать проект", en: "Create project" }, path: "/crm/projects?create=1", group: { ru: "Действия", en: "Actions" } },
    ];
  }
  return [
    { id: "nav-dashboard", label: { ru: "Панель", en: "Dashboard" }, path: "/crm", group: { ru: "Навигация", en: "Navigation" } },
    { id: "nav-users", label: { ru: "Пользователи", en: "Users" }, path: "/crm/users", group: { ru: "Навигация", en: "Navigation" } },
    { id: "nav-promises", label: { ru: "Обещания", en: "Promises" }, path: "/crm/promises", group: { ru: "Навигация", en: "Navigation" } },
    { id: "nav-pages", label: { ru: "Страницы", en: "Pages" }, path: "/crm/pages", group: { ru: "Навигация", en: "Navigation" }, keywords: ["traffic", "analytics"] },
    { id: "nav-contacts", label: { ru: "Контакты", en: "Contact Us" }, path: "/crm/contacts", group: { ru: "Навигация", en: "Navigation" }, keywords: ["messages", "support"] },
    { id: "nav-logs", label: { ru: "Логи", en: "Logs" }, path: "/crm/logs", group: { ru: "Навигация", en: "Navigation" } },
    { id: "nav-settings", label: { ru: "Настройки", en: "Settings" }, path: "/crm/settings", group: { ru: "Навигация", en: "Navigation" } },
  ];
}
