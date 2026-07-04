# Prompt: Build the Al-Tayabat App Landing Page From Scratch

> Paste everything below into the other agent as one prompt. It describes the
> site by content, structure, and behavior only — no file names or code from
> any existing implementation are referenced, so the agent is free to choose
> its own architecture.

---

## 1. Project context

Build a marketing landing page (single homepage + a handful of informational
sub-pages) for **"الطيبات" (Al-Tayabat)** — a free mobile app (iOS + Android)
that helps users follow "نظام الطيبات" ("the Tayabat system"), a natural
nutrition/lifestyle method created by the late Dr. Dhia Al-Awadi (الدكتور ضياء
العوضي رحمه الله). The method is built on listening to your body, balance over
restriction, and self-healing through clean inputs.

- **Audience:** Arabic-speaking adults interested in natural health/nutrition.
- **Language:** Arabic only, RTL layout, throughout the entire site.
- **Slogan (use verbatim, it's the brand line):**
  > نظّم غذاءك، راقب تحسّنك أسبوعيًا، وشارك تجربتك مع مجتمع شفاف
- **Tone:** warm, calm, trustworthy, slightly spiritual/reverent when
  referencing the founder, never clinical or pushy.
- **Primary goal of the page:** explain the app's value and drive app
  installs (App Store / Google Play badges, with a "coming soon" state since
  the app may still be in review).

## 2. Hard content rules (non-negotiable)

These rules exist because the underlying nutrition system has a detailed
reference book, and any specific food/meal data is operational and subject to
change inside the app itself:

1. **Never invent or copy a specific list of foods, dishes, or a weekly meal
   plan onto the website.** No "allowed foods" / "forbidden foods" tables, no
   named dishes, no quantities or frequencies tied to a named food.
2. Content about food classification must stay at the **conceptual level**
   only — e.g., "foods are grouped into tiers by how often they're safe to
   eat" — never list which food belongs to which tier.
3. Every page that touches this topic must end with a clear call-to-action
   pointing the reader to **download the app** for the actual, up-to-date
   classification — phrase it naturally, e.g. "for the full, current
   breakdown of every food item, download the app."
4. All written content must be **original phrasing** — do not reproduce any
   existing marketing copy, book text, or app store listing verbatim from any
   source you're given or recall; rewrite ideas in your own words.
5. Anything resembling medical/health claims must carry a short disclaimer
   that this is lifestyle/educational content, not a substitute for medical
   advice, and users should not stop prescribed medication without consulting
   their doctor.

## 3. Required pages & sections

### Homepage (in this order)

1. **Sticky navbar** — logo + name, in-page anchor links to Features / Food
   Levels / Golden Rules / Screenshots, a persistent "Download" CTA button.
2. **Hero** — H1 combining the brand name and the core promise ("listen to
   your body, understand its nature"), a short supporting paragraph, 2 small
   highlight chips (e.g. "weekly health score", "transparent community
   stats"), the founder's signature quote ("الصحة هي الحالة الطبيعية — المرض
   هو الانحراف"), a short medical disclaimer box, app store badges, and an
   illustrative phone mockup of the app's home screen.
3. **Stats/principles strip** — 4 short principle chips (listen to your body,
   balance not extremes, self-healing, consistency over perfection).
4. **App goals section** — grid of ~6 cards explaining the philosophy in
   product terms (self-healing principle, listen to your body, suggested
   meals with swap options, smart weekly evaluation, transparent community
   statistics, balance not deprivation). No specific foods.
5. **Core app features section** — 2 large "headline" feature cards (weekly
   health evaluation; transparent community statistics — both described as
   genuinely differentiating) + ~6 smaller feature cards (daily suggested
   meals with swap option, weekly repetition tracking, reviewable health
   history, community of real users, achievements/streak calendar, in-app
   knowledge library). Keep all of this feature-level, no named foods.
6. **"Why this is the best app for the Tayabat system" comparison section** —
   3–4 short reasons (official adaptation of the founder's method, unique
   weekly scientific evaluation, transparent aggregated community statistics,
   adaptive food classification that updates without the user memorizing
   anything).
7. **Research/community impact section** — frame the app as more than a meal
   tracker: every completed weekly evaluation contributes anonymized data to
   a transparent, collectively-visible measure of how well the system works
   in practice (average improvement, adherence rates, most successful
   patterns) — emphasize transparency and shared benefit, not hard numbers
   you don't have.
8. **Food levels section** — explain that allowed foods are graded into
   tiers by recommended frequency (e.g., daily staple → daily-limited →
   weekly-limited → occasional/healthy-only → avoid entirely), described
   purely as a *framework*, never naming actual foods in any tier.
9. **Golden rules section** — 6 lifestyle habits as the foundation of the
   method (eat only at true hunger, stop before full, weekly/monthly
   fasting rhythm, natural vinegar after meals, warm water on an empty
   stomach, light daily movement). These are behavioral principles, safe to
   describe specifically (they aren't food examples).
10. **Screenshots / app tour section** — a horizontally scrollable set of ~4
    phone mockups (home, meal selection, stats/calendar, community feed),
    each with a short caption. Build these as illustrative UI mockups (not
    real screenshots) so the section works before real app screenshots
    exist; design the component so a real screenshot image can later replace
    a mockup per-slot without changing layout.
11. **Founder legacy section** — short bio framing of Dr. Dhia Al-Awadi as a
    natural-medicine researcher whose life's work was teaching people to
    understand their bodies; frame the app as a "sadaqah jariyah" (ongoing
    charitable legacy) carrying that work forward. 2–3 short pull-quotes
    attributed to him are fine if phrased originally, not copied from any
    source text.
12. **Community channels section** — optional row of social links (YouTube,
    Instagram, Facebook, X, TikTok) — render only if at least one is
    configured/provided.
13. **Download CTA section** — closing call-to-action with app icon, a short
    motivating line, store badges, and a graceful "in final review — register
    your interest via email" fallback state for when store links aren't live
    yet.
14. **Footer** — brand blurb, in-page nav links, links to legal pages
    (privacy policy, terms of use, account/data deletion), contact email, a
    new "Learn about the system" link group (see sub-pages below), copyright
    + the same medical disclaimer line.

### Required sub-pages (separate routes, all linked from the footer)

Each is a short, original-wording article page (not a copy of any source
book) that ends with the same "download the app for full details" CTA:

- **About the system** — what the Tayabat system is, its core idea (the body
  manufactures what it needs from clean inputs rather than only extracting
  ready-made nutrients), the "body knows best" principle, balance over
  extremes.
- **Food levels (conceptual)** — expands section 8 above into a full page,
  still with zero named foods.
- **Golden rules** — expands section 9 above into a full page with one
  paragraph per rule.
- **Founder biography** — expands section 11 above; mention there are many
  underlying theories behind the method without detailing medical claims.
- **FAQ** — 5–7 short Q&As covering: what the system is, why this app is the
  best fit for it, what's allowed/forbidden (answer redirects to the app, per
  rule #3), how the weekly evaluation works, whether it replaces medical
  care (no), platform/pricing availability.

## 4. Visual direction

- Arabic-first typography using a modern, geometric Arabic-supporting
  typeface (e.g. a Google "Cairo"-style font), RTL layout throughout.
- Warm, natural, health-brand palette: deep navy for headings/dark sections,
  an emerald/teal duo as the primary brand gradient, gold as an accent for
  "premium/founder" moments, soft pastel tints behind icons.
- Rounded, card-based UI (large radius, soft shadows, subtle hover lift),
  pill-shaped badges/tags, a floating/rotated phone mockup motif in the hero.
- Fully responsive, mobile-first; the screenshots section scrolls
  horizontally on small screens.

## 5. Technical & SEO requirements

- Use whatever modern web framework you prefer, but it must support: file or
  config-based metadata per page, a generated `sitemap.xml`, a generated
  `robots.txt` that disallows any admin/internal routes, and the ability to
  inject JSON-LD structured data.
- Route URLs for the sub-pages should be **ASCII slugs** (e.g. `/about`,
  `/food-levels`, `/golden-rules`, `/founder`, `/faq`) even though all visible
  content is Arabic — avoids known build/encoding issues with non-ASCII
  paths in some frameworks' canonical-URL/header handling. Titles, H1s, and
  body copy stay fully Arabic regardless of the URL.
- Each page needs a unique `<title>`, meta description, and canonical URL.
  The homepage title/description should foreground these phrases naturally:
  "نظام الطيبات", "تطبيق الطيبات", "أفضل تطبيق لنظام الطيبات", "تنظيم
  وجباتك", "تابع تحسّنك وتقييمك".
- Add an Open Graph image and `twitter:card = summary_large_image` for link
  previews; reuse the app icon/brand artwork if no dedicated social image
  exists yet.
- Add `SoftwareApplication` + `Organization` JSON-LD on the homepage. Add
  `FAQPage` JSON-LD **only** on the FAQ sub-page, and make sure its content
  matches the visible Q&A text exactly (don't put FAQ structured data on a
  page without matching visible FAQ content — that violates search engine
  structured-data guidelines).
- Make the homepage as statically cacheable as possible — avoid forcing
  fully dynamic, no-cache rendering just to read a small set of
  feature-flag/config values (e.g. social links, store URLs); fetch that
  kind of low-churn public config in a way that supports periodic
  regeneration (e.g. revalidate every hour) rather than per-request.
- Include a short, real medical disclaimer in the hero and reuse it (or a
  shorter version) in the footer.

## 6. Deliverable

Produce the full working site (or a single homepage if that's all that's
feasible) matching the structure above, plus the sub-pages, with all visible
text in natural, original Arabic copy — not placeholder Lorem Ipsum, and not
copied from any external source.
