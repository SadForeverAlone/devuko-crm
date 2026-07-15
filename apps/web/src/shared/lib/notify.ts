export type AppNotificationVariant = "default" | "success" | "error";

export type AppNotificationPayload = {
  message: string;
  variant?: AppNotificationVariant;
};

const EVENT_NAME = "devuko:notify";

export function emitAppNotification(message: string, variant: AppNotificationVariant = "default") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AppNotificationPayload>(EVENT_NAME, {
      detail: { message, variant },
    })
  );
}

export function subscribeAppNotifications(
  onMessage: (payload: AppNotificationPayload) => void
) {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<AppNotificationPayload>;
    const message = custom.detail?.message;
    const variant = custom.detail?.variant ?? "default";
    if (typeof message === "string" && message.trim()) {
      onMessage({ message, variant });
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
