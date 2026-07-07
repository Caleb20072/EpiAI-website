import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-secondary mb-1.5 block">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-xl bg-input border border-default text-primary text-sm focus-ring',
          'placeholder:text-muted',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-secondary mb-1.5 block">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-xl bg-input border border-default text-primary text-sm focus-ring resize-none',
          'placeholder:text-muted',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-secondary mb-1.5 block">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-xl bg-input border border-default text-primary text-sm focus-ring',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
