import type { getCrmContacts, getCrmOverview, getCrmPromises, getCrmUsers } from "@/entities/crm";

export type CrmTab =
  | "dashboard"
  | "logs"
  | "users"
  | "promises"
  | "pages"
  | "files"
  | "tasks"
  | "reports"
  | "call-tracker"
  | "settings"
  | "contacts"
  | "sites"
  | "projects"
  | "infrastructure"
  | "deployments"
  | "monitoring"
  | "automation"
  | "team"
  | "notifications";

export type CrmLang = "ru" | "en";

export type CrmUser = Awaited<ReturnType<typeof getCrmUsers>>[number];
export type CrmLog = Awaited<ReturnType<typeof getCrmOverview>>["recentLogs"][number];
export type CrmContact = Awaited<ReturnType<typeof getCrmContacts>>[number];
export type CrmPromiseApiRecord = Awaited<ReturnType<typeof getCrmPromises>>[number];

export type PromiseRecord = {
  id: string;
  title: string;
  owner: string;
  status: string;
  proofStatus: string;
  proofAdded: boolean;
  proofCount: number;
  deadline: string;
  deadlineAt: string;
  pledgeAmount: number;
  category: string;
  description: string;
  userId?: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  status: "Новая" | "В Процессе" | "Выполнена";
  createdAt: string;
  owner: string;
};

export type PageRecord = {
  id: string;
  page: string;
  views: number;
  uniqueUsers: number;
  conversion: string;
};

export type ReportRecord = {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High";
  channel: string;
  createdAt: string;
  status: string;
  description: string;
};

export type CallRecord = {
  id: string;
  manager: string;
  queue: string;
  handled: number;
  missed: number;
  avgTime: string;
  status: string;
};

export type FileRecord = {
  id: string;
  title: string;
  type: string;
  owner: string;
  updatedAt: string;
  status: string;
};
