import { useState, useEffect, useRef } from 'react';
import {
    motion,
    useInView,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useMotionValueEvent,
    AnimatePresence,
} from 'framer-motion';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import {
    ArrowRight,
    Moon,
    Sun,
    Shield,
    Eye,
    Zap,
    TrendingUp,
    Bot,
    Layers,
    Sparkles,
    BarChart3,
    User,
    Plus,
    ChevronRight,
    Play,
    ArrowLeft,
    MoreVertical,
    SlidersHorizontal,
    Mail,
    CheckCircle,
    Loader2,
    Download,
    Menu,
    X,
    Lock,
    Wallet,
} from 'lucide-react';

const APK_DOWNLOAD_URL = 'https://github.com/Immadominion/aura-the-app/releases/latest/download/app-release.apk';

const TAWK_TO_URL = 'https://embed.tawk.to/68c3692a2d363c192cbaaea5/1j4tl5k2i';

/* ─────────────────────────────────────────────
   Scroll-triggered fade-in with slide direction
   ───────────────────────────────────────────── */
function Reveal({
    children,
    className = '',
    delay = 0,
    direction = 'up',
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'left' | 'right' | 'none';
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const variants: Record<string, { opacity: number; x?: number; y?: number }> = {
        up: { opacity: 0, y: 48 },
        left: { opacity: 0, x: -48 },
        right: { opacity: 0, x: 48 },
        none: { opacity: 0 },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={variants[direction]}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Animated counter
   ───────────────────────────────────────────── */
function Counter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (inView) motionVal.set(value);
    }, [inView, value, motionVal]);

    useMotionValueEvent(spring, 'change', (v) => {
        setDisplay(Math.round(v).toString());
    });

    return (
        <span ref={ref}>
            {prefix}{display}{suffix}
        </span>
    );
}

/* ─────────────────────────────────────────────
   Premium Glass Sphere (decorative)
   ───────────────────────────────────────────── */
function MockGlassSphere({ size = 48, className = '' }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="50" cy="50" r="48" fill="url(#glass-gradient)" fillOpacity="0.4" stroke="url(#glass-border)" strokeWidth="1.5" />
            <ellipse cx="40" cy="30" rx="15" ry="10" transform="rotate(-30 40 30)" fill="white" fillOpacity="0.8" filter="blur(4px)" />
            <path d="M 20 50 A 30 30 0 0 0 80 50" stroke="white" strokeWidth="2" strokeOpacity="0.3" fill="none" filter="blur(2px)" />
            <defs>
                <linearGradient id="glass-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0.8" />
                    <stop offset="0.5" stopColor="var(--accent)" stopOpacity="0.2" />
                    <stop offset="1" stopColor="white" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="glass-border" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0.8" />
                    <stop offset="1" stopColor="white" stopOpacity="0.2" />
                </linearGradient>
            </defs>
        </svg>
    )
}

/* ─────────────────────────────────────────────
   Floating gradient orbs (background decoration)
   ───────────────────────────────────────────── */
function GradientOrbs() {
    return (
        <div className="gradient-orbs" aria-hidden="true">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
        </div>
    );
}

/* ─────────────────────────────────────────────
   Waitlist email form (click-to-expand)
   ───────────────────────────────────────────── */
function WaitlistForm({ label, className = '' }: { label: string; className?: string }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || status === 'loading') return;

        setStatus('loading');
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage(data.message || "You're on the list!");
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    // Success state
    if (status === 'success') {
        return (
            <motion.div
                className={`waitlist-success ${className}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                <CheckCircle size={18} />
                <span>{message}</span>
            </motion.div>
        );
    }

    // Collapsed: show original button
    if (!open) {
        return (
            <motion.button
                className={`btn btn-primary btn-glow ${className}`}
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 350);
                }}
                layoutId={`waitlist-${label}`}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
                {label} <ArrowRight size={16} />
            </motion.button>
        );
    }

    // Expanded: show email form
    return (
        <motion.form
            className={`waitlist-form ${className}`}
            onSubmit={handleSubmit}
            layoutId={`waitlist-${label}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="waitlist-input-wrap">
                <Mail size={16} className="waitlist-icon" />
                <input
                    ref={inputRef}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') { setOpen(false); setEmail(''); setStatus('idle'); }
                    }}
                    required
                    className="waitlist-input"
                />
                <button
                    type="submit"
                    className="btn btn-primary waitlist-btn"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? (
                        <Loader2 size={16} className="spin" />
                    ) : (
                        <>Go <ArrowRight size={14} /></>
                    )}
                </button>
            </div>
            {status === 'error' && (
                <motion.p
                    className="waitlist-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message}
                </motion.p>
            )}
        </motion.form>
    );
}

