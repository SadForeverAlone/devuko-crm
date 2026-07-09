import { useCallback, useEffect, useState } from "react";
import { subscribeAppNotifications } from "@/shared/lib/notify";

type Toast = { id: number; message: string };

export function DevukoToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  useEffect(() => subscribeAppNotifications(push), [push]);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="devuko-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="devuko-toast">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
