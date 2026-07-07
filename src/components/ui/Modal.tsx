import { cn } from '@/lib/utils/cn';
import { Card } from './Card';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className={cn(
          'relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-default bg-surface shadow-elevated p-5 sm:p-6',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card-muted transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-subtle">{footer}</div> : null}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, action }: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center">
      {icon ? <div className="mb-4 flex justify-center text-muted">{icon}</div> : null}
      <p className="text-secondary mb-4">{title}</p>
      {action}
    </Card>
  );
}
