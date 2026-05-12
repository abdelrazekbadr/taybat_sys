// Tayebat — Home Screen Variation C: "Body Signals"
// Focus: Listening. The hero is a wellness check (mood scale)
// with the weekly comfort curve. Numbers stay quiet; feelings lead.

function ScHomeC() {
  return (
    <div className="tb-screen" style={{ background: '#FFFFFF' }}>
      {/* header */}
      <div style={{ padding: '60px 22px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--tb-green)', color: '#fff', display: 'grid', placeItems: 'center' }}><TbIcon.leaf size={18}/></div>
          <div style={{ fontWeight: 800, color: 'var(--tb-ink)', fontSize: 17 }}>الطيّبات</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--tb-bg)', border: 'none', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)' }}><TbIcon.bell size={18}/></button>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--tb-bg)', border: 'none', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)' }}><TbIcon.user size={18}/></button>
        </div>
      </div>

      <div className="tb-scroll" style={{ padding: '6px 22px 110px' }}>
        {/* Greeting */}
        <div style={{ padding: '8px 4px 14px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--tb-ink)', lineHeight: 1.3 }}>
            صباح الخير، سارة
          </div>
          <div style={{ fontSize: 14, color: 'var(--tb-muted)', marginTop: 4 }}>
            خذي نفساً عميقاً — وأنصتي لجسدك.
          </div>
        </div>

        {/* HERO — Mood scale */}
        <div style={{
          padding: 24, borderRadius: 28,
          background: 'linear-gradient(165deg, #F1FAF4 0%, #E5F4EC 60%, #DFF1E7 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 999, background: 'rgba(16,185,129,0.10)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 800, color: 'var(--tb-green-deep)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--tb-green)' }}/> فحص مزاج · ٣٠ ثانية
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tb-ink)', marginTop: 12, lineHeight: 1.35 }}>
              كيف تشعرين الآن؟
            </div>
            <div style={{ fontSize: 13, color: 'var(--tb-muted)', marginTop: 4 }}>
              راحتك أهم من أي رقم. اضغطي على الحالة الأقرب.
            </div>

            {/* mood arc */}
            <div style={{ marginTop: 22, position: 'relative', height: 90 }}>
              <svg viewBox="0 0 320 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <path d="M 20 70 Q 160 -10 300 70" stroke="rgba(15,42,54,0.10)" strokeWidth="2" fill="none" strokeDasharray="4 6" />
              </svg>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 90, padding: '0 4px' }}>
                {[
                  { e: '😣', l: 'متعبة', y: 0 },
                  { e: '😕', l: 'منخفضة', y: 14 },
                  { e: '😌', l: 'متوسطة', y: 26, active: true },
                  { e: '🙂', l: 'جيدة', y: 14 },
                  { e: '😄', l: 'ممتازة', y: 0 },
                ].map((m, i) => (
                  <button key={i} style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    transform: `translateY(${-m.y}px)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{
                      width: m.active ? 54 : 44, height: m.active ? 54 : 44, borderRadius: 999,
                      background: m.active ? '#fff' : 'rgba(255,255,255,0.7)',
                      border: m.active ? '2px solid var(--tb-green)' : '2px solid transparent',
                      display: 'grid', placeItems: 'center', fontSize: m.active ? 26 : 22,
                      boxShadow: m.active ? '0 8px 18px rgba(16,185,129,0.25)' : 'none',
                    }}>{m.e}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: m.active ? 'var(--tb-green-deep)' : 'var(--tb-muted)' }}>{m.l}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comfort trend */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>منحنى راحتك هذا الأسبوع</h3>
            <a>التقييم →</a>
          </div>
          <div className="tb-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--tb-muted)', fontWeight: 700 }}>متوسط الراحة</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--tb-ink)' }}>٣٫٨<span style={{ fontSize: 14, color: 'var(--tb-muted)', fontWeight: 700 }}>/٥</span></div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-green-deep)', padding: '3px 8px', borderRadius: 999, background: 'var(--tb-green-soft)' }}>↑ ٠٫٤</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--tb-muted)' }}>آخر ٧ أيام</div>
            </div>

            {/* chart */}
            <div style={{ position: 'relative', height: 110 }}>
              <svg viewBox="0 0 320 110" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* grid */}
                {[0, 1, 2, 3].map(i => (
                  <line key={i} x1="0" y1={20 + i * 25} x2="320" y2={20 + i * 25} stroke="#EEF2F6" strokeWidth="1"/>
                ))}
                {/* area + line */}
                <path d="M 10 80 L 60 70 L 110 78 L 160 55 L 210 48 L 260 35 L 310 28 L 310 100 L 10 100 Z" fill="url(#g1)"/>
                <path d="M 10 80 L 60 70 L 110 78 L 160 55 L 210 48 L 260 35 L 310 28" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {[
                  [10,80],[60,70],[110,78],[160,55],[210,48],[260,35],[310,28],
                ].map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={i === 6 ? 5 : 3.5} fill={i === 6 ? '#10B981' : '#fff'} stroke="#10B981" strokeWidth="2"/>
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
              {['س','أ','ث','ر','خ','ج','ج'].map((d, i) => (
                <span key={i} style={{ fontSize: 10.5, color: i === 6 ? 'var(--tb-green-deep)' : 'var(--tb-muted-2)', fontWeight: i === 6 ? 800 : 700 }}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Body whispers */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>إشارات لاحظناها</h3>
            <a>الكل</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tag: 'تحسّن', color: 'var(--tb-green)', tagBg: 'var(--tb-green-soft)', tagFg: 'var(--tb-green-deep)', text: 'الانتفاخ بعد الوجبات قلّ بنسبة ملحوظة منذ بدأت بالأرز الأبيض.', icon: <TbIcon.heart size={18}/> },
              { tag: 'لاحظي',  color: 'var(--tb-honey)', tagBg: '#FFF4D6', tagFg: '#B8852C', text: 'في الأيام التي تناولتِ فيها قهوة كثيرة، التقييم انخفض درجة.', icon: <TbIcon.drop size={18}/> },
              { tag: 'نوم',    color: 'var(--tb-zone-purple)', tagBg: '#F1ECF8', tagFg: '#6F4FAB', text: 'نومك أعمق في الأسبوع الأخير — متوسط ٧.٣ ساعات.', icon: <TbIcon.moon size={18}/> },
            ].map((row, i) => (
              <div key={i} className="tb-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: row.tagBg, color: row.tagFg,
                  display: 'grid', placeItems: 'center',
                }}>{row.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block', padding: '2px 9px', borderRadius: 999,
                    background: row.tagBg, color: row.tagFg,
                    fontSize: 10.5, fontWeight: 800, marginBottom: 4,
                  }}>{row.tag}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--tb-ink-2)', lineHeight: 1.55, fontWeight: 600 }}>{row.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick log row */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>تسجيل سريع</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'وجبة', icon: <TbIcon.fork size={20}/>, color: 'var(--tb-green)' },
              { label: 'جوع',  icon: <TbIcon.flame size={20}/>, color: '#F08A4B' },
              { label: 'ألم',   icon: <TbIcon.heart size={20}/>, color: '#E36A6A' },
              { label: 'نوم',   icon: <TbIcon.moon size={20}/>, color: '#6F4FAB' },
            ].map((q, i) => (
              <button key={i} style={{
                background: '#fff', border: '1px solid var(--tb-line)',
                borderRadius: 18, padding: '14px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                color: q.color, cursor: 'pointer',
              }}>
                {q.icon}
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--tb-ink-2)' }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <HomeTabBar active="home"/>
    </div>
  );
}

Object.assign(window, { ScHomeC });
