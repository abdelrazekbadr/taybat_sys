// Tayebat — Onboarding, Splash, Sign In, Sign Up screens

// ─── Illustration placeholders (hand-drawn would never beat the user's real assets) ──
function TbIllu({ kind, height = 200 }) {
  // soft, abstract placeholder — caller drops real illustration here
  const palette = {
    listen:  { bg: '#E8F4EE', accent: '#10B981' },
    watch:   { bg: '#EAF2EC', accent: '#0F8E66' },
    family:  { bg: '#EEF3F6', accent: '#10B981' },
    bottles: { bg: '#16A77A', accent: '#fff' },
  }[kind] || { bg: '#E8F4EE', accent: '#10B981' };

  return (
    <div style={{
      height,
      background: palette.bg,
      borderRadius: 22,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* subtle leafy backdrop using primitives only */}
      <svg viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}>
        <circle cx="60" cy="170" r="38" fill={palette.accent} opacity="0.18"/>
        <circle cx="270" cy="40" r="32" fill={palette.accent} opacity="0.14"/>
        <ellipse cx="40" cy="60" rx="18" ry="34" fill={palette.accent} opacity="0.18" transform="rotate(-25 40 60)"/>
        <ellipse cx="290" cy="160" rx="22" ry="42" fill={palette.accent} opacity="0.18" transform="rotate(35 290 160)"/>
      </svg>
      <div style={{
        position: 'relative', textAlign: 'center',
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 999,
          background: palette.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
          boxShadow: '0 12px 30px rgba(16,185,129,0.25)',
        }}>
          {kind === 'listen' && <TbIcon.heart size={42} />}
          {kind === 'watch' && <TbIcon.spark size={42} />}
          {kind === 'family' && <TbIcon.community size={42} />}
        </div>
        <div style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10.5, color: 'rgba(15,42,54,0.5)', letterSpacing: 0.5,
        }}>{`{ illustration · ${kind} }`}</div>
      </div>
    </div>
  );
}

// ─── Page dots ────────────────────────────────────────────────
function TbDots({ active = 0, count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: i === active ? 26 : 8, height: 8, borderRadius: 999,
          background: i === active ? 'var(--tb-green)' : 'var(--tb-line)',
          transition: 'width .25s ease',
        }} />
      ))}
    </div>
  );
}

