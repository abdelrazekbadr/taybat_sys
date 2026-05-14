// Tayebat — Redesigned Home + Meal Picker + Meal Detail flow
// Builds on shared tokens & icons. RTL Arabic.

import React from 'react';

const { useState: useStateR, useEffect: useEffectR, useRef: useRefR } = React;

const TbIcon = new Proxy(
  {},
  {
    get: () => (p = {}) => (
      <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="currentColor" />
    ),
  },
);

function HomeTabBar() {
  return null;
}

// ─── Social icons (simple, non-branded marks) ───────────────────
const TbSocial = {
  fb: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.5V4.4C16.1 4.3 15.1 4.2 14 4.2c-2.3 0-3.9 1.4-3.9 4v2.3H7.5v3h2.6V21h3.4Z" />
    </svg>,

  x: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="currentColor">
      <path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.5L4.8 21H1.6l7.5-8.6L1.2 3h6.6l4.5 6 5.2-6Zm-1.1 16h1.8L7.7 4.9H5.8L16.4 19Z" />
    </svg>,

  wa: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="currentColor">
      <path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.5-1.2A9 9 0 1 0 12 3Zm5.2 12.6c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.2-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.4.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.8.9 2.1 1l.7.4c.2.1.2.7 0 1.3Z" />
    </svg>,

  ig: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.7" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>,

  share: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none">
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 11 7-4M8 13l7 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>,

  star: (p = {}) =>
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill={p.fill || 'currentColor'} style={{ fill: "rgb(229, 235, 241)" }}>
      <path d="M12 3 14.2 9 20.5 9.3 15.5 13.4 17.2 19.5 12 16.2 6.8 19.5 8.5 13.4 3.5 9.3 9.8 9 12 3Z" style={{ fill: "rgb(245, 156, 9)" }} />
    </svg>

};

// ─── Star rating component (1..5) with zone color ──────────────
function TbStars({ value = 5, size = 12, gap = 2 }) {
  const palette = {
    5: '#10B981', // green excellent
    4: '#10B981',
    3: '#F5C24A', // honey/yellow
    2: '#F08A4B', // orange caution
    1: '#E36A6A' // red avoid
  };
  const c = palette[Math.round(value)] || '#10B981';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap, color: "rgb(252, 162, 4)" }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(value);
        const half = !filled && i - 0.5 <= value;
        return (
          <span key={i} style={{ color: filled || half ? c : '#E5EBF1', display: 'inline-flex' }}>
            {half ?
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <defs>
                  <linearGradient id={`hg${i}`} x1="0" x2="1">
                    <stop offset="50%" stopColor={c} />
                    <stop offset="50%" stopColor="#E5EBF1" />
                  </linearGradient>
                </defs>
                <path fill={`url(#hg${i})`} d="M12 3 14.2 9 20.5 9.3 15.5 13.4 17.2 19.5 12 16.2 6.8 19.5 8.5 13.4 3.5 9.3 9.8 9 12 3Z" />
              </svg> :

            <TbSocial.star size={size} />
            }
          </span>);

      })}
    </div>);

}

// ─── Animated subscriber number ─────────────────────────────────
function SubscriberCounter({ to = 1247 }) {
  const [n, setN] = useStateR(0);
  useEffectR(() => {
    let raf, start;
    const dur = 1400;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * ease));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  // arabic-indic numerals
  const arab = String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, letterSpacing: '0.5px' }}>{arab}</span>);

}

