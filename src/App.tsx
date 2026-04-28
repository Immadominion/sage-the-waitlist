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
    type MotionValue,
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
                    name="email"
                    autoComplete="email"
                    aria-label="Email address"
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
                <span className="app-sub">3 strategies live · Meteora DLMM focus</span>
                <div className="app-stats">
                    <div className="app-stat">
                        <span className="app-stat-val">50M+</span>
                        <span className="app-stat-lbl">Train Set</span>
                    </div>
                    <div className="app-stat">
                        <span className="app-stat-val">77%</span>
                        <span className="app-stat-lbl">Hit Rate</span>
                    </div>
                    <div className="app-stat">
                        <span className="app-stat-val">3</span>
                        <span className="app-stat-lbl">Modes</span>
                    </div>
                </div>
                <div className="app-banner">
                    <div className="app-banner-content">
                        <h4>Model Briefing</h4>
                        <p>Historical signals are flowing into live DLMM execution.</p>
                    </div>
                </div>
                <div className="app-bots-section mt-4">
                    <span className="app-label">AGENTS</span>
                    <div className="app-bot-item">
                        <div className="app-bot-left">
                            <span className="app-dot green" />
                            <div className="app-bot-info">
                                <h5>Rule Engine</h5>
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
                                <h5>Aura Delegate</h5>
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
                        <Plus size={16} /> New Agent
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
                        <h2 className="app-title-lg">DLMM Delegate</h2>
                        <span className="app-sub text-md">delegate · Meteora DLMM · 0.5 SOL risk</span>
                    </div>
                    <div className="app-tag-badge">Non-custodial</div>
                </div>
                <div className="mt-4">
                    <span className="app-label">NET P&L</span>
                    <div className="app-balance text-profit mt-1">
                        <span className="app-balance-val">+4.8200 SOL</span>
                    </div>
                    <span className="app-sub">312 trades · historical edge live</span>
                </div>
                <div className="app-params-section mt-6">
                    <span className="app-label">EXECUTION POLICY</span>
                    <div className="app-param-list mt-2">
                        <div className="app-param-row">
                            <span className="app-param-lbl">Market</span>
                            <span className="app-param-val">Meteora DLMM</span>
                        </div>
                        <div className="app-param-row">
                            <span className="app-param-lbl">Training Set</span>
                            <span className="app-param-val">50M+ txs</span>
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
                            <span className="app-param-lbl">Fee Model</span>
                            <span className="app-param-val">Active bin</span>
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
   HorizontalScreen — single item in the horizontal
   carousel. Each item translates and scales based on its
   distance from the focused index, which advances with scroll.
   ───────────────────────────────────────────── */
function HorizontalScreen({
    progress,
    index,
    count,
    children,
}: {
    progress: MotionValue<number>;
    index: number;
    count: number;
    children: React.ReactNode;
}) {
    const itemW = 340; // horizontal spacing between items
    // Focus starts at 1 (so item 0 sits to the LEFT of frame on load) and ends at count-1.
    // x = (index - focus) * itemW, where focus moves from 1 → count-1 with scroll.
    const x = useTransform(progress, (v: number) => (index - (1 + v * (count - 2))) * itemW);
    // As it gets closer to 0, scale approaches 1, otherwise it shrinks
    const rotateY = useTransform(x, [-2 * itemW, 0, 2 * itemW], [35, 0, -35]);
    const opacity = useTransform(x, [-2 * itemW, -0.2 * itemW, 0, 0.2 * itemW, 2 * itemW], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-2 * itemW, 0, 2 * itemW], [0.75, 1, 0.75]);
    const z = useTransform(x, (v: number) => -Math.abs(v) * 0.5);

    return (
        <motion.div
            className="horizontal-screen-item"
            style={{ x, rotateY, opacity, scale, z }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Proximity-only floating logo.
   Each instance reacts only when the cursor is within RADIUS px
   of its own bounding-box center — no global "everything moves" effect.
   ───────────────────────────────────────────── */
function ProximityFloater({
    src,
    alt,
    size,
    className = '',
    mouseX,
    mouseY,
    strength = 0.35,
    radius = 220,
    delay = 0,
    rotate = 0,
}: {
    src: string;
    alt: string;
    size: number;
    className?: string;
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
    strength?: number;
    radius?: number;
    delay?: number;
    rotate?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 140, damping: 18, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 140, damping: 18, mass: 0.4 });

    const update = () => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX.get() - cx;
        const dy = mouseY.get() - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > radius) {
            x.set(0);
            y.set(0);
        } else {
            const factor = (1 - dist / radius) * strength;
            x.set(dx * factor);
            y.set(dy * factor);
        }
    };

    useMotionValueEvent(mouseX, 'change', update);
    useMotionValueEvent(mouseY, 'change', update);

    return (
        <motion.div
            ref={ref}
            className={`floating-logo ${className}`}
            style={{ x: sx, y: sy, rotate }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.15, filter: 'brightness(1.1)' }}
            transition={{
                delay,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                scale: { type: 'spring', stiffness: 300, damping: 15 },
            }}
        >
            <img src={src} alt={alt} width={size} height={size} draggable={false} style={{ pointerEvents: 'none' }} />
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   ControlSurfaceMobilePhone — mobile-only single phone
   that cross-fades from AutomateScreen to MonitorScreen as
   the user scrolls past the section, then continues normally.
   ───────────────────────────────────────────── */
