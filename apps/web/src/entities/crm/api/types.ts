export type CrmWorkspace = {
  id: string;
  slug: string;
  label: string;
  kind: "platform" | "site";
  siteId: string | null;
  siteDomain: string | null;
  createdAt: string;
};

export type CrmSite = {
  id: string;
  domain: string;
  slug: string;
  repo: string | null;
  status: string;
  prodPath: string | null;
  apiPort: number | null;
  webPort: number | null;
  extraDomains: string[];
  devConfig: Record<string, unknown> | null;
  provisionLog: Array<{ step: string; ok: boolean; message: string; at: string }>;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmStorageUsage = {
  usedPercent: number;
  path: string;
};

export type CrmOverview = {
  serverDateTime: string;
  serverTimeZone: string;
  lastAuditActivityAt: string | null;
  storageUsage: CrmStorageUsage | null;
  counters: {
    usersCount: number;
    promisesCount: number;
    activePromisesCount: number;
    proofsCount: number;
  };
  recentLogs: Array<{
    id: string;
    actorUserId: string | null;
    action: string;
    method: string | null;
    path: string | null;
    statusCode: number | null;
    entityType: string | null;
    entityId: string | null;
    createdAt: string;
  }>;
  logCategories: Array<{ action: string; count: number }>;
  contacts: Array<{ id: string; name: string; email: string; message: string; status: string; createdAt: string }>;
  settings: Array<{ key: string; value: string; updatedAt: string }>;
};

export type CrmDockerContainer = {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "stopped" | "other";
  ports: string;
  createdAt: string;
};

export type CrmDockerVolume = {
  name: string;
  driver: string;
  mountpoint: string;
};

export type CrmDockerNetwork = {
  id: string;
  name: string;
  driver: string;
  scope: string;
};

export type CrmDockerImage = {
  id: string;
  repository: string;
  tag: string;
  size: string;
  createdSince: string;
};

export type CrmServerInfo = {
  hostname: string;
  uptimeSeconds: number;
  platform: string;
  arch: string;
};

export type CrmDiskMount = {
  filesystem: string;
  mount: string;
  usedPercent: number;
  usedGb: number;
  totalGb: number;
};

export type CrmPlatformDatabaseStats = {
  available: boolean;
  engine: string;
  version: string;
  database: string;
  sizeMb: number;
  connections: number;
};

export type CrmDatabaseInstance = {
  id: string;
  name: string;
  engine: string;
  image: string;
  state: "running" | "stopped" | "other";
  ports: string;
};

export type CrmPlatformMetrics = {
  serverDateTime: string;
  serverTimeZone: string;
  serverInfo: CrmServerInfo;
  lastAuditActivityAt: string | null;
  storageUsage: CrmStorageUsage | null;
  storageMounts: CrmDiskMount[];
  memoryUsage: { usedPercent: number; totalMb: number; usedMb: number } | null;
  cpuUsage: { usedPercent: number } | null;
  docker: {
    available: boolean;
    containers: CrmDockerContainer[];
    runningCount: number;
    stoppedCount: number;
    imageCount: number;
    volumes: CrmDockerVolume[];
    networks: CrmDockerNetwork[];
    images: CrmDockerImage[];
  };
  platformDatabase: CrmPlatformDatabaseStats;
  databaseInstances: CrmDatabaseInstance[];
  sites: {
    total: number;
    active: number;
    pending: number;
    error: number;
  };
  deploymentsToday: number;
  recentDeployments: Array<{
    id: string;
    action: string;
    target: string | null;
    ok: boolean;
    createdAt: string;
    actorName: string | null;
  }>;
  adminsCount: number;
  sslCertificates: Array<{
    domain: string;
    path: string;
    issuer: string;
    expiresAt: string;
    daysLeft: number;
    status: "healthy" | "warning" | "critical" | "missing";
  }>;
  domainRegistrations: Array<{
    domain: string;
    expiresAt: string;
    daysLeft: number;
    status: "healthy" | "warning" | "critical" | "unknown";
  }>;
};

export type CrmAdmin = {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: string;
};

export type CrmSession = {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: string;
};

export type CrmPlatformLog = {
  id: string;
  actorAdminId: string | null;
  actorName: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  ok: boolean;
  createdAt: string;
};