// ─── Mock data ──────────────────────────────────────────────────
const SUGGESTIONS = {
  breakfast: [
  { id: 'b1', name: 'تمر مع زيت الزيتون', sub: 'مع كوب ماء دافئ', zone: 'green', rating: 5, kcal: '١٢٠' },
  { id: 'b2', name: 'شوفان بالعسل والقرفة', sub: 'بدون حليب', zone: 'green', rating: 4.5, kcal: '٢١٠' },
  { id: 'b3', name: 'بيض مسلوق + خبز قمح كامل', sub: 'مع زعتر وزيت زيتون', zone: 'yellow', rating: 3.5, kcal: '٣٠٠' },
  { id: 'b4', name: 'فول مدمس بزيت الزيتون', sub: 'مع ليمون وكمون', zone: 'green', rating: 4, kcal: '٢٢٠' }],

  lunch: [
  { id: 'l1', name: 'أرز أبيض + بطاطس مسلوقة', sub: 'مع ملح وقليل من العسل', zone: 'green', rating: 5, kcal: '٣٥٠' },
  { id: 'l2', name: 'صدر دجاج مشوي + سلطة خضراء', sub: 'بزيت زيتون وليمون', zone: 'green', rating: 4.5, kcal: '٤٢٠' },
  { id: 'l3', name: 'شوربة عدس بالكمون', sub: 'مع خبز محمّص', zone: 'green', rating: 4, kcal: '٢٨٠' },
  { id: 'l4', name: 'سمك مشوي + أرز بسمتي', sub: 'مع طحينة', zone: 'yellow', rating: 3.5, kcal: '٤٥٠' }],

  dinner: [
  { id: 'd1', name: 'سلطة كينوا بالخضار', sub: 'مع زيت زيتون وليمون', zone: 'green', rating: 5, kcal: '٢٤٠' },
  { id: 'd2', name: 'زبادي يوناني + مكسرات', sub: 'مع تمر وعسل', zone: 'green', rating: 4.5, kcal: '٢٠٠' },
  { id: 'd3', name: 'بيض عيون + خبز قمح كامل', sub: 'مع طماطم', zone: 'yellow', rating: 3, kcal: '٣٢٠' },
  { id: 'd4', name: 'حمص بالطحينة + خضار', sub: 'مع زيتون', zone: 'green', rating: 4, kcal: '٢٦٠' }]

};

const TODAY_MEALS = [
{ id: 't1', meal: 'الإفطار', name: 'تمر مع زيت الزيتون', time: '٨:١٤ صباحاً', zone: 'green', rating: 5, icon: 'apple' },
{ id: 't2', meal: 'العصر', name: 'شوفان بالعسل والقرفة', time: '٤:٣٠ مساءً', zone: 'green', rating: 4, icon: 'bowl' },
{ id: 't3', meal: 'الغداء', name: 'صدر دجاج + سلطة', time: '٢:٠٠ ظهراً', zone: 'yellow', rating: 3.5, icon: 'fork' }];


const MEAL_DETAIL = {
  name: 'تمر مع زيت الزيتون',
  zone: 'green',
  meal: 'الإفطار',
  time: '٨:١٤ صباحاً',
  rating: 5,
  desc: 'وجبة استشفائية متوازنة من نظام الطيّبات — تجمع بين الطاقة السريعة من التمر والدهون الصحية من زيت الزيتون.',
  items: [
  { name: 'تمر مجدول', qty: '٣ حبات', rating: 5, zone: 'green', note: 'مصدر طاقة سريعة وألياف' },
  { name: 'زيت زيتون بكر', qty: 'ملعقة صغيرة', rating: 5, zone: 'green', note: 'دهون أحادية مفيدة' },
  { name: 'ماء دافئ', qty: 'كوب', rating: 5, zone: 'green', note: 'يساعد على الهضم' },
  { name: 'قرفة (اختياري)', qty: 'رشّة', rating: 4, zone: 'green', note: 'منظّمة للسكر' },
  { name: 'حليب كامل الدسم', qty: 'تجنبيه', rating: 2, zone: 'orange', note: 'قد يثقل الهضم صباحاً' }]

};

// ─── Shared header ─────────────────────────────────────────────
function ReHeader({ onProfile }) {
  return (
    <div style={{ padding: '60px 22px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          position: 'relative',
          width: 50, height: 50, borderRadius: 999,
          background: 'linear-gradient(135deg, #1ED49A, #0CA170)',
          color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18,
          boxShadow: '0 6px 16px rgba(16,185,129,0.30)'
        }}>
          س
          {/* badge medallion */}
          <div style={{
            position: 'absolute', bottom: -3, left: -3,
            width: 22, height: 22, borderRadius: 999,
            background: 'linear-gradient(135deg, #FFE08A, #F5A623)',
            border: '2px solid #F1F5F9',
            display: 'grid', placeItems: 'center', color: '#fff'
          }}>
            <TbIcon.medal size={12} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, color: 'var(--tb-muted)', fontWeight: 600 }}>صباح الخير،</div>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--tb-ink)', lineHeight: 1.1 }}>سارة المنصور</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
            padding: '2px 8px', borderRadius: 999,
            background: 'var(--tb-green-soft)', color: 'var(--tb-green-deep)',
            fontSize: 11, fontWeight: 800
          }}>
            رقم المشترك: <SubscriberCounter to={1247} />
          </div>
        </div>
      </div>
      <button style={{
        position: 'relative', width: 44, height: 44, borderRadius: 999, background: '#fff',
        border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)'
      }}>
        <TbIcon.bell size={20} />
        <span style={{
          position: 'absolute', top: 9, right: 11, width: 8, height: 8,
          borderRadius: 999, background: 'var(--tb-rose)', border: '2px solid #fff'
        }} />
      </button>
    </div>);

}

