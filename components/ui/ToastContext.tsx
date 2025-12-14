"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import Link from "next/link";

type Toast = {
  id: number;
  message: string;
  undo?: () => void;
};

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (data: Omit<Toast, "id">) => {
    const id = Date.now();
    setToast({ ...data, id });

    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <AnimatePresence>
        {toast && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeToast}
            />

            {/* Center Wrapper (Flex-based, Mobile-safe) */}
            <div
              className="
                fixed inset-0 z-50
                flex items-center justify-center
                px-4
                py-safe
              "
            >
              {/* Toast Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="
                  w-full max-w-md
                  bg-white
                  rounded-2xl
                  shadow-2xl
                  p-6

                  /* جلوگیری از بیرون‌زدگی در موبایل */
                  max-h-[calc(100dvh-2rem)]
                  overflow-y-auto
                "
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-7 h-7 text-eco-green flex-shrink-0 mt-0.5" />

                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 leading-relaxed">
                      {toast.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-5">
                      <Link
                        href="/cart"
                        onClick={closeToast}
                        className="text-sm font-semibold text-eco-green hover:underline"
                      >
                        View Cart
                      </Link>

                      {toast.undo && (
                        <button
                          onClick={() => {
                            toast.undo?.();
                            closeToast();
                          }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-800"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={closeToast}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
