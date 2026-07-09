import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import { ApiError } from "@/shared/api/http";
import {
  clearStoredCrmToken,
  createCrmSite,
  createCrmUser,
  getCrmContacts,
  getCrmOverview,
  getCrmPages,
  getCrmPromises,
  getCrmReports,
  getCrmSites,
  getCrmUsers,
  getCrmWorkspaces,
  getStoredCrmToken,
  getStoredCrmWorkspaceId,
  loginCrm,
  PLATFORM_WORKSPACE_ID,
  provisionCrmSite,
  setStoredCrmToken,
  setStoredCrmWorkspaceId,
  updateCrmSettings,
  updateCrmUser,
  type CrmSite,
  type CrmWorkspace,
} from "@/entities/crm";
import { emitAppNotification } from "@/shared/lib/notify";
import { crmCopy, crmNavItems, crmPlatformNavItems, crmShortcutItems, settingsBlueprint } from "./config";
import type { UserRoleCode } from "./i18n";
import {
  buildCountryMetrics,
  buildGenderMetrics,
  buildPromiseRecords,
  buildRoleOverview,
  clampNumber,
  getCrmLocaleTag,
  getStatusLabel,
  getUserRoleCode,
  humanizeAction,
  humanizePath,
  inferCountry,
  inferGender,
} from "./lib";
import type { CrmLang } from "./types";
import { crmTabPathMap, parseCrmRoute } from "./crm-routes";
import { CRM_EMAIL_RE, CRM_LOGIN_RE, hasValidCrmNamePart } from "./crm-validation";

