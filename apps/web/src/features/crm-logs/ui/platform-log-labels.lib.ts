import type { CrmLang } from "@/widgets/crm-app/model/types";

export const platformLogActionLabels: Record<CrmLang, Record<string, string>> = {
  ru: {
    "auth.login": "Вход",
    "auth.login_failed": "Неудачный вход",
    "admin.create": "Создан оператор",
    "admin.update": "Изменён оператор",
    "admin.delete": "Удалён оператор",
    "site.create": "Создан сайт",
    "site.update": "Изменён сайт",
    "site.delete": "Удалён сайт",
    "site.provision": "Настройка сайта",
    "site.deploy": "Деплой проекта",
    "platform.deploy": "Деплой платформы",
  },
  en: {
    "auth.login": "Login",
    "auth.login_failed": "Failed login",
    "admin.create": "Admin created",
    "admin.update": "Admin updated",
    "admin.delete": "Admin deleted",
    "site.create": "Site created",
    "site.update": "Site updated",
    "site.delete": "Site deleted",
    "site.provision": "Site provision",
    "site.deploy": "Project deploy",
    "platform.deploy": "Platform deploy",
  },
};

export function platformLogActionLabel(action: string, crmLang: CrmLang) {
  return platformLogActionLabels[crmLang][action] ?? action;
}
