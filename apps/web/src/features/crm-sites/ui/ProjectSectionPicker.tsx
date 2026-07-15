import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBox,
  faChartLine,
  faCloudArrowUp,
  faDatabase,
  faFileLines,
  faGaugeHigh,
  faGear,
  faGlobe,
  faHardDrive,
  faKey,
  faLeaf,
  faLock,
  faRocket,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import type { ProjectDetailTab } from "@/widgets/crm-app/model/platform-nav";
import { projectDetailTabGroups, projectDetailTabs } from "@/widgets/crm-app/model/platform-nav";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { PlatformSectionPicker } from "@/features/crm-platform-ops/ui/PlatformSectionPicker";

type ProjectSectionPickerProps = {
  crmLang: CrmLang;
  tab: ProjectDetailTab;
  onNavigateTab: (tab: ProjectDetailTab) => void;
};

const tabIcons: Record<ProjectDetailTab, IconDefinition> = {
  overview: faGaugeHigh,
  deployments: faRocket,
  services: faServer,
  containers: faBox,
  domains: faGlobe,
  ssl: faLock,
  environment: faLeaf,
  secrets: faKey,
  storage: faHardDrive,
  database: faDatabase,
  logs: faFileLines,
  monitoring: faChartLine,
  backups: faCloudArrowUp,
  settings: faGear,
};

export function ProjectSectionPicker({ crmLang, tab, onNavigateTab }: ProjectSectionPickerProps) {
  return (
    <PlatformSectionPicker
      crmLang={crmLang}
      value={tab}
      onChange={onNavigateTab}
      groups={projectDetailTabGroups}
      options={projectDetailTabs.map((item) => ({
        key: item.key,
        label: item.label,
        icon: tabIcons[item.key],
      }))}
      panelAriaLabel={{ ru: "Раздел проекта", en: "Project section" }}
    />
  );
}
