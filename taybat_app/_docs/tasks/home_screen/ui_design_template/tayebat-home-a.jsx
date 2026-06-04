// Tayebat — Home Screen Variation A: "Today's Healing"
// Focus: A calm daily companion. The hero is a hunger check-in,
// not a stat. The day's allowed plate + a single weekly nudge.

function ScHomeA() {
  return (
    <div className="tb-screen">
      {/* header */}
      <div style={{ padding: '60px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 999,
            background: 'linear-gradient(135deg, #1ED49A, #0CA170)',
            color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17,
          }}>س</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--tb-muted)', fontWeight: 600 }}>صباح الخير،</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tb-ink)' }}>سارة 🌿</div>
          </div>
        </div>
        <button style={{
          position: 'relative', width: 44, height: 44, borderRadius: 999, background: '#fff',
          border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)',
        }}>
          <TbIcon.bell size={20}/>
          <span style={{
            position: 'absolute', top: 9, right: 11, width: 8, height: 8,
            borderRadius: 999, background: 'var(--tb-rose)', border: '2px solid #fff',
          }}/>
        </button>
      </div>

      <div className="tb-scroll" style={{ padding: '4px 22px 110px' }}>
        {/* HERO — Hunger check-in */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(150deg, #0EA875 0%, #1ED49A 100%)',
          borderRadius: 26, padding: '22px 22px 20px', color: '#fff',
          overflow: 'hidden',
          boxShadow: '0 20px 36px rgba(14,168,117,0.30)',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 999, background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ position: 'absolute', left: -50, bottom: -60, width: 150, height: 150, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700,
              }}>اليوم ١٢ من رحلتك</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.22)',
                fontSize: 11, fontWeight: 700,
              }}><TbIcon.flame size={12}/> ٥ أيام التزام</div>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, marginBottom: 4 }}>هل تشعرين بالجوع الآن؟</div>
            <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.6, marginBottom: 18 }}>
              توقّفي لحظة وأنصتي. آخر إشارة جوع كانت قبل <b style={{ fontWeight: 800 }}>٣ ساعات</b>.
            </div>

            {/* moods row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[
                { e: '😋', l: 'جوع شديد' },
                { e: '🙂', l: 'جائع' },
                { e: '😌', l: 'عادي' },
                { e: '😊', l: 'شبعان' },
              ].map((m, i) => (
                <button key={i} style={{
                  flex: 1, padding: '12px 4px', borderRadius: 16,
                  background: i === 1 ? '#fff' : 'rgba(255,255,255,0.18)',
                  border: 'none', cursor: 'pointer',
                  color: i === 1 ? 'var(--tb-ink)' : '#fff',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{m.e}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700 }}>{m.l}</div>
                </button>
              ))}
            </div>

            <button style={{
              width: '100%', height: 46, borderRadius: 12,
              background: '#fff', color: 'var(--tb-green-deep)',
              border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: 14.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <TbIcon.plus size={16}/> سجّلي وجبة الآن
            </button>
          </div>
        </div>

        {/* Today's plate */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>طبق اليوم المقترح</h3>
            <a>تبديل ↻</a>
          </div>
          <div className="tb-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { meal: 'الإفطار', name: 'تمر مع زيت زيتون', sub: 'مع كوب ماء دافئ', zone: 'green', icon: <TbIcon.apple size={22}/>, done: true },
              { meal: 'الغداء',   name: 'أرز أبيض + بطاطس مسلوقة', sub: 'مع ملح وقليل من العسل', zone: 'green', icon: <TbIcon.bowl size={22}/>, done: false },
              { meal: 'العصر',   name: 'توست قمح كامل + جبن أصفر', sub: 'مراقبة الأعراض', zone: 'yellow', icon: <TbIcon.fork size={22}/>, done: false },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: m.zone === 'green' ? 'var(--tb-green-soft)' : '#FFF4D6',
                  color: m.zone === 'green' ? 'var(--tb-green-deep)' : '#B8852C',
                  display: 'grid', placeItems: 'center',
                }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-muted)' }}>{m.meal}</span>
                    <span style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: m.zone === 'green' ? 'var(--tb-zone-green)' : 'var(--tb-zone-yellow)',
                    }}/>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: m.zone === 'green' ? 'var(--tb-zone-green)' : '#B8852C' }}>
                      {m.zone === 'green' ? 'منطقة خضراء' : 'منطقة صفراء'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--tb-ink)' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tb-muted)', marginTop: 2 }}>{m.sub}</div>
                </div>
                <button style={{
                  width: 32, height: 32, borderRadius: 999, border: 'none',
                  background: m.done ? 'var(--tb-green)' : '#F1F5F9',
                  color: m.done ? '#fff' : 'var(--tb-muted-2)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}><TbIcon.check size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Eval nudge */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-card" style={{
            padding: 18, display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(135deg, #FFFAEC 0%, #FFF4D6 100%)',
            border: '1px solid #F5C24A30',
            boxShadow: 'none',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: '#F5C24A', color: '#fff',
              display: 'grid', placeItems: 'center',
            }}><TbIcon.spark size={26}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#B8852C', marginBottom: 2 }}>تقييم أسبوعي</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--tb-ink)' }}>كيف كان شعورك هذا الأسبوع؟</div>
              <div style={{ fontSize: 11.5, color: 'var(--tb-muted)', marginTop: 2 }}>دقيقتان فقط — قياس راحتك لا أرقامك</div>
            </div>
            <button style={{
              width: 36, height: 36, borderRadius: 999, border: 'none',
              background: '#F5C24A', color: '#fff', display: 'grid', placeItems: 'center',
            }}><TbIcon.arrowL size={18}/></button>
          </div>
        </div>

        {/* Wellness signals — small grid */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>إشارات جسدك هذا الأسبوع</h3>
            <a>تفاصيل</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="tb-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ color: 'var(--tb-green-deep)' }}><TbIcon.heart size={18}/></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tb-muted)' }}>الراحة</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>تحسّن</div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', gap: 3, height: 22 }}>
                {[8,12,9,14,11,16,18].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h, borderRadius: 2, background: i === 6 ? 'var(--tb-green)' : 'var(--tb-green-soft)' }}/>
                ))}
              </div>
            </div>
            <div className="tb-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ color: '#0EA875' }}><TbIcon.drop size={18}/></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tb-muted)' }}>الترطيب</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>٥<span style={{ fontSize: 14, color: 'var(--tb-muted)', fontWeight: 700 }}>/٨</span></div>
              </div>
              <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: 'var(--tb-bg-tint)' }}>
                <div style={{ width: '62%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #1ED49A, #0CA170)' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Badge unlock */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, #FFE08A, #F5A623)',
              display: 'grid', placeItems: 'center', color: '#fff',
              boxShadow: '0 8px 22px rgba(245,166,35,0.32)',
            }}><TbIcon.medal size={26}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-honey)', marginBottom: 2 }}>قريباً 🎉</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>أسبوع من النجاح</div>
              <div style={{ marginTop: 6, height: 5, borderRadius: 999, background: 'var(--tb-bg-tint)' }}>
                <div style={{ width: '71%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #FFD062, #F5A623)' }}/>
              </div>
              <div style={{ fontSize: 11, color: 'var(--tb-muted)', marginTop: 4 }}>٥ من ٧ أيام</div>
            </div>
          </div>
        </div>
      </div>

      <HomeTabBar active="home" />
    </div>
  );
}

// Shared bottom navigation
function HomeTabBar({ active = 'home' }) {
  const tab = (key, label, Icon) => {
    const isActive = key === active;
    return (
      <div className={"tb-tab " + (isActive ? 'active' : '')}>
        <Icon size={22} filled={isActive}/>
        <span>{label}</span>
      </div>
    );
  };
  return (
    <div className="tb-tabbar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      {tab('home', 'الرئيسية', TbIcon.home)}
      {tab('library', 'المكتبة', TbIcon.book)}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="tb-fab-tab"><TbIcon.plus size={26}/></div>
      </div>
      {tab('badges', 'الشارات', TbIcon.medal)}
      {tab('profile', 'حسابي', TbIcon.user)}
    </div>
  );
}

Object.assign(window, { ScHomeA, HomeTabBar });
