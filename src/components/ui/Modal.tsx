import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from './Button';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-ink/30 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[340px] rounded-4xl border border-border-subtle bg-bg animate-pop-in">
        {title && (
          <header className="px-5 pt-5 pb-2">
            <h2 className="text-[15px] font-bold tracking-tightish text-ink-strong">{title}</h2>
          </header>
        )}
        <div className="px-5 py-2 text-[13px] leading-5 text-ink-subtle">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-5 pb-5 pt-3">{footer}</footer>}
      </div>
    </div>
  );
}

type ConfirmProps = {
  open: boolean;
  title: string;
  body?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  destructive,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {body}
    </Modal>
  );
}
