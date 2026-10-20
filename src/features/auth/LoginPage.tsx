import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { UserRole } from '@/types';
import { PROTOTYPE_USERS, ROLE_CONFIGS } from '@/config/roles';
import { getStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pickaxe,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Server,
  Sparkles,
  Info,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid enterprise email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['owner', 'engineer', 'geologist', 'investor'] as const),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role: activeRole } = useAuthRole();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to active role home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(ROLE_CONFIGS[activeRole].homePath, { replace: true });
    }
  }, [isAuthenticated, activeRole, navigate]);

  const rememberedEmail = getStoredItem<string>(
    STORAGE_KEYS.REMEMBERED_EMAIL,
    PROTOTYPE_USERS.owner.email
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: 'demo-password-2026',
      role: 'owner',
      rememberMe: true,
    },
  });

  const selectedRole = watch('role');

  const onQuickSelectRole = (r: UserRole) => {
    setValue('role', r);
    setValue('email', PROTOTYPE_USERS[r].email);
  };

  const onSubmit = (data: LoginFormData) => {
    setIsSubmitting(true);
    login(data.role, data.email, data.rememberMe);
  };

  const handleInstantQuickLogin = (r: UserRole) => {
    setIsSubmitting(true);
    login(r, PROTOTYPE_USERS[r].email, true);
  };

  return (
    <div className="min-h-screen bg-[#0A1522] text-slate-100 flex flex-col justify-between selection:bg-copper-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-copper-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#14283F_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-500 to-copper-700 flex items-center justify-center text-white shadow-lg shadow-copper-900/40 border border-copper-400/40">
            <Pickaxe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-tight">Red Ridge Gold Project</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-copper-500/20 text-copper-300 border border-copper-400/30 rounded uppercase">
                Restricted Terminal
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">Mining Operations & Intelligence Platform (MROP)</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>JORC & ASIC Governance Compliant</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Platform Brief & Quick Persona Sign-In */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-copper-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-copper-400" />
                <span>Enterprise Authentication Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Secure Operational Intelligence for Gold Extraction & Processing
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Role-based telemetry, mechanical health monitoring, bench grade reconciliation, and AI-assisted operational pivot control for the Red Ridge Gold Project.
              </p>
            </div>

            {/* Quick One-Click Demonstrator Personas */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-copper-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Quick Persona Sign-In (Prototype Mode)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Direct Access</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select an operational role to instantly authenticate and load its dedicated dashboard:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(['owner', 'engineer', 'geologist', 'investor'] as const).map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const usr = PROTOTYPE_USERS[r];

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleInstantQuickLogin(r)}
                      disabled={isSubmitting}
                      className="group p-3 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-copper-500/80 transition-all text-left flex items-start gap-3 relative overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-lg bg-copper-600/20 border border-copper-500/40 text-copper-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-copper-600 group-hover:text-white transition-colors">
                        {usr.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white group-hover:text-copper-300 transition-colors truncate">
                            {cfg.label}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                            ENTER
                          </span>
                        </div>
                        <span className="text-[11px] text-copper-400 font-semibold block truncate">
                          {cfg.tagline}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          {usr.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Info Chips */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="block font-bold text-white text-sm">2.8 Mtpa</span>
                <span className="text-[10px] text-slate-400">Plant Throughput</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="block font-bold text-copper-400 text-sm">142 Days</span>
                <span className="text-[10px] text-slate-400">Zero LTI Streak</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="block font-bold text-emerald-400 text-sm">94.2%</span>
                <span className="text-[10px] text-slate-400">SAG Mill Availability</span>
              </div>
            </div>
          </div>

          {/* Right Column: Standard Credential Sign-In Form */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl border border-slate-800/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Lock className="w-4 h-4 text-copper-400" />
                  <span>Terminal Sign-In</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with authorized credentials or your assigned domain role.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Authorized Operational Role
                  </label>
                  <select
                    {...register('role')}
                    onChange={(e) => onQuickSelectRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-transparent transition-all"
                  >
                    <option value="owner">Owner — Executive Root Control</option>
                    <option value="engineer">Mine Engineer — Mechanical & Plant Level</option>
                    <option value="geologist">Geologist — Geological & Spatial Level</option>
                    <option value="investor">Investor — Corporate Governance & Macro Level</option>
                  </select>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="name@redridgemining.com.au"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Security Passcode / Key
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Demo: Any</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Enter operational passcode"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="rounded border-slate-700 bg-slate-800 text-copper-600 focus:ring-copper-500"
                    />
                    <span>Remember terminal identity</span>
                  </label>
                  <span className="text-copper-400 hover:text-copper-300 cursor-pointer text-[11px]">
                    MFA Token Help
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-copper-600 to-copper-500 hover:from-copper-500 hover:to-copper-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-copper-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Security Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Operations Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Prototype Note */}
              <div className="mt-5 p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-copper-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Prototype Access:</strong> Static mock credentials are enabled. Select any role above or click Sign In to proceed directly to the operational dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Security Badges */}
      <footer className="relative z-10 border-t border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit TLS End-to-End Encryption</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Defense-Grade SCADA Air-Gap Ready</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-copper-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-600 font-mono">
          MROP v1.4.2-PROTOTYPE • Red Ridge Gold Project
        </div>
      </footer>
    </div>
  );
};
