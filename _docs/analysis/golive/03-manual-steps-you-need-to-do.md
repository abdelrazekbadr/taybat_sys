
# Manual Steps — Google Play Publish

Only what genuinely needs you (payment, external-console clicks, secrets). Everything else I handle. Do these in order.

## Who does what — full picture

State is verified against the actual repo/environment as of this check (not just "who's capable of it") — ✅ **Done** means I confirmed it's actually finished; ⏳ **Pending (Me)** means it's mine to do but not started yet; ⏳ **Pending (You)** means it's genuinely blocked on you.

| Step | I can do myself | What you'd need to do | State |
| --- | --- | --- | --- |
| 1. Fix `build.gradle` release signing | ✅ Yes — text edit, ready now | Confirm you want it applied | ⏳ Pending (Me) — `release` still points at `signingConfigs.debug`, not yet edited |
| 2. Generate production keystore | ✅ Yes — `keytool` runs fully non-interactively with flags, no prompts needed | Nothing | ⏳ Pending (Me) — only `debug.keystore` exists, no production keystore generated yet |
| 3. Wire keystore into the build (no interactive `eas credentials` menu needed) | ✅ Yes — write `credentials.json` + set `credentialsSource: local` in `eas.json`, both gitignored | Nothing | ⏳ Pending (Me) — `credentials.json` doesn't exist yet |
| 4. `eas.json` production/submit config | ✅ Yes | Nothing | ⏳ Pending (Me) — `eas.json`'s `production` block is still empty `{}` |
| 5. `eas build --platform android --profile production` | ✅ Yes — `eas` CLI is already logged in as `abadr-tayabat` in this environment, confirmed | Nothing, unless you want to review the build before it's kicked off | ⏳ Pending (Me) — blocked on steps 1–4 first; CLI login re-verified working now |
| 6. Register release SHA-1 in Firebase Console | ❌ Firebase Console is web-UI-only, no API/tool I have | You: paste the SHA-1 I generate into Firebase → Project settings → your Android app → Add fingerprint (2 minutes) | ⏳ Pending (You) — also blocked on step 2 (no SHA-1 to give you yet) |
| 7. Download updated `google-services.json`, place it in the repo | ⚠️ Split — download button only exists in Firebase Console (you click it) | You: click download, hand me the file. I'll drop it into both `taybat_app/google-services.json` and `android/app/google-services.json` myself | ⏳ Pending (You) — confirmed current file still has empty `oauth_client: []`, so this hasn't happened yet |
| 8. Google Play Console: create app + $25 fee | ❌ Payment + account, no tool | You, one-time | ⏳ Pending (You) |
| 9. Data safety form / content rating questionnaire answers | ✅ I can draft every answer from the actual data the app collects (checked against real schema/code, not guessed) | You paste/select them into the Play Console form — no API exists for this, it's genuinely UI-only | ⏳ Pending (Me) — draft not written yet |
| 10. Store listing copy (short + full description) | ✅ Yes, I'll write it | You paste it in, maybe tweak tone | ⏳ Pending (Me) — draft not written yet |
| 11. App icon (512×512 required) | ✅ Already done — `assets/images/app_icon.png` is exactly 512×512, no resizing needed | Nothing | ✅ Done — re-verified via `sips`: exactly 512×512 |
| 12. Feature graphic (1024×500) | ⚠️ I can produce a basic version (icon centered on a brand-color canvas via `sips` padding) | If you want a real designed banner rather than a placeholder, that's on you or a designer | ⏳ Pending (Me) — not generated yet |
| 13. Phone screenshots | ⚠️ Only if a simulator/device is reachable from this environment — unconfirmed | Run the app and share screenshots, or tell me to try driving a simulator here | ⏳ Pending (You) — no device/emulator currently connected (`adb devices` is empty); reconnect one and I can capture these myself |
| 14. Google Play service account JSON (for `eas submit`) | ❌ Google Cloud Console UI, no tool | You: create it once (steps below), hand me the file path — never paste key contents in chat | ⏳ Pending (You) — file not present in repo |
| 15. `eas submit` | ✅ Yes, once #14 exists | Nothing | ⏳ Pending (Me) — blocked on step 14 |
| 16. Closed-testing requirement check (new accounts) | ❌ Only visible in your Play Console account | You check and tell me the account's current status | ⏳ Pending (You) |

