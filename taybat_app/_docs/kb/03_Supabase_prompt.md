# Claud

1. Add MCP server
   Add the MCP server to your project config using the command line.
   Code:
   File: Code

```
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk"
```

2. Authenticate
   After configuring the MCP server, you need to authenticate. In a regular terminal (not the IDE extension) run:
   Details:
   Select the supabase server, then Authenticate to begin the flow.
   Code:
   File: Code

```
claude /mcp
```

3. Install Agent Skills (Optional)
   Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
   Details:
   npx skills add supabase/agent-skills
   Code:
   File: Code

```
npx skills add supabase/agent-skills
```

# TRAE


You already have the right Trae config file:

`/Users/abadr/Library/Application Support/Trae/User/mcp.json`

Right now `supabase-mcp` is empty (`{}`), so Trae has nothing to connect to.

Also: you pasted an **APIFY_TOKEN** in chat. Treat it as compromised and rotate/revoke it in Apify immediately.

## Step 1) Backup the file

```bash
cp "/Users/abadr/Library/Application Support/Trae/User/mcp.json" \
   "/Users/abadr/Library/Application Support/Trae/User/mcp.json.bak.$(date +%Y%m%d-%H%M%S)"
```

## Step 2) Validate the JSON (important)

```bash
python3 -m json.tool "/Users/abadr/Library/Application Support/Trae/User/mcp.json" >/dev/null \
  && echo "JSON OK" || echo "JSON INVALID"
```

If it says **JSON OK**, go to Step 3 (patch only Supabase).
If it says **JSON INVALID**, skip to Step 4 (overwrite with a clean config).

## Step 3) Patch only the Supabase MCP entry (recommended)

This keeps your other MCP servers intact and only fills `supabase-mcp.url`:

```bash
python3 - <<'PY'
import json, os

path = os.path.expanduser("~/Library/Application Support/Trae/User/mcp.json")
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

servers = data.get("mcpServers")
if not isinstance(servers, dict):
    servers = {}

servers["supabase-mcp"] = {
    "url": "https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk"
}

data["mcpServers"] = servers

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated supabase-mcp in:", path)
PY
```

Verify:

```bash
python3 -m json.tool "/Users/abadr/Library/Application Support/Trae/User/mcp.json"
grep -n "\"supabase-mcp\"" -n "/Users/abadr/Library/Application Support/Trae/User/mcp.json"
```

## Step 4) If JSON is invalid: overwrite with a minimal working config

This is the cleanest way to ensure Trae loads Supabase MCP (you can re-add Apify later):

```bash
cat > "/Users/abadr/Library/Application Support/Trae/User/mcp.json" <<'JSON'
{
  "mcpServers": {
    "supabase-mcp": {
      "url": "https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk"
    }
  }
}
JSON

python3 -m json.tool "/Users/abadr/Library/Application Support/Trae/User/mcp.json"
```

## Step 5) Restart Trae (to reload MCP config)

```bash
osascript -e 'tell application "Trae" to quit'
open -a Trae
```

## Step 6) Does Supabase MCP need authentication?

Yes—**usually a one-time browser login/authorization** is required.

How it typically happens:

- After Trae loads the server, the **first time Trae tries to use a Supabase MCP tool**, it should open a browser window to authenticate and grant access.

To trigger it, ask your agent something like:

- “List tables in my Supabase database using MCP”

Supabase MCP auth flow reference: https://supabase.com/docs/guides/getting-started/mcp

## One more critical note about your current Apify config

In Trae, `command` for stdio servers is expected to be a single executable (no spaces). Your Apify entry uses:

```json
"command": "npx -y @apify/actors-mcp-server"
```

This can break MCP loading in some clients. If Supabase still doesn’t appear after Step 3/5, temporarily remove/fix the Apify entry.

If you paste the output of:

```bash
python3 -m json.tool "/Users/abadr/Library/Application Support/Trae/User/mcp.json"
```

and tell me whether `supabase-mcp` shows up in Trae’s MCP list after restart, I’ll give you the exact next fix (including a corrected Apify block if needed).
