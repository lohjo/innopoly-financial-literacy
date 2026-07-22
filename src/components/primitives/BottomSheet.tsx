import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { dur, useMotionPrefs } from "../../motion";

/** Shared bottom sheet: backdrop + drag-handle chrome + spring entrance.
    Reduced motion collapses to a fast fade. Focus lands on the sheet; Escape
    and backdrop tap dismiss. Portal-free — callers already sit at screen root. */
export function BottomSheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const { collapse } = useMotionPrefs();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.micro }}
            className="fixed inset-0 z-50"
            style={{ background: "color-mix(in srgb, var(--foreground) 32%, transparent)" }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="sheet"
            ref={sheetRef}
            initial={collapse ? { opacity: 0 } : { y: "100%" }}
            animate={collapse ? { opacity: 1 } : { y: 0 }}
            exit={collapse ? { opacity: 0 } : { y: "100%" }}
            transition={collapse ? { duration: dur.micro } : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] px-4 pb-6 pt-2 outline-none"
            style={{
              background: "var(--card)",
              borderTopLeftRadius: "var(--radius-sheet)",
              borderTopRightRadius: "var(--radius-sheet)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-3)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
          >
            <div className="mx-auto mb-3 rounded-full" style={{ width: 36, height: 4, background: "var(--border)" }} aria-hidden />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
