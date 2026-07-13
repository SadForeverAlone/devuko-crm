import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { useCrmWorkspace } from "../model/useCrmWorkspace";
import {
  ContactsSection,
  DashboardDetailSection,
  DashboardSection,
  LogsSection,
  PagesSection,
  PromisesSection,
  ReportsSection,
  SettingsSection,
  UsersSection,
} from "./sections";
import { withCrmSectionSuspense } from "./sections/CrmSectionSuspense";
import {
  LazyAutomationSection,
  LazyDeploymentsSection,
  LazyInfrastructureSectionView,
  LazyMonitoringSection,
  LazyNotificationsSection,
  LazyPlatformAdminsSection,
  LazyPlatformDashboardV2Section,
  LazyPlatformLogsSection,
  LazyPlatformSettingsSection,
  LazyProjectDetailSection,
  LazySitesSection,
} from "./sections/lazySections";
import type { DashboardPart } from "./sections/sectionTypes";
import type { InfrastructureSection, ProjectDetailTab } from "../model/platform-nav";

type CrmWorkspace = ReturnType<typeof useCrmWorkspace>;

export function CrmTabContent({ workspace: ws }: { workspace: CrmWorkspace }) {
  const {
    tab,
    crmLang,
    dashboardPart,
    projectId,
    projectTab,
    infrastructureSection,
    platformMetrics,
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
    logFilter,
    setLogFilter,
    siteLogs,
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
    handleUpdateSite,
    handleDeleteSite,
    handleSwitchWorkspace,
    isPlatformWorkspace,
    platformLogs,
    platformAdmins,
    adminSearch,
    setAdminSearch,
    platformAdminForm,
    setPlatformAdminForm,
    platformAdminPassword,
    setPlatformAdminPassword,
    platformAdminPasswordKey,
    selectedPlatformAdmin,
    currentAdminId,
    canDeletePlatformAdmin,
    handleDeletePlatformAdmin,
    crmSession,
    deploying,
    handleDeployPlatform,
    handleDeploySite,
  } = ws;

  const location = useLocation();
  const visibleContactsCount = useMemo(() => visibleContacts.length, [visibleContacts]);
  const openProjectCreate = useMemo(
    () => new URLSearchParams(location.search).get("create") === "1",
    [location.search]
  );
  const selectedProject = useMemo(
    () => sites.find((site) => site.id === projectId) ?? null,
    [sites, projectId]
  );

  if (tab === "dashboard" && !data) {
    return <section className="crm-page crm-page--loading" aria-busy="true" aria-label="Loading" />;
  }

  if (tab === "dashboard" && data) {
    if (isPlatformWorkspace && !dashboardPart) {
      return withCrmSectionSuspense(
        <LazyPlatformDashboardV2Section
          crmLang={crmLang}
          sites={sites}
          metrics={platformMetrics}
          onOpenProjects={() => navigate("/crm/projects")}
          onOpenInfrastructure={() => navigate("/crm/infrastructure")}
          onOpenDeployments={() => navigate("/crm/deployments")}
          onOpenMonitoring={() => navigate("/crm/monitoring")}
          onOpenTeam={() => navigate("/crm/team")}
          onSwitchToSite={handleSwitchWorkspace}
          onOpenProject={(id) => navigate(`/crm/projects/${id}`)}
        />
      );
    }

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

  if (tab === "projects" && isPlatformWorkspace) {
    if (projectId) {
      return withCrmSectionSuspense(
        <LazyProjectDetailSection
          crmLang={crmLang}
          site={selectedProject}
          metrics={platformMetrics}
          platformLogs={platformLogs}
          tab={(projectTab || "overview") as ProjectDetailTab}
          onBack={() => navigate("/crm/projects")}
          onNavigateTab={(nextTab) => navigate(`/crm/projects/${projectId}/${nextTab}`)}
          onSwitchToWorkspace={handleSwitchWorkspace}
          onProvision={handleProvisionSite}
          onDeploy={handleDeploySite}
          deploying={deploying}
        />
      );
    }

    return withCrmSectionSuspense(
      <LazySitesSection
        crmLang={crmLang}
        sites={sites}
        siteForm={siteForm}
        setSiteForm={setSiteForm}
        onCreateSite={handleCreateSite}
        onProvisionSite={handleProvisionSite}
        onUpdateSite={handleUpdateSite}
        onDeleteSite={handleDeleteSite}
        onSwitchToSiteWorkspace={(workspaceId) => {
          const site = sites.find((item) => item.workspaceId === workspaceId);
          if (site) navigate(`/crm/projects/${site.id}`);
          else handleSwitchWorkspace(workspaceId);
        }}
        onOpenProject={(id) => navigate(`/crm/projects/${id}`)}
        openCreateOnMount={openProjectCreate}
        listTitle={crmLang === "ru" ? "Проекты" : "Projects"}
        listSubtitle={
          crmLang === "ru"
            ? "Управление проектами и workspace"
            : "Manage projects and workspaces"
        }
      />
    );
  }

  if (tab === "infrastructure" && isPlatformWorkspace) {
    return withCrmSectionSuspense(
      <LazyInfrastructureSectionView
        crmLang={crmLang}
        section={(infrastructureSection || "overview") as InfrastructureSection}
        metrics={platformMetrics}
        sites={sites}
        onNavigateSection={(section) =>
          navigate(section === "overview" ? "/crm/infrastructure" : `/crm/infrastructure/${section}`)
        }
      />
    );
  }

  if (tab === "deployments" && isPlatformWorkspace) {
    return withCrmSectionSuspense(
      <LazyDeploymentsSection
        crmLang={crmLang}
        metrics={platformMetrics}
        deploying={deploying}
        onDeployPlatform={() => void handleDeployPlatform()}
      />
    );
  }

  if (tab === "monitoring" && isPlatformWorkspace) {
    return withCrmSectionSuspense(
      <LazyMonitoringSection crmLang={crmLang} metrics={platformMetrics} sites={sites} />
    );
  }

  if (tab === "automation" && isPlatformWorkspace) {
    return withCrmSectionSuspense(<LazyAutomationSection crmLang={crmLang} />);
  }

  if (tab === "notifications" && isPlatformWorkspace) {
    return withCrmSectionSuspense(
      <LazyNotificationsSection
        crmLang={crmLang}
        metrics={platformMetrics}
        onOpenMonitoring={() => navigate("/crm/monitoring")}
      />
    );
  }

  if (tab === "logs" && isPlatformWorkspace) {
    return withCrmSectionSuspense(<LazyPlatformLogsSection crmLang={crmLang} logs={platformLogs} />);
  }

  if (tab === "logs" && data) {
    return (
      <LogsSection
        crmLang={crmLang}
        logs={siteLogs}
        logCategories={data.logCategories}
        rowLimitInput={rowLimitInput}
        setRowLimitInput={setRowLimitInput}
        logDateFrom={logDateFrom}
        setLogDateFrom={setLogDateFrom}
        logDateTo={logDateTo}
        setLogDateTo={setLogDateTo}
        logFilter={logFilter}
        setLogFilter={setLogFilter}
      />
    );
  }

  if (tab === "users" || tab === "team") {
    if (isPlatformWorkspace) {
      return withCrmSectionSuspense(
        <LazyPlatformAdminsSection
          crmLang={crmLang}
          admins={platformAdmins}
          platformLogs={platformLogs}
          usersView={usersView}
          isCreateAdmin={isUserCreateRoute}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          selectedAdmin={selectedPlatformAdmin}
          adminForm={platformAdminForm}
          setAdminForm={setPlatformAdminForm}
          adminPassword={platformAdminPassword}
          setAdminPassword={setPlatformAdminPassword}
          adminPasswordKey={`${selectedPlatformAdmin?.id ?? (isUserCreateRoute ? "new" : "list")}-${platformAdminPasswordKey}`}
          onNavigateCreateAdmin={() => navigate("/crm/team/new")}
          onSelectAdmin={(id) => navigate(`/crm/team/${id}`)}
          onBackToList={() => navigate("/crm/team")}
          onSaveAdmin={handleSaveUser}
          onDeleteAdmin={handleDeletePlatformAdmin}
          currentAdminId={currentAdminId}
          canDeleteAdmin={canDeletePlatformAdmin}
          sectionTitle={tab === "team" ? (crmLang === "ru" ? "Команда" : "Team") : undefined}
        />
      );
    }

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

  if (tab === "pages") return <PagesSection crmLang={crmLang} pages={pages} />;
  if (tab === "reports") return <ReportsSection crmLang={crmLang} reports={reports} />;

  if (tab === "settings") {
    if (isPlatformWorkspace && data) {
      return withCrmSectionSuspense(
        <LazyPlatformSettingsSection
          crmLang={crmLang}
          sites={sites}
          storageUsage={data.storageUsage ?? null}
          serverDateTime={data.serverDateTime}
          serverTimeZone={data.serverTimeZone}
        />
      );
    }

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
    return withCrmSectionSuspense(
      <LazySitesSection
        crmLang={crmLang}
        sites={sites}
        siteForm={siteForm}
        setSiteForm={setSiteForm}
        onCreateSite={handleCreateSite}
        onProvisionSite={handleProvisionSite}
        onUpdateSite={handleUpdateSite}
        onDeleteSite={handleDeleteSite}
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