/* ─────────────────────────────────────────────
   Rive Robot (reusable)
   ───────────────────────────────────────────── */
function RiveRobot({ src = '/fly-agent.riv', className = '' }: { src?: string; className?: string }) {
    const { RiveComponent } = useRive({
        src,
        autoplay: true,
        stateMachines: src.includes('no-agent') ? 'State Machine 1' : 'Motion',
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    });
    return (
        <div className={`rive-wrapper ${className}`}>
            <RiveComponent />
        </div>
    );
}

/* ─────────────────────────────────────────────
   Phone Screens (pixel-accurate to Flutter app)
   ───────────────────────────────────────────── */
function AutomateScreen() {
    return (
        <div className="app-screen">
            <div className="app-header-icons">
                <Layers size={18} className="app-icon active" />
                <Sparkles size={18} className="app-icon" />
                <BarChart3 size={18} className="app-icon" />
                <User size={18} className="app-icon ml-auto" />
            </div>
            <div className="app-body">
                <span className="app-label">AUTOMATE</span>
                <div className="app-balance">
                    <span className="app-balance-val">+12</span>
                    <span className="app-balance-dec">.47 SOL</span>
                </div>
                <span className="app-sub">3 running · 847 trades total</span>
                <div className="app-stats">
                    <div className="app-stat">
                        <span className="app-stat-val">847</span>
                        <span className="app-stat-lbl">Trades</span>
                    </div>
                    <div className="app-stat">
                        <span className="app-stat-val">73%</span>
                        <span className="app-stat-lbl">Win Rate</span>
                    </div>
                    <div className="app-stat">
                        <span className="app-stat-val">3</span>
                        <span className="app-stat-lbl">Bots</span>
                    </div>
                </div>
                <div className="app-banner">
                    <div className="app-banner-content">
                        <h4>Fleet Leaderboard</h4>
                        <p>See how your bots rank against the platform.</p>
                    </div>
                </div>
                <div className="app-bots-section mt-4">
                    <span className="app-label">BOTS</span>
                    <div className="app-bot-item">
                        <div className="app-bot-left">
                            <span className="app-dot green" />
                            <div className="app-bot-info">
                                <h5>Alpha Hunter</h5>
                                <p>Running · 2h ago · 312 scans</p>
                            </div>
                        </div>
                        <div className="app-bot-right">
                            <span className="app-bot-pnl profit">+4.82 SOL</span>
                            <ChevronRight size={14} className="app-icon-muted" />
                        </div>
                    </div>
                    <div className="app-bot-item">
                        <div className="app-bot-left">
                            <span className="app-dot green" />
                            <div className="app-bot-info">
                                <h5>Dip Buyer</h5>
                                <p>Running · 5h ago · 128 scans</p>
                            </div>
                        </div>
                        <div className="app-bot-right">
                            <span className="app-bot-pnl profit">+7.65 SOL</span>
                            <ChevronRight size={14} className="app-icon-muted" />
                        </div>
                    </div>
                </div>
                <div className="app-bottom-action">
                    <button className="app-btn-primary">
                        <Plus size={16} /> New Strategy
                    </button>
                </div>
            </div>
        </div>
    );
}

