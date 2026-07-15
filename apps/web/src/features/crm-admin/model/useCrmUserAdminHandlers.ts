import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ApiError } from "@/shared/api/http";
import {
  createCrmAdmin,
  createCrmUser,
  deleteCrmAdmin,
  updateCrmAdmin,
  updateCrmUser,
  type CrmAdmin,
  type CrmSession,
} from "@/entities/crm";
import { emitAppNotification } from "@/shared/lib/notify";
import { crmCopy } from "@/widgets/crm-app/model/config";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { CRM_EMAIL_RE, CRM_LOGIN_RE, hasValidCrmNamePart } from "@/features/crm-auth/model/crm-validation";
import type { CrmNavigate } from "@/widgets/crm-app/model/useCrmNavigation";
import type { parseCrmRoute } from "@/widgets/crm-app/model/crm-routes";

type CrmRoute = ReturnType<typeof parseCrmRoute>;
type CrmUserRecord = Awaited<ReturnType<typeof import("@/entities/crm").getCrmUsers>>[number];

type UseCrmUserAdminHandlersInput = {
  crmLang: CrmLang;
  isPlatformWorkspace: boolean;
  route: CrmRoute;
  navigate: CrmNavigate;
  load: () => Promise<void>;
  users: CrmUserRecord[];
  platformAdmins: CrmAdmin[];
  crmSession: CrmSession | null;
  usersView: "list" | "detail";
  promisesView: "list" | "detail";
  tasksView: "list" | "detail";
};

