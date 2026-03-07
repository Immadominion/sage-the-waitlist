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
    Clock,
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
    ExternalLink,
    Mail,
    CheckCircle,
    Loader2,
} from 'lucide-react';

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
   Waitlist email form
   ───────────────────────────────────────────── */
function WaitlistForm({ variant = 'default' }: { variant?: 'default' | 'hero' | 'cta' }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

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

    if (status === 'success') {
        return (
            <motion.div
                className={`waitlist-success ${variant}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <CheckCircle size={20} />
                <span>{message}</span>
            </motion.div>
        );
    }

    return (
        <form className={`waitlist-form ${variant}`} onSubmit={handleSubmit}>
            <div className="waitlist-input-wrap">
                <Mail size={16} className="waitlist-icon" />
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
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
                        <>{variant === 'cta' ? 'Join waitlist' : 'Get early access'} <ArrowRight size={14} /></>
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
            <p className="waitlist-note">No spam. Only product updates.</p>
        </form>
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
                    <div className="app-tag-badge">Sage AI</div>
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
                        <img src="/logo.png" alt="Sage" className="logo-img" />
                        <span>Sage</span>
                    </a>
                    <nav className="nav-links">
                        <a href="#story">Why Sage</a>
                        <a href="#how">How it works</a>
                        <a href="#security">Security</a>
                    </nav>
                    <div className="nav-right">
                        <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <a href="#cta" className="btn btn-primary btn-sm">Join waitlist</a>
                    </div>
                </div>
            </header>

            <main>
                {/* ═══════════════════════════════════════
                    SECTION 1 — HERO
                    ═══════════════════════════════════════ */}
                <section className="hero" ref={heroRef}>
                    <GradientOrbs />
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
                                Sage gives you AI-powered trading bots that find opportunities,
                                enter positions, and manage risk — all from your phone.
                                You stay in control. The AI does the work.
                            </p>
                            <motion.div
                                className="hero-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <WaitlistForm variant="hero" />
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="hero-visual"
                            style={{ y: heroParallax, scale: heroScale, opacity: heroOpacity }}
                        >
                            <motion.div
                                className="phone phone-hero"
                                initial={{ opacity: 0, y: 60, rotateY: -8 }}
                                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                                Sage's ML model is trained on the strategies of top-performing
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
                                    title: 'Connect your wallet',
                                    desc: 'Sign in with any Solana wallet. No deposits, no transfers. Your funds stay exactly where they are.',
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
                    SECTION 7 — SECURITY (Seal screenshot)
                    ═══════════════════════════════════════ */}
                <section className="section section-full" id="security">
                    <div className="container split-layout">
                        <Reveal className="split-text" direction="left">
                            <span className="eyebrow">YOUR KEYS. YOUR WALLET.</span>
                            <h2>You never hand over your private key.</h2>
                            <p>
                                Sage is built on <strong>Seal</strong> — an open-source smart wallet
                                infrastructure that lets AI agents trade on your behalf without ever
                                touching your private key.
                            </p>
                            <p>
                                Think of it like giving a valet your car key with a speed limit and
                                a geo-fence — they can drive, but only within your rules.
                            </p>
                            <div className="trust-list">
                                <div className="trust-item">
                                    <Shield size={18} />
                                    <div>
                                        <strong>Non-custodial</strong>
                                        <span>Your crypto never leaves your wallet</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Clock size={18} />
                                    <div>
                                        <strong>Time-limited sessions</strong>
                                        <span>Bot access expires automatically</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Eye size={18} />
                                    <div>
                                        <strong>Fully transparent</strong>
                                        <span>Every trade is logged and inspectable</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal className="split-visual" direction="right" delay={0.15}>
                            <div className="seal-screenshot-wrapper">
                                <div className="browser-chrome">
                                    <div className="browser-dots">
                                        <span /><span /><span />
                                    </div>
                                    <span className="browser-url">seal.scrolls.fun</span>
                                </div>
                                <img
                                    src="/seal-landing-page-ui.png"
                                    alt="Seal — Autonomous wallet infrastructure for Solana"
                                    className="seal-screenshot"
                                />
                            </div>
                            <a
                                href="https://seal.scrolls.fun"
                                className="seal-link"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Visit Seal <ExternalLink size={14} />
                            </a>
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
                                <span className="eyebrow">WHY SAGE</span>
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
                                        <h3>Your rules, enforced on-chain</h3>
                                        <p>
                                            Set position sizes, stop losses, profit targets, and
                                            spending limits. These aren't suggestions — they're
                                            enforced by the blockchain itself.
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
                                    Join the waitlist and be among the first to deploy
                                    an AI trading agent on Solana.
                                </p>
                                <div className="cta-actions">
                                    <WaitlistForm variant="cta" />
                                </div>
                                <p className="cta-count mt-2">Join 0+ traders on the waitlist</p>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-brand">
                        <img src="/logo.png" alt="Sage" className="logo-img" />
                        <span>Sage</span>
                    </div>
                    <span className="footer-note">AI-powered trading on Solana.</span>
                </div>
            </footer>
        </div>
    );
}
