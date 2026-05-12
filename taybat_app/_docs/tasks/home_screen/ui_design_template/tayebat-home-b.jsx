// Tayebat — Home Screen Variation B: "Healing Zones"
// Focus: The 5 color zones are the central metaphor.
// A ring shows the week's zone mix; recent meals are zone-tagged.

function ScHomeB() {
  const zones = [
    { key: 'green',  name: 'خضراء',   color: 'var(--tb-zone-green)',  pct: 64, count: 18 },
    { key: 'yellow', name: 'صفراء',   color: 'var(--tb-zone-yellow)', pct: 22, count: 6 },
    { key: 'orange', name: 'برتقالية', color: 'var(--tb-zone-orange)', pct: 9,  count: 2 },
    { key: 'purple', name: 'بنفسجية', color: 'var(--tb-zone-purple)', pct: 5,  count: 1 },
    { key: 'red',    name: 'حمراء',   color: 'var(--tb-zone-red)',    pct: 0,  count: 0 },
  ];

  // Build conic-gradient
  let cursor = 0;
  const gradStops = zones.filter(z => z.pct > 0).map(z => {
    const a = cursor; const b = cursor + z.pct; cursor = b;
    return `${z.color} ${a}% ${b}%`;
  }).join(', ') + ', var(--tb-bg-tint) ' + cursor + '% 100%';

  return (
    <div className="tb-screen">
      {/* header */}
      <div style={{ padding: '60px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--tb-muted)', fontWeight: 600 }}>الأسبوع الثالث · يوم ١٢</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--tb-ink)' }}>خريطتك اليوم</div>
        </div>
        <button style={{
          width: 44, height: 44, borderRadius: 999, background: '#fff',
          border: '1px solid var(--tb-line)', display: 'grid', placeItems: 'center', color: 'var(--tb-ink)',
        }}><TbIcon.bell size={20}/></button>
      </div>

      <div className="tb-scroll" style={{ padding: '4px 22px 110px' }}>
        {/* HERO — Zone Ring */}
        <div className="tb-card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {/* ring */}
            <div style={{
              width: 150, height: 150, borderRadius: '50%',
              background: `conic-gradient(${gradStops})`,
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 18px rgba(16,185,129,0.15)',
            }}>
              <div style={{
                width: 108, height: 108, borderRadius: '50%',
                background: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px var(--tb-line-soft)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--tb-muted)', fontWeight: 700 }}>التزام الأسبوع</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--tb-ink)', lineHeight: 1 }}>٨٦<span style={{ fontSize: 16, color: 'var(--tb-muted)' }}>٪</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--tb-green-deep)', marginTop: 4 }}>
                  <TbIcon.flame size={12}/> ٥ أيام
                </div>
              </div>
            </div>
            {/* legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {zones.slice(0, 4).map((z) => (
                <div key={z.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: z.color, flexShrink: 0 }}/>
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: 'var(--tb-ink-2)' }}>{z.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tb-muted)' }}>{z.pct}٪</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 16, padding: '12px 14px', borderRadius: 14,
            background: 'var(--tb-green-tint)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ color: 'var(--tb-green-deep)' }}><TbIcon.spark size={18}/></div>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: 'var(--tb-ink-2)' }}>
              ٦٤٪ من طعامك خلال الأسبوع كان من المنطقة الخضراء — توازن ممتاز.
            </div>
          </div>
        </div>

        {/* Quick: What can I eat now? */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>ماذا يمكنني تناوله الآن؟</h3>
            <a>الكل</a>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginInline: -22, paddingInline: 22 }}>
            {[
              { name: 'أرز أبيض',       zone: 'green', icon: <TbIcon.bowl size={22}/>, qty: '٢٠٠غم' },
              { name: 'تمر',             zone: 'green', icon: <TbIcon.apple size={22}/>, qty: '٥ حبات' },
              { name: 'زيت زيتون',       zone: 'green', icon: <TbIcon.drop size={22}/>, qty: 'م. كبيرة' },
              { name: 'بطاطس مسلوقة',    zone: 'green', icon: <TbIcon.fork size={22}/>, qty: 'حبتان' },
              { name: 'جبن أصفر',        zone: 'yellow', icon: <TbIcon.fork size={22}/>, qty: 'شريحة' },
            ].map((f, i) => (
              <div key={i} style={{
                minWidth: 130, padding: 14, borderRadius: 18, background: '#fff',
                boxShadow: 'var(--tb-shadow-1)', display: 'flex', flexDirection: 'column', gap: 8,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  width: 8, height: 8, borderRadius: 999,
                  background: f.zone === 'green' ? 'var(--tb-zone-green)' : 'var(--tb-zone-yellow)',
                }}/>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: f.zone === 'green' ? 'var(--tb-green-soft)' : '#FFF4D6',
                  color: f.zone === 'green' ? 'var(--tb-green-deep)' : '#B8852C',
                  display: 'grid', placeItems: 'center',
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tb-ink)' }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--tb-muted)', marginTop: 2 }}>{f.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's meal log */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-section-h">
            <h3>وجبات اليوم</h3>
            <a>+ سجّل</a>
          </div>
          <div className="tb-card" style={{ padding: '6px 0' }}>
            {[
              { t: '٨:١٤', meal: 'إفطار', name: 'تمر + زيت زيتون', zone: 'green' },
              { t: '١:٣٠', meal: 'غداء',   name: 'أرز + بطاطس مسلوقة', zone: 'green' },
              { t: '٤:٤٥', meal: 'مسليات', name: 'شوكولاتة داكنة', zone: 'yellow' },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--tb-line-soft)' : 'none',
              }}>
                <div style={{
                  width: 5, height: 42, borderRadius: 5,
                  background: row.zone === 'green' ? 'var(--tb-zone-green)' : 'var(--tb-zone-yellow)',
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-muted)' }}>{row.meal}</span>
                    <span style={{ fontSize: 11, color: 'var(--tb-muted-2)' }}>{row.t}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tb-ink)', marginTop: 2 }}>{row.name}</div>
                </div>
                <button style={{
                  width: 30, height: 30, borderRadius: 999, border: 'none',
                  background: 'var(--tb-bg-tint)', color: 'var(--tb-muted)',
                  display: 'grid', placeItems: 'center',
                }}><TbIcon.refresh size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Zone tip */}
        <div style={{ marginTop: 22 }}>
          <div className="tb-card" style={{
            padding: 18,
            background: 'linear-gradient(135deg, #F4F8FB, #FFFFFF)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'var(--tb-ink)', color: '#fff',
              display: 'grid', placeItems: 'center',
            }}><TbIcon.leaf size={20}/></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tb-muted)', marginBottom: 4 }}>نصيحة اليوم</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--tb-ink)', lineHeight: 1.5 }}>إذا ظهرت أعراض من الصفراء، عودي للخضراء حتى تزول.</div>
              <a style={{ fontSize: 12.5, color: 'var(--tb-green-deep)', fontWeight: 800, marginTop: 8, display: 'inline-block' }}>اقرئي المزيد ←</a>
            </div>
          </div>
        </div>
      </div>

      <HomeTabBar active="home"/>
    </div>
  );
}

Object.assign(window, { ScHomeB });
