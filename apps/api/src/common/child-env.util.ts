const CHILD_ENV_ALLOWLIST = [
  "PATH",
  "HOME",
  "USER",
  "SHELL",
  "LANG",
  "LC_ALL",
  "NODE_ENV",
  "DEVUKO_CRM_REPO_ROOT",
  "SKIP_GIT",
  "VITE_PUBLIC_URL",
  "DEPLOY_BRANCH",
  "POSTGRES_USER",
  "POSTGRES_DB",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
  "PLATFORM_REPO_ROOT",
  "SELFPACT_WORKSPACE_DOMAIN",
  "SELFPACT_WORKSPACE_API_BASE",
  "SELFPACT_REPO_URL",
] as const;

const MAIL_CHILD_ENV_KEYS = ["PATH", "HOME", "LANG", "LC_ALL"] as const;

export function pickChildEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const key of CHILD_ENV_ALLOWLIST) {
    const value = process.env[key];
    if (value !== undefined) {
      env[key] = value;
    }
  }
  return { ...env, ...extra };
}

/** Minimal env for short-lived mail/IMAP helper subprocesses. */
export function pickMailChildEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const key of MAIL_CHILD_ENV_KEYS) {
    const value = process.env[key];
    if (value !== undefined) {
      env[key] = value;
    }
  }
  return { ...env, ...extra };
}