function MonitorScreen() {
    return (
        <div className="app-screen">
            <div className="app-header-nav">
                <ArrowLeft size={20} className="app-icon" />
                <div className="app-nav-actions ml-auto">
                    <div className="app-icon-circ"><Play size={14} className="text-profit" /></div>
                    <MoreVertical size={18} className="app-icon" />
                </div>
            </div>
            <div className="app-body">
                <div className="app-title-row">
                    <div>
                        <div className="app-status-badge running">
                            <span className="app-dot green" /> Running
                        </div>
                        <h2 className="app-title-lg">Alpha Hunter</h2>
                        <span className="app-sub text-md">live · 0.5 SOL per position</span>
                    </div>
                    <div className="app-tag-badge">Aura AI</div>
                </div>
                <div className="mt-4">
                    <span className="app-label">NET P&L</span>
                    <div className="app-balance text-profit mt-1">
                        <span className="app-balance-val">+4.8200 SOL</span>
                    </div>
                    <span className="app-sub">312 trades · 73% win rate</span>
                </div>
                <div className="app-params-section mt-6">
                    <span className="app-label">PARAMETERS</span>
                    <div className="app-param-list mt-2">
                        <div className="app-param-row">
                            <span className="app-param-lbl">Entry Threshold</span>
                            <span className="app-param-val">150%</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Position Size</span>
                            <span className="app-param-val">0.5 SOL</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Max Concurrent</span>
                            <span className="app-param-val">5</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Cooldown</span>
                            <span className="app-param-val">79 min</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Stop Loss</span>
                            <span className="app-param-val">-10.0%</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Profit Target</span>
                            <span className="app-param-val">+25.0%</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Max Hold Time</span>
                            <span className="app-param-val">360 min</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Scan Interval</span>
                            <span className="app-param-val">30s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main App
   ───────────────────────────────────────────── */
export default function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [heroPhone, setHeroPhone] = useState<'automate' | 'monitor'>('automate');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Parallax refs
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroParallax = useTransform(heroProgress, [0, 1], [0, -120]);
    const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
    const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Auto-switch hero phone every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroPhone(prev => prev === 'automate' ? 'monitor' : 'automate');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page">
            {/* ═══ NAV ═══ */}
            <header className="nav">
                <div className="nav-inner container">
                    <a href="#" className="logo">
                        <img src="/sage-logo.png" alt="Aura" className="logo-img" />
                        <span>Aura</span>
                    </a>
                    <nav className="nav-links">
                        <a href="#story">Why Aura</a>
                        <a href="#how">How it works</a>
                        <a href="#security">Security</a>
                        <a href="/whitepaper">Whitepaper</a>
                    </nav>
                    <div className="nav-right">
                        <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <a href={APK_DOWNLOAD_URL} className="btn btn-outline btn-sm nav-download" download>
                            <Download size={14} /> Download
                        </a>
                        <a href="#cta" className="btn btn-primary btn-sm nav-cta">Get early access</a>
                    </div>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="mobile-menu"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <nav className="mobile-menu-links">
                                <a href="#story" onClick={() => setMobileMenuOpen(false)}>Why Aura</a>
                                <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                                <a href="#security" onClick={() => setMobileMenuOpen(false)}>Security</a>
                                <a href="/whitepaper" onClick={() => setMobileMenuOpen(false)}>Whitepaper</a>
                            </nav>
                            <div className="mobile-menu-actions">
                                <a href={APK_DOWNLOAD_URL} className="btn btn-outline" download>
                                    <Download size={16} /> Download APK
                                </a>
                                <a href="#cta" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                    Get early access <ArrowRight size={16} />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main>
                {/* ═══════════════════════════════════════
                    SECTION 1 — HERO
                    ═══════════════════════════════════════ */}
                <section className="hero" ref={heroRef}>
                    <div className="hero-bg-grid" />
                    <GradientOrbs />
                    <motion.div
                        className="floating-orb"
                        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'absolute', top: '20%', left: '15%', zIndex: 0, filter: 'blur(4px)', opacity: 0.8 }}
                    >
                        <MockGlassSphere size={48} />
                    </motion.div>
                    <motion.div
                        className="floating-orb"
                        animate={{ y: [0, 20, 0], x: [0, -15, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{ position: 'absolute', bottom: '25%', right: '10%', zIndex: 0, filter: 'blur(6px)', opacity: 0.6 }}
                    >
                        <MockGlassSphere size={64} />
                    </motion.div>
                    <div className="container hero-layout">
                        <motion.div
                            className="hero-text"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.span
                                className="badge"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                Now in early access
                            </motion.span>
                            <h1>
                                Let AI trade<br />
                                for you on <span className="text-gradient">Solana.</span>
                            </h1>
                            <p className="hero-sub">
                                Aura gives you AI-powered trading bots that find opportunities,
                                enter positions, and manage risk — all from your phone.
                                You stay in control. The AI does the work.
                            </p>
                            <motion.div
                                className="hero-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <WaitlistForm label="Start trading smarter" />
                                <a href={APK_DOWNLOAD_URL} className="btn btn-outline" download>
                                    <Download size={16} /> Download for Android
                                </a>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="hero-visual"
                            style={{ y: heroParallax, scale: heroScale, opacity: heroOpacity }}
                        >
                            <motion.div
                                className="phone phone-hero"
                                initial={{ opacity: 0, y: 60, rotateY: -8 }}
                                animate={{
                                    opacity: 1,
                                    y: [0, -15, 0],
                                    rotateY: 0
                                }}
                                transition={{
                                    opacity: { duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
                                    y: { duration: 6, ease: "easeInOut", repeat: Infinity },
                                    rotateY: { duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={heroPhone}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.4 }}
                                        style={{ height: '100%' }}
                                    >
                                        {heroPhone === 'automate' ? <AutomateScreen /> : <MonitorScreen />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                            <div className="phone-glow" />
                        </motion.div>
                    </div>
                    <div className="hero-scroll-hint">
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 2 — THE PROBLEM (with Rive robot)
                    ═══════════════════════════════════════ */}
                <section className="section section-full" id="story">
                    <div className="container split-layout">
                        <Reveal className="split-text" direction="left">
                            <span className="eyebrow">THE PROBLEM</span>
                            <h2>You're missing trades while you sleep.</h2>
                            <p>
                                The best liquidity pool opportunities on Solana appear and
                                disappear in minutes. Manual trading means you're always late,
                                always watching charts, and always second-guessing.
                            </p>
                            <p>
                                What if an AI agent could watch the markets 24/7, spot the right
                                moments, and act — while you live your life?
                            </p>
                        </Reveal>
                        <Reveal className="split-visual" direction="right" delay={0.15}>
                            <RiveRobot src="/no-agent.riv" className="rive-large" />
                            <p className="visual-caption">Your agent, waiting to be deployed.</p>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 3 — THE SOLUTION (with Rive robot)
                    ═══════════════════════════════════════ */}
                <section className="section section-full section-alt">
                    <div className="container split-layout reverse">
                        <Reveal className="split-visual" direction="left" delay={0.15}>
                            <RiveRobot src="/fly-agent.riv" className="rive-large" />
                            <p className="visual-caption">Your agent, actively trading.</p>
                        </Reveal>
                        <Reveal className="split-text" direction="right">
                            <span className="eyebrow">THE SOLUTION</span>
                            <h2>An AI agent that trades like the best — for you.</h2>
                            <p>
                                Aura's ML model is trained on the strategies of top-performing
                                Solana traders. It scans thousands of liquidity pools every 30 seconds,
                                finds high-confidence opportunities, and enters positions automatically.
                            </p>
                            <div className="feature-pills">
                                <span className="pill"><TrendingUp size={14} /> 73% win rate target</span>
                                <span className="pill"><Zap size={14} /> 30-second scan cycles</span>
                                <span className="pill"><Bot size={14} /> Runs 24/7</span>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 4 — HOW IT WORKS (steps)
                    ═══════════════════════════════════════ */}
                <section className="section section-full" id="how">
                    <div className="container">
                        <Reveal>
                            <div className="section-header centered">
                                <span className="eyebrow">HOW IT WORKS</span>
                                <h2>From zero to AI-powered trading in 3 steps.</h2>
                            </div>
                        </Reveal>
                        <div className="steps-grid">
                            {[
                                {
                                    num: '01',
                                    title: 'Sign in with your wallet',
                                    desc: 'Connect any Solana wallet to sign in. Fund your bot with exactly what you want to trade — withdraw anytime.',
                                    icon: SlidersHorizontal,
                                },
                                {
                                    num: '02',
                                    title: 'Set your rules',
                                    desc: 'Choose how much to invest per trade, your risk tolerance, and profit targets. The AI follows your rules, not its own.',
                                    icon: Bot,
                                },
                                {
                                    num: '03',
                                    title: 'Let the AI work',
                                    desc: 'Your bot scans the market, enters positions when confident, and exits automatically. Watch live from your phone.',
                                    icon: Sparkles,
                                },
                            ].map((step, i) => (
                                <Reveal key={step.num} delay={i * 0.15}>
                                    <div className="step-card">
                                        <span className="step-num">{step.num}</span>
                                        <step.icon size={28} className="step-icon" />
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>
                                        <div className="step-line" />
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 5 — APP PREVIEW (real phone)
                    ═══════════════════════════════════════ */}
                <section className="section section-full section-alt">
                    <div className="container">
                        <Reveal>
                            <div className="section-header centered">
                                <span className="eyebrow">THE APP</span>
                                <h2>Everything you need. Nothing you don't.</h2>
                                <p className="section-sub">
                                    Control your AI trading bots, monitor P&L, and adjust strategies
                                    — all from a single mobile screen.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="app-preview-layout">
                                <motion.div
                                    className="phone phone-large"
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    <AutomateScreen />
                                </motion.div>
                                <motion.div
                                    className="phone phone-large phone-offset"
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    <MonitorScreen />
                                </motion.div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 6 — METRICS STRIP
                    ═══════════════════════════════════════ */}
                <section className="metrics-strip">
                    <div className="container">
                        <div className="metrics-row">
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={73} suffix="%" /></span>
                                <span className="metric-label">Win Rate Target</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={30} suffix="s" /></span>
                                <span className="metric-label">Scan Interval</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value">24/7</span>
                                <span className="metric-label">Always Running</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={0} /></span>
                                <span className="metric-label">Private Keys Shared</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 7 — SECURITY
                    ═══════════════════════════════════════ */}
                <section className="section section-full" id="security">
                    <div className="container split-layout">
                        <Reveal className="split-text" direction="left">
                            <span className="eyebrow">SECURITY MODEL</span>
                            <h2>Your rules. Enforced by code.</h2>
                            <p>
                                Every bot runs in its own isolated wallet. You fund it with
                                exactly what you're willing to risk — and withdraw anytime.
                                The bot can only trade within the strict parameters you set.
                            </p>
                            <p>
                                Position sizes, stop losses, profit targets, max concurrent
                                positions — these aren't suggestions. They're hard limits the
                                engine enforces on every single trade.
                            </p>
                            <div className="trust-list">
                                <div className="trust-item">
                                    <Wallet size={18} />
                                    <div>
                                        <strong>Isolated bot wallets</strong>
                                        <span>Each bot has its own sandboxed wallet — your main wallet is never touched</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Lock size={18} />
                                    <div>
                                        <strong>Hard-coded risk limits</strong>
                                        <span>Max loss, position size, and exposure caps enforced every cycle</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Eye size={18} />
                                    <div>
                                        <strong>Full transparency</strong>
                                        <span>Every trade, every decision — logged and visible in real time</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Shield size={18} />
                                    <div>
                                        <strong>Withdraw anytime</strong>
                                        <span>Pull your funds back to any wallet instantly — zero lock-up</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal className="split-visual" direction="right" delay={0.15}>
                            <div className="security-visual">
                                <div className="security-card">
                                    <div className="security-card-header">
                                        <Lock size={20} />
                                        <span>Bot Execution Limits</span>
                                    </div>
                                    <div className="security-params">
                                        <div className="security-param">
                                            <span className="security-param-lbl">Max Position Size</span>
                                            <span className="security-param-val">0.5 SOL</span>
                                        </div>
                                        <div className="security-param">
                                            <span className="security-param-lbl">Max Concurrent</span>
                                            <span className="security-param-val">5</span>
                                        </div>
                                        <div className="security-param">
                                            <span className="security-param-lbl">Stop Loss</span>
                                            <span className="security-param-val loss">-10.0%</span>
                                        </div>
                                        <div className="security-param">
                                            <span className="security-param-lbl">Profit Target</span>
                                            <span className="security-param-val profit">+25.0%</span>
                                        </div>
                                        <div className="security-param">
                                            <span className="security-param-lbl">Wallet Isolation</span>
                                            <span className="security-param-val accent">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 8 — WHY SAGE (bento)
                    ═══════════════════════════════════════ */}
                <section className="section section-full section-alt">
                    <div className="container">
                        <Reveal>
                            <div className="section-header centered">
                                <span className="eyebrow">WHY AURA</span>
                                <h2>Not another trading dashboard.</h2>
                            </div>
                        </Reveal>
                        <div className="bento-grid">
                            <Reveal delay={0}>
                                <div className="bento-card bento-wide bento-hero-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">AI-FIRST</span>
                                        <h3>Trained on the best traders</h3>
                                        <p>
                                            Our ML model learned from wallets with 77% win rates.
                                            It doesn't guess — it recognizes patterns that humans miss.
                                        </p>
                                    </div>
                                    <div className="bento-metric">
                                        <span className="metric-big"><Counter value={77} suffix="%" /></span>
                                        <span className="metric-label">win rate from top wallets</span>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <div className="bento-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">MOBILE</span>
                                        <h3>Made for your phone</h3>
                                        <p>
                                            No desktop dashboards. No browser extensions.
                                            Full trading control from your pocket.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <div className="bento-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">TRANSPARENT</span>
                                        <h3>See everything</h3>
                                        <p>
                                            Every decision the AI makes is logged with reasoning.
                                            You always know why a trade was entered or exited.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <div className="bento-card bento-wide">
                                    <div className="bento-body">
                                        <span className="bento-tag">CONTROL</span>
                                        <h3>Your rules, strictly enforced</h3>
                                        <p>
                                            Set position sizes, stop losses, profit targets, and
                                            spending limits. These aren't suggestions — they're
                                            hard limits enforced on every single trade cycle.
                                        </p>
                                    </div>
                                    <div className="bento-metric">
                                        <span className="metric-big"><Counter value={100} suffix="%" /></span>
                                        <span className="metric-label">your control</span>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 9 — CTA
                    ═══════════════════════════════════════ */}
                <section className="section section-full cta-section" id="cta">
                    <div className="container">
                        <Reveal>
                            <div className="cta-card">
                                <div className="cta-glow" />
                                <h2>Ready to let AI trade for you?</h2>
                                <p>
                                    Join the early access and be among the first to deploy
                                    an AI trading agent on Solana.
                                </p>
                                <div className="cta-actions">
                                    <WaitlistForm label="Request early access" className="btn-lg" />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-brand">
                        <img src="/sage-logo.png" alt="Aura" className="logo-img" />
                        <span>Aura</span>
                    </div>
                    <div className="footer-links">
                        <a href="/whitepaper">Whitepaper</a>
                        <a href="https://x.com/useaura" target="_blank" rel="noopener noreferrer">@useaura</a>
                        <a href="mailto:hello@useaura.wtf">hello@useaura.wtf</a>
                    </div>
                    <span className="footer-note">AI-powered trading on Solana.</span>
                </div>
            </footer>

            {/* Tawk.to Support Chat Widget */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                        (function(){
                            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                            s1.async=true;
                            s1.src='${TAWK_TO_URL}';
                            s1.charset='UTF-8';
                            s1.setAttribute('crossorigin','*');
                            s0.parentNode.insertBefore(s1,s0);
                        })();
                    `,
                }}
            />
        </div>
    );
}
