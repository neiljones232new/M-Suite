import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    const uid = process.getuid?.() || 501;
    const plistPath = `${process.env.HOME}/Library/LaunchAgents/com.msuite.dev.plist`;
    
    // Stop (ignore errors if not running)
    try {
      execSync(`launchctl bootout gui/${uid}/com.msuite.dev`, {
        stdio: 'pipe',
      });
    } catch {
      // Ignore if already stopped
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start
    execSync(`launchctl bootstrap gui/${uid} ${plistPath}`, {
      stdio: 'pipe',
    });
    
    return NextResponse.json({ 
      status: 'restarted',
      message: 'M-Suite services restarting...',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to restart suite',
      },
      { status: 500 }
    );
  }
}
