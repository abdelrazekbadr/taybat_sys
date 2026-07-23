# Go-Live — Al-Taybat

Generated: 2026-07-11 (inventory taken from the live dev Supabase project `mbbbdhyhtqkxakmblzmk`, used by `taybat_app`).

## Documents
| File | Purpose |
| --- | --- |
| [01-supabase-production-setup.md](01-supabase-production-setup.md) | Step-by-step: clone the current Supabase config into a new production project without retyping schema/policies/functions by hand |
| [02-google-play-publish.md](02-google-play-publish.md) | Google Play publish steps + 2 blocking config issues found in the actual repo (release signing, missing Google Sign-In OAuth client) |
| [03-manual-steps-you-need-to-do.md](03-manual-steps-you-need-to-do.md) | Just the steps that genuinely need you — payment, external-console clicks, secrets — short and link-first, everything else is handled |

## Why this exists
`taybat_app` currently points at one Supabase project for both development and "live" testing (`EXPO_PUBLIC_USE_MOCK=false` in `.env`). Going live means standing up a **separate** Supabase project (own URL, own keys, own billing) that has the same schema, RLS policies, functions, triggers, cron jobs, and storage config — without hand-typing 34 migrations' worth of DDL again.
