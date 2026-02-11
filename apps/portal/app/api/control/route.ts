import { NextResponse } from "next/server";
import { exec } from "child_process";
import { homedir } from "os";

function run(cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

const PLIST = `${homedir()}/Library/LaunchAgents/com.msuite.dev.plist`;
const SERVICE = `gui/${process.getuid?.() ?? 501}/com.msuite.dev`;

export async function POST(req: Request) {
  const { action } = await req.json();

  try {
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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
