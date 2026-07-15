import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBell } from "@fortawesome/free-solid-svg-icons";
import type { CrmPlatformMetrics } from "@/entities/crm";
import { EmptyState, PlatformCard, PlatformPage, StatusPill } from "@/shared/ui/platform";
import type { CrmLang } from "@/widgets/crm-app/model/types";
import { buildMonitorAlerts, computeMonitorHealth } from "@/features/crm-platform-ops/ui/monitoring.lib";
import { notifyChannels, notifyEnvVars, notifyRuleIcon, notifyRules } from "@/features/crm-platform-ops/ui/notifications.lib";

type NotificationsSectionProps = {
  crmLang: CrmLang;
  metrics: CrmPlatformMetrics | null;
  onOpenMonitoring: () => void;
};

function deliveryStatusLabel(crmLang: CrmLang) {
  return crmLang === "ru" ? "В разработке" : "In development";
}

function healthCopy(health: ReturnType<typeof computeMonitorHealth>, crmLang: CrmLang) {
  if (health === "critical") {
    return crmLang === "ru" ? "Есть критичные сигналы" : "Critical signals active";
  }
  if (health === "degraded") {
    return crmLang === "ru" ? "Есть предупреждения" : "Warnings active";
  }
  return crmLang === "ru" ? "Сигналов для отправки нет" : "No signals to deliver";
}

