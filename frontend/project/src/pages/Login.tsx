import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, GraduationCap } from 'lucide-react';
import PasswordField, { TextField, Checkbox } from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setErrors((p) => ({ ...p, form: error }));
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-semibold text-slate-900 tracking-tight">
            Ascend
          </span>
        </Link>

        {/* Card */}
        <div className="card p-6 sm:p-7">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Continue your personalized learning journey.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {errors.form && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-danger-600">
                {errors.form}
              </div>
            )}
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
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-accent-600 hover:text-accent-700 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