// ─── Hero card: commitment + hunger check ──────────────────────
function CommitmentCard({ onWantMeal }) {
  const [mood, setMood] = useStateR(2);
  const moods = [
  { e: '😋', l: 'جوع شديد' },
  { e: '🙂', l: 'جائع' },
  { e: '😌', l: 'محايد' },
  { e: '😊', l: 'شبعان' }];

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(150deg, #0EA875 0%, #1ED49A 100%)',
      borderRadius: 26, padding: '20px 22px', color: '#fff',
      overflow: 'hidden',
      boxShadow: '0 20px 36px rgba(14,168,117,0.30)'
    }}>
      <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 999, background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ position: 'absolute', left: -50, bottom: -60, width: 150, height: 150, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700
          }}>اليوم ١٢ من رحلتك</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.22)',
            fontSize: 11, fontWeight: 700
          }}><TbIcon.flame size={12} /> ٥ أيام التزام</div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, marginBottom: 4 }}>هل تشعرين بالجوع الآن؟</div>
        <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6, marginBottom: 16 }}>
          توقّفي وأنصتي. آخر إشارة جوع كانت قبل <b style={{ fontWeight: 800 }}>٣ ساعات</b>.
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {moods.map((m, i) =>
          <button key={i} onClick={() => setMood(i)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 16,
            background: i === mood ? '#fff' : 'rgba(255,255,255,0.18)',
            border: 'none', cursor: 'pointer',
            color: i === mood ? 'var(--tb-ink)' : '#fff',
            fontFamily: 'inherit'
          }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{m.e}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700 }}>{m.l}</div>
            </button>
          )}
        </div>

        <button onClick={onWantMeal} style={{
          width: '100%', height: 48, borderRadius: 14,
          background: '#fff', color: 'var(--tb-green-deep)',
          border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer'
        }}>
          <TbIcon.fork size={16} /> اضف وجبة الآن
        </button>
      </div>
    </div>);

}

// ─── Meal row (today's meal) ───────────────────────────────────
function TodayMealRow({ m, onOpen }) {
  const Icon = m.icon === 'apple' ? TbIcon.apple : m.icon === 'bowl' ? TbIcon.bowl : TbIcon.fork;
  const zoneColor = m.zone === 'green' ? 'var(--tb-zone-green)' : m.zone === 'yellow' ? '#B8852C' : 'var(--tb-zone-orange)';
  const zoneBg = m.zone === 'green' ? 'var(--tb-green-soft)' : '#FFF4D6';
  return (
    <div onClick={onOpen} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: '#fff', borderRadius: 18, cursor: 'pointer',
      border: '1px solid var(--tb-line-soft)'
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: zoneBg, color: zoneColor,
        display: 'grid', placeItems: 'center'
      }}><Icon size={22} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--tb-muted)' }}>{m.meal}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--tb-muted-2)' }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tb-muted)' }}>{m.time}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tb-ink)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
        <TbStars value={m.rating} size={13} />
      </div>
      <button onClick={(e) => e.stopPropagation()} style={{
        width: 38, height: 38, borderRadius: 999, border: '1px solid var(--tb-line)',
        background: '#fff', color: 'var(--tb-green-deep)',
        display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0
      }}><TbSocial.share size={18} /></button>
    </div>);

}

// ─── SCREEN 1: Home redesign ───────────────────────────────────
function ScHomeNew({ onWantMeal = () => {}, onOpenMeal = () => {} }) {
  return (
    <div className="tb-screen">
      <ReHeader />

      <div className="tb-scroll" style={{ padding: '4px 22px 110px' }}>
        <CommitmentCard onWantMeal={onWantMeal} />

        {/* Today's meals */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>وجبات اليوم</h3>
            <a>اختر وجبة</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TODAY_MEALS.map((m) =>
            <TodayMealRow key={m.id} m={m} onOpen={() => onOpenMeal(m)} />
            )}
          </div>
        </div>

        {/* Badge unlock */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #FFE08A, #F5A623)',
              display: 'grid', placeItems: 'center', color: '#fff',
              boxShadow: '0 6px 18px rgba(245,166,35,0.32)'
            }}><TbIcon.medal size={24} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-honey)', marginBottom: 2 }}>الشارة القادمة 🎉</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>أسبوع من الالتزام</div>
              <div style={{ marginTop: 6, height: 5, borderRadius: 999, background: 'var(--tb-bg-tint)' }}>
                <div style={{ width: '71%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #FFD062, #F5A623)' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--tb-muted)', marginTop: 4 }}>٥ من ٧ أيام</div>
            </div>
          </div>
        </div>
      </div>

      <HomeTabBar active="home" />
    </div>);

}