export function useCrmWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getStoredCrmToken());
  const [crmLang, setCrmLang] = useState<CrmLang>("ru");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getCrmOverview>
  > | null>(null);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getCrmUsers>>>(
    [],
  );
  const [contacts, setContacts] = useState<
    Awaited<ReturnType<typeof getCrmContacts>>
  >([]);
  const [promises, setPromises] = useState<
    Awaited<ReturnType<typeof getCrmPromises>>
  >([]);
  const [pages, setPages] = useState<Awaited<ReturnType<typeof getCrmPages>>>(
    [],
  );
  const [reports, setReports] = useState<
    Awaited<ReturnType<typeof getCrmReports>>
  >([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPromiseId, setSelectedPromiseId] = useState("PR-1001");
  const [selectedTaskId, setSelectedTaskId] = useState("TSK-1001");
  const [logFilter, setLogFilter] = useState("all");
  const [logRoleFilter, setLogRoleFilter] = useState<"all" | UserRoleCode>("all");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [rowLimitInput, setRowLimitInput] = useState("120");
  const [logPage, setLogPage] = useState(1);
  const [activeLogFilterMenu, setActiveLogFilterMenu] = useState<
    "" | "time" | "role" | "actor" | "action" | "path" | "result"
  >("");
  const [logColumnFilters, setLogColumnFilters] = useState({
    time: "",
    role: "",
    actor: "",
    action: "",
    path: "",
    result: "",
  });
  const [contactSearch, setContactSearch] = useState("");
  const [contactDateFrom, setContactDateFrom] = useState("");
  const [contactDateTo, setContactDateTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [usersOrderBy, setUsersOrderBy] = useState<
    "createdAt" | "email" | "displayName" | "login"
  >("createdAt");
  const [usersOrderDir, setUsersOrderDir] = useState<"asc" | "desc">("desc");
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>(
    {},
  );
  const [userForm, setUserForm] = useState({
    login: "",
    email: "",
    name: "",
    surname: "",
    lastname: "",
    note: "",
    password: "",
    permissions: "0",
    avatarUrl: "",
    country: "",
  });
  const [workspaces, setWorkspaces] = useState<CrmWorkspace[]>([]);
  const [sites, setSites] = useState<CrmSite[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => getStoredCrmWorkspaceId());
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({
    domain: "",
    repo: "",
    apiPort: "8080",
    webPort: "8088",
    extraDomains: "",
  });

  const isPlatformWorkspace = activeWorkspaceId === PLATFORM_WORKSPACE_ID;
  const activeWorkspace = useMemo(
    () => workspaces.find((item) => item.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  );
  const visibleNavItems = useMemo(
    () => (isPlatformWorkspace ? [...crmPlatformNavItems, ...crmNavItems] : crmNavItems),
    [isPlatformWorkspace]
  );

  const logRowsPerPage = useMemo(
    () => clampNumber(Number(rowLimitInput), 10, 200, 120),
    [rowLimitInput],
  );

  const load = async () => {
    const [
      overview,
      usersList,
      contactsList,
      promisesList,
      pagesList,
      reportsList,
      workspacesList,
      sitesList,
    ] = await Promise.all(
      [
        getCrmOverview({
          limit: 500,
          action: logFilter,
          dateFrom: logDateFrom || undefined,
          dateTo: logDateTo || undefined,
          contactSearch: contactSearch || undefined,
        }),
        getCrmUsers({
          limit: 200,
          search: userSearch || undefined,
          orderBy: usersOrderBy,
          orderDir: usersOrderDir,
        }),
        getCrmContacts({
          limit: 200,
          search: contactSearch || undefined,
          dateFrom: contactDateFrom || undefined,
          dateTo: contactDateTo || undefined,
        }),
        getCrmPromises({ limit: 100 }),
        getCrmPages({ limit: 100 }),
        getCrmReports({ limit: 100 }),
        getCrmWorkspaces(),
        getCrmSites(),
      ],
    );

    setWorkspaces(workspacesList);
    setSites(sitesList);

    setData(overview);
    setUsers(usersList);
    setContacts(contactsList);
    setPromises(promisesList);
    setPages(pagesList);
    setReports(reportsList);
    setSettingsDraft((prev) => {
      const fromApi = Object.fromEntries((overview.settings ?? []).map((item) => [item.key, item.value]));
      return Object.fromEntries(
        settingsBlueprint.map((b) => [b.key, fromApi[b.key] ?? prev[b.key] ?? ""]),
      );
    });
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        await load();
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearStoredCrmToken();
          setToken("");
        }
      }
    };
    void run();
    const poll = window.setInterval(() => {
      if (!cancelled) {
        void run();
      }
    }, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [
    token,
    logFilter,
    logDateFrom,
    logDateTo,
    contactSearch,
    contactDateFrom,
    contactDateTo,
    userSearch,
    usersOrderBy,
    usersOrderDir,
    activeWorkspaceId,
  ]);

  const route = useMemo(() => parseCrmRoute(location.pathname), [location.pathname]);
  const tab = route.tab;
  const isUserCreateRoute = route.userId === "new";
  const usersView: "list" | "detail" = route.userId ? "detail" : "list";
  const promisesView: "list" | "detail" = route.promiseId ? "detail" : "list";
  const tasksView: "list" | "detail" = route.taskId ? "detail" : "list";
  const dashboardPart = route.dashboardPart;

  useEffect(() => {
    if (!isPlatformWorkspace && tab === "sites") {
      navigate("/crm");
    }
  }, [isPlatformWorkspace, tab, navigate]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        setWorkspaceMenuOpen(false);
        return;
      }
      if (!target.closest(".crm-workspace-picker")) {
        setWorkspaceMenuOpen(false);
      }
    };
    if (!workspaceMenuOpen) {
      return;
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [workspaceMenuOpen]);

  const handleSwitchWorkspace = (workspaceId: string) => {
    setStoredCrmWorkspaceId(workspaceId);
    setActiveWorkspaceId(workspaceId);
    setSettingsDraft({});
    setWorkspaceMenuOpen(false);
    if (workspaceId !== PLATFORM_WORKSPACE_ID && tab === "sites") {
      navigate("/crm");
    }
  };

  const handleCreateSite = async () => {
    const loc = crmCopy[crmLang];
    const domain = siteForm.domain.trim().toLowerCase();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
      emitAppNotification(loc.sitesValidationDomain);
      return;
    }
    const created = await createCrmSite({
      domain,
      repo: siteForm.repo.trim() || undefined,
      apiPort: Number(siteForm.apiPort) || 8080,
      webPort: Number(siteForm.webPort) || 8088,
      extraDomains: siteForm.extraDomains
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
      provision: true,
    });
    emitAppNotification(loc.sitesCreatedToast);
    setSiteForm({ domain: "", repo: "", apiPort: "8080", webPort: "8088", extraDomains: "" });
    await load();
    if (created.workspaceId) {
      handleSwitchWorkspace(created.workspaceId);
    }
  };

  const handleProvisionSite = async (siteId: string) => {
    await provisionCrmSite(siteId);
    emitAppNotification(crmCopy[crmLang].sitesProvisionToast);
    await load();
  };

  useEffect(() => {
    if (route.userId === "new") {
      setSelectedUserId("");
      setUserForm({
        login: "",
        email: "",
        name: "",
        surname: "",
        lastname: "",
        note: "",
        password: "",
        permissions: "0",
        avatarUrl: "",
        country: "",
      });
      return;
    }
    if (!route.userId) {
      return;
    }
    if (!users.length) {
      return;
    }
    const selected = users.find((user) => user.id === route.userId);
    if (!selected) {
      return;
    }
    if (selectedUserId !== route.userId) {
      setSelectedUserId(route.userId);
    }
    const nameParts = selected.displayName.trim().split(" ");
    setUserForm({
      login: selected.login ?? selected.email.split("@")[0] ?? selected.displayName,
      email: selected.email,
      name: nameParts[0] ?? "",
      surname: nameParts[1] ?? "",
      lastname: nameParts[2] ?? "",
      note: selected.adminNote ?? "",
      password: "",
      permissions: String(selected.permissions ?? 0),
      avatarUrl: selected.avatarUrl ?? "",
      country: selected.country?.trim() ?? "",
    });
  }, [route.userId, users, selectedUserId]);

  useEffect(() => {
    if (route.promiseId && route.promiseId !== selectedPromiseId) {
      setSelectedPromiseId(route.promiseId);
    }
  }, [route.promiseId, selectedPromiseId]);

  useEffect(() => {
    if (route.taskId && route.taskId !== selectedTaskId) {
      setSelectedTaskId(route.taskId);
    }
  }, [route.taskId, selectedTaskId]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );
  const userMap = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );
  const usersWithMeta = useMemo(
    () =>
      users.map((user, index) => ({
        ...user,
        index: index + 1,
        roleCode: getUserRoleCode(user),
        gender: inferGender(user),
        country: inferCountry(user),
      })),
    [users],
  );

  const genderMetrics = useMemo(
    () => buildGenderMetrics(usersWithMeta),
    [usersWithMeta],
  );
  const countryMetrics = useMemo(
    () => buildCountryMetrics(usersWithMeta),
    [usersWithMeta],
  );
  const promiseRecords = useMemo(
    () => buildPromiseRecords(promises, crmLang),
    [promises, crmLang],
  );
  const selectedPromise = useMemo(
    () =>
      promiseRecords.find((item) => item.id === selectedPromiseId) ??
      promiseRecords[0] ??
      null,
    [promiseRecords, selectedPromiseId],
  );
  const ui = crmCopy[crmLang];

  const sidebarAudit = useMemo(() => {
    const raw = data?.lastAuditActivityAt;
    if (!raw) {
      return { line1: ui.sidebarNoAuditActivity, line2: "" as string };
    }
    const d = new Date(raw);
    const loc = getCrmLocaleTag(crmLang);
    const timeStr = new Intl.DateTimeFormat(loc, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
    const dateStr = new Intl.DateTimeFormat(loc, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
    return {
      line1: `${ui.sidebarLastEvent}: ${timeStr}`,
      line2: dateStr,
    };
  }, [data?.lastAuditActivityAt, crmLang, ui]);

  const visibleContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        `${contact.name} ${contact.email} ${contact.message}`
          .toLowerCase()
          .includes(contactSearch.trim().toLowerCase()),
      ),
    [contacts, contactSearch],
  );

  const visibleLogs = useMemo(() => {
    const logs = data?.recentLogs ?? [];
    const logUi = crmCopy[crmLang];
    return logs
      .map((log) => {
        const actor = log.actorUserId ? userMap.get(log.actorUserId) : null;
        const role: UserRoleCode = actor ? getUserRoleCode(actor) : "system";
        return {
          ...log,
          actorName: actor?.displayName ?? logUi.logSystemEvent,
          role,
          readableAction: humanizeAction(log.action),
          readablePath: humanizePath(log.path, log.method, crmLang),
          result: getStatusLabel(log.statusCode, crmLang),
        };
      })
      .filter((log) =>
        logRoleFilter === "all" ? true : log.role === logRoleFilter,
      )
      .filter((log) =>
        [
          new Date(log.createdAt)
            .toISOString()
            .slice(0, 16)
            .includes(logColumnFilters.time),
          log.role.toLowerCase().includes(logColumnFilters.role.toLowerCase()),
          log.actorName
            .toLowerCase()
            .includes(logColumnFilters.actor.toLowerCase()),
          log.readableAction
            .toLowerCase()
            .includes(logColumnFilters.action.toLowerCase()),
          log.readablePath
            .toLowerCase()
            .includes(logColumnFilters.path.toLowerCase()),
          log.result
            .toLowerCase()
            .includes(logColumnFilters.result.toLowerCase()),
        ].every(Boolean),
      );
  }, [data?.recentLogs, logRoleFilter, userMap, logColumnFilters, crmLang]);
  const roleOverview = useMemo(
    () => buildRoleOverview(usersWithMeta, visibleLogs, crmLang),
    [usersWithMeta, visibleLogs, crmLang],
  );

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logRowsPerPage;
    return visibleLogs.slice(start, start + logRowsPerPage);
  }, [visibleLogs, logPage, logRowsPerPage]);

  const logPageCount = Math.max(
    1,
    Math.ceil(visibleLogs.length / logRowsPerPage),
  );

  useEffect(() => {
    setLogPage(1);
  }, [
    logFilter,
    logRoleFilter,
    logDateFrom,
    logDateTo,
    logRowsPerPage,
    logColumnFilters,
  ]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        setActiveLogFilterMenu("");
        return;
      }
      if (!target.closest(".crm-th-filter")) {
        setActiveLogFilterMenu("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const setUsersViewByRoute: Dispatch<SetStateAction<"list" | "detail">> = (value) => {
    const next = typeof value === "function" ? value(usersView) : value;
    if (next === "list") {
      navigate("/crm/users");
    } else if (selectedUserId) {
      navigate(`/crm/users/${selectedUserId}`);
    }
  };
  const setPromisesViewByRoute: Dispatch<SetStateAction<"list" | "detail">> = (value) => {
    const next = typeof value === "function" ? value(promisesView) : value;
    if (next === "list") {
      navigate("/crm/promises");
    } else if (selectedPromiseId) {
      navigate(`/crm/promises/${selectedPromiseId}`);
    }
  };
  const setTasksViewByRoute: Dispatch<SetStateAction<"list" | "detail">> = (value) => {
    const next = typeof value === "function" ? value(tasksView) : value;
    if (next === "list") {
      navigate("/crm/tasks");
    } else if (selectedTaskId) {
      navigate(`/crm/tasks/${selectedTaskId}`);
    }
  };
  const setSelectedUserIdByRoute: Dispatch<SetStateAction<string>> = (value) => {
    const next = typeof value === "function" ? value(selectedUserId) : value;
    setSelectedUserId(next);
    if (next) navigate(`/crm/users/${next}`);
  };
  const setSelectedPromiseIdByRoute: Dispatch<SetStateAction<string>> = (value) => {
    const next = typeof value === "function" ? value(selectedPromiseId) : value;
    setSelectedPromiseId(next);
    if (next) navigate(`/crm/promises/${next}`);
  };
  const setSelectedTaskIdByRoute: Dispatch<SetStateAction<string>> = (value) => {
    const next = typeof value === "function" ? value(selectedTaskId) : value;
    setSelectedTaskId(next);
    if (next) navigate(`/crm/tasks/${next}`);
  };

  const handleSaveUser = async () => {
    const loc = crmCopy[crmLang];
    const trimmedLogin = userForm.login.trim();
    const trimmedEmail = userForm.email.trim();
    const trimmedCountry = userForm.country.trim();
    const displayName =
      [userForm.name, userForm.surname, userForm.lastname]
        .filter(Boolean)
        .join(" ")
        .trim() || trimmedLogin;
    if (!trimmedLogin || !trimmedEmail) {
      emitAppNotification(loc.userSaveValidationFields);
      return;
    }
    if (!CRM_LOGIN_RE.test(trimmedLogin)) {
      emitAppNotification(loc.userSaveValidationLogin);
      return;
    }
    if (!CRM_EMAIL_RE.test(trimmedEmail)) {
      emitAppNotification(loc.userSaveValidationEmail);
      return;
    }
    if (trimmedCountry.length > 0 && trimmedCountry.length < 2) {
      emitAppNotification(loc.userSaveValidationCountry);
      return;
    }
    if (!hasValidCrmNamePart(userForm.name) || !hasValidCrmNamePart(userForm.surname) || !hasValidCrmNamePart(userForm.lastname)) {
      emitAppNotification(loc.userSaveValidationName);
      return;
    }
    if (route.userId === "new") {
      const pwd = userForm.password.trim();
      if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        emitAppNotification(loc.userSaveValidationPassword);
        return;
      }
      const res = await createCrmUser({
        login: trimmedLogin,
        email: trimmedEmail,
        password: pwd,
        displayName: displayName || trimmedLogin,
        permissions: Number(userForm.permissions),
        adminNote: userForm.note.trim() || null,
        country: trimmedCountry || null,
        avatarUrl: userForm.avatarUrl.trim() || null,
      });
      emitAppNotification(loc.userCreatedToast);
      await load();
      if (res.user?.id) {
        navigate(`/crm/users/${res.user.id}`);
      } else {
        navigate("/crm/users");
      }
      return;
    }
    if (!selectedUserId) {
      return;
    }
    const payload: Parameters<typeof updateCrmUser>[1] = {
      login: trimmedLogin || null,
      email: trimmedEmail,
      displayName,
      avatarUrl: userForm.avatarUrl || null,
      permissions: Number(userForm.permissions),
      adminNote: userForm.note.trim() || null,
      country: trimmedCountry || null,
    };
    if (userForm.password.trim()) {
      payload.password = userForm.password.trim();
    }
    await updateCrmUser(selectedUserId, payload);
    emitAppNotification(loc.userSavedToast);
    await load();
    setUserForm((prev) => ({ ...prev, password: "" }));
  };

  const handleSaveSettings = async () => {
    await updateCrmSettings(
      Object.entries(settingsDraft).map(([key, value]) => ({ key, value })),
    );
    emitAppNotification("Настройки CRM сохранены");
    await load();
  };

  const handleNavigateCreateUser = () => {
    navigate("/crm/users/new");
  };

  const handleLogin = async () => {
    setLoginError(null);
    const authUi = crmCopy[crmLang];
    const response = await loginCrm(login, password);
    if (!response.ok || !response.token) {
      setLoginError(authUi.crmLoginError);
      return;
    }
    setStoredCrmToken(response.token);
    setToken(response.token);
  };

  const handleLogout = () => {
    clearStoredCrmToken();
    setToken("");
  };

  return {
    token,
    crmLang,
    setCrmLang,
    login,
    setLogin,
    password,
    setPassword,
    loginError,
    data,
    tab,
    dashboardPart,
    isUserCreateRoute,
    usersView,
    promisesView,
    tasksView,
    selectedUser,
    usersWithMeta,
    genderMetrics,
    countryMetrics,
    promiseRecords,
    selectedPromise,
    ui,
    authUi: crmCopy[crmLang],
    sidebarAudit,
    visibleContacts,
    paginatedLogs,
    logPageCount,
    roleOverview,
    rowLimitInput,
    setRowLimitInput,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    logRoleFilter,
    setLogRoleFilter,
    logFilter,
    setLogFilter,
    activeLogFilterMenu,
    setActiveLogFilterMenu,
    logColumnFilters,
    setLogColumnFilters,
    logPage,
    setLogPage,
    logRowsPerPage,
    contactSearch,
    setContactSearch,
    contactDateFrom,
    setContactDateFrom,
    contactDateTo,
    setContactDateTo,
    userSearch,
    setUserSearch,
    usersOrderBy,
    setUsersOrderBy,
    usersOrderDir,
    setUsersOrderDir,
    settingsDraft,
    setSettingsDraft,
    userForm,
    setUserForm,
    selectedTaskId,
    pages,
    reports,
    crmNavItems: visibleNavItems,
    crmShortcutItems,
    crmTabPathMap,
    navigate,
    workspaces,
    sites,
    activeWorkspace,
    activeWorkspaceId,
    isPlatformWorkspace,
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    handleSwitchWorkspace,
    siteForm,
    setSiteForm,
    handleCreateSite,
    handleProvisionSite,
    setUsersViewByRoute,
    setPromisesViewByRoute,
    setTasksViewByRoute,
    setSelectedUserIdByRoute,
    setSelectedPromiseIdByRoute,
    setSelectedTaskIdByRoute,
    handleSaveUser,
    handleSaveSettings,
    handleNavigateCreateUser,
    handleLogin,
    handleLogout,
  };
}
