import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { TextField } from '../components/auth/PasswordField';
import GoogleButton from '../components/auth/GoogleButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return false;
    }
    setError(undefined);
    return true;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We sent a password reset link to your inbox."
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
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-success-50 border border-success-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-success-600" />
          </div>
          <p className="mt-5 text-sm text-slate-600 leading-relaxed">
            We sent a reset link to
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{email}</p>
          <p className="mt-3 text-[13px] text-slate-500 leading-relaxed">
            Click the link in the email to reset your password. If you don't see
            it, check your spam folder.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
            className="mt-6 btn-secondary w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Try a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered your password?{' '}
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
        <GoogleButton label="Continue with Google" disabled />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-base-600" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">or</span>
          </div>
        </div>

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <Link to="/login" className="btn-ghost w-full">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