// ─── SCREEN 2: Meal picker (tabs breakfast/lunch/dinner) ───────
function ScMealPicker({ onClose = () => {}, onPick = () => {} }) {
  const [tab, setTab] = useStateR('breakfast');
  const tabs = [
  { k: 'breakfast', l: 'فطار' },
  { k: 'lunch', l: 'غداء' },
  { k: 'dinner', l: 'عشاء' }];

  const items = SUGGESTIONS[tab];
  return (
    <div className="tb-screen" style={{ background: '#F1F5F9' }}>
      {/* header */}
      <div style={{ padding: '60px 22px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 999, background: '#fff',
          border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center',
          color: 'var(--tb-ink)', cursor: 'pointer'
        }}><TbIcon.chevL size={18} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tb-muted)' }}>من نظام الطيّبات</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tb-ink)' }}>اختار  وجبتك</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* tabs */}
      <div style={{ padding: '12px 22px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
          background: '#fff', borderRadius: 14, padding: 4,
          border: '1px solid var(--tb-line-soft)'
        }}>
          {tabs.map((t) =>
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '10px 0', borderRadius: 11, border: 'none',
            background: t.k === tab ? 'linear-gradient(180deg, #1ED49A, #0CA170)' : 'transparent',
            color: t.k === tab ? '#fff' : 'var(--tb-muted)',
            fontWeight: 800, fontSize: 13.5, fontFamily: 'inherit',
            boxShadow: t.k === tab ? '0 4px 12px rgba(16,185,129,0.30)' : 'none',
            cursor: 'pointer'
          }}>{t.l}</button>
          )}
        </div>
      </div>

      {/* suggestion list */}
      <div className="tb-scroll" style={{ padding: '14px 22px 110px' }}>
        <div style={{ fontSize: 12, color: 'var(--tb-muted)', fontWeight: 700, marginBottom: 10 }}>
          {items.length} اقتراحات مناسبة لمرحلتك الحالية
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((m) =>
          <div key={m.id} onClick={() => onPick(m)} style={{
            background: '#fff', borderRadius: 18, padding: 14,
            border: '1px solid var(--tb-line-soft)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
              {/* image placeholder */}
              <div className="tb-placeholder" style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: m.zone === 'green' ?
              'repeating-linear-gradient(135deg, #DCFCE7 0 6px, #E8F7F0 6px 12px)' :
              'repeating-linear-gradient(135deg, #FFF4D6 0 6px, #FFFAEC 6px 12px)',
              color: m.zone === 'green' ? '#059669' : '#B8852C',
              fontSize: 10, fontWeight: 700
            }}>صورة</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
                  <TbStars value={m.rating} size={13} />
                  <span style={{ fontSize: 10.5, color: 'var(--tb-muted)', fontWeight: 700 }}>{m.kcal} سعرة</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--tb-ink)' }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--tb-muted)', marginTop: 2 }}>{m.sub}</div>
              </div>
              <button style={{
              width: 34, height: 34, borderRadius: 999, border: 'none',
              background: 'var(--tb-green-soft)', color: 'var(--tb-green-deep)',
              display: 'grid', placeItems: 'center', flexShrink: 0
            }}><TbIcon.plus size={18} /></button>
            </div>
          )}
        </div>
      </div>

      <HomeTabBar active="home" />
    </div>);

}

