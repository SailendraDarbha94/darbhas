"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "success" | "error";

interface ToastAction {
  label: string;
  href: string;
}

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  action?: ToastAction;
}

interface ToastApi {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/**
 * Lightweight toast system for the admin dashboard. Success toasts announce
 * politely and auto-dismiss quickly; errors interrupt (role="alert") and
 * linger longer. Max three on screen; every toast is dismissable by keyboard.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, action?: ToastAction) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, kind, message, action }]);
      // Errors get more reading time than confirmations.
      window.setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4500);
    },
    [dismiss],
  );

  const api = useRef<ToastApi>({
    success: (message, action) => push("success", message, action),
    error: (message) => push("error", message),
  });
  api.current.success = (message, action) => push("success", message, action);
  api.current.error = (message) => push("error", message);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={`toast-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-lg ${
              toast.kind === "error" ? "border-red-600" : "border-green-700"
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 text-sm font-bold ${
                toast.kind === "error" ? "text-red-600" : "text-green-700"
              }`}
            >
              {toast.kind === "error" ? "✕" : "✓"}
            </span>
            <div className="flex-1 text-sm text-[#2b2620]">
              {toast.message}
              {toast.action ? (
                <>
                  {" "}
                  <a
                    href={toast.action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#b0713b] underline hover:text-[#9a6233]"
                  >
                    {toast.action.label}
                  </a>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-[#7d7468] hover:text-[#2b2620] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b0713b]"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
