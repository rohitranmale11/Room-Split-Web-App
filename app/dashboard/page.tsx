"use client";

import type { LegacyRef, RefObject } from "react";
import { useState, useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:22,height:22}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Unified Expense Ledger",
    desc: "Track every bill, payment, and transfer in one clean, searchable ledger per room. No more chasing receipts.",
    accent: "#2563eb",
    bg: "rgba(37,99,235,0.07)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:22,height:22}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Room-Centric Workspaces",
    desc: "Group expenses by flat, PG, or house. Each room gets its own workspace with smart invite links.",
    accent: "#0891b2",
    bg: "rgba(8,145,178,0.07)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:22,height:22}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Accurate Auto-Balances",
    desc: "Per-member balances computed automatically on every expense. Always know exactly who owes who.",
    accent: "#059669",
    bg: "rgba(5,150,105,0.07)",
  },
];

const STEPS = [
  { n: "01", title: "Create a room", desc: "Spin up a workspace for each flat or house you share." },
  { n: "02", title: "Invite roommates", desc: "Share a secure invite code — no email lists needed." },
  { n: "03", title: "Add expenses", desc: "Log rent, utilities, groceries in just a few taps." },
  { n: "04", title: "Settle up", desc: "RoomSplit calculates balances and keeps them live." },
];

const PERKS = [
  "Up to 3 active rooms",
  "Unlimited expenses & members",
  "Automatic balance calculations",
  "Secure Google or email login",
  "Real-time activity feed",
  "Export-ready summaries",
];

