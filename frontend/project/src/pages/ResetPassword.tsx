import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordField from '../components/auth/PasswordField';

interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  bar: string;
}

const strengthFor = (pw: string): Strength => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, Omit<Strength, 'score'>> = {
    0: { label: 'Too short', color: 'text-slate-400', bar: 'bg-slate-200' },
    1: { label: 'Weak', color: 'text-danger-600', bar: 'bg-danger-500' },
    2: { label: 'Fair', color: 'text-warning-600', bar: 'bg-warning-500' },
    3: { label: 'Good', color: 'text-accent-600', bar: 'bg-accent-500' },
    4: { label: 'Strong', color: 'text-success-600', bar: 'bg-success-500' },
  };
  return { score: score as Strength['score'], ...map[score] };
};

const rules = [
  { key: 'length', test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { key: 'case', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p), label: 'Upper and lower case' },
  { key: 'number', test: (p: string) => /\d/.test(p), label: 'A number' },
  { key: 'symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'A symbol' },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const strength = strengthFor(password);

  const validate = () => {
    const next: typeof errors = {};
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Must be at least 8 characters';
    if (!confirm) next.confirm = 'Please confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1400);
  };

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new password for your account."
      footer={
        <>
          Remembered it?{' '}
          <Link
            to="/login"
            className="font-medium text-accent-600 hover:text-accent-700 transition-colors"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          value={password}
          onChange={onPasswordChange}
          error={errors.password}
        />

        {password && (
          <div className="mt-2.5">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < strength.score ? strength.bar : 'bg-slate-200'
                  }`}
                />
              ))}
              <span className={`text-xs font-medium ml-1 ${strength.color}`}>
                {strength.label}
              </span>
            </div>
            <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {rules.map((r) => {
                const ok = r.test(password);
                return (
                  <li
                    key={r.key}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      ok ? 'text-success-600' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        ok ? 'bg-success-100' : 'bg-slate-100'
                      }`}
                    >
                      {ok && <Check className="w-2.5 h-2.5 text-success-600" />}
                    </span>
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <PasswordField
          id="confirm"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting password…
            </>
          ) : (
            <>
              Reset password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
