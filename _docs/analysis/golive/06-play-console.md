# 06 — Google Play Console

## 0. Account & timeline warning
- A **Google Play Developer account** ($25 one-time) is required.
- **New personal developer accounts** must run a **closed test with ≥12 testers for ≥14 continuous days** before they can promote to Production. **Start this immediately** — it is the longest pole in the tent. (Organization/business accounts registered before this rule may be exempt — check your account's requirements page.)

## 1. Create the app
- App name: **الطيبات** · Default language: Arabic · App/Game: App · Free.
- Package `com.tayabat.sys` is set the first time you upload an AAB.

## 2. Signing
- Enroll in **Play App Signing** (default). Upload via `eas submit` or manually. Record the **app signing SHA‑1** and feed it back to Google Sign‑In config → [05](05-google-cloud-firebase.md).

## 3. Store listing (Arabic, RTL)
Prepare assets:
- **App icon** 512×512 (have `assets/images/app_icon.png` — export at 512).
- **Feature graphic** 1024×500.
- **Phone screenshots** — min 2, recommend 4–8 (home, meal select, community, stats). Capture from a device in Arabic.
- Short description (≤80 chars) + full description — Arabic. Explain Dr. Diya Al‑Awadi's five-zone dietary system.
- Category (Health & Fitness), contact email, website (`tayabat_web` URL).

## 4. App content / policy declarations
- **Privacy Policy URL** (required) → hosted page from [B3](02-blockers.md).
- **Data safety form** — declare what you collect and why:
  - Personal: email, name (auth/profile).
  - Health info: dietary/meal logs, health goals/conditions → **declare health data**; explain it stays in the user's account.
  - App activity / analytics: Firebase Analytics events + pseudonymous user id.
  - Data is encrypted in transit; users can **request deletion in-app** (`account.tsx`) — provide the hosted deletion URL too.
- **Account deletion** — Play requires both in-app deletion (✅ present) **and** a web URL describing deletion (host `DELETION.md`).
- **Ads** — declare none (no ad SDK present).
- **Content rating** questionnaire → likely Everyone.
- **Target audience** — adults / not primarily children.
- **Government / health app** disclaimers if you make medical claims — keep copy as "dietary guidance," not medical treatment.

## 5. Permissions justification
Declared permissions: `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` (local reminders that survive reboot). No sensitive permissions (no location, camera, contacts) → no special declaration form needed.

## 6. Release tracks (recommended flow)
1. **Internal testing** — upload first AAB, smoke-test Google login + core flows on real devices.
2. **Closed testing** — enroll ≥12 testers, keep active ≥14 days (satisfies the new-account rule). Collect crash/feedback.
3. **Production** — staged rollout (start 10–20%), watch **Android vitals** (ANRs/crashes) and Supabase usage, then ramp to 100%.

## 7. Pre-launch checks Google runs
- **Pre-launch report** (automated device farm) — review for crashes on the release build; catches Proguard/native issues before users do.
- Ensure `EXPO_PUBLIC_USE_MOCK=false` is baked into the uploaded AAB (test login actually hits Supabase, not mocks).
