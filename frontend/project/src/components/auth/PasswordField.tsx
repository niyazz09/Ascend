import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: ReactNode;
  icon?: ReactNode;
}

export default function PasswordField({
  label,
  error,
  hint,
  icon,
  className = '',
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={props.id ?? label}
          className="text-[13px] font-medium text-slate-700"
        >
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={props.id ?? label}
          type={visible ? 'text' : 'password'}
          className={`input w-full ${icon ? 'pl-9' : ''} pr-10 ${
            hasError ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-500/20' : ''
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hasError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-600">
          <XCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  icon?: ReactNode;
  success?: boolean;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  success,
  className = '',
  ...props
}: TextFieldProps) {
  const hasError = Boolean(error);
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={props.id ?? label}
          className="text-[13px] font-medium text-slate-700"
        >
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={props.id ?? label}
          className={`input w-full ${icon ? 'pl-9' : ''} ${
            hasError
              ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-500/20'
              : success
                ? 'border-success-400 focus:border-success-400 focus:ring-success-500/20'
                : ''
          }`}
          {...props}
        />
        {success && !hasError && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success-500" />
        )}
      </div>
      {hasError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-600">
          <XCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="w-4 h-4 rounded border border-base-600 bg-white peer-checked:bg-accent-600 peer-checked:border-accent-600 peer-focus:ring-2 peer-focus:ring-accent-500/20 transition-colors flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </span>
      <span className="text-[13px] text-slate-600">{label}</span>
    </label>
  );
}
