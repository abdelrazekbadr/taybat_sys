
**Summary**

- Here is the clean summary of the Supabase integration setup we now have for `dev` and `prod`.
- I am **not** repeating any personal CLI access token or any service-role secret in chat.
- Keep personal access tokens and service-role keys **out of repo files**.

**Projects**

- `dev`
  - Project name: `taybat-app-dev`
  - Project ref: `mbbbdhyhtqkxakmblzmk`
  - Project URL: `https://mbbbdhyhtqkxakmblzmk.supabase.co`
- `prod`
  - Project name: `taybat-app-prod`
  - Project ref: `bmyachyraddxekojqnoi`
  - Project URL: `https://bmyachyraddxekojqnoi.supabase.co`

**Public Keys**

- `prod publishable key`
  - `sb_publishable_f5uCdAke7r3OGhz9HBVB3Q_3dEzhyvt`
- `prod legacy anon key`
  - starts with: `eyJhbGciOiJIUzI1Ni...`
  - note: browser-safe if RLS is correct, but prefer the publishable key for new usage
- `dev public key`
  - already exists in your current env / existing integration
  - linked to project ref `mbbbdhyhtqkxakmblzmk`

**CLI Login**

- Use this exact CLI wrapper because Homebrew install was blocked and this works locally:

```bash
cd /Users/abadr/Documents/Abadr/Projects/taybat_sys
HOME=/Users/abadr/Documents/Abadr/Projects/taybat_sys/.supabase-cli-home npx -y supabase login
```

- Check login / projects:

```bash
HOME=/Users/abadr/Documents/Abadr/Projects/taybat_sys/.supabase-cli-home npx -y supabase projects list
```

**CLI Link Commands**

- Link `dev`:

```bash
HOME=/Users/abadr/Documents/Abadr/Projects/taybat_sys/.supabase-cli-home npx -y supabase link --project-ref mbbbdhyhtqkxakmblzmk
```

- Link `prod`:

```bash
HOME=/Users/abadr/Documents/Abadr/Projects/taybat_sys/.supabase-cli-home npx -y supabase link --project-ref bmyachyraddxekojqnoi
```

**MCP Names**

- `supabase` -> dev
- `supabase-prod` -> prod

**MCP URLs**

- `dev`

```text
https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk
```

- `prod`

```text
https://mcp.supabase.com/mcp?project_ref=bmyachyraddxekojqnoi
```

**Configured Files**

- Root Claude config: [.claude/settings.json](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/.claude/settings.json)
- Root MCP config: [.mcp.json](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/.mcp.json)
- App MCP config: [taybat_app/.mcp.json](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/.mcp.json)
- App Claude config: [taybat_app/.claude/settings.json](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/.claude/settings.json)
- Skill updated for env differentiation: [supabase skill](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/.trae/skills/supabase/SKILL.md)
- Workflow skill updated for env differentiation: [supabase-workflow skill](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/.trae/skills/supabase-workflow/SKILL.md)

**Current MCP Config Shape**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk"
    },
    "supabase-prod": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=bmyachyraddxekojqnoi"
    }
  }
}
```

**Important Notes**

- Do **not** store:
  - personal Supabase access token
  - service-role key
- Safe to store in app env:
  - project URL
  - publishable key
  - legacy anon key if needed
- Preferred app-side production env values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://bmyachyraddxekojqnoi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f5uCdAke7r3OGhz9HBVB3Q_3dEzhyvt
EXPO_PUBLIC_USE_MOCK=false
```

**Current State**

- CLI login is working.
- MCP for prod is working.
- Prod extensions were prepared.
- The remaining blocker for full checklist execution is still the schema dump path, because `supabase db dump` in this environment needs Docker.

If you want, I can next prepare a single **copy-paste setup note** file with:

- dev values
- prod values
- CLI commands
- MCP config
- `.env.production` example
