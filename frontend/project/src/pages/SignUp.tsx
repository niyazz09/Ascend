import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Check } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordField, { TextField } from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';

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

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    agree?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const strength = strengthFor(password);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Must be at least 8 characters';
    if (!confirm) next.confirm = 'Please confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    if (!agree) next.agree = 'You must accept the terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      setErrors((p) => ({ ...p, form: error }));
      return;
    }
    navigate('/dashboard');
  };

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your personalized learning journey today."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent-600 hover:text-accent-700 transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-danger-600">
            {errors.form}
          </div>
        )}

        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Alex Carter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
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
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <div>
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) setErrors((p) => ({ ...p, agree: undefined }));
              }}
            />
            <span className="mt-0.5 w-4 h-4 rounded border border-base-600 bg-white peer-checked:bg-accent-600 peer-checked:border-accent-600 peer-focus:ring-2 peer-focus:ring-accent-500/20 transition-colors flex items-center justify-center shrink-0">
              {agree && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="text-[13px] text-slate-600">
              I agree to the{' '}
              <a href="#" className="font-medium text-accent-600 hover:text-accent-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-accent-600 hover:text-accent-700">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.agree && (
            <p className="mt-1.5 text-xs text-danger-600">{errors.agree}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
