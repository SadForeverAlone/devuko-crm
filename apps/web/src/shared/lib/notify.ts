const EVENT_NAME = "devuko:notify";

export function emitAppNotification(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { message } }));
}

export function subscribeAppNotifications(onMessage: (message: string) => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<{ message?: string }>;
    const message = custom.detail?.message;
    if (typeof message === "string" && message.trim()) {
      onMessage(message);
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