function ControlSurfaceMobilePhone() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 80%', 'start 20%'],
    });
    const automateOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);
    const monitorOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 1]);
    return (
        <div ref={ref} className="phone phone-large preview-mobile-only">
            <motion.div className="control-surface-screen-layer" style={{ opacity: automateOpacity }}>
                <AutomateScreen />
            </motion.div>
            <motion.div className="control-surface-screen-layer" style={{ opacity: monitorOpacity }}>
                <MonitorScreen />
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main App
   ───────────────────────────────────────────── */
export default function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>('light');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Page-wide scroll progress (top hairline bar)
    const { scrollYProgress: pageProgress } = useScroll();
    const pageProgressX = useSpring(pageProgress, { stiffness: 120, damping: 30, mass: 0.2 });

    // Hero parallax refs
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroParallax = useTransform(heroProgress, [0, 1], [0, -120]);
    const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
    const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

    // 3D rotation for the phone cluster on scroll
    const heroPhoneRotateX = useTransform(heroProgress, [0, 1], [15, -10]);
    const heroPhoneScale = useTransform(heroProgress, [0, 1], [1, 0.95]);

    // Raw viewport-relative cursor position (used by ProximityFloater).
    // Stored in motion values to avoid re-renders on every mousemove.
    const mouseX = useMotionValue(-9999);
    const mouseY = useMotionValue(-9999);
    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };
    const handleMouseLeave = () => {
        mouseX.set(-9999);
        mouseY.set(-9999);
    };

    // Horizontal scroll progress. We snap the underlying scroll progress to
    // discrete indices so that scrolling snaps visually to each phone frame.
    // There are 5 slides, meaning 4 steps (0, 0.25, 0.5, 0.75, 1).
    const snappedHeroProgress = useTransform(heroProgress, (v: number) => Math.round(v * 4) / 4);
    // Apply a spring to the snapped progress so the transitions between snaps are fluid and weighty
    const horizontalProgress = useSpring(snappedHeroProgress, { stiffness: 120, damping: 20, mass: 0.6 });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="page">
            <motion.div className="scroll-progress" style={{ scaleX: pageProgressX }} />
            {/* ═══ NAV ═══ */}
            <header className="nav">
                <div className="nav-inner container">
                    <a href="#" className="logo">
                        <img src="/sage-logo.png" alt="Aura" className="logo-img" />
                        <span>Aura</span>
                    </a>
                    <nav className="nav-links">
                        <a href="#proof">Proof</a>
                        <a href="#modes">Modes</a>
                        <a href="#security">Security</a>
                        <a href="/pitch">Pitch</a>
                        <a href="/whitepaper">Whitepaper</a>
                    </nav>
                    <div className="nav-right">
                        <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <a href={APK_DOWNLOAD_URL} className="btn btn-outline btn-sm nav-download" download>
                            <Download size={14} /> Download
                        </a>
                        <a href="#cta" className="btn btn-primary btn-sm nav-cta">Request access</a>
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
                                <a href="#proof" onClick={() => setMobileMenuOpen(false)}>Proof</a>
                                <a href="#modes" onClick={() => setMobileMenuOpen(false)}>Modes</a>
                                <a href="#security" onClick={() => setMobileMenuOpen(false)}>Security</a>
                                <a href="/pitch" onClick={() => setMobileMenuOpen(false)}>Pitch</a>
                                <a href="/whitepaper" onClick={() => setMobileMenuOpen(false)}>Whitepaper</a>
                            </nav>
                            <div className="mobile-menu-actions">
                                <a href={APK_DOWNLOAD_URL} className="btn btn-outline" download>
                                    <Download size={16} /> Download APK
                                </a>
                                <a href="#cta" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                    Request access <ArrowRight size={16} />
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
                <section className="hero" ref={heroRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                    <div className="hero-bg-grid" />
                    <div className="container hero-layout-center">
                        <motion.div
                            className="hero-text-center"
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
                                Android beta · early access
                            </motion.span>
                            <h1>
                                Your Meteora LP,<br />on autopilot.
                            </h1>
                            <p className="hero-sub">
                                Aura runs Meteora DLMM positions for you from a non-custodial Android app.<br />
                                Execute swaps through Jupiter, automate your own rules, or delegate LP timing to the model — keys never leave your wallet.
                            </p>
                            <motion.div
                                className="hero-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <a href="#cta" className="btn btn-primary">Request access</a>
                                <a href={APK_DOWNLOAD_URL} className="btn btn-outline" download>
                                    <Download size={16} /> Download
                                </a>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="hero-visual-center"
                            style={{ y: heroParallax, scale: heroScale, opacity: heroOpacity }}
                        >
                            {/* Floating protocol logos — proximity-only mouse parallax. */}
                            <ProximityFloater src="/jupiter.svg" alt="Jupiter" size={56} className="fl fl-1" mouseX={mouseX} mouseY={mouseY} delay={0.4} rotate={-8} />
                            <ProximityFloater src="/meteora.png" alt="Meteora" size={72} className="fl fl-2" mouseX={mouseX} mouseY={mouseY} delay={0.55} rotate={6} />
                            <ProximityFloater src="/pump.png" alt="Pump.fun" size={44} className="fl fl-3" mouseX={mouseX} mouseY={mouseY} delay={0.7} rotate={-4} />
                            <ProximityFloater src="/jupiter.svg" alt="" size={36} className="fl fl-4" mouseX={mouseX} mouseY={mouseY} delay={0.85} rotate={14} />
                            <ProximityFloater src="/pump.png" alt="" size={64} className="fl fl-5" mouseX={mouseX} mouseY={mouseY} delay={1.0} rotate={-10} />
                            <ProximityFloater src="/meteora.png" alt="" size={40} className="fl fl-6" mouseX={mouseX} mouseY={mouseY} delay={1.15} rotate={3} />

                            {/* Horizontal scrolling carousel of screens translating into the center phone frame. */}
                            <motion.div
                                className="hero-phones-cluster"
                                style={{ rotateX: heroPhoneRotateX, scale: heroPhoneScale }}
                            >
                                {/* Static phone shell */}
                                <div className="phone-empty-shell" />

                                {/* Scrolling screens that appear to slide inside/behind the phone shell */}
                                <div className="horizontal-screens-container" aria-hidden>
                                    {[
                                        <MonitorScreen key="m1" />,
                                        <AutomateScreen key="a1" />,
                                        <MonitorScreen key="m2" />,
                                        <AutomateScreen key="a2" />,
                                        <MonitorScreen key="m3" />,
                                    ].map((screen, i, arr) => (
                                        <HorizontalScreen key={i} progress={horizontalProgress} index={i} count={arr.length}>
                                            {screen}
                                        </HorizontalScreen>
                                    ))}
                                </div>
                                <div className="phone-glow-center" />
                            </motion.div>
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
                <section className="section section-full" id="proof">
                    <div className="container split-layout">
                        <Reveal className="split-text" direction="left">
                            <span className="eyebrow">THE GAP</span>
                            <h2>Live APIs show the pool. They do not show the edge.</h2>
                            <p>
                                Most crypto automation only sees current liquidity, price,
                                and volume. Meteora DLMM rewards LPs for being in the right
                                bin before fees concentrate. That is a historical pattern
                                problem, not a dashboard problem.
                            </p>
                            <p>
                                Manual traders are late. API-only agents have no memory.
                                The advantage comes from reconstructing how positions actually
                                behaved across millions of past transactions and deploying that
                                insight into execution.
                            </p>
                        </Reveal>
                        <Reveal className="split-visual" direction="right" delay={0.15}>
                            <RiveRobot src="/no-agent.riv" className="rive-large" />
                            <p className="visual-caption">What most bots see: current pool state, without historical memory.</p>
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
                            <p className="visual-caption">What Aura adds: learned history, constrained execution, mobile control.</p>
                        </Reveal>
                        <Reveal className="split-text" direction="right">
                            <span className="eyebrow">THE MOAT</span>
                            <h2>Aura built the missing data and execution stack first.</h2>
                            <p>
                                Aura extracted 244 TB of Old Faithful archives, decoded 50M+
                                Meteora DLMM transactions into structured training data, trained
                                on real LP outcomes, and wired the result into a non-custodial
                                mobile execution engine. The current benchmark is a 77% win rate
                                across 12,635 real Meteora positions.
                            </p>
                            <div className="feature-pills">
                                <span className="pill"><TrendingUp size={14} /> 77% historical win rate</span>
                                <span className="pill"><Zap size={14} /> 30-second scan cadence</span>
                                <span className="pill"><Bot size={14} /> 25 decoded DLMM event types</span>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    SECTION 4 — HOW IT WORKS (steps)
                    ═══════════════════════════════════════ */}
                <section className="section section-full" id="modes">
                    <div className="container">
                        <Reveal>
                            <div className="section-header centered">
                                <span className="eyebrow">THREE MODES</span>
                                <h2>One system, three levels of control.</h2>
                                <p className="section-sub">
                                    Start with direct execution, add rule-based automation,
                                    or hand Meteora LP timing to the model.
                                </p>
                            </div>
                        </Reveal>
                        <div className="steps-grid">
                            {[
                                {
                                    num: '01',
                                    title: 'Execute',
                                    desc: 'Route swaps through Jupiter when you want direct control and instant mobile execution.',
                                    icon: Zap,
                                },
                                {
                                    num: '02',
                                    title: 'Automate',
                                    desc: 'Define entries, exits, sizing, and risk. Aura watches the market and acts inside your limits.',
                                    icon: SlidersHorizontal,
                                },
                                {
                                    num: '03',
                                    title: 'Delegate',
                                    desc: 'Let the model handle Meteora DLMM timing while you keep custody, visibility, and the ability to stop anytime.',
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
                                <span className="eyebrow">THE CONTROL SURFACE</span>
                                <h2>One mobile interface for execute, automate, and delegate.</h2>
                                <p className="section-sub">
                                    Check P&amp;L, inspect parameters, pause exposure, and move
                                    capital without living in a browser dashboard or terminal.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="app-preview-layout">
                                {/* Desktop: two phones side-by-side */}
                                <motion.div
                                    className="phone phone-large preview-desktop-only"
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    <AutomateScreen />
                                </motion.div>
                                <motion.div
                                    className="phone phone-large phone-offset preview-desktop-only"
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    <MonitorScreen />
                                </motion.div>
                                {/* Mobile: single phone, scroll cross-fades Automate -> Monitor */}
                                <ControlSurfaceMobilePhone />
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
                                <span className="metric-value"><Counter value={50} suffix="M+" /></span>
                                <span className="metric-label">decoded DLMM transactions</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={244} suffix=" TB" /></span>
                                <span className="metric-label">Old Faithful archive processed</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={77} suffix="%" /></span>
                                <span className="metric-label">historical win rate proof</span>
                            </div>
                            <div className="metric-divider" />
                            <div className="metric-item">
                                <span className="metric-value"><Counter value={0} /></span>
                                <span className="metric-label">user wallet keys shared</span>
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
                            <h2>Non-custodial by design. Constrained in code.</h2>
                            <p>
                                Aura uses Solana Mobile Wallet Adapter for user authorization.
                                Your main wallet signs setup and funding. It is never handed to
                                the backend for day-to-day execution.
                            </p>
                            <p>
                                Each agent gets its own encrypted keypair, isolated wallet,
                                withdrawal whitelist, and enforced limits on position size,
                                stop loss, exposure, and concurrency.
                            </p>
                            <div className="trust-list">
                                <div className="trust-item">
                                    <Wallet size={18} />
                                    <div>
                                        <strong>Wallet-first authorization</strong>
                                        <span>Sign in and approve funding from your own Solana wallet.</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Lock size={18} />
                                    <div>
                                        <strong>Per-agent encrypted keys</strong>
                                        <span>Each bot keypair is AES-256-GCM encrypted and isolated from every other agent.</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Eye size={18} />
                                    <div>
                                        <strong>Withdrawal whitelist</strong>
                                        <span>Funds return only to the wallet you authenticated with.</span>
                                    </div>
                                </div>
                                <div className="trust-item">
                                    <Shield size={18} />
                                    <div>
                                        <strong>Kill switch and full logs</strong>
                                        <span>Pause the agent instantly and inspect every trade decision in real time.</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal className="split-visual" direction="right" delay={0.15}>
                            <div className="security-visual">
                                <div className="security-card">
                                    <div className="security-card-header">
                                        <Lock size={20} />
                                        <span>Agent Guardrails</span>
                                    </div>
                                    <div className="security-params">
                                        <div className="security-param">
                                            <span className="security-param-lbl">Wallet Model</span>
                                            <span className="security-param-val accent">Isolated</span>
                                        </div>
                                        <div className="security-param">
                                            <span className="security-param-lbl">Key Storage</span>
                                            <span className="security-param-val">Encrypted</span>
                                        </div>
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
                                            <span className="security-param-lbl">Withdrawal</span>
                                            <span className="security-param-val">Whitelisted</span>
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
                                <h2>The moat is the pipeline, not the prompt.</h2>
                            </div>
                        </Reveal>
                        <div className="bento-grid">
                            <Reveal delay={0}>
                                <div className="bento-card bento-wide bento-hero-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">DATA</span>
                                        <h3>50M+ decoded transactions, not live API snapshots</h3>
                                        <p>
                                            Old Faithful gave Aura access to Solana's buried history.
                                            We reconstructed Meteora DLMM activity event by event and
                                            turned it into ML-ready training data.
                                        </p>
                                    </div>
                                    <div className="bento-metric">
                                        <span className="metric-big"><Counter value={50} suffix="M+" /></span>
                                        <span className="metric-label">decoded DLMM transactions</span>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <div className="bento-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">MODEL</span>
                                        <h3>Trained on real LP outcomes</h3>
                                        <p>
                                            The model is built on position lifecycles, fee behavior,
                                            and bin movement. Not prompts. Not copy trading.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <div className="bento-card">
                                    <div className="bento-body">
                                        <span className="bento-tag">EXECUTION</span>
                                        <h3>Live engine with hard guardrails</h3>
                                        <p>
                                            Aura wraps a real LP execution engine with sub-minute
                                            scans, isolated agent wallets, and strict risk limits.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <div className="bento-card bento-wide">
                                    <div className="bento-body">
                                        <span className="bento-tag">MOBILE</span>
                                        <h3>One phone surface from swap to delegation</h3>
                                        <p>
                                            Execute through Jupiter, automate rules, or delegate
                                            Meteora timing from the same Android app using Solana MWA.
                                        </p>
                                    </div>
                                    <div className="bento-metric">
                                        <span className="metric-big"><Counter value={3} /></span>
                                        <span className="metric-label">capital control modes</span>
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
                                <h2>See the execution layer before everyone else.</h2>
                                <p>
                                    Early access is open for the Android beta. If you want the
                                    product that sits between raw Solana infra and passive vaults,
                                    this is it.
                                </p>
                                <div className="cta-actions">
                                    <WaitlistForm label="Request access" className="btn-lg" />
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
                        <a href="/pitch">Pitch</a>
                        <a href="/whitepaper">Whitepaper</a>
                        <a href="https://x.com/useaura" target="_blank" rel="noopener noreferrer">@useaura</a>
                        <a href="mailto:hello@useaura.wtf">hello@useaura.wtf</a>
                    </div>
                    <span className="footer-note">Autonomous capital execution on Solana.</span>
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