export function NotificationsSection({ crmLang, metrics, onOpenMonitoring }: NotificationsSectionProps) {
  const alerts = buildMonitorAlerts(metrics, crmLang);
  const health = computeMonitorHealth(alerts);
  const criticalCount = alerts.filter((item) => item.severity === "critical").length;
  const warningCount = alerts.filter((item) => item.severity === "warning").length;

  return (
    <PlatformPage
      title={crmLang === "ru" ? "Уведомления" : "Notifications"}
      subtitle={
        crmLang === "ru"
          ? "Каналы доставки и правила алертов платформы"
          : "Delivery channels and platform alert rules"
      }
      actions={
        <span className="crm-notify-badge">
          <FontAwesomeIcon icon={faBell} />
          {deliveryStatusLabel(crmLang)}
        </span>
      }
    >
      <section className={`crm-notify-status crm-notify-status--${health}`}>
        <div className="crm-notify-status__lead">
          <span className="crm-notify-status__dot" aria-hidden />
          <div>
            <strong>{healthCopy(health, crmLang)}</strong>
            <p>
              {crmLang === "ru"
                ? "Сигналы берутся из мониторинга. Автоотправка в каналы скоро."
                : "Signals come from monitoring. Auto-delivery to channels is coming soon."}
            </p>
          </div>
        </div>
        <div className="crm-notify-status__stats">
          <div>
            <span>{notifyChannels.length}</span>
            <small>{crmLang === "ru" ? "канала" : "channels"}</small>
          </div>
          <div>
            <span>{notifyRules.length}</span>
            <small>{crmLang === "ru" ? "правил" : "rules"}</small>
          </div>
          <div>
            <span>{alerts.length}</span>
            <small>{crmLang === "ru" ? "сигналов" : "signals"}</small>
          </div>
        </div>
      </section>

      <div className="crm-notify-layout">
        <PlatformCard
          icon={faBell}
          title={crmLang === "ru" ? "Активные сигналы" : "Active signals"}
          subtitle={
            alerts.length > 0
              ? crmLang === "ru"
                ? `${criticalCount} критичных · ${warningCount} предупреждений`
                : `${criticalCount} critical · ${warningCount} warnings`
              : crmLang === "ru"
                ? "Сейчас тишина"
                : "All quiet"
          }
          action={
            <button type="button" className="crm-btn crm-btn--ghost crm-btn--sm" onClick={onOpenMonitoring}>
              {crmLang === "ru" ? "Мониторинг" : "Monitoring"}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          }
        >
          {alerts.length === 0 ? (
            <EmptyState
              icon={faBell}
              title={crmLang === "ru" ? "Нечего отправлять" : "Nothing to notify"}
              description={
                crmLang === "ru"
                  ? "Когда мониторинг найдёт проблему, она появится здесь."
                  : "When monitoring detects an issue, it will show up here."
              }
            />
          ) : (
            <ul className="crm-notify-signals">
              {alerts.slice(0, 8).map((alert) => (
                <li key={alert.id} className="crm-notify-signals__item">
                  <div className="crm-notify-signals__content">
                    <div className="crm-notify-signals__top">
                      <strong>{alert.message}</strong>
                      <StatusPill
                        label={
                          alert.severity === "critical"
                            ? crmLang === "ru"
                              ? "Критично"
                              : "Critical"
                            : alert.severity === "warning"
                              ? crmLang === "ru"
                                ? "Предупр."
                                : "Warning"
                              : crmLang === "ru"
                                ? "Инфо"
                                : "Info"
                        }
                        tone={
                          alert.severity === "critical"
                            ? "critical"
                            : alert.severity === "warning"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    </div>
                    <p>
                      {alert.category}
                      {alert.detail ? ` · ${alert.detail}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PlatformCard>

        <PlatformCard
          title={crmLang === "ru" ? "Каналы доставки" : "Delivery channels"}
          subtitle={
            crmLang === "ru"
              ? "Настраиваются через env API-сервера"
              : "Configured via API server env"
          }
        >
          <ul className="crm-notify-channels">
            {notifyChannels.map((channel) => (
              <li key={channel.id} className="crm-notify-channel">
                <span className="crm-notify-channel__icon" aria-hidden>
                  <FontAwesomeIcon icon={channel.icon} />
                </span>
                <div className="crm-notify-channel__body">
                  <strong>{channel.name}</strong>
                  <p>{channel.description[crmLang]}</p>
                  <code className="crm-notify-channel__env">{channel.envKeys.join(" · ")}</code>
                </div>
                <StatusPill label={crmLang === "ru" ? "Скоро" : "Soon"} tone="neutral" />
              </li>
            ))}
          </ul>
        </PlatformCard>
      </div>

      <PlatformCard
        title={crmLang === "ru" ? "Правила алертов" : "Alert rules"}
        subtitle={
          crmLang === "ru"
            ? "Какие события будут уходить в каналы"
            : "Which events will be sent to channels"
        }
      >
        <ul className="crm-notify-rules">
          {notifyRules.map((rule) => (
            <li key={rule.id} className="crm-notify-rule">
              <span className="crm-notify-rule__icon" aria-hidden>
                <FontAwesomeIcon icon={notifyRuleIcon(rule.id)} />
              </span>
              <div className="crm-notify-rule__body">
                <strong>{rule.label[crmLang]}</strong>
                <p>{rule.description[crmLang]}</p>
              </div>
              <div className="crm-notify-rule__meta">
                <StatusPill
                  label={
                    rule.severity === "critical"
                      ? crmLang === "ru"
                        ? "Критично"
                        : "Critical"
                      : crmLang === "ru"
                        ? "Предупр."
                        : "Warning"
                  }
                  tone={rule.severity === "critical" ? "critical" : "warning"}
                />
                <StatusPill label={crmLang === "ru" ? "Скоро" : "Soon"} tone="neutral" />
              </div>
            </li>
          ))}
        </ul>
      </PlatformCard>

      <PlatformCard
        title={crmLang === "ru" ? "Настройка на сервере" : "Server configuration"}
        subtitle={
          crmLang === "ru"
            ? "Переменные окружения devuko-crm-api"
            : "devuko-crm-api environment variables"
        }
      >
        <dl className="crm-notify-env">
          {notifyEnvVars.map((envKey) => (
            <div key={envKey} className="crm-notify-env__row">
              <dt>
                <code>{envKey}</code>
              </dt>
              <dd>{crmLang === "ru" ? "Не задано" : "Not set"}</dd>
            </div>
          ))}
        </dl>
        <p className="crm-notify-env__hint">
          {crmLang === "ru"
            ? "После добавления переменных перезапустите API-контейнер. UI покажет статус каналов, когда endpoint будет готов."
            : "After adding variables, restart the API container. The UI will show channel status once the endpoint is ready."}
        </p>
      </PlatformCard>
    </PlatformPage>
  );
}
