import { useCallback, useEffect, useState } from "react";
import { subscribeAppNotifications, type AppNotificationVariant } from "@/shared/lib/notify";

type Toast = { id: number; message: string; variant: AppNotificationVariant };

export function DevukoToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: AppNotificationVariant = "default") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  useEffect(
    () =>
      subscribeAppNotifications((payload) => {
        push(payload.message, payload.variant ?? "default");
      }),
    [push]
  );

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="devuko-toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`devuko-toast${toast.variant !== "default" ? ` devuko-toast--${toast.variant}` : ""}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