// ─── Splash ───────────────────────────────────────────────────
function ScSplash() {
  return (
    <div className="tb-screen" style={{
      background: 'linear-gradient(180deg, #1ED49A 0%, #0EA875 60%, #0B8E64 100%)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '120px 0 80px',
    }}>
      {/* soft bottles silhouette */}
      <svg viewBox="0 0 390 700" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
        <g fill="#fff">
          <path d="M70 180 v40 c-12 6-16 16-16 28 v340 c0 18 12 30 30 30 h28 c18 0 30-12 30-30 V248 c0-12-4-22-16-28 v-40 z"/>
          <path d="M220 130 v50 c-14 8-20 18-20 32 v360 c0 18 12 30 30 30 h36 c18 0 30-12 30-30 V212 c0-14-6-24-20-32 v-50 z"/>
        </g>
      </svg>
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: 999, background: 'rgba(255,255,255,0.12)',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 280, height: 280, borderRadius: 999, background: 'rgba(255,255,255,0.10)',
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        {/* leaf badge */}
        <div style={{
          width: 96, height: 96, borderRadius: 999,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <div style={{ color: '#fff' }}><TbIcon.leaf size={48} /></div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>الطيّبات</div>
        <div style={{ marginTop: 6, fontSize: 17, opacity: 0.94, fontWeight: 500 }}>إبدأ رحلة الاستشفاء …</div>
      </div>

      {/* loading bar */}
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{ width: 130, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
          <div style={{ width: '55%', height: '100%', background: '#fff', borderRadius: 999 }} />
        </div>
        <div style={{ textAlign: 'center', opacity: 0.85 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, fontFamily: 'var(--tb-font-en)', fontWeight: 500 }}>PREMIUM WELLNESS</div>
          <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>فكرة د. ضياء العوضي</div>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding shell ─────────────────────────────────────────
function ScOnboardingShell({ pageIdx, total, illuKind, title, sub, bullets, primary = 'التالي', showSkip = true, footer }) {
  return (
    <div className="tb-screen">
      {/* top bar */}
      <div style={{ paddingTop: 70, padding: '70px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--tb-green-deep)', fontWeight: 800, fontSize: 17 }}>الطيّبات</div>
        {showSkip && <button style={{ background: 'none', border: 'none', color: 'var(--tb-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>تخطّي</button>}
      </div>

      <div className="tb-scroll" style={{ padding: '20px 24px 16px' }}>
        <TbIllu kind={illuKind} height={210} />

        <div style={{ marginTop: 28 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.25, color: 'var(--tb-ink)' }}>{title}</h1>
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--tb-muted)' }}>{sub}</p>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bullets.map((b, i) => (
            <div key={i} className="tb-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 999,
                background: 'var(--tb-green-soft)', color: 'var(--tb-green-deep)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}><TbIcon.check size={16} /></div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--tb-ink-2)', flex: 1 }}>{b}</div>
            </div>
          ))}
        </div>

        {footer}
      </div>

      {/* nav row */}
      <div style={{ padding: '6px 24px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <button className="tb-btn tb-btn-soft" style={{ width: 54, height: 54, padding: 0, borderRadius: 999 }}>
          <TbIcon.chevL size={18} />
        </button>
        <TbDots active={pageIdx} count={total} />
        <button className="tb-btn tb-btn-primary" style={{ flex: 1, marginRight: 12 }}>
          {primary}
        </button>
      </div>
    </div>
  );
}

// Onboarding 1
function ScOnboard1() {
  return (
    <ScOnboardingShell
      pageIdx={0}
      total={4}
      illuKind="listen"
      title="اسمع جسدك، لا تعد السعرات"
      sub="نظام الطيّبات يركّز على الأكل عند الجوع الحقيقي واختيار أطعمة تشفي الجسم من الالتهاب."
      bullets={[
        'أطعمة مسموحة محدّدة بوضوح',
        'الأكل عند الجوع الفعلي، لا على جدول',
        'الاستماع لإشارات جسدك',
      ]}
    />
  );
}
// Onboarding 2
function ScOnboard2() {
  return (
    <ScOnboardingShell
      pageIdx={1}
      total={4}
      illuKind="watch"
      title="راقب شعورك يتحسّن"
      sub="كل أسبوع سنسألك عن شعورك ونقيس تحسّنك من خلال الراحة والعافية، ليس الأرقام."
      bullets={[
        'تقييمات أسبوعية بسيطة',
        'شارات التحفيز لتشجيعك',
        'رسوم بيانية توضح تحسّنك',
      ]}
    />
  );
}
// Onboarding 3 — zones intro
function ScOnboard3() {
  return (
    <div className="tb-screen">
      <div style={{ padding: '70px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--tb-green-deep)', fontWeight: 800, fontSize: 17 }}>الطيّبات</div>
        <button style={{ background: 'none', border: 'none', color: 'var(--tb-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>تخطّي</button>
      </div>
      <div className="tb-scroll" style={{ padding: '18px 24px 16px' }}>
        <div style={{
          background: '#fff', borderRadius: 22, padding: 22,
          boxShadow: 'var(--tb-shadow-1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(180deg, #1ED49A, #0CA170)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><TbIcon.leaf size={28} /></div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--tb-muted)', fontWeight: 700 }}>خريطة الطيّبات</div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>خمس مناطق لونية</div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: 'var(--tb-zone-green)',  n: 'الخضراء',  d: 'يومي بدون قيد', tag: 'الأساس' },
              { c: 'var(--tb-zone-yellow)', n: 'الصفراء',  d: 'يومي مع المراقبة', tag: 'حذِر' },
              { c: 'var(--tb-zone-orange)', n: 'البرتقالية', d: 'أسبوعي ١-٣ مرات', tag: 'محدود' },
              { c: 'var(--tb-zone-purple)', n: 'البنفسجية', d: 'للأصحاء فقط', tag: 'نادر' },
              { c: 'var(--tb-zone-red)',    n: 'الحمراء',   d: 'ممنوع نهائياً', tag: 'تجنّب' },
            ].map((z, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 14,
                background: 'rgba(241,245,249,0.5)',
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 999, background: z.c, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>المنطقة {z.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--tb-muted)' }}>{z.d}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: z.c, background: '#fff', padding: '4px 10px', borderRadius: 999, border: `1px solid ${z.c}30` }}>{z.tag}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>خريطة طعام واضحة بألوان</h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--tb-muted)' }}>
            كل صنف غذائي له منطقة. لا تخمين ولا حسابات — فقط افتح القائمة وكُل من الأخضر بثقة.
          </p>
        </div>
      </div>

      <div style={{ padding: '6px 24px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <button className="tb-btn tb-btn-soft" style={{ width: 54, height: 54, padding: 0, borderRadius: 999 }}>
          <TbIcon.chevL size={18} />
        </button>
        <TbDots active={2} count={4} />
        <button className="tb-btn tb-btn-primary" style={{ flex: 1, marginRight: 12 }}>
          التالي
        </button>
      </div>
    </div>
  );
}
// Onboarding 4 — Why join + CTA (matches last screenshot)
function ScWhyJoin() {
  return (
    <div className="tb-screen">
      <div style={{ padding: '70px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--tb-green-deep)', fontWeight: 800, fontSize: 17 }}>الطيّبات</div>
        <button style={{ background: 'none', border: 'none', color: 'var(--tb-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>تخطّي</button>
      </div>
      <div className="tb-scroll" style={{ padding: '14px 24px 8px' }}>
        <TbIllu kind="family" height={180} />

        <h1 style={{ margin: '22px 0 0', fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>لماذا تنضم إلى عائلة الطيّبات؟</h1>
        <p style={{ margin: '10px 0 18px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--tb-muted)' }}>
          رحلتك نحو الشفاء والراحة تبدأ هنا، بأسلوب حياة يفهم لغة جسدك.
        </p>

        {[
          { icon: <TbIcon.fork size={20} />, title: 'مراقبة فعّالية نظامك الغذائي', desc: 'لا نعدّ السعرات، بل نراقب كيف يستعيد جسدك حيويته وتختفي آلامك تدريجياً.' },
          { icon: <TbIcon.brain size={20} />, title: 'تتبّع السلوك والتحفيز الذكي', desc: 'أدوات ذكية تساعدك على الالتزام بإشارات الجوع الحقيقي وللوصول لمرحلة الاستشفاء التام.' },
          { icon: <TbIcon.community size={20} />, title: 'مشاركة قصص النجاح', desc: 'كن جزءاً من مجتمع ملهم يشارك تجارب التحسّن والتعافي لرفع المعنويات.' },
        ].map((row, i) => (
          <div key={i} className="tb-card" style={{ padding: 16, marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'var(--tb-green-soft)', color: 'var(--tb-green-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{row.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4 }}>{row.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--tb-muted)', lineHeight: 1.65 }}>{row.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <TbDots active={3} count={4} />
        </div>
      </div>

      <div style={{ padding: '14px 24px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="tb-btn tb-btn-primary">ابدأ الآن</button>
        <button className="tb-btn tb-btn-ghost">تسجيل الدخول</button>
      </div>
    </div>
  );
}

// ─── Sign In ──────────────────────────────────────────────────
function ScSignIn() {
  const [phone, setPhone] = useState('+٢٠١٠٠٠٠٠٠٠٠٠');
  const [pwd, setPwd] = useState('••••••••');
  return (
    <div className="tb-screen">
      <div style={{ padding: '70px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: '#fff', border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)' }}>
          <TbIcon.chevL size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--tb-green)', color: '#fff', display: 'grid', placeItems: 'center' }}><TbIcon.leaf size={16} /></div>
          <div style={{ fontWeight: 800, color: 'var(--tb-green-deep)' }}>الطيّبات</div>
        </div>
      </div>
      <div className="tb-scroll" style={{ padding: '28px 24px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>أهلاً بعودتك</h1>
        <p style={{ margin: '8px 0 28px', fontSize: 14.5, color: 'var(--tb-muted)', lineHeight: 1.6 }}>سعداء برؤيتك مجدّداً. تابع رحلتك من حيث توقّفت.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="tb-field">
            <label>رقم الهاتف</label>
            <div style={{ position: 'relative' }}>
              <input className="tb-input" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: 46 }} />
              <div style={{ position: 'absolute', left: 16, top: 0, height: 54, display: 'grid', placeItems: 'center', color: 'var(--tb-muted)' }}>
                <TbIcon.phone size={18} />
              </div>
            </div>
          </div>
          <div className="tb-field">
            <label>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input className="tb-input" value={pwd} onChange={e => setPwd(e.target.value)} type="text" style={{ paddingLeft: 46, letterSpacing: 4 }} />
              <div style={{ position: 'absolute', left: 16, top: 0, height: 54, display: 'grid', placeItems: 'center', color: 'var(--tb-muted)' }}>
                <TbIcon.eye size={18} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--tb-muted)', fontWeight: 600 }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--tb-green)', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <TbIcon.check size={11}/>
            </span>
            تذكّرني
          </label>
          <a style={{ fontSize: 13, color: 'var(--tb-green-deep)', fontWeight: 700, textDecoration: 'none' }}>نسيت كلمة المرور؟</a>
        </div>

        <button className="tb-btn tb-btn-primary" style={{ width: '100%', marginTop: 24 }}>تسجيل الدخول</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--tb-line)' }} />
          <div style={{ fontSize: 12, color: 'var(--tb-muted-2)', fontWeight: 600 }}>أو تابع باستخدام</div>
          <div style={{ flex: 1, height: 1, background: 'var(--tb-line)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="tb-btn tb-btn-soft" style={{ height: 52 }}><TbIcon.google /> Google</button>
          <button className="tb-btn tb-btn-soft" style={{ height: 52 }}><TbIcon.apple_logo /> Apple</button>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13.5, color: 'var(--tb-muted)' }}>
          ليس لديك حساب؟ <a style={{ color: 'var(--tb-green-deep)', fontWeight: 800, textDecoration: 'none' }}>أنشئ حساباً</a>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up ──────────────────────────────────────────────────
function ScSignUp() {
  return (
    <div className="tb-screen">
      <div style={{ padding: '70px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: '#fff', border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)' }}>
          <TbIcon.chevL size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--tb-green)', color: '#fff', display: 'grid', placeItems: 'center' }}><TbIcon.leaf size={16} /></div>
          <div style={{ fontWeight: 800, color: 'var(--tb-green-deep)' }}>الطيّبات</div>
        </div>
      </div>
      <div className="tb-scroll" style={{ padding: '22px 24px 30px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>أنشئ حسابك</h1>
        <p style={{ margin: '8px 0 22px', fontSize: 14.5, color: 'var(--tb-muted)', lineHeight: 1.6 }}>دقيقة واحدة، وتبدأ رحلتك نحو راحة جسدك.</p>

        {/* progress strip */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i === 1 ? 'var(--tb-green)' : 'var(--tb-line)' }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tb-field">
            <label>الاسم الكامل</label>
            <input className="tb-input" defaultValue="سارة محمود" />
          </div>
          <div className="tb-field">
            <label>رقم الهاتف</label>
            <input className="tb-input" defaultValue="+٢٠١٠٠ ٠٠٠ ٠٠٠٠" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="tb-field">
              <label>العمر</label>
              <input className="tb-input" defaultValue="٣٤" />
            </div>
            <div className="tb-field">
              <label>الجنس</label>
              <div className="tb-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>أنثى</span>
                <span style={{ color: 'var(--tb-muted-2)' }}><TbIcon.chevD size={14}/></span>
              </div>
            </div>
          </div>
          <div className="tb-field">
            <label>كلمة المرور</label>
            <input className="tb-input" type="text" defaultValue="••••••••" style={{ letterSpacing: 4 }} />
          </div>
        </div>

        {/* terms */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--tb-green)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0, marginTop: 2 }}>
            <TbIcon.check size={12}/>
          </span>
          <div style={{ fontSize: 12.5, color: 'var(--tb-muted)', lineHeight: 1.6 }}>
            أوافق على <a style={{ color: 'var(--tb-green-deep)', fontWeight: 700 }}>شروط الاستخدام</a> و<a style={{ color: 'var(--tb-green-deep)', fontWeight: 700 }}>سياسة الخصوصية</a>
          </div>
        </div>

        <button className="tb-btn tb-btn-primary" style={{ width: '100%', marginTop: 22 }}>متابعة</button>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13.5, color: 'var(--tb-muted)' }}>
          لديك حساب بالفعل؟ <a style={{ color: 'var(--tb-green-deep)', fontWeight: 800, textDecoration: 'none' }}>سجّل الدخول</a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScSplash, ScOnboard1, ScOnboard2, ScOnboard3, ScWhyJoin, ScSignIn, ScSignUp, TbDots, TbIllu });
