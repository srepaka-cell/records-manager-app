import { useEffect, useId, useRef, type ReactNode } from 'react';

type DialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeTargetId?: string;
};

export function Dialog({ title, onClose, children, className, closeTargetId }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('disabled'));
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="backdrop">
      <div ref={panelRef} className={className ? `dialog ${className}` : 'dialog'} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dialog-title">
          <h2 id={titleId}>{title}</h2>
          {closeTargetId ? (
            <button type="button" className="dialog-close" aria-label="Close" data-target-id={closeTargetId} onClick={onClose}>
              <CloseIcon />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
