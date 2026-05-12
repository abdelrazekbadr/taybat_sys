// Tayebat — shared UI primitives (icons, phone shell)
// RTL Arabic wellness app

const { useState } = React;

// ─── Icons (inline SVG) ─────────────────────────────────────────
const TbIcon = {
  leaf: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22} {...p}>
      <path d="M20 4c-7 0-13 4-13 12 0 1.5.3 3 .8 4.3.2.4.8.4 1 0L11 16c1-2 3-4 7-6 .5-.3.5-1 0-1.2-1.5-.7-1.5-1.8 0-2.6.6-.3.5-1.2-.2-1.4C16.5 4.3 18 4 20 4z" fill="currentColor"/>
    </svg>
  ),
  home: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 24} height={p.size || 24}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill={p.filled ? 'currentColor' : 'none'} fillOpacity={p.filled ? 0.1 : 0}/>
    </svg>
  ),
  book: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 24} height={p.size || 24}>
      <path d="M4 4h6c1.7 0 3 1.3 3 3v13c0-1.7-1.3-3-3-3H4V4ZM20 4h-6c-1.7 0-3 1.3-3 3v13c0-1.7 1.3-3 3-3h6V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  medal: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 24} height={p.size || 24}>
      <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 3 6 8m10-5 2 5M9 9l3-6 3 6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  user: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 24} height={p.size || 24}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
  ),
  check: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 16} height={p.size || 16}><path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  spark: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 18} height={p.size || 18}><path d="M12 3 13.8 9 20 10.5 15 14.5l1.5 6.5L12 17.5 7.5 21 9 14.5 4 10.5 10.2 9 12 3Z" fill="currentColor"/></svg>
  ),
  flame: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 18} height={p.size || 18}><path d="M12 2c1 4-3 5-3 9 0 2 1.5 3 3 3s3-1 3-3c0-1-.5-2-1-3 2 1 4 3 4 6a6 6 0 1 1-12 0c0-4 3-7 6-12Z" fill="currentColor"/></svg>
  ),
  bell: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M5 17h14l-2-3v-3a5 5 0 0 0-10 0v3l-2 3Zm5 2a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
  ),
  heart: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" fill="currentColor"/></svg>
  ),
  drop: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11Z" fill="currentColor"/></svg>
  ),
  moon: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M20 15a8 8 0 0 1-11-11 8 8 0 1 0 11 11Z" fill="currentColor"/></svg>
  ),
  apple: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M16 8c2 0 4 2 4 5 0 4-3 8-5 8-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-5-4-5-8 0-3 2-5 4-5 1.5 0 2 1 3.5 1S14 8 16 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M13 7c1-2 3-2 3-3-2 0-3 1-3 3Z" fill="currentColor"/></svg>
  ),
  bowl: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 24} height={p.size || 24}><path d="M3 11h18a9 9 0 0 1-18 0Z" fill="currentColor"/><path d="M8 8c0-2 4-2 4 0M14 7c0-2 3-2 3 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  fork: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M7 3v6a2 2 0 0 0 4 0V3M9 11v10M15 3c-1 0-2 2-2 5s1 4 2 4v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  arrowL: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M5 12h14M5 12l5-5M5 12l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  arrowR: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 22} height={p.size || 22}><path d="M19 12H5M19 12l-5-5M19 12l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  chevD: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 16} height={p.size || 16}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  chevL: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" width={p.size || 16} height={p.size || 16}><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  google: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20}><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.3Z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4 20.7 7.7 23 12 23Z"/><path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.6V6.9H2.3a11 11 0 0 0 0 10.2L6 14.3Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.7 1 4 3.3 2.3 6.9L6 9.7c.9-2.5 3.2-4.4 6-4.4Z"/></svg>
  ),
  apple_logo: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5.7-1 1.3-2 1.5-3.1-2.3-1-2.9-3.4-2.9-3.8ZM14 4.7c.7-.8 1.1-2 1-3.1-1 0-2.2.6-2.9 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.3Z"/></svg>
  ),
  phone: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none"><path d="M7 4h10v16H7V4Zm4 14h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  eye: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>
  ),
  refresh: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  brain: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none"><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h3V4H9Zm6 0a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3h-3V4h3Z" stroke="currentColor" strokeWidth="1.7"/></svg>
  ),
  community: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="17" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M3 19c.7-3 3-5 6-5s5.3 2 6 5M14 19c.5-2 2-3.5 4-3.5s3 1.5 3.5 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
};

// ─── iPhone shell (no nav, custom for our Arabic prototype) ────
function TbPhone({ children, dark = false, time = '٣:١٥', width = 390, height = 844, statusbarDark = false }) {
  return (
    <div style={{
      width, height,
      borderRadius: 54, overflow: 'hidden',
      position: 'relative',
      background: dark ? '#0F2A36' : '#F1F5F9',
      boxShadow: '0 36px 80px rgba(15,42,54,0.20), 0 0 0 1px rgba(15,42,54,0.10)',
      fontFamily: "var(--tb-font-ar)",
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 124, height: 36, borderRadius: 24, background: '#000', zIndex: 50,
      }} />
      {/* status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px 0', boxSizing: 'border-box',
        color: statusbarDark ? '#fff' : '#0F2A36',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.2 }}>{time}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.95 }}>
          <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6.5" width="3" height="4.5" rx=".6" fill="currentColor"/><rect x="4.5" y="4.5" width="3" height="6.5" rx=".6" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx=".6" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx=".6" fill="currentColor"/></svg>
          <svg width="15" height="11" viewBox="0 0 17 12"><path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill="currentColor"/><path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill="currentColor"/><circle cx="8.5" cy="10.5" r="1.4" fill="currentColor"/></svg>
          <svg width="25" height="12" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity=".4" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#10B981"/><path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="currentColor" fillOpacity=".5"/></svg>
        </div>
      </div>
      {/* content */}
      <div className="tb-app tb-screen" style={{ background: dark ? '#0F2A36' : '#F1F5F9' }}>
        {children}
      </div>
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, zIndex: 60,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8,
      }}>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(15,42,54,0.28)' }} />
      </div>
    </div>
  );
}

// ─── Brand mark (leaf) ─────────────────────────────────────────
function TbLeafMark({ size = 64, color = '#fff' }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <path d="M50 12c-16 0-32 8-32 28 0 5 1.5 9 3.5 12L24 50c1-1 4.5-2.5 9-5.5 6-4 12-10 14.5-18 .7-2 .7-3 0-3.4-1.5-1-2.5-2.5 2-7 .6-.6.4-1.7-.4-2-3 .7-4 .3 1-1.5.7-.3.6-1.3-.1-1.6-2-.7-3-.4 0-.9Z" fill={color}/>
    </svg>
  );
}

Object.assign(window, { TbIcon, TbPhone, TbLeafMark });
