"use client";

import { useState, useEffect } from "react";

export default function RoomSplitLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", color: "#0f172a", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes subtleFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }

        .fade-up { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.22s; }
        .d3 { animation-delay: 0.34s; }
        .d4 { animation-delay: 0.46s; }
        .d5 { animation-delay: 0.58s; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0f172a; color: #fff;
          font-size: 14px; font-weight: 600;
          padding: 14px 32px; border-radius: 100px; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(15,23,42,0.18);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
        }
        .btn-primary:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(15,23,42,0.22); }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #64748b;
          font-size: 14px; font-weight: 500;
          padding: 14px 24px; border-radius: 100px;
          border: 1.5px solid #e2e8f0; cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { border-color: #94a3b8; color: #334155; transform: translateY(-1px); }

        .nav-link {
          font-size: 14px; font-weight: 500; color: #64748b;
          transition: color 0.2s; padding: 8px 4px;
        }
        .nav-link:hover { color: #0f172a; }

        .feature-chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: #fff; border: 1px solid #e2e8f0;
          padding: 7px 14px; border-radius: 100px;
          font-size: 12.5px; font-weight: 500; color: #475569;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .card-float {
          background: #fff; border: 1px solid #e8eef4;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04);
          animation: subtleFloat 7s ease-in-out infinite;
        }

        .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        @media (max-width: 640px) {
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a, .hero-btns button { text-align: center; justify-content: center; }
          .chips-row { justify-content: center !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? "rgba(248,250,252,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid #e8eef4" : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>RS</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.025em" }}>RoomSplit</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a href="/login" className="nav-link" style={{ padding: "8px 16px" }}>Login</a>
            <a href="/signup" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
              Get started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <main>
        <section style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          paddingTop: 64,
          background: "linear-gradient(160deg, #f0f6ff 0%, #f8fafc 50%, #f1f5f9 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Background texture */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.045) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
            <div style={{ position: "absolute", top: -200, right: "5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)", filter: "blur(60px)" }} />
            <div style={{ position: "absolute", bottom: -100, left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)", filter: "blur(50px)" }} />
          </div>

          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: 620, textAlign: "center" }}>

              {mounted && <>
                {/* Label */}
                <div className="fade-up d1" style={{ marginBottom: 28 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#fff", border: "1px solid #dbeafe",
                    padding: "6px 16px", borderRadius: 100,
                    fontSize: 12, fontWeight: 600, color: "#2563eb",
                    letterSpacing: "0.01em",
                    boxShadow: "0 1px 4px rgba(37,99,235,0.08)"
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
                    Shared expense management
                  </span>
                </div>

                {/* Headline */}
                <h1 className="fade-up d2" style={{
                  fontSize: "clamp(40px, 6vw, 72px)",
                  fontFamily: "'DM Serif Display', serif",
                  fontWeight: 400, lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  color: "#0f172a", marginBottom: 22,
                }}>
                  Split bills,<br />
                  <em style={{ color: "#2563eb", fontStyle: "italic" }}>not friendships.</em>
                </h1>

                {/* Subtext */}
                <p className="fade-up d3" style={{
                  fontSize: 16.5, lineHeight: 1.75, color: "#64748b",
                  fontWeight: 400, marginBottom: 40, maxWidth: 460, margin: "0 auto 40px"
                }}>
                  Track shared rent, groceries, and utilities with your roommates — automatic balances, zero spreadsheets.
                </p>

                {/* CTAs */}
                <div className="fade-up d4 hero-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
                  <a href="/signup" className="btn-primary">
                    Get started — it's free
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                  </a>
                  <a href="/login" className="btn-ghost">
                    Login to your room
                  </a>
                </div>

                {/* Feature chips */}
                <div className="fade-up d5 chips-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { icon: "🏠", text: "Up to 3 rooms free" },
                    { icon: "⚡", text: "Auto balance calc" },
                    { icon: "🔒", text: "Google or email login" },
                  ].map(chip => (
                    <span key={chip.text} className="feature-chip">
                      <span style={{ fontSize: 14 }}>{chip.icon}</span>
                      {chip.text}
                    </span>
                  ))}
                </div>
              </>}
            </div>
          </div>

          {/* Floating mini-card — decorative */}
            {/* {mounted && (
              <div className="fade-in d4 card-float" style={{
                position: "absolute", bottom: "12%", right: "6%",
                padding: "14px 18px", minWidth: 200, zIndex: 2,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {[
                  { color: "#22c55e", label: "Rohan settled up", sub: "₹1,200 · 2m ago" },
                  { color: "#f59e0b", label: "Groceries added", sub: "$120 · split 3 ways" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="dot" style={{ background: item.color }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
        </section>
      </main>

      {/* ── FOOTER ── */}
      {/* <footer style={{ borderTop: "1px solid #e8eef4", background: "#fff", padding: "22px 28px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>RS</div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>RoomSplit</span>
            <span style={{ fontSize: 12, color: "#cbd5e1", marginLeft: 4 }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Login", href: "/login" }, { label: "Sign up", href: "/signup" }].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#0f172a")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94a3b8")}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer> */}
    </div>
  );
}