function useInView(threshold = 0.15): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimCounter({
  target,
  prefix = "",
  suffix = "",
}: {
  target: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref as LegacyRef<HTMLSpanElement>}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export default function RoomSplitLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroIn] = useInView(0.1);
  const [featRef, featIn] = useInView(0.1);
  const [howRef, howIn] = useInView(0.1);
  const [priceRef, priceIn] = useInView(0.1);
  const [ctaRef, ctaIn] = useInView(0.1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#f8fafc", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.7); opacity: 0.3; }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-10px); }
        }
        @keyframes slideBar {
          from { width: 0; }
          to   { width: 73%; }
        }

        .animate-fadeup { animation: fadeUp 0.65s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadein { animation: fadeIn 0.7s ease both; }
        .d1 { animation-delay: 0.07s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.23s; }
        .d4 { animation-delay: 0.31s; }
        .d5 { animation-delay: 0.39s; }

        .nav-link {
          font-size: 13.5px; font-weight: 500; color: #475569;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #0f172a; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #2563eb; color: #fff;
          font-size: 13.5px; font-weight: 600;
          padding: 13px 28px; border-radius: 100px; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 6px rgba(37,99,235,0.25), 0 6px 20px rgba(37,99,235,0.18);
          font-family: 'Poppins', sans-serif;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 4px 24px rgba(37,99,235,0.38); }
        .btn-primary:active { transform: translateY(0); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #334155;
          font-size: 13.5px; font-weight: 500;
          padding: 12px 24px; border-radius: 100px;
          border: 1.5px solid #e2e8f0; cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: 'Poppins', sans-serif;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .btn-outline:hover { border-color: #3b82f6; color: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 14px rgba(37,99,235,0.12); }

        .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
        }

        .feature-card {
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.09);
          border-color: rgba(37,99,235,0.2);
        }

        .step-card {
          position: relative; overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.08); border-color: rgba(37,99,235,0.22); }

        .step-watermark {
          position: absolute; bottom: -14px; right: 10px;
          font-size: 72px; font-weight: 900; color: rgba(37,99,235,0.05);
          line-height: 1; pointer-events: none; user-select: none;
          font-family: 'Poppins', sans-serif;
        }

        .badge-blue {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 100px;
          background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;
        }

        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #2563eb; margin-bottom: 10px; display: block;
        }

        .pill-up  { background: #dcfce7; color: #166534; font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 100px; }
        .pill-neu { background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 100px; }

        .activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; border-radius: 10px;
          transition: background 0.15s; cursor: default;
        }
        .activity-row:hover { background: #f8fafc; }

        .live-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #dcfce7; color: #166534;
          font-size: 10px; font-weight: 700; padding: 4px 10px;
          border-radius: 100px; border: 1px solid rgba(22,163,74,0.2);
          letter-spacing: 0.04em; text-transform: uppercase;
          font-family: 'Poppins', sans-serif;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: pulseDot 2s ease-in-out infinite;
          display: inline-block; flex-shrink: 0;
        }

        .floating { animation: floatCard 6s ease-in-out infinite; }

        .cta-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 28px; overflow: hidden; position: relative;
        }
        .cta-glow {
          position: absolute; border-radius: 50%;
          filter: blur(64px); pointer-events: none;
        }

        .progress-bar {
          height: 100%; background: linear-gradient(90deg, #2563eb, #38bdf8);
          border-radius: 100px; animation: slideBar 1.2s cubic-bezier(.22,1,.36,1) both;
          animation-delay: 0.5s;
        }

        .divider { height: 1px; background: #e2e8f0; }

        .check-circle {
          width: 20px; height: 20px; border-radius: 50%;
          background: #eff6ff; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .hero-grid  { grid-template-columns: 1fr !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-row  { gap: 28px !important; }
        }
        @media (max-width: 560px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .cta-inner  { flex-direction: column !important; }
          .hero-btns  { flex-direction: column !important; align-items: flex-start; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? "rgba(248,250,252,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.04em", fontFamily: "'Poppins', sans-serif" }}>RS</div>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>RoomSplit</span>
            </a>
            <nav style={{ display: "flex", gap: 32 }}>
              {["Features", "How it works", "Pricing"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="nav-link">{l}</a>
              ))}
            </nav>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/login" className="nav-link" style={{ padding: "8px 14px" }}>Login</a>
            <a href="/signup" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
              Get started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", paddingTop: 108, paddingBottom: 80, overflow: "hidden", background: "linear-gradient(180deg,#eff6ff 0%,#f8fafc 55%,#f1f5f9 100%)" }}>
          {/* Background decoration */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
            <div style={{ position: "absolute", top: -140, right: "8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 65%)", filter: "blur(50px)" }} />
            <div style={{ position: "absolute", bottom: -80, left: -60, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 65%)", filter: "blur(40px)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 105%,#f1f5f9 0%,transparent 55%)" }} />
          </div>

          <div ref={heroRef as LegacyRef<HTMLDivElement>} style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1 }}>
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 60, alignItems: "center" }}>

              {/* Left copy */}
              <div>
                {heroIn && <>
                  <div className="animate-fadeup d1" style={{ marginBottom: 22 }}>
                    <span className="badge-blue">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      Enterprise-grade roommate finance
                    </span>
                  </div>

                  <h1 className="animate-fadeup d2" style={{
                    fontSize: "clamp(38px, 5.2vw, 66px)",
                    fontWeight: 800, lineHeight: 1.1,
                    letterSpacing: "-0.035em",
                    color: "#0f172a", marginBottom: 20,
                  }}>
                    Split rent &amp; bills<br />
                    <span style={{ color: "#2563eb" }}>like a modern</span><br />
                    finance team.
                  </h1>

                  <p className="animate-fadeup d3" style={{ fontSize: 15.5, lineHeight: 1.8, color: "#475569", fontWeight: 400, maxWidth: 430, marginBottom: 36 }}>
                    RoomSplit turns messy shared bills into a clean, auditable ledger — track rooms, expenses, and balances in one collaborative dashboard.
                  </p>

                  <div className="animate-fadeup d4 hero-btns" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
                    <a href="/signup" className="btn-primary">
                      Get started for free
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/></svg>
                    </a>
                    <a href="#how-it-works" className="btn-outline">See how it works</a>
                  </div>

                  <div className="animate-fadeup d5" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                    {["No credit card required", "Built for shared households"].map(t => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
                        <div className="check-circle"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></div>
                        {t}
                      </div>
                    ))}
                  </div>
                </>}
              </div>

              {/* Right — Dashboard preview */}
              {heroIn && (
                <div className="animate-fadein d3 floating" style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: -24, background: "radial-gradient(ellipse,rgba(37,99,235,0.13) 0%,transparent 70%)", filter: "blur(32px)", borderRadius: 36, zIndex: 0 }} />
                  <div className="card" style={{ position: "relative", zIndex: 1, borderRadius: 24, overflow: "hidden", boxShadow: "0 28px 80px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06)" }}>

                    {/* Mac-style top bar */}
                    <div style={{ background: "#0f172a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.09em", textTransform: "uppercase" }}>RoomSplit · Dashboard</span>
                      <div className="live-badge"><span className="live-dot" />Live</div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: "1px solid #f1f5f9" }}>
                      {[
                        { label: "Total expenses", val: "$2,430", pill: "+12%", up: true },
                        { label: "Pending balances", val: "$320", pill: "-4%", up: false },
                        { label: "Rooms active", val: "3", pill: "+1", up: true },
                      ].map((s, i) => (
                        <div key={s.label} style={{ padding: "16px 16px", borderRight: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                          <p style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
                          <p style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.05em", marginBottom: 6 }}>{s.val}</p>
                          <span className={s.up ? "pill-up" : "pill-neu"}>{s.pill}</span>
                        </div>
                      ))}
                    </div>

                    {/* Activity feed */}
                    <div style={{ padding: "14px 14px 6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>Recent activity</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>Last 24h</span>
                      </div>
                      {[
                        { emoji: "🛒", label: "Groceries — Pune Flat",  sub: "Split 3 ways", amt: "+$120.00", amtClr: "#0f172a", time: "2m" },
                        { emoji: "👤", label: "New member joined",       sub: "Bangalore PG",  amt: null,       amtClr: null,      time: "12m" },
                        { emoji: "🏠", label: "Rent — Mumbai Flat",      sub: "Split 4 ways", amt: "+$650.00", amtClr: "#0f172a", time: "1h" },
                        { emoji: "✅", label: "Rohan settled up",        sub: "₹1,200",       amt: "Done",     amtClr: "#16a34a", time: "3h" },
                      ].map(row => (
                        <div key={row.label} className="activity-row">
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{row.emoji}</div>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{row.label}</p>
                              <p style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 400 }}>{row.sub}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {row.amt && <p style={{ fontSize: 12, fontWeight: 700, color: row.amtClr }}>{row.amt}</p>}
                            <p style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 400 }}>{row.time} ago</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ padding: "8px 14px 16px" }}>
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Settlement progress</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>73%</span>
                        </div>
                        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 100, overflow: "hidden" }}>
                          <div className="progress-bar" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <div style={{ background: "#0f172a", padding: "22px 28px" }}>
          <div className="stats-row" style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
            {[
              { n: <AnimCounter target={12000} suffix="+" />, label: "Rooms created" },
              { n: <AnimCounter target={48000} suffix="+" />, label: "Expenses tracked" },
              { n: <AnimCounter target={98}    suffix="%" />, label: "Satisfaction rate" },
              { n: <AnimCounter target={4} prefix="$" suffix="M+" />, label: "Settled this month" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: 3 }}>{s.n}</div>
                <div style={{ fontSize: 10.5, color: "#475569", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: "96px 0", background: "#f1f5f9" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
            <div ref={featRef as LegacyRef<HTMLDivElement>} style={{ textAlign: "center", marginBottom: 56 }}>
              {featIn && <>
                <span className="section-label animate-fadeup">Features</span>
                <h2 className="animate-fadeup d1" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 14 }}>
                  Everything your household<br /><span style={{ color: "#2563eb" }}>finance stack needs.</span>
                </h2>
                <p className="animate-fadeup d2" style={{ fontSize: 15, color: "#64748b", fontWeight: 400, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
                  From rent to pizza nights — every shared payment transparent, fair, and searchable.
                </p>
              </>}
            </div>

            <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {FEATURES.map((f, i) => (
                <div key={f.title} className={`card feature-card ${featIn ? `animate-fadeup d${i + 2}` : ""}`} style={{ padding: "32px 28px", borderRadius: 22 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 15, background: f.bg, color: f.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>{f.icon}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: f.bg, color: f.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, marginBottom: 14 }}>{f.title.split(" ")[0]}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "#64748b", fontWeight: 400, marginBottom: 24 }}>{f.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: f.accent, cursor: "pointer" }}>
                    Learn more
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ padding: "96px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
            <div ref={howRef as LegacyRef<HTMLDivElement>} style={{ textAlign: "center", marginBottom: 56 }}>
              {howIn && <>
                <span className="section-label animate-fadeup">How it works</span>
                <h2 className="animate-fadeup d1" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 14 }}>
                  From invite link to{" "}
                  <span style={{ color: "#2563eb" }}>settled up</span><br />in minutes.
                </h2>
                <p className="animate-fadeup d2" style={{ fontSize: 15, color: "#64748b", fontWeight: 400, maxWidth: 440, margin: "0 auto", lineHeight: 1.8 }}>
                  RoomSplit mirrors how you already live — with financial-grade clarity.
                </p>
              </>}
            </div>

            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {STEPS.map((s, i) => (
                <div key={s.n} className={`card step-card ${howIn ? `animate-fadeup d${i + 2}` : ""}`} style={{ padding: "28px 22px 38px", borderRadius: 20, background: i === 0 ? "#eff6ff" : "#fff", borderColor: i === 0 ? "rgba(37,99,235,0.22)" : "#e2e8f0" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", marginBottom: 18, background: i === 0 ? "#2563eb" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i === 0 ? "#fff" : "#94a3b8", boxShadow: i === 0 ? "0 4px 16px rgba(37,99,235,0.4)" : "none" }}>{s.n}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "#64748b", fontWeight: 400 }}>{s.desc}</p>
                  <span className="step-watermark">{s.n}</span>
                </div>
              ))}
            </div>

            {/* Connector dots */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 24, maxWidth: 440, margin: "24px auto 0" }}>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? "#2563eb" : "#e2e8f0", border: i > 0 ? "2px solid #cbd5e1" : "none", flexShrink: 0 }} />
                  {i < 3 && <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${i===0?"#2563eb":"#e2e8f0"}, #e2e8f0)` }} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: "96px 0", background: "#f8fafc" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
            <div ref={priceRef as LegacyRef<HTMLDivElement>} style={{ textAlign: "center", marginBottom: 56 }}>
              {priceIn && <>
                <span className="section-label animate-fadeup">Pricing</span>
                <h2 className="animate-fadeup d1" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 14 }}>
                  Simple,{" "}<span style={{ color: "#2563eb" }}>roommate-friendly</span><br />pricing.
                </h2>
                <p className="animate-fadeup d2" style={{ fontSize: 15, color: "#64748b", fontWeight: 400, maxWidth: 380, margin: "0 auto", lineHeight: 1.8 }}>
                  Start free and upgrade only when your household needs more.
                </p>
              </>}
            </div>

            <div style={{ maxWidth: 460, margin: "0 auto" }}>
              <div className={`card ${priceIn ? "animate-fadeup d3" : ""}`} style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 10px 40px rgba(37,99,235,0.11), 0 2px 8px rgba(0,0,0,0.04)", border: "1.5px solid rgba(37,99,235,0.15)", background: "linear-gradient(160deg,#eff6ff 0%,#f8fafc 100%)" }}>
                {/* Blue header */}
                <div style={{ background: "linear-gradient(90deg,#2563eb 0%,#0ea5e9 100%)", padding: "24px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Free Forever</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>RoomSplit Starter</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.05em" }}>$0</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginLeft: 4 }}>/mo</span>
                  </div>
                </div>

                <div style={{ padding: "32px 36px" }}>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, fontWeight: 400, marginBottom: 24 }}>
                    Perfect for small flats and PGs getting started with shared expense tracking.
                  </p>
                  <div className="divider" style={{ marginBottom: 24 }} />
                  <ul style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                    {PERKS.map(p => (
                      <li key={p} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="check-circle"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></div>
                        <span style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/signup" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "15px", fontSize: 14.5 }}>
                    Create your first room — free
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/></svg>
                  </a>
                  <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", marginTop: 14, fontWeight: 400 }}>No credit card · No contracts · Cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "56px 28px 80px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div ref={ctaRef as LegacyRef<HTMLDivElement>} className={`cta-box ${ctaIn ? "animate-fadeup" : ""}`}>
              <div className="cta-glow" style={{ width: 500, height: 500, background: "radial-gradient(circle,rgba(37,99,235,0.22) 0%,transparent 70%)", top: -150, right: -80 }} />
              <div className="cta-glow" style={{ width: 300, height: 300, background: "radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 70%)", bottom: -80, left: 80 }} />

              <div style={{ position: "relative", zIndex: 1, padding: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
                <div style={{ maxWidth: 520 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 14 }}>Get started today</span>
                  <h2 style={{ fontSize: "clamp(26px,4vw,48px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", color: "#fff", marginBottom: 14 }}>
                    Bring clarity to your<br />
                    <span style={{ color: "#60a5fa" }}>shared bills.</span>
                  </h2>
                  <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, fontWeight: 400 }}>
                    Join roommates who treat their flat like a small business. One dashboard for rooms, expenses, and balances.
                  </p>
                </div>
                <div className="cta-inner" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <a href="/signup" className="btn-primary" style={{ background: "#fff", color: "#0f172a", boxShadow: "0 4px 24px rgba(255,255,255,0.12)" }}>
                    Get started in 2 minutes
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/></svg>
                  </a>
                  <a href="/login" style={{ fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "underline", textUnderlineOffset: 3 }}>Already have an account?</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "26px 28px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>RS</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>RoomSplit</span>
            <span style={{ fontSize: 12.5, color: "#94a3b8", marginLeft: 6, fontWeight: 400 }}>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["Features", "Pricing", "Login"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: "#64748b", fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#0f172a")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#64748b")}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}