export function useCrmUserAdminHandlers({
  crmLang,
  isPlatformWorkspace,
  route,
  navigate,
  load,
  users,
  platformAdmins,
  crmSession,
  usersView,
  promisesView,
  tasksView,
}: UseCrmUserAdminHandlersInput) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPromiseId, setSelectedPromiseId] = useState("PR-1001");
  const [selectedTaskId, setSelectedTaskId] = useState("TSK-1001");
  const [userSearch, setUserSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [usersOrderBy, setUsersOrderBy] = useState<
    "createdAt" | "email" | "displayName" | "login"
  >("createdAt");
  const [usersOrderDir, setUsersOrderDir] = useState<"asc" | "desc">("desc");
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
  const [platformAdminForm, setPlatformAdminForm] = useState({
    login: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [platformAdminPassword, setPlatformAdminPassword] = useState("");
  const [platformAdminPasswordKey, setPlatformAdminPasswordKey] = useState(0);

  const clearPlatformAdminPassword = () => {
    setPlatformAdminPassword("");
    setPlatformAdminPasswordKey((key) => key + 1);
  };

  useEffect(() => {
    if (!isPlatformWorkspace) {
      return;
    }
    if (route.userId === "new") {
      setSelectedUserId("");
      setPlatformAdminForm({ login: "", firstName: "", lastName: "", email: "" });
      clearPlatformAdminPassword();
      return;
    }
    if (!route.userId || !platformAdmins.length) {
      return;
    }
    const selected = platformAdmins.find((admin) => admin.id === route.userId);
    if (!selected) {
      return;
    }
    if (selectedUserId !== route.userId) {
      setSelectedUserId(route.userId);
    }
    setPlatformAdminForm({
      login: selected.login,
      firstName: selected.firstName,
      lastName: selected.lastName,
      email: selected.email,
    });
    clearPlatformAdminPassword();
  }, [isPlatformWorkspace, route.userId, platformAdmins, selectedUserId]);

  useEffect(() => {
    if (isPlatformWorkspace) {
      return;
    }
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
    if (!route.userId || !users.length) {
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
  }, [isPlatformWorkspace, route.userId, users, selectedUserId]);

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
    [users, selectedUserId]
  );
  const selectedPlatformAdmin = useMemo(
    () => platformAdmins.find((admin) => admin.id === selectedUserId) ?? null,
    [platformAdmins, selectedUserId]
  );
  const currentAdminId = useMemo(() => crmSession?.id ?? null, [crmSession]);
  const canDeletePlatformAdmin = platformAdmins.length > 1;

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

  const handleSavePlatformAdmin = async () => {
    const loc = crmCopy[crmLang];
    const trimmedLogin = platformAdminForm.login.trim().toLowerCase();
    const trimmedEmail = platformAdminForm.email.trim().toLowerCase();
    const trimmedFirstName = platformAdminForm.firstName.trim();
    const trimmedLastName = platformAdminForm.lastName.trim();
    if (!trimmedLogin || !trimmedEmail || !trimmedFirstName || !trimmedLastName) {
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
    if (!hasValidCrmNamePart(trimmedFirstName) || !hasValidCrmNamePart(trimmedLastName)) {
      emitAppNotification(loc.userSaveValidationName);
      return;
    }
    if (route.userId === "new") {
      const pwd = platformAdminPassword.trim();
      if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        emitAppNotification(loc.userSaveValidationPassword);
        return;
      }
      try {
        const res = await createCrmAdmin({
          login: trimmedLogin,
          email: trimmedEmail,
          password: pwd,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        });
        clearPlatformAdminPassword();
        emitAppNotification(loc.platformAdminCreatedToast);
        await load();
        if (res.admin?.id) {
          navigate(`/crm/team/${res.admin.id}`);
        } else {
          navigate("/crm/team");
        }
      } catch (error) {
        emitAppNotification(error instanceof ApiError ? error.message : loc.userSaveValidationFields);
      }
      return;
    }
    if (!selectedUserId) {
      return;
    }
    const payload: Parameters<typeof updateCrmAdmin>[1] = {
      login: trimmedLogin,
      email: trimmedEmail,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    };
    const pwd = platformAdminPassword.trim();
    if (pwd) {
      if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        emitAppNotification(loc.userSaveValidationPassword);
        return;
      }
      payload.password = pwd;
    }
    try {
      await updateCrmAdmin(selectedUserId, payload);
      clearPlatformAdminPassword();
      emitAppNotification(loc.platformAdminSavedToast);
      await load();
    } catch (error) {
      emitAppNotification(error instanceof ApiError ? error.message : loc.userSaveValidationFields);
    }
  };

  const handleSaveUser = async () => {
    if (isPlatformWorkspace) {
      await handleSavePlatformAdmin();
      return;
    }
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
    if (
      !hasValidCrmNamePart(userForm.name) ||
      !hasValidCrmNamePart(userForm.surname) ||
      !hasValidCrmNamePart(userForm.lastname)
    ) {
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
      const pwd = userForm.password.trim();
      if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        emitAppNotification(loc.userSaveValidationPassword);
        return;
      }
      payload.password = pwd;
    }
    try {
      await updateCrmUser(selectedUserId, payload);
      emitAppNotification(loc.userSavedToast);
      await load();
      setUserForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      emitAppNotification(error instanceof ApiError ? error.message : loc.userSaveValidationFields);
    }
  };

  const handleDeletePlatformAdmin = async () => {
    const loc = crmCopy[crmLang];
    if (!selectedUserId || route.userId === "new") {
      return;
    }
    if (crmSession?.id === selectedUserId) {
      emitAppNotification(loc.platformAdminDeleteSelfBlocked);
      return;
    }
    if (platformAdmins.length <= 1) {
      emitAppNotification(loc.platformAdminDeleteLastBlocked);
      return;
    }
    const admin = platformAdmins.find((item) => item.id === selectedUserId);
    const label = admin?.displayName ?? admin?.email ?? selectedUserId;
    if (!window.confirm(loc.platformAdminDeleteConfirm.replace("{name}", label))) {
      return;
    }
    try {
      await deleteCrmAdmin(selectedUserId);
      emitAppNotification(loc.platformAdminDeletedToast);
      navigate(isPlatformWorkspace ? "/crm/team" : "/crm/users");
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        const message = error.message.toLowerCase();
        if (message.includes("own account") || message.includes("свой")) {
          emitAppNotification(loc.platformAdminDeleteSelfBlocked);
          return;
        }
        if (message.includes("last admin") || message.includes("последн")) {
          emitAppNotification(loc.platformAdminDeleteLastBlocked);
          return;
        }
      }
      throw error;
    }
  };

  const handleNavigateCreateUser = () => {
    navigate("/crm/users/new");
  };

  return {
    selectedUserId,
    selectedPromiseId,
    selectedTaskId,
    userSearch,
    setUserSearch,
    adminSearch,
    setAdminSearch,
    usersOrderBy,
    setUsersOrderBy,
    usersOrderDir,
    setUsersOrderDir,
    userForm,
    setUserForm,
    platformAdminForm,
    setPlatformAdminForm,
    platformAdminPassword,
    setPlatformAdminPassword,
    platformAdminPasswordKey,
    selectedUser,
    selectedPlatformAdmin,
    currentAdminId,
    canDeletePlatformAdmin,
    setUsersViewByRoute,
    setPromisesViewByRoute,
    setTasksViewByRoute,
    setSelectedUserIdByRoute,
    setSelectedPromiseIdByRoute,
    setSelectedTaskIdByRoute,
    handleSaveUser,
    handleDeletePlatformAdmin,
    handleNavigateCreateUser,
  };
}
