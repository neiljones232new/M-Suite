# M-Suite Portal Control Plane Upgrade (Full Implementation)

This document captures the full next-level upgrade plan for the **M-Suite Portal** so it becomes a true **Control Plane** for the suite.

---

## 🎯 Target UX

- Click Dock icon → Suite starts → Portal opens  
- Portal shows live service health  
- Start / Restart / Stop buttons control `launchctl`  
- Offline mode works cleanly  
- Logs are visible inside Portal  

---

## 1. LaunchAgent Improvements

Update your plist with:

```xml
<key>WorkingDirectory</key>
<string>/Users/neiljones/Developer/M_Suite</string>

<key>KeepAlive</key>
<dict>
  <key>SuccessfulExit</key>
  <false/>
</dict>

<key>ThrottleInterval</key>
<integer>5</integer>
```

### Why
- Crash → restart  
- Stop → stays stopped  
- Prevents restart loops  

---

## 2. Portal API Routes for Suite Control

Create these routes:

```
apps/portal/app/api/suite/start/route.ts
apps/portal/app/api/suite/stop/route.ts
apps/portal/app/api/suite/restart/route.ts
```

### Start

```ts
import { NextResponse } from "next/server"
import { execSync } from "child_process"

export async function POST() {
  const uid = process.getuid()
  execSync(`launchctl bootstrap gui/${uid} ~/Library/LaunchAgents/com.msuite.dev.plist`)
  return NextResponse.json({ status: "started" })
}
```

### Stop

```ts
export async function POST() {
  const uid = process.getuid()
  execSync(`launchctl bootout gui/${uid}/com.msuite.dev`)
  return NextResponse.json({ status: "stopped" })
}
```

### Restart

```ts
export async function POST() {
  const uid = process.getuid()
  execSync(`launchctl bootout gui/${uid}/com.msuite.dev || true`)
  execSync(`launchctl bootstrap gui/${uid} ~/Library/LaunchAgents/com.msuite.dev.plist`)
  return NextResponse.json({ status: "restarted" })
}
```

---

## 3. Wire Portal Buttons to API

```ts
async function suiteAction(action: "start" | "stop" | "restart") {
  await fetch(`/api/suite/${action}`, { method: "POST" })
  window.location.reload()
}
```

Buttons:

```tsx
<button onClick={() => suiteAction("start")}>Start Suite</button>
<button onClick={() => suiteAction("restart")}>Restart</button>
<button onClick={() => suiteAction("stop")}>Stop</button>
```

---

## 4. Live Health Polling

### Service Registry

`apps/portal/app/lib/services.ts`

```ts
export const services = [
  {
    id: "practice-ui",
    name: "Practice Web UI",
    url: "http://localhost:3000",
    health: "http://localhost:3000",
  },
  {
    id: "practice-api",
    name: "Practice API",
    url: "http://localhost:3001",
    health: "http://localhost:3001/health",
  },
  {
    id: "customs-ui",
    name: "Customs UI",
    url: "http://localhost:5173",
    health: "http://localhost:5173",
  },
  {
    id: "customs-api",
    name: "Customs Backend",
    url: "http://localhost:3100",
    health: "http://localhost:3100/health",
  },
]
```

### Polling Hook

```ts
import { useEffect, useState } from "react"

export function useHealth(url: string) {
  const [up, setUp] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(url)
        setUp(res.ok)
      } catch {
        setUp(false)
      }
    }

    check()
    const timer = setInterval(check, 3000)
    return () => clearInterval(timer)
  }, [url])

  return up
}
```

---

## 5. Offline Mode as Next Route

Create:

```
apps/portal/app/offline/page.tsx
```

```tsx
export default function Offline() {
  return (
    <main>
      <h1>M-Suite is Stopped</h1>
      <p>The suite is not currently running.</p>

      <button
        onClick={() => fetch("/api/suite/start", { method: "POST" })}
      >
        Relaunch Suite
      </button>
    </main>
  )
}
```

---

## 6. Logs Viewer Inside Portal

### API Route

```
apps/portal/app/api/logs/route.ts
```

```ts
import { NextResponse } from "next/server"
import fs from "fs"

export async function GET() {
  const log = fs.readFileSync("/tmp/msuite.log", "utf8")
  return NextResponse.json({ log })
}
```

### UI Panel

```tsx
const res = await fetch("/api/logs")
const { log } = await res.json()

<pre>{log}</pre>
```

---

## 7. Dock Launcher Script (Final Form)

```zsh
#!/bin/zsh

AGENT="com.msuite.dev"
PLIST="$HOME/Library/LaunchAgents/com.msuite.dev.plist"

launchctl bootout gui/$(id -u)/$AGENT 2>/dev/null
launchctl bootstrap gui/$(id -u) $PLIST

until curl -s http://localhost:4000 >/dev/null; do
  sleep 0.5
done

open http://localhost:4000
```

---

## ✅ Final Outcome

M-Suite becomes a real platform:

- Dock-first launcher  
- LaunchAgent orchestration  
- Portal-driven lifecycle controls  
- Live health monitoring  
- Offline recovery  
- Logs surfaced in UI  

---

## Next Decision

Do you want the Portal to supervise:

- Only the LaunchAgent (**Suite Supervisor**)  
- Or each service individually (**Service Supervisor**)  

Choose direction before expanding further.
