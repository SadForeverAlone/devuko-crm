import { useMemo } from "react";
import {
  useCrmWorkspaceAdminOps,
  useCrmWorkspaceChromeState,
  useCrmWorkspaceDataView,
  useCrmWorkspaceFilters,
  useCrmWorkspaceNavigation,
  useCrmWorkspaceSiteOps,
} from "../model/useCrmWorkspaceSlices";
import { useCrmProjectsTabModel } from "@/features/crm-sites/model/useCrmProjectsTabModel";
import { withCrmSectionSuspense } from "@/shared/crm/ui";
import { DashboardDetailSection } from "@/features/crm-dashboard/ui/DashboardDetailSection";
import {
  LazyAutomationSection,
  LazyContactsSection,
  LazyDashboardSection,
  LazyDeploymentsSection,
  LazyInfrastructureSectionView,
  LazyLogsSection,
  LazyMonitoringSection,
  LazyNotificationsSection,
  LazyPagesSection,
  LazyPlatformAdminsSection,
  LazyPlatformDashboardV2Section,
  LazyPlatformLogsSection,
  LazyPlatformSettingsSection,
  LazyProjectDetailSection,
  LazyPromisesSection,
  LazyReportsSection,
  LazySettingsSection,
  LazySitesSection,
  LazyUsersSection,
} from "./sections/lazySections";
import type { DashboardPart } from "@/shared/crm/ui";
import type { InfrastructureSection } from "../model/platform-nav";

export function CrmTabContent() {
  const nav = useCrmWorkspaceNavigation();
  const chrome = useCrmWorkspaceChromeState();
  const filters = useCrmWorkspaceFilters();
  const siteOps = useCrmWorkspaceSiteOps();
  const adminOps = useCrmWorkspaceAdminOps();
  const dataView = useCrmWorkspaceDataView();

  const {
    tab,
    dashboardPart,
    projectId,
    projectTab,
    infrastructureSection,
    navigate,
    handleSwitchWorkspace,
  } = nav;
  const { crmLang, ui, isPlatformWorkspace } = chrome;
  const {
    rowLimitInput,
    setRowLimitInput,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    logFilter,
    setLogFilter,
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
  } = filters;
  const {
    sites,
    siteForm,
    setSiteForm,
    handleCreateSite,
    handleProvisionSite,
    handleUpdateSite,
    handleDeleteSite,
    deploying,
    handleDeployPlatform,
    handleDeploySite,
  } = siteOps;
  const {
    usersView,
    isUserCreateRoute,
    usersWithMeta,
    selectedUser,
    userForm,
    setUserForm,
    setSelectedUserIdByRoute,
    setUsersViewByRoute,
    handleSaveUser,
    handleNavigateCreateUser,
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
  } = adminOps;
  const {
    data,
    platformMetrics,
    genderMetrics,
    countryMetrics,
    roleOverview,
    visibleContacts,
    siteLogs,
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
    platformLogs,
  } = dataView;

  const projectsTab = useCrmProjectsTabModel({
    crmLang,
    projectId,
    projectTab,
    navigate,
    handleSwitchWorkspace,
    platformMetrics,
    platformLogs,
    siteOps: {
      sites,
      siteForm,
      setSiteForm,
      handleCreateSite,
      handleProvisionSite,
      handleUpdateSite,
      handleDeleteSite,
      deploying,
      handleDeploySite,
    },
  });

  const visibleContactsCount = useMemo(() => visibleContacts.length, [visibleContacts]);

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
      withCrmSectionSuspense(
        <LazyDashboardSection
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
      )
    );
  }

  if (tab === "projects" && isPlatformWorkspace) {
    if (projectId) {
      return withCrmSectionSuspense(
        <LazyProjectDetailSection
          crmLang={crmLang}
          site={projectsTab.selectedProject}
          metrics={projectsTab.platformMetrics}
          platformLogs={projectsTab.platformLogs}
          tab={projectsTab.projectTab}
          onBack={projectsTab.onBackToList}
          onNavigateTab={projectsTab.onNavigateProjectTab}
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
        sites={projectsTab.siteOps.sites}
        siteForm={projectsTab.siteOps.siteForm}
        setSiteForm={projectsTab.siteOps.setSiteForm}
        onCreateSite={projectsTab.siteOps.handleCreateSite}
        onProvisionSite={projectsTab.siteOps.handleProvisionSite}
        onUpdateSite={projectsTab.siteOps.handleUpdateSite}
        onDeleteSite={projectsTab.siteOps.handleDeleteSite}
        onSwitchToSiteWorkspace={projectsTab.onSwitchToSiteWorkspace}
        onOpenProject={projectsTab.onOpenProject}
        openCreateOnMount={projectsTab.openProjectCreate}
        listTitle={projectsTab.listCopy.listTitle}
        listSubtitle={projectsTab.listCopy.listSubtitle}
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
    return withCrmSectionSuspense(
      <LazyLogsSection
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

    return withCrmSectionSuspense(
      <LazyUsersSection
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
        selectedUser={selectedUser}
        userForm={userForm}
        setUserForm={setUserForm}
        onSaveUser={handleSaveUser}
        onNavigateCreateUser={handleNavigateCreateUser}
      />
    );
  }

  if (tab === "promises") {
    return withCrmSectionSuspense(
      <LazyPromisesSection
        crmLang={crmLang}
        promisesView={promisesView}
        promiseRecords={promiseRecords}
        selectedPromise={selectedPromise}
        setSelectedPromiseId={setSelectedPromiseIdByRoute}
        setPromisesView={setPromisesViewByRoute}
      />
    );
  }

  if (tab === "pages") {
    return withCrmSectionSuspense(<LazyPagesSection crmLang={crmLang} pages={pages} />);
  }
  if (tab === "reports") {
    return withCrmSectionSuspense(<LazyReportsSection crmLang={crmLang} reports={reports} />);
  }

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

    return withCrmSectionSuspense(
      <LazySettingsSection
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
    return withCrmSectionSuspense(
      <LazyContactsSection
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