**Bottom line (re-verified against the repo, not just planned):** 1 of 16 steps is actually done (the app icon). Of the rest, **8 are mine to execute next** (signing fix, keystore, credentials wiring, `eas.json`, kicking off the build, data-safety/store-listing drafts, feature graphic — `eas submit` also mine but blocked on #14), and **7 are genuinely on you** (Play Console account/payment, Firebase Console clicks, the service account JSON, the closed-testing check, and screenshots until a device is reconnected). Say the word and I'll start on steps 1–4 now. The sections below are the manual ones, in order, with links.

---

## 1. Create the Play Console app + pay

🔗 https://play.google.com/console

1. Sign in with the account that will publish the app.
2. Pay the one-time $25 registration fee (skip if already a developer).
3. Click **Create app**.
4. App name: `الطيبات`
5. Default language: `Arabic`
6. App or game: `App`
7. Free or paid: `Free`
8. Accept the declarations → **Create app**.

---

## 2. Register the release SHA-1 in Firebase

⚠️ Wait until I send you the SHA-1 (I generate the keystore, this needs that value).

🔗 https://console.firebase.google.com

1. Open project `al-tayabatcom-123b4`.
2. ⚙️ gear icon (top left) → **Project settings**.
3. Scroll to **Your apps** → Android app `com.tayabat.sys`.
4. Click **Add fingerprint**.
5. Paste the SHA-1 I gave you → **Save**.
6. Click **Download google-services.json**.
7. Save the downloaded file directly into: `taybat_app/google-services.json` (overwrite the existing one).
8. Tell me it's there — I'll copy it into the second required location (`taybat_app/android/app/google-services.json`) myself.

---

## 3. Create a service account for `eas submit`

🔗 https://play.google.com/console → your app → **Setup** → **API access**

1. If prompted, link/create a Google Cloud project (Play Console suggests one automatically).
2. Click **Create new service account** → opens Google Cloud Console in a new tab.
3. In Google Cloud Console: **Create Service Account** → name it `eas-submit` → **Create and continue** → skip optional role step → **Done**.
4. Open the new service account → **Keys** tab → **Add key** → **Create new key** → type `JSON` → downloads automatically.
5. Save that downloaded file directly into: `taybat_app/google-play-service-account.json`
6. Back in Play Console → **API access** → find `eas-submit` in the list → **Grant access**.
7. Permissions: at minimum **Release to testing tracks**; give **Release manager** if you want it to also handle production releases later.
8. **Invite user** / confirm.
9. Tell me the file is saved — I'll wire it into `eas.json` and gitignore it. Don't paste its contents in chat.

---

## 4. Fill in App content (Play Console)

🔗 Play Console → your app → **Policy** → **App content**

I'll hand you drafted answers for each of these separately — this step is just pasting/selecting them in:

1. **Privacy policy** → URL: `https://al-tayabat.com/privacy` (already live).
2. **Account deletion** → URL: `https://al-tayabat.com/deletion` (already live).
3. **Data safety** → answer the questionnaire using my drafted answers.
4. **Content rating** → complete the questionnaire using my drafted answers.
5. **Target audience & content** → select age groups per my draft.
6. **Ads** → "No ads" (no ad SDK in this app).
7. **Government apps** → No. **News apps** → No.

---

## 5. Fill in Store listing (Play Console)

🔗 Play Console → your app → **Grow** → **Store presence** → **Main store listing**

1. Short description → paste mine (80 char limit).
2. Full description → paste mine (4000 char limit).
3. App icon → upload `taybat_app/assets/images/app_icon.png` as-is (already 512×512, meets the requirement).
4. Feature graphic (1024×500) → I'll generate a basic placeholder version; replace it with real design work if/when you want one.
5. Phone screenshots (min 2, recommend 4–8) → run the app and capture these yourself, or tell me to try driving a simulator here.
6. Category, contact email → your call.

---

## 6. Check your account's testing requirement

🔗 Play Console → your app → **Publishing overview**, or account-level **Dashboard**

If this developer account was created after Nov 2023, Google requires a closed testing track with 20+ opted-in testers active for 14 continuous days before production access unlocks. Check what your account's dashboard actually says and tell me — it determines whether the first release can go straight to production or has to sit in closed testing first.
