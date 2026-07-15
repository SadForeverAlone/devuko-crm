import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBoxOpen,
  faCertificate,
  faComments,
  faEnvelope,
  faPaperPlane,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import type { CrmLang } from "@/widgets/crm-app/model/types";

export type NotifyChannel = {
  id: string;
  name: string;
  icon: IconDefinition;
  description: Record<CrmLang, string>;
  envKeys: string[];
};

export type NotifyRule = {
  id: string;
  label: Record<CrmLang, string>;
  description: Record<CrmLang, string>;
  severity: "critical" | "warning";
};

export const notifyChannels: NotifyChannel[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: faPaperPlane,
    description: {
      ru: "Сообщения в группу или личный чат через бота",
      en: "Messages to a group or direct chat via bot",
    },
    envKeys: ["NOTIFICATION_TELEGRAM_BOT_TOKEN", "NOTIFICATION_TELEGRAM_CHAT_ID"],
  },
  {
    id: "slack",
    name: "Slack",
    icon: faComments,
    description: {
      ru: "Incoming webhook в канал команды",
      en: "Incoming webhook to a team channel",
    },
    envKeys: ["NOTIFICATION_SLACK_WEBHOOK"],
  },
  {
    id: "discord",
    name: "Discord",
    icon: faComments,
    description: {
      ru: "Webhook в канал Discord-сервера",
      en: "Webhook to a Discord server channel",
    },
    envKeys: ["NOTIFICATION_DISCORD_WEBHOOK"],
  },
  {
    id: "email",
    name: "Email",
    icon: faEnvelope,
    description: {
      ru: "SMTP-рассылка на список адресов",
      en: "SMTP delivery to a recipient list",
    },
    envKeys: ["NOTIFICATION_SMTP_URL", "NOTIFICATION_EMAIL_TO"],
  },
];

export const notifyRules: NotifyRule[] = [
  {
    id: "deploy_failed",
    label: { ru: "Деплой не удался", en: "Deploy failed" },
    description: {
      ru: "Ошибка деплоя платформы или проекта",
      en: "Platform or project deploy failure",
    },
    severity: "critical",
  },
  {
    id: "server_down",
    label: { ru: "Сервер недоступен", en: "Server down" },
    description: {
      ru: "Docker или PostgreSQL CRM недоступны",
      en: "Docker or CRM PostgreSQL is unavailable",
    },
    severity: "critical",
  },
  {
    id: "ssl_expires",
    label: { ru: "SSL истекает", en: "SSL expires soon" },
    description: {
      ru: "Сертификат домена скоро истечёт",
      en: "Domain certificate is about to expire",
    },
    severity: "warning",
  },
  {
    id: "container_stopped",
    label: { ru: "Контейнер остановлен", en: "Container stopped" },
    description: {
      ru: "Один или несколько контейнеров не running",
      en: "One or more containers are not running",
    },
    severity: "warning",
  },
  {
    id: "resource_pressure",
    label: { ru: "Высокая нагрузка", en: "High resource usage" },
    description: {
      ru: "CPU, RAM или диск выше порога",
      en: "CPU, RAM or disk above threshold",
    },
    severity: "warning",
  },
  {
    id: "project_error",
    label: { ru: "Ошибка проекта", en: "Project error" },
    description: {
      ru: "Проект в статусе error или provisioning failed",
      en: "Project in error or failed provisioning state",
    },
    severity: "critical",
  },
];

export const notifyEnvVars = [
  "NOTIFICATION_TELEGRAM_BOT_TOKEN",
  "NOTIFICATION_TELEGRAM_CHAT_ID",
  "NOTIFICATION_SLACK_WEBHOOK",
  "NOTIFICATION_DISCORD_WEBHOOK",
  "NOTIFICATION_SMTP_URL",
  "NOTIFICATION_EMAIL_TO",
] as const;

export function notifyRuleIcon(ruleId: string): IconDefinition {
  if (ruleId === "deploy_failed") return faBoxOpen;
  if (ruleId === "ssl_expires") return faCertificate;
  if (ruleId === "server_down") return faServer;
  return faServer;
}
