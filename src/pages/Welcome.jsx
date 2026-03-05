import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Globe, ArrowRight, Zap, CheckCircle2, Users, Calendar, Award, Sparkles } from 'lucide-react';

/* ── Floating particle dot ───────────────────────────────── */
function Particle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      className="absolute rounded-full bg-indigo-500/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{
        y: [0, -40, 0],
        opacity: [0, 0.6, 0],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 10 + 4,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 5,
}));

/* ── Floating feature pill ─────────────────────────────── */
function FloatingPill({ icon: Icon, text, className, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
      }}
      className={`absolute flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl ${className}`}
    >
      <Icon size={14} className="text-indigo-300 shrink-0" />
      {text}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
const Welcome = () => {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Mouse parallax for left panel
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const blobX = useSpring(useTransform(mx, [0, 1], ['-6%', '6%']), { stiffness: 50, damping: 20 });
  const blobY = useSpring(useTransform(my, [0, 1], ['-6%', '6%']), { stiffness: 50, damping: 20 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - left) / width);
    my.set((e.clientY - top) / height);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    const trimmed = domain.trim().toLowerCase();
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

    if (!trimmed) {
      setError('Please enter your college domain.');
      return;
    }
    if (!domainRegex.test(trimmed)) {
      setError('Please enter a valid domain like gateway.edu.in');
      return;
    }

    setSubmitted(true);
    localStorage.setItem('college_domain', trimmed);
    setTimeout(() => navigate('/login'), 600);
  };

  // Stagger items
  const stagger = (i) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] } });

  return (
    <div
      className="min-h-screen flex overflow-hidden bg-[#07070a]"
      onMouseMove={handleMouseMove}
    >
      {/* ── LEFT PANEL (Brand / Visual) ─────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-gradient-to-br from-indigo-950 via-[#0d0a1f] to-[#07070a] flex-col items-center justify-center overflow-hidden">

        {/* Animated particles */}
        {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

        {/* Radial blob */}
        <motion.div style={{ x: blobX, y: blobY }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[100px]" />
        </motion.div>

        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,white 0,white 1px,transparent 1px,transparent 56px),repeating-linear-gradient(90deg,white 0,white 1px,transparent 1px,transparent 56px)' }}
        />

        {/* Floating pills */}
        <FloatingPill icon={Users} text="Club Management" className="top-[18%] left-[12%]" delay={0.6} />
        <FloatingPill icon={Calendar} text="Event Timelines" className="top-[30%] right-[8%]" delay={1.0} />
        <FloatingPill icon={Award} text="Achievement Engine" className="bottom-[28%] left-[10%]" delay={1.4} />
        <FloatingPill icon={Sparkles} text="Live Leaderboard" className="bottom-[18%] right-[12%]" delay={1.8} />

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 gap-8 max-w-md">
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <Zap size={36} className="text-white fill-white" />
          </motion.div>

          <motion.div {...stagger(1)} className="space-y-3">
            <h1 className="text-6xl font-black tracking-tighter text-white leading-none">CLUVION</h1>
            <p className="text-white/40 font-medium text-base leading-relaxed">
              The campus operating system. Connect your institution, manage clubs, and track every achievement.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div {...stagger(2)} className="flex flex-col gap-3 w-full text-left">
            {[
              'Domain-verified campus accounts',
              'Role-based dashboards (Student, Club Head, Admin)',
              'Real-time events and club feeds',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/50 font-medium">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 text-[11px] font-black uppercase tracking-[0.25em] text-white/15"
        >
          Your campus. Connected.
        </motion.p>
      </div>

      {/* ── RIGHT PANEL (Form) ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      >
        {/* Subtle background glow for mobile */}
        <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Cluvion</span>
          </div>

          {/* Header */}
          <motion.div {...stagger(0)} className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-white">
              Select your campus
            </h2>
            <p className="text-white/40 text-base leading-relaxed">
              Enter your institution's email domain to access your campus portal. We'll verify and connect you automatically.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.form
            {...stagger(1)}
            onSubmit={handleProceed}
            className="space-y-5"
          >
            {/* Domain input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-white/30">
                College Email Domain
              </label>

              <motion.div
                animate={focused ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  focused
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#07070a]'
                    : error
                    ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#07070a]'
                    : ''
                }`}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-indigo-400 pointer-events-none select-none z-10">
                  @
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={domain}
                  onChange={(e) => { setDomain(e.target.value); setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="gateway.edu.in"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 text-white text-base rounded-2xl placeholder-white/20 focus:outline-none transition-all font-medium"
                />
              </motion.div>

              {/* Example hint */}
              <AnimatePresence>
                {!error && !domain && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-white/25 font-medium pl-1"
                  >
                    e.g. <span className="text-indigo-400 font-bold">gateway.edu.in</span> or <span className="text-indigo-400 font-bold">mit.ac.in</span>
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-rose-400 font-bold pl-1 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={submitted ? { scale: [1, 0.96, 1.04, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="group w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {submitted ? 'Redirecting...' : 'Continue to Campus'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div {...stagger(2)} className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-white/20 font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </motion.div>

          {/* Back to landing */}
          <motion.div {...stagger(3)} className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 text-sm font-bold text-white/40 border border-white/[0.08] rounded-2xl hover:bg-white/5 hover:text-white/70 transition-all"
            >
              ← Back to Cluvion home
            </button>
          </motion.div>

          {/* Security note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-[11px] text-white/15 font-medium leading-relaxed"
          >
            🔒 Your domain is verified locally and never shared. <br />
            Only email addresses from this domain can register.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
