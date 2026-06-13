# Al-Taybat — Low-Cost Launch Plan (Proposal)

> Goal: publish **Android app + landing website** as fast and cheap as possible, defer iOS / Facebook auth / paid tiers to later phases.
> Date: 2026-06-12

---

## 1. The Big Question Answered: "Supabase or hosting server?"

**They are not alternatives — you need both, and both are free at your scale.**

| Piece | What it is | Where it lives |
|---|---|---|
| Backend (DB, Auth, Storage, Email triggers) | Supabase | **Supabase Cloud — Free plan** (already there) |
| Web (landing page + admin panel) | Next.js 16 app (`tayabat_web`) | **Vercel — free Hobby plan** (Supabase **cannot** host a Next.js app) |
| Mobile app | Expo / React Native (`taybat_app`) | **Google Play** (binary lives on Play, talks to Supabase) |

Supabase only hosts your database/auth/storage/edge-functions. The Next.js site must be deployed to a web host. **Vercel** is the zero-config choice for Next.js (made by the same company). Alternative: Cloudflare Pages/Workers (also free, friendlier terms for commercial use, but needs the OpenNext adapter — more setup). **Recommendation: start on Vercel Hobby; move to Vercel Pro ($20/mo) or Cloudflare only when traffic grows.**

---

## 2. Total Cost to Launch

| Item | Cost | When |
|---|---|---|
| Domain (e.g. `taybat.app` / `.com`) | ~$10–12 / year | Day 1 |
| Google Play developer account | **$25 one-time** | Day 1 |
| Vercel Hobby (web hosting) | $0 | — |
| Supabase Free plan | $0 | — |
| Resend (SMTP for auth emails) | $0 (3,000 emails/mo, 100/day) | — |
| Cloudflare (DNS + CDN) | $0 | — |
| **Total first year** | **≈ $35–40** | |

Deferred costs (only when you scale):
- Apple Developer (iOS): **$99/year** — Phase 2
- Supabase Pro: $25/mo — when you exceed 500 MB DB / 1 GB storage / need backups
- Vercel Pro: $20/mo — when landing traffic is heavy or you want to be clean on commercial-use terms
- Resend paid: $20/mo — beyond 3,000 emails/month

### Domain advice
There is **no good free domain** anymore (free TLDs like `.tk` are dead and hurt SEO/trust). $10/year is the only unavoidable cost:
- **Porkbun** or **Cloudflare Registrar** — sell at cost (~$10/yr for `.com`, free WHOIS privacy).
- First-year promos: `.xyz` / `.site` ≈ $1–2 first year (but renewal $10+, and `.com`/`.app` look more trustworthy).
- Either way, point DNS to **Cloudflare (free plan)** — free SSL, CDN, and easy subdomains (`www`, `admin`, `api`-style mail records).

**Recommendation:** buy one `.com` (or `.app`) and use subpaths/subdomains for everything: `taybat.com` (landing), `taybat.com/admin` (admin panel), email `no-reply@taybat.com`.

---

## 3. Critical Timeline Constraint — Google Play Closed Testing

⚠️ **Personal Play Console accounts created after 13 Nov 2023 cannot publish to production until the app has run a closed test with ≥ 12 testers opted-in continuously for 14 days.** ([Google policy](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en))

This means **the 14-day clock is your real bottleneck — start it immediately.** Plan around it:

1. Create the Play account **today** (identity verification itself can take a few days).
2. Upload your **current build** to Closed Testing as soon as the account is ready — it does *not* need to be feature-complete.
3. Recruit 12+ testers (family, friends, colleagues; or tester-exchange communities). Once a tester opts in, uninstalling doesn't break the count.
4. Keep shipping fixes to the same closed track during the 14 days.
5. After 14 days, apply for **production access**, then publish.

*Alternative that skips this entirely:* register as an **organization account** (no tester requirement) — but it requires a D-U-N-S number / registered business, which usually takes longer than just doing the 14-day test. **Recommendation: personal account + start the clock now.**

---

## 4. Supabase Free Plan — What You Get & The Two Gotchas

