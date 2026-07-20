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
        className="pointer-events-none fixed inset-x-4 top-20 z-50 flex flex-col items-end gap-2.5 sm:inset-x-auto sm:right-6 sm:w-96"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className="toast-in pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_1px_2px_rgba(70,45,25,0.06),0_22px_48px_-24px_rgba(70,45,25,0.5)] backdrop-blur-xl"
          >
            {/* Faint semantic wash over the glass */}
            <span
              aria-hidden
              className={`absolute inset-0 ${
                toast.kind === "error" ? "bg-[#a8503a]/[0.06]" : "bg-[#3f6f4f]/[0.05]"
              }`}
            />
            {/* Specular top edge — the house glass signature */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
            />
            <span
              aria-hidden
              className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                toast.kind === "error" ? "bg-[#a8503a]" : "bg-[#3f6f4f]"
              }`}
            >
              {toast.kind === "error" ? "!" : "✓"}
            </span>
            <div className="relative flex-1 pt-0.5 text-sm leading-relaxed text-[#2b2620]">
              {toast.message}
              {toast.action ? (
                <>
                  {" "}
                  <a
                    href={toast.action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#b0713b] underline decoration-[#b0713b]/40 underline-offset-2 hover:text-[#9a6233] hover:decoration-[#9a6233]"
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
              className="relative -m-1 rounded-full p-1.5 text-[#7d7468] hover:bg-black/5 hover:text-[#2b2620] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b0713b]"
            >
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
