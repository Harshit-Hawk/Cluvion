// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, BookOpen, Building2,
  Zap, ArrowRight, CheckCircle2, Sparkles, Shield, ArrowLeft
} from 'lucide-react';

/* ──────────────────────────────────────────────
   FLOATING PARTICLE
────────────────────────────────────────────── */
function Particle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      className="absolute rounded-full bg-indigo-500/15 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 8 + 4, duration: Math.random() * 4 + 3, delay: Math.random() * 5,
}));

/* ──────────────────────────────────────────────
   DARK INPUT FIELD
────────────────────────────────────────────── */
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/30">{label}</label>
      <motion.div
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
          focused ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#0d0d14]' : ''
        }`}
      >
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={15} className={`transition-colors ${focused ? 'text-indigo-400' : 'text-white/25'}`} />
          </div>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-10 py-3.5 bg-white/[0.05] border border-white/10 text-white text-sm rounded-xl placeholder-white/20 focus:outline-none transition-all font-medium"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN LOGIN PAGE
════════════════════════════════════════════ */
const Login = () => {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Sign Up
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [college, setCollege] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup, user, role, sessionReady } = useAuth();
  const router = useRouter();
  const collegeDomain = typeof window !== 'undefined' ? (localStorage.getItem('college_domain') || '') : '';

  const checkDomain = (emailVal) => {
    if (!collegeDomain || collegeDomain === 'demo.edu') return true;
    return emailVal.trim().toLowerCase().endsWith('@' + collegeDomain);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!checkDomain(email)) {
      setError(`Please use your college email (@${collegeDomain})`);
      return;
    }
    try {
      setError(null);
      await login(email, password);
      window.location.href = '/';
    } catch {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!checkDomain(signUpEmail)) {
      setError(`Please use your college email (@${collegeDomain})`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await signup({ email: signUpEmail, password: signUpPassword, fullName, rollNo, college });
      setSignUpSuccess(true);
      setTimeout(() => router.push('/student'), 2200);
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const switchTab = (t) => { setTab(t); setError(null); };

  useEffect(() => {
    if (sessionReady && user && role) {
      if (role === 'admin' || role === 'super_admin' || role === 'college_admin') router.replace('/admin');
      else if (role === 'faculty') router.replace('/faculty');
      else if (role === 'club_head') router.replace('/head');
      else if (role === 'club_coordinator') router.replace('/coordinator');
      else router.replace('/student');
    }
  }, [user, role, sessionReady, router]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a0f]">

      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-gradient-to-br from-indigo-950 via-[#0d0a20] to-[#0a0a0f] flex-col items-center justify-center overflow-hidden px-14">
        {/* Particles */}
        {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,white 0,white 1px,transparent 1px,transparent 56px),repeating-linear-gradient(90deg,white 0,white 1px,transparent 1px,transparent 56px)' }} />
        {/* Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-10 max-w-sm">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <Zap size={30} className="text-white fill-white" />
          </motion.div>

          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-black tracking-tighter text-white leading-none"
            >
              {tab === 'signin' ? (
                <>Welcome<br /><span className="text-indigo-400">back.</span></>
              ) : (
                <>Join the<br /><span className="text-indigo-400">nexus.</span></>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-white/40 text-base leading-relaxed"
            >
              {tab === 'signin'
                ? 'Sign in to your campus portal and pick up exactly where you left off.'
                : 'Create your Cluvion account and unlock every club, event, and achievement on your campus.'}
            </motion.p>
          </div>

          {/* Feature checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: Shield, text: 'Domain-verified & secure' },
              { icon: Sparkles, text: 'Instant access to clubs & events' },
              { icon: CheckCircle2, text: 'Role-based dashboard on first login' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/45 font-medium">
                <Icon size={15} className="text-emerald-500 shrink-0" />
                {text}
              </div>
            ))}
          </motion.div>

          {/* Domain badge */}
          {collegeDomain && collegeDomain !== 'demo.edu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 self-start">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-white/60">@{collegeDomain}</span>
              <button onClick={() => router.push('/welcome')}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                Change
              </button>
            </motion.div>
          )}
        </div>

        <p className="absolute bottom-8 text-[11px] font-black uppercase tracking-[0.25em] text-white/10">
          Cluvion · Campus Operating System
        </p>
      </div>

      {/* ── RIGHT PANEL (Form) ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto"
      >
        {/* Glow (mobile) */}
        <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">Cluvion</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl">
            {['signin', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  tab === t ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-indigo-600/60 rounded-xl border border-indigo-500/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            ))}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-rose-400 font-medium flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {tab === 'signin' ? (
              /* ── SIGN IN ── */
              <motion.form
                key="signin"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <Field label="Email Address" icon={Mail} type="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder={`you@${collegeDomain || 'university.edu'}`}
                  required autoComplete="email" />
                <Field label="Password" icon={Lock} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />

                <motion.button
                  type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="group w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
                >
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <button type="button" onClick={() => switchTab('signup')}
                  className="w-full py-3.5 text-sm font-bold text-white/35 border border-white/[0.08] rounded-2xl hover:bg-white/5 hover:text-white/60 transition-all">
                  Don't have an account? <span className="text-indigo-400">Register here</span>
                </button>
              </motion.form>

            ) : (
              /* ── SIGN UP ── */
              <AnimatePresence mode="wait">
                {signUpSuccess ? (
                  /* Success state */
                  <motion.div
                    key="success"
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center py-10 gap-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                      className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 size={38} className="text-emerald-400" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">Account Created!</h3>
                      <p className="text-white/40 text-sm">Welcome to Cluvion, {fullName.split(' ')[0]}! Redirecting you in…</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-500"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Full Name" icon={User} value={fullName}
                        onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
                      <Field label="Email Address" icon={Mail} type="email" value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        placeholder={`you@${collegeDomain || 'university.edu'}`} required autoComplete="email" />
                      <Field label="Password" icon={Lock} type="password" value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="Create a strong password" required autoComplete="new-password" />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/[0.06]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Campus Details</span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Roll Number" icon={BookOpen} value={rollNo}
                        onChange={e => setRollNo(e.target.value)} placeholder="21CS1045" required />
                      <Field label="College" icon={Building2} value={college}
                        onChange={e => setCollege(e.target.value)} placeholder="MIT College" required />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                      className="group w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 mt-1"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account…
                        </>
                      ) : (
                        <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </motion.button>

                    <button type="button" onClick={() => switchTab('signin')}
                      className="w-full py-3.5 text-sm font-bold text-white/30 hover:text-white/60 transition-colors text-center">
                      Already have an account? <span className="text-indigo-400">Sign in</span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </AnimatePresence>

          {/* Back link */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            onClick={() => router.push('/welcome')}
            className="flex items-center gap-2 text-xs font-bold text-white/20 hover:text-white/50 transition-colors mx-auto"
          >
            <ArrowLeft size={13} /> Back to campus selection
          </motion.button>

          {/* Security line */}
          <p className="text-center text-[10px] text-white/15 font-medium">
            🔒 Secured with domain verification. Your data is private.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
