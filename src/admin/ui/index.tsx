/**
 * Admin UI kit — small, dependency-free building blocks shared by every admin page.
 */
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Search, X, type LucideIcon } from 'lucide-react';

// Tiny class-name helper shared with the components below (only affects HMR granularity).
// eslint-disable-next-line react-refresh/only-export-components
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─── Button ─── */

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:bg-indigo-400',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 disabled:bg-rose-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon: Icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed whitespace-nowrap',
        size === 'sm' ? 'text-xs px-2.5 py-1.5' : 'text-sm px-4 py-2',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {(loading || Icon) && (
        <span className="inline-flex shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
        </span>
      )}
      {children !== undefined && children !== null && <span>{children}</span>}
    </button>
  );
});

export function IconButton({
  icon: Icon,
  label,
  className,
  tone = 'default',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        tone === 'danger' ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
        className,
      )}
      {...rest}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ─── Form fields ─── */

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500';

type WithField = { label?: string; hint?: string; error?: string; containerClassName?: string };

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & WithField>(
  function TextInput({ label, hint, error, required, containerClassName, className, ...rest }, ref) {
    return (
      <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
        {(id) => (
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={Boolean(error)}
            className={cx(inputBase, error ? 'border-rose-400' : 'border-slate-200', className)}
            {...rest}
          />
        )}
      </Field>
    );
  },
);

export function TextArea({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  rows = 4,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithField) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          className={cx(inputBase, 'resize-y', error ? 'border-rose-400' : 'border-slate-200', className)}
          {...rest}
        />
      )}
    </Field>
  );
}

export function SelectInput({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & WithField) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
      {(id) => (
        <select
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          className={cx(inputBase, 'pr-8', error ? 'border-rose-400' : 'border-slate-200', className)}
          {...rest}
        >
          {children}
        </select>
      )}
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cx('flex items-start gap-3', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium text-slate-700">{label}</span>}
          {description && <span className="block text-xs text-slate-500 mt-0.5">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(inputBase, 'pl-9 border-slate-200')}
      />
    </div>
  );
}

/* ─── Display ─── */

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cx('bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-900/[0.03]', padded && 'p-5 sm:p-6', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const badgeTones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', badgeTones[tone])}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return status === 'active' ? (
    <Badge tone="green">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Active</span>
    </Badge>
  ) : (
    <Badge tone="gray">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span>Inactive</span>
    </Badge>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-md bg-slate-200/70', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cx('h-4', c === 0 ? 'flex-1' : 'w-20 hidden sm:block')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-4">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2 shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}

/** Table wrapper with horizontal scroll on small screens. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cx('px-4 sm:px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/80 border-b border-slate-200', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx('px-4 sm:px-5 py-3.5 align-middle text-slate-700', className)}>{children}</td>;
}

/* ─── Modal ─── */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  return createPortal(
    <div translate="no" className="notranslate fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative w-full bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] focus:outline-none',
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 bg-slate-50/60 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
