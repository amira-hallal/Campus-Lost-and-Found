/**
 * Reusable modal dialog.
 *
 * Usage:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Claim this item"
 *          footer={<button onClick={save}>Send</button>}>
 *     ...content...
 *   </Modal>
 *
 * Closes on Escape, on the X button and on a click outside the box.
 * Keeps keyboard focus inside while open and gives it back to the opener when closed.
 */
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  // Always call the latest onClose without re-running the focus effect on every render
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const opener = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)];

    // Focus the first field/button inside the modal (skip the X button if there is something else)
    const [closeButton, ...rest] = focusables();
    (rest[0] ?? closeButton ?? dialog).focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap: Tab on the last element goes back to the first, and the reverse
      const elements = focusables();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`w-full ${SIZES[size] ?? SIZES.md} max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl shadow-brand-950/20 outline-none dark:border-night-700 dark:bg-night-900`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div>
            <h2 id={titleId} className="display text-xl">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1.5 text-sm">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-2 -mt-1 rounded-lg p-1.5 text-muted hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-stone-400 dark:hover:bg-night-800 dark:hover:text-stone-100"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {children && <div className="px-6 py-4">{children}</div>}

        {footer && (
          <div className="flex flex-col-reverse gap-2 px-6 pt-2 pb-6 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
