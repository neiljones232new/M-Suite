import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    const uid = process.getuid?.() || 501; // Fallback to common UID
    const plistPath = `${process.env.HOME}/Library/LaunchAgents/com.msuite.dev.plist`;
    
    execSync(`launchctl bootstrap gui/${uid} ${plistPath}`, {
      stdio: 'pipe',
    });
    
    return NextResponse.json({ 
      status: 'started',
      message: 'M-Suite services starting...',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to start suite',
      },
      { status: 500 }
    );
  }
}