Free plan is genuinely enough for launch: **50,000 monthly active users (auth), 500 MB database, 1 GB file storage, 5 GB egress, unlimited API requests** ([pricing](https://supabase.com/pricing)).

### Gotcha 1 — Default email is unusable in production
Supabase's built-in mailer sends **~2 emails/hour** and is meant for dev only. **You must configure custom SMTP before launch** ([docs](https://supabase.com/docs/guides/auth/auth-smtp)) — available on the free plan:

1. Sign up at **Resend** (free: 3,000 emails/mo, 100/day) — best free tier; alternative: Brevo (300/day).
2. Verify your new domain in Resend (add DNS records in Cloudflare: SPF, DKIM).
3. Supabase Dashboard → Authentication → SMTP Settings → enter Resend SMTP credentials, sender `no-reply@yourdomain.com`.
4. Raise the auth email rate limit (defaults to 30/hr with custom SMTP) in Auth → Rate Limits.
5. Translate/brand the email templates (confirm signup, magic link, reset password) — Arabic + your logo.

### Gotcha 2 — Free projects pause after 7 days of no DB activity
Once real users sign in daily this never triggers. During the quiet pre-launch period, a scheduled job (e.g. a Supabase cron / GitHub Action pinging a table daily) keeps it alive. Upgrade to Pro only when you have real traction.

---

## 5. Auth Scope for Phase 1

| Provider | Phase 1? | Notes |
|---|---|---|
| Email + password | ✅ | Needs custom SMTP (above) for verification emails |
| Google Sign-In | ✅ | Free; create OAuth client in Google Cloud Console; add production redirect URL `https://<project-ref>.supabase.co/auth/v1/callback`; app scheme `taybatapp://` already configured |
| Facebook | ❌ **Deferred** | Meta app-review approval blocked — hide the button behind a feature flag, remove the provider from the Supabase dashboard for now |
| Apple Sign-In | ❌ Deferred to iOS phase | **Note:** Apple *requires* Sign in with Apple on iOS if you offer Google login — budget it into Phase 2 |

Action in code: gate the Facebook button with a flag (e.g. `ENABLE_FACEBOOK_AUTH=false` in env) rather than deleting it, so Phase 2 is a flag flip after Meta approval.

---

## 6. Step-by-Step Launch Sequence

### Phase 0 — Accounts & Infrastructure (Day 1–2) — *do these in parallel*
- [ ] Buy domain (Porkbun / Cloudflare Registrar, ~$10)
- [ ] Add domain to Cloudflare free plan (DNS + SSL)
- [ ] Create Google Play developer account ($25) → start identity verification immediately
- [ ] Create Resend account → verify domain (SPF/DKIM in Cloudflare)
- [ ] Supabase: set custom SMTP, raise rate limits, Arabic email templates
- [ ] Supabase: confirm Site URL + redirect URLs use the new domain
- [ ] Google Cloud Console: OAuth consent screen with new domain, privacy-policy URL (required), production client IDs

### Phase 1 — Web Launch: Landing + Admin (Week 1)
- [ ] Push `tayabat_web` to GitHub, import to Vercel (auto CI/CD on every push)
- [ ] Attach custom domain in Vercel; set env vars (`NEXT_PUBLIC_SUPABASE_URL`, anon key)
- [ ] Landing page SEO: Arabic `lang="ar" dir="rtl"`, meta/OG tags, `sitemap.xml`, `robots.txt`
- [ ] Publish **privacy policy + terms pages** (you already have drafts in `_docs/_doc_technical/app-privacy/`) — required by both Google Play and the OAuth consent screen
- [ ] Add "Download on Google Play — coming soon / join the beta" CTA → use the landing page to recruit your 12 testers
- [ ] Register site in Google Search Console, submit sitemap
- [ ] Protect `/admin` (auth + role check) before going live

### Phase 2 — Android Closed Testing (Week 1–2, starts the 14-day clock)
- [ ] Replace placeholder values in `app.json` (Google iOS client ID can stay placeholder; verify android package `com.tayabat.sys` is final — **it can never change after first upload**)
- [ ] Bump `versionCode`, set production env (`.env`: prod Supabase URL/keys)
- [ ] Build signed AAB: `eas build -p android --profile production` (EAS free tier is enough; or build locally for free with the existing `android/` folder: `cd android && ./gradlew bundleRelease`)
- [ ] Play Console: create app, fill store listing (Arabic + English), content rating, data-safety form, privacy-policy URL
- [ ] Upload AAB to **Closed testing** track, invite 12+ testers via email list / Google Group
- [ ] During the 14 days: fix bugs, push updates to the same track; use **EAS Update** (free) for OTA JS fixes without store review

### Phase 3 — Production Launch (Week 3–4)
- [ ] After 14 days + 12 opted-in testers → apply for **Production access** in Play Console
- [ ] Promote the closed-testing build to Production (start with staged rollout 20% → 100%)
- [ ] Update landing page with the real Play Store link
- [ ] Announce (social, communities) — landing page is your SEO/ad target

### Phase 4 — Later (when revenue/traction justifies it)
- iOS: Apple Developer $99/yr + Sign in with Apple + TestFlight → App Store
- Facebook auth: finish Meta app review, flip the feature flag
- Supabase Pro ($25/mo): backups, no pausing, more storage
- Email volume → Resend paid; Web traffic → Vercel Pro
- Push notifications at scale, monitoring (Sentry free tier works meanwhile)

---

## 7. Realistic Timeline

```
Day 1–2     Domain + Cloudflare + Play account + Resend/SMTP + OAuth config
Day 3–5     Landing page live on Vercel with custom domain + privacy policy
Day 5–7     Signed AAB uploaded to Closed testing, 12 testers recruited
Day 7–21    14-day closed test window (keep fixing bugs, build features)
Day 21–25   Apply production access → approved → PUBLIC ON GOOGLE PLAY
```

**≈ 3–4 weeks to public Android launch, ~$35 total spend.** The web landing page is live within the first week and works as your tester-recruitment + SEO asset while the Play clock runs.

---

## Sources
- [Google Play — App testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Google Play community guide — the 12-testers requirement](https://support.google.com/googleplay/android-developer/community-guide/255621488/everything-about-the-12-testers-requirement?hl=en)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase — Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase — Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase — Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
