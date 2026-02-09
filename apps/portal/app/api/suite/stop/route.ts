import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    const uid = process.getuid?.() || 501;
    
    execSync(`launchctl bootout gui/${uid}/com.msuite.dev`, {
      stdio: 'pipe',
    });
    
    return NextResponse.json({ 
      status: 'stopped',
      message: 'M-Suite services stopped',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to stop suite',
      },
      { status: 500 }
    );
  }
}
