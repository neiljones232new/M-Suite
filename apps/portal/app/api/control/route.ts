import { NextResponse } from "next/server";
import { exec } from "child_process";
import { homedir } from "os";
import path from "path";

function run(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

type Action = "start" | "stop" | "restart";
type Target =
  | "suite"
  | "practiceWeb"
  | "practiceApi"
  | "customsUi"
  | "customsBackend";

interface TargetConfig {
  name: string;
  port: number;
  startCommand: string;
}

const ROOT = path.resolve(process.cwd(), "..", "..");
const LOG_DIR = "/tmp";
const targets: Record<Exclude<Target, "suite">, TargetConfig> = {
  practiceWeb: {
    name: "Practice Web",
    port: 3000,
    startCommand: `cd "${ROOT}" && nohup pnpm practice > "${LOG_DIR}/msuite-practice-web.log" 2>&1 &`,
  },
  practiceApi: {
    name: "Practice API",
    port: 3001,
    startCommand: `cd "${ROOT}" && nohup pnpm practice-api > "${LOG_DIR}/msuite-practice-api.log" 2>&1 &`,
  },
  customsUi: {
    name: "Customs UI",
    port: 5173,
    startCommand: `cd "${ROOT}" && nohup pnpm customs > "${LOG_DIR}/msuite-customs-ui.log" 2>&1 &`,
  },
  customsBackend: {
    name: "Customs Backend",
    port: 3100,
    startCommand: `cd "${ROOT}" && nohup pnpm customs-backend > "${LOG_DIR}/msuite-customs-backend.log" 2>&1 &`,
  },
};

const PLIST = `${homedir()}/Library/LaunchAgents/com.msuite.dev.plist`;
const SERVICE = `gui/${process.getuid?.() ?? 501}/com.msuite.dev`;

async function isRunningOnPort(port: number) {
  try {
    const output = await run(`lsof -ti tcp:${port}`);
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

async function stopByPort(port: number) {
  await run(
    `PIDS="$(lsof -ti tcp:${port} 2>/dev/null || true)"; if [ -n "$PIDS" ]; then kill $PIDS || true; sleep 1; kill -9 $PIDS 2>/dev/null || true; fi`
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const action = body?.action as Action | undefined;
  const target = (body?.target as Target | undefined) ?? "suite";

  if (!action || !["start", "stop", "restart"].includes(action)) {
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  }

  try {
    if (target === "suite") {
      if (action === "start") {
        await run(`launchctl load ${PLIST}`);
      }

      if (action === "stop") {
        await run(`launchctl unload ${PLIST}`);
      }

      if (action === "restart") {
        // kickstart only works if already loaded
        await run(`launchctl kickstart -k ${SERVICE}`);
      }

      return NextResponse.json({ success: true, target, action });
    }

    const config = targets[target];
    const running = await isRunningOnPort(config.port);

    if (action === "start") {
      if (running) {
        return NextResponse.json({
          success: true,
          target,
          action,
          message: `${config.name} is already running`,
        });
      }
      await run(config.startCommand);
    }

    if (action === "stop") {
      await stopByPort(config.port);
    }

    if (action === "restart") {
      await stopByPort(config.port);
      await run(config.startCommand);
    }

    return NextResponse.json({ success: true, target, action });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
