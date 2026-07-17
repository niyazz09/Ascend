import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Check } from 'lucide-react';

const highlights = [
  'Adaptive roadmap tuned to your pace',
  'Quizzes that target your weak areas',
  'Mastery tracking across every topic',
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-slate-50 border-r border-base-600 relative overflow-hidden">
        <div className="flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-semibold text-slate-900 tracking-tight">
              Ascend
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.1]">
              Learn smarter, rise faster.
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 leading-relaxed">
              A personalized learning platform that maps your path, probes your
              understanding, and keeps you climbing — one focused step at a time.
            </p>

            <ul className="mt-8 space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent-700" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Ascend. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 h-14 border-b border-base-600">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
              Ascend
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-8 pt-6 border-t border-base-600 text-center text-[13px] text-slate-500">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
