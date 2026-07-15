export const CRM_ADMIN_ROLE = "crm_admin" as const;

export type CrmJwtPayload = {
  sub: string;
  email: string;
  name?: string;
  role: typeof CRM_ADMIN_ROLE;
  /** Server session id (`CrmAuthSession`). */
  sid?: string;
};