// ─── SCREEN 3: Meal details ────────────────────────────────────
function ScMealDetails({ onBack = () => {}, meal = MEAL_DETAIL }) {
  return (
    <div className="tb-screen">
      {/* image hero */}
      <div style={{
        position: 'relative',
        height: 280, flexShrink: 0,
        background: 'repeating-linear-gradient(135deg, #DCFCE7 0 12px, #E8F7F0 12px 24px)'
      }}>
        {/* status spacer */}
        <div style={{ position: 'absolute', top: 60, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', zIndex: 5 }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.92)',
            border: 'none', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)', cursor: 'pointer',
            backdropFilter: 'blur(6px)'
          }}><TbIcon.chevL size={18} /></button>
          <button style={{
            width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.92)',
            border: 'none', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)', cursor: 'pointer',
            backdropFilter: 'blur(6px)'
          }}><TbIcon.heart size={18} /></button>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
          color: '#0EA875', fontFamily: 'monospace', fontSize: 12, fontWeight: 700
        }}>صورة الوجبة · {meal.name}</div>
      </div>

      <div className="tb-scroll" style={{
        marginTop: -28, padding: '24px 22px 110px',
        background: '#F1F5F9', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        position: 'relative', zIndex: 10
      }}>
        {/* zone tag + meal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 999,
            background: '#fff', color: 'var(--tb-muted)',
            fontSize: 11, fontWeight: 800, border: '1px solid var(--tb-line)'
          }}>{meal.meal} · {meal.time}</span>
        </div>

        {/* title */}
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--tb-ink)', letterSpacing: '-0.3px' }}>{meal.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <TbStars value={meal.rating} size={18} />
          <span style={{ fontSize: 12, color: 'var(--tb-muted)', fontWeight: 600 }}>تقييم نظام الطيّبات</span>
        </div>

        <p style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.75, color: 'var(--tb-muted)' }}>{meal.desc}</p>

        {/* Ingredients */}
        <div style={{ marginTop: 18 }}>
          <div className="tb-section-h">
            <h3>المكوّنات وتقييم كل عنصر</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meal.items.map((it, i) => {
              const zoneColor = it.zone === 'green' ? '#10B981' :
              it.zone === 'yellow' ? '#F5C24A' :
              it.zone === 'orange' ? '#F08A4B' :
              '#E36A6A';
              const zoneBg = it.zone === 'green' ? '#DCFCE7' :
              it.zone === 'yellow' ? '#FFF4D6' :
              it.zone === 'orange' ? '#FFE4D2' :
              '#FFE4E4';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#fff', borderRadius: 16, padding: '12px 14px',
                  border: '1px solid var(--tb-line-soft)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--tb-ink)' }}>{it.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--tb-muted)', fontWeight: 700 }}>· {it.qty}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--tb-muted)' }}>{it.note}</div>
                  </div>
                  <TbStars value={it.rating} size={14} />
                </div>);

            })}
          </div>
        </div>

        {/* Single share button */}
        <button style={{
          marginTop: 22, width: '100%', height: 54, borderRadius: 14,
          background: '#fff', color: 'var(--tb-ink)',
          border: '1.5px solid var(--tb-green)', fontFamily: 'inherit', fontWeight: 800, fontSize: 14.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer'
        }}>
          <span style={{ color: 'var(--tb-green-deep)' }}><TbSocial.share size={20} /></span>
          شاركي الوجبة على السوشيال ميديا
        </button>

        {/* Add to today's meals */}
        <button style={{
          marginTop: 16, width: '100%', height: 52, borderRadius: 14,
          background: 'linear-gradient(180deg, #1ED49A, #0CA170)', color: '#fff',
          border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 8px 22px rgba(16,185,129,0.30)', cursor: 'pointer'
        }}>
          <TbIcon.plus size={18} /> أضيفي إلى وجبات اليوم
        </button>
      </div>
    </div>);

}

// ─── Interactive wrapper: flows through 3 screens ──────────────
function ScHomeFlow() {
  const [view, setView] = useStateR('home'); // 'home' | 'picker' | 'detail'
  const [selected, setSelected] = useStateR(MEAL_DETAIL);
  return (
    <>
      {view === 'home' &&
      <ScHomeNew
        onWantMeal={() => setView('picker')}
        onOpenMeal={(m) => {setSelected({ ...MEAL_DETAIL, name: m.name, meal: m.meal, time: m.time, rating: m.rating });setView('detail');}} />

      }
      {view === 'picker' &&
      <ScMealPicker
        onClose={() => setView('home')}
        onPick={(m) => {setSelected({ ...MEAL_DETAIL, name: m.name, rating: m.rating });setView('detail');}} />

      }
      {view === 'detail' &&
      <ScMealDetails onBack={() => setView('home')} meal={selected} />
      }
    </>);

}

Object.assign(window, { ScHomeNew, ScMealPicker, ScMealDetails, ScHomeFlow });
