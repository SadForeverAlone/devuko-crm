import { useMemo } from "react";
import type { useCrmWorkspace } from "../model/useCrmWorkspace";
import {
  CallTrackerSection,
  ContactsSection,
  DashboardDetailSection,
  DashboardSection,
  FilesSection,
  LogsSection,
  PagesSection,
  PromisesSection,
  ReportsSection,
  SettingsSection,
  SitesSection,
  TasksSection,
  UsersSection,
} from "./sections";
import type { DashboardPart } from "./sections/sectionTypes";

type CrmWorkspace = ReturnType<typeof useCrmWorkspace>;

export function CrmTabContent({ workspace: ws }: { workspace: CrmWorkspace }) {
  const {
    tab,
    crmLang,
    dashboardPart,
    data,
    ui,
    genderMetrics,
    countryMetrics,
    roleOverview,
    visibleContacts,
    selectedUser,
    navigate,
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
    paginatedLogs,
    logPageCount,
    logPage,
    setLogPage,
    logRowsPerPage,
    usersView,
    isUserCreateRoute,
    usersWithMeta,
    userSearch,
    setUserSearch,
    usersOrderBy,
    setUsersOrderBy,
    usersOrderDir,
    setUsersOrderDir,
    setSelectedUserIdByRoute,
    setUsersViewByRoute,
    userForm,
    setUserForm,
    handleSaveUser,
    handleNavigateCreateUser,
    promisesView,
    promiseRecords,
    selectedPromise,
    setSelectedPromiseIdByRoute,
    setPromisesViewByRoute,
    tasksView,
    selectedTaskId,
    setSelectedTaskIdByRoute,
    setTasksViewByRoute,
    pages,
    reports,
    settingsDraft,
    setSettingsDraft,
    handleSaveSettings,
    contactSearch,
    setContactSearch,
    contactDateFrom,
    setContactDateFrom,
    contactDateTo,
    setContactDateTo,
    sites,
    siteForm,
    setSiteForm,
    handleCreateSite,
    handleProvisionSite,
    handleSwitchWorkspace,
  } = ws;

  const visibleContactsCount = useMemo(() => visibleContacts.length, [visibleContacts]);

  if (tab === "dashboard" && data) {
    return dashboardPart ? (
      <DashboardDetailSection
        crmLang={crmLang}
        part={dashboardPart as DashboardPart}
        counters={data.counters}
        serverDateTime={data.serverDateTime}
        serverTimeZone={data.serverTimeZone}
        genderMetrics={genderMetrics}
        countryMetrics={countryMetrics}
        roleOverview={roleOverview}
        visibleContactsCount={visibleContactsCount}
        onBack={() => navigate("/crm")}
      />
    ) : (
      <DashboardSection
        crmLang={crmLang}
        selectedUserName={selectedUser?.displayName ?? null}
        dashboardSubtitle={ui.dashboardSubtitle}
        counters={data.counters}
        serverDateTime={data.serverDateTime}
        serverTimeZone={data.serverTimeZone}
        genderMetrics={genderMetrics}
        countryMetrics={countryMetrics}
        roleOverview={roleOverview}
        visibleContactsCount={visibleContactsCount}
        onOpenPart={(part) => navigate(`/crm/dashboard/${part}`)}
      />
    );
  }

  if (tab === "logs" && data) {
    return (
      <LogsSection
        crmLang={crmLang}
        rowLimitInput={rowLimitInput}
        setRowLimitInput={setRowLimitInput}
        logDateFrom={logDateFrom}
        setLogDateFrom={setLogDateFrom}
        logDateTo={logDateTo}
        setLogDateTo={setLogDateTo}
        logRoleFilter={logRoleFilter}
        setLogRoleFilter={setLogRoleFilter}
        logFilter={logFilter}
        setLogFilter={setLogFilter}
        logCategories={data.logCategories}
        activeLogFilterMenu={activeLogFilterMenu}
        setActiveLogFilterMenu={setActiveLogFilterMenu}
        logColumnFilters={logColumnFilters}
        setLogColumnFilters={setLogColumnFilters}
        paginatedLogs={paginatedLogs}
        logPageCount={logPageCount}
        logPage={logPage}
        setLogPage={setLogPage}
        logRowsPerPage={logRowsPerPage}
      />
    );
  }

  if (tab === "users") {
    return (
      <UsersSection
        crmLang={crmLang}
        usersView={usersView}
        isCreateUser={isUserCreateRoute}
        usersWithMeta={usersWithMeta}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        usersOrderBy={usersOrderBy}
        setUsersOrderBy={setUsersOrderBy}
        usersOrderDir={usersOrderDir}
        setUsersOrderDir={setUsersOrderDir}
        setSelectedUserId={setSelectedUserIdByRoute}
        setUsersView={setUsersViewByRoute}
        selectedUser={ws.selectedUser}
        userForm={userForm}
        setUserForm={setUserForm}
        onSaveUser={handleSaveUser}
        onNavigateCreateUser={handleNavigateCreateUser}
      />
    );
  }

  if (tab === "promises") {
    return (
      <PromisesSection
        crmLang={crmLang}
        promisesView={promisesView}
        promiseRecords={promiseRecords}
        selectedPromise={selectedPromise}
        setSelectedPromiseId={setSelectedPromiseIdByRoute}
        setPromisesView={setPromisesViewByRoute}
      />
    );
  }

  if (tab === "tasks") {
    return (
      <TasksSection
        crmLang={crmLang}
        tasksView={tasksView}
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskIdByRoute}
        setTasksView={setTasksViewByRoute}
      />
    );
  }

  if (tab === "pages") return <PagesSection crmLang={crmLang} pages={pages} />;
  if (tab === "files") return <FilesSection crmLang={crmLang} />;
  if (tab === "reports") return <ReportsSection crmLang={crmLang} reports={reports} />;
  if (tab === "call-tracker") return <CallTrackerSection crmLang={crmLang} />;

  if (tab === "settings") {
    return (
      <SettingsSection
        crmLang={crmLang}
        settingsDraft={settingsDraft}
        setSettingsDraft={setSettingsDraft}
        onSaveSettings={handleSaveSettings}
      />
    );
  }

  if (tab === "sites") {
    return (
      <SitesSection
        crmLang={crmLang}
        sites={sites}
        siteForm={siteForm}
        setSiteForm={setSiteForm}
        onCreateSite={handleCreateSite}
        onProvisionSite={handleProvisionSite}
        onSwitchToSiteWorkspace={handleSwitchWorkspace}
      />
    );
  }

  if (tab === "contacts") {
    return (
      <ContactsSection
        crmLang={crmLang}
        visibleContacts={visibleContacts}
        contactSearch={contactSearch}
        setContactSearch={setContactSearch}
        contactDateFrom={contactDateFrom}
        setContactDateFrom={setContactDateFrom}
        contactDateTo={contactDateTo}
        setContactDateTo={setContactDateTo}
      />
    );
  }

  return null;
}

