import type { Dispatch, SetStateAction } from "react";
import type { UserRoleCode } from "../../model/i18n";
import type {
  CrmContact,
  CrmLang,
  CrmUser,
  PageRecord,
  PromiseRecord,
  ReportRecord,
} from "../../model/types";

export type UsersMetaRecord = {
  id: string;
  index: number;
  login: string | null;
  displayName: string;
  email: string;
  roleCode: UserRoleCode;
  country: string;
  createdAt: string;
  permissions: number;
  adminNote?: string | null;
  avatarUrl?: string | null;
};

export type VisibleLogRecord = {
  id: string;
  createdAt: string;
  role: UserRoleCode;
  actorName: string;
  readableAction: string;
  readablePath: string;
  result: string;
  statusCode: number | null;
};

export type UserFormState = {
  login: string;
  email: string;
  name: string;
  surname: string;
  lastname: string;
  note: string;
  password: string;
  permissions: string;
  avatarUrl: string;
  country: string;
};

export type LogFilterMenu =
  | ""
  | "time"
  | "role"
  | "actor"
  | "action"
  | "path"
  | "result";
export type LogColumnFilters = Record<Exclude<LogFilterMenu, "">, string>;

export type DashboardSectionProps = {
  crmLang: CrmLang;
  selectedUserName: string | null;
  dashboardSubtitle: string;
  counters: {
    usersCount: number;
    promisesCount: number;
    activePromisesCount: number;
    proofsCount: number;
  };
  serverDateTime: string;
  serverTimeZone: string;
  genderMetrics: Array<{ label: string; count: number; percent: number }>;
  countryMetrics: Array<{ label: string; count: number }>;
  roleOverview: Array<{ code: UserRoleCode; label: string; value: string }>;
  visibleContactsCount: number;
  onOpenPart: (part: DashboardPart) => void;
};

export type DashboardPart =
  | "users"
  | "promises"
  | "proofs"
  | "system-time"
  | "segmentation"
  | "countries"
  | "logs-by-role"
  | "contacts";

export type LogsSectionProps = {
  crmLang: CrmLang;
  rowLimitInput: string;
  setRowLimitInput: Dispatch<SetStateAction<string>>;
  logDateFrom: string;
  setLogDateFrom: Dispatch<SetStateAction<string>>;
  logDateTo: string;
  setLogDateTo: Dispatch<SetStateAction<string>>;
  logRoleFilter: "all" | UserRoleCode;
  setLogRoleFilter: Dispatch<SetStateAction<"all" | UserRoleCode>>;
  logFilter: string;
  setLogFilter: Dispatch<SetStateAction<string>>;
  logCategories: Array<{ action: string; count: number }>;
  activeLogFilterMenu: LogFilterMenu;
  setActiveLogFilterMenu: Dispatch<SetStateAction<LogFilterMenu>>;
  logColumnFilters: LogColumnFilters;
  setLogColumnFilters: Dispatch<SetStateAction<LogColumnFilters>>;
  paginatedLogs: VisibleLogRecord[];
  logPageCount: number;
  logPage: number;
  setLogPage: Dispatch<SetStateAction<number>>;
  logRowsPerPage: number;
};

export type UsersSectionProps = {
  crmLang: CrmLang;
  usersView: "list" | "detail";
  isCreateUser: boolean;
  usersWithMeta: UsersMetaRecord[];
  userSearch: string;
  setUserSearch: Dispatch<SetStateAction<string>>;
  usersOrderBy: "createdAt" | "email" | "displayName" | "login";
  setUsersOrderBy: Dispatch<
    SetStateAction<"createdAt" | "email" | "displayName" | "login">
  >;
  usersOrderDir: "asc" | "desc";
  setUsersOrderDir: Dispatch<SetStateAction<"asc" | "desc">>;
  setSelectedUserId: Dispatch<SetStateAction<string>>;
  setUsersView: Dispatch<SetStateAction<"list" | "detail">>;
  selectedUser: CrmUser | null;
  userForm: UserFormState;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  onSaveUser: () => Promise<void>;
  onNavigateCreateUser: () => void;
};

export type PromisesSectionProps = {
  crmLang: CrmLang;
  promisesView: "list" | "detail";
  promiseRecords: PromiseRecord[];
  selectedPromise: PromiseRecord | null;
  setSelectedPromiseId: Dispatch<SetStateAction<string>>;
  setPromisesView: Dispatch<SetStateAction<"list" | "detail">>;
};

export type TasksSectionProps = {
  crmLang: CrmLang;
  tasksView: "list" | "detail";
  selectedTaskId: string;
  setSelectedTaskId: Dispatch<SetStateAction<string>>;
  setTasksView: Dispatch<SetStateAction<"list" | "detail">>;
};

export type SettingsSectionProps = {
  crmLang: CrmLang;
  settingsDraft: Record<string, string>;
  setSettingsDraft: Dispatch<SetStateAction<Record<string, string>>>;
  onSaveSettings: () => Promise<void>;
};

export type PagesSectionProps = {
  crmLang: CrmLang;
  pages: PageRecord[];
};

export type FilesSectionProps = {
  crmLang: CrmLang;
};

export type CallTrackerSectionProps = {
  crmLang: CrmLang;
};

export type ReportsSectionProps = {
  crmLang: CrmLang;
  reports: ReportRecord[];
};

export type ContactsSectionProps = {
  crmLang: CrmLang;
  visibleContacts: CrmContact[];
  contactSearch: string;
  setContactSearch: Dispatch<SetStateAction<string>>;
  contactDateFrom: string;
  setContactDateFrom: Dispatch<SetStateAction<string>>;
  contactDateTo: string;
  setContactDateTo: Dispatch<SetStateAction<string>>;
};
