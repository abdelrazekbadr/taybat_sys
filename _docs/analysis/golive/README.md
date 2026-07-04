# Go-Live — Al‑Taybat Android (Phase 1)

Master plan for taking the Al‑Taybat Expo app from **development** to **production** on the **Google Play Store**, plus the required **Supabase**, **Google Cloud**, **Firebase**, and **Play Console** configuration.

Generated: 2026‑07‑04 · App version `1.0.0` (versionCode `1`) · Package `com.tayabat.sys`

## Documents in this folder

| File | Purpose |
| --- | --- |
| [01-screen-scan.md](01-screen-scan.md) | Scan of every app screen — completeness + missing points |
| [02-blockers.md](02-blockers.md) | **Hard blockers** that must be fixed before you can ship |
| [03-app-config.md](03-app-config.md) | App / EAS / Android build config changes for production |
| [04-supabase.md](04-supabase.md) | Supabase dev→prod: security advisors, auth, email, storage |
| [05-google-cloud-firebase.md](05-google-cloud-firebase.md) | Google Cloud Console + Firebase (OAuth, SHA‑1, Analytics) |
| [06-play-console.md](06-play-console.md) | Google Play Console: listing, data safety, testing track |
| [07-final-checklist.md](07-final-checklist.md) | One-page ordered checklist |

## TL;DR — the 6 things most likely to bite you

1. **Android release build is signed with the *debug* keystore.** Must ship with a real upload key (EAS-managed or your own). → [02-blockers.md](02-blockers.md)
2. **`google-services.json` has an empty `oauth_client`** → Google Sign‑In fails with `DEVELOPER_ERROR (code 10)` on the release build. The **release SHA‑1** must be registered in Firebase/Google Cloud. → [05](05-google-cloud-firebase.md)
3. **No hosted Privacy Policy URL.** Google Play *requires* one; you have the text in `_docs/_doc_technical/app-privacy/` but it is not hosted or linked in-app. → [02](02-blockers.md)
4. **OAuth consent screen is likely still in "Testing"** → only whitelisted Google accounts can sign in. Must publish to Production. → [05](05-google-cloud-firebase.md)
5. **Supabase has 1 ERROR + many WARN security advisors** (SECURITY DEFINER view + functions, leaked-password protection off, default SMTP). → [04](04-supabase.md)
6. **New Google Play personal accounts require a 12-tester / 14-day closed test** before production access. Start this early. → [06](06-play-console.md)
