import type { CrmLang } from "./types";

const STATUS_RU: Record<string, string> = {
  NEW: "Новое",
  new: "Новое",
  ACTIVE: "Активно",
  active: "Активно",
  COMPLETED: "Завершено",
  completed: "Завершено",
  FAILED: "Провалено",
  failed: "Провалено",
  EXPIRED: "Истекло",
  expired: "Истекло",
  Low: "Низкая",
  low: "Низкая",
  MEDIUM: "Средняя",
  Medium: "Средняя",
  medium: "Средняя",
  HIGH: "Высокая",
  High: "Высокая",
  high: "Высокая",
  "В Процессе": "В процессе",
  "в процессе": "В процессе",
  Новая: "Новая",
  Выполнена: "Выполнена",
  Актуально: "Актуально",
  "На согласовании": "На согласовании",
  Обновлено: "Обновлено",
  Черновик: "Черновик",
  Открыт: "Открыт",
  "В работе": "В работе",
  Подтвержден: "Подтверждён",
  Онлайн: "Онлайн",
  Перерыв: "Перерыв",
  "Основной сайт": "Основной сайт",
  Landing: "Лендинг",
  landing: "Лендинг",
  Sales: "Продажи",
  sales: "Продажи",
  Support: "Поддержка",
  support: "Поддержка",
  VIP: "VIP",
  vip: "VIP",
};

const STATUS_EN: Record<string, string> = {
  NEW: "New",
  new: "New",
  ACTIVE: "Active",
  active: "Active",
  COMPLETED: "Completed",
  completed: "Completed",
  FAILED: "Failed",
  failed: "Failed",
  EXPIRED: "Expired",
  expired: "Expired",
  Low: "Low",
  low: "Low",
  MEDIUM: "Medium",
  Medium: "Medium",
  medium: "Medium",
  HIGH: "High",
  High: "High",
  high: "High",
  "В Процессе": "In progress",
  "в процессе": "In progress",
  Новая: "New",
  Выполнена: "Done",
  Актуально: "Current",
  "На согласовании": "Pending approval",
  Обновлено: "Updated",
  Черновик: "Draft",
  Открыт: "Open",
  "В работе": "In progress",
  Подтвержден: "Confirmed",
  Онлайн: "Online",
  Перерыв: "Break",
  "Основной сайт": "Main site",
  Landing: "Landing",
  landing: "Landing",
  Sales: "Sales",
  sales: "Sales",
  Support: "Support",
  support: "Support",
  VIP: "VIP",
  vip: "VIP",
};
const STATUS_MAP: Record<CrmLang, Record<string, string>> = {
  ru: STATUS_RU,
  en: STATUS_EN,
};

function lookupKeys(value: string): string[] {
  const t = value.trim();
  if (!t) return [];
  const out = new Set<string>();
  out.add(t);
  out.add(t.toUpperCase());
  out.add(t.toLowerCase());
  return [...out];
}

export function translateCrmStatus(value: string, lang: CrmLang): string {
  const t = value.trim();
  if (!t) return value;
  const map = STATUS_MAP[lang];
  for (const key of lookupKeys(t)) {
    if (map[key] !== undefined) {
      return map[key]!;
    }
  }
  return t;
